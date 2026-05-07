import { buildSystemPrompt } from "@/lib/toffel-ai/systemPrompt";
import { getProvider } from "@/lib/marketData";
import { getCachedQuote, setCachedQuote } from "@/lib/quoteCache";
import { computeReturnPct } from "@/lib/computeReturns";

export const dynamic = "force-dynamic";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL =
  process.env.OPENROUTER_MODEL ?? "openai/gpt-oss-20b:free";

// ── Tool definition (OpenAI/OpenRouter function-calling schema) ───────────────
// Equivalent to the Anthropic tool_use shape but in the format the upstream
// model actually accepts. Description is identical to spec.
const TOOLS = [
  {
    type: "function" as const,
    function: {
      name: "get_live_quote",
      description:
        "Fetch the current live price and daily change for a single ticker. Use when the visitor explicitly asks for a current price, today's return, or real-time data on a specific holding. Do NOT use for ranking queries — use the pre-sorted context section instead.",
      parameters: {
        type: "object",
        properties: {
          ticker: {
            type: "string",
            description: "Uppercase ticker symbol e.g. AMD",
          },
        },
        required: ["ticker"],
      },
    },
  },
];

const MAX_TOOL_HOPS = 3;

interface AccumulatedToolCall {
  id: string;
  name: string;
  arguments: string; // accumulated string, parsed at end
}

interface ToolResult {
  id: string;
  content: unknown;
}

interface ChatMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string | null;
  tool_calls?: Array<{
    id: string;
    type: "function";
    function: { name: string; arguments: string };
  }>;
  tool_call_id?: string;
}

// ── Tool implementation ──────────────────────────────────────────────────────

async function executeGetLiveQuote(ticker: string): Promise<unknown> {
  const symbol = ticker.toUpperCase();
  let quote = getCachedQuote(symbol);

  if (!quote) {
    try {
      const provider = getProvider();
      const map = await provider.fetchQuotes([symbol]);
      const fresh = map[symbol];
      if (fresh && fresh.price !== null) {
        setCachedQuote(symbol, fresh);
        quote = fresh;
      }
    } catch (err) {
      console.error("[toffel-ai/get_live_quote] fetch failed:", err);
      return { ticker: symbol, error: "live quote unavailable" };
    }
  }

  if (!quote || quote.price === null) {
    return { ticker: symbol, error: "no price data" };
  }

  // SMH has different cost bases in Roth vs Brokerage — the tool can't
  // disambiguate from a bare ticker arg, so omit returnPct and let the
  // model use the account-specific value from context.
  const returnPct = symbol === "SMH" ? undefined : computeReturnPct(symbol);

  return {
    ticker: symbol,
    price: quote.price,
    change: quote.change,
    changePercent: quote.changePercent,
    returnPct,
    updatedAt: quote.updatedAt,
  };
}

async function dispatchTool(name: string, args: unknown): Promise<unknown> {
  if (name === "get_live_quote") {
    const ticker =
      typeof (args as { ticker?: unknown })?.ticker === "string"
        ? ((args as { ticker: string }).ticker)
        : "";
    if (!ticker) return { error: "ticker is required" };
    return await executeGetLiveQuote(ticker);
  }
  return { error: `unknown tool: ${name}` };
}

// ── Streaming helper: read one OpenRouter response, forward text deltas ──────

async function streamOneTurn(
  messages: ChatMessage[],
  forwardText: (chunk: string) => void
): Promise<{ toolCalls: AccumulatedToolCall[]; finishReason: string | null }> {
  const upstream = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://toffel.dev",
      "X-Title": "Toffel AI Portfolio Assistant",
    },
    body: JSON.stringify({
      model: MODEL,
      stream: true,
      max_tokens: 1024,
      messages,
      tools: TOOLS,
    }),
    signal: AbortSignal.timeout(45_000),
  });

  if (!upstream.ok) {
    const errBody = await upstream.text().catch(() => "");
    throw new Error(`OpenRouter ${upstream.status}: ${errBody}`);
  }

  const reader = upstream.body?.getReader();
  if (!reader) {
    return { toolCalls: [], finishReason: null };
  }

  const decoder = new TextDecoder();
  let buffer = "";
  const toolCallsByIndex = new Map<number, AccumulatedToolCall>();
  let finishReason: string | null = null;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data:")) continue;

        const payload = trimmed.slice(5).trim();
        if (payload === "[DONE]") continue;

        let json: Record<string, unknown>;
        try {
          json = JSON.parse(payload);
        } catch {
          continue;
        }

        const choices = json.choices as
          | Array<{
              delta?: {
                content?: string;
                tool_calls?: Array<{
                  index: number;
                  id?: string;
                  function?: { name?: string; arguments?: string };
                }>;
              };
              finish_reason?: string | null;
            }>
          | undefined;

        const choice = choices?.[0];
        if (!choice) continue;

        const delta = choice.delta;
        if (typeof delta?.content === "string" && delta.content.length > 0) {
          forwardText(delta.content);
        }

        if (Array.isArray(delta?.tool_calls)) {
          for (const tc of delta.tool_calls) {
            const existing = toolCallsByIndex.get(tc.index) ?? {
              id: "",
              name: "",
              arguments: "",
            };
            if (tc.id) existing.id = tc.id;
            if (tc.function?.name) existing.name = tc.function.name;
            if (typeof tc.function?.arguments === "string") {
              existing.arguments += tc.function.arguments;
            }
            toolCallsByIndex.set(tc.index, existing);
          }
        }

        if (choice.finish_reason) finishReason = choice.finish_reason;
      }
    }
  } finally {
    reader.releaseLock();
  }

  const toolCalls = [...toolCallsByIndex.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([, v]) => v)
    .filter((tc) => tc.name);

  return { toolCalls, finishReason };
}

// ── Route handler ────────────────────────────────────────────────────────────

export async function POST(request: Request) {
  if (!process.env.OPENROUTER_API_KEY) {
    console.error("[toffel-ai] OPENROUTER_API_KEY is not set");
    return new Response("Toffel AI is not configured yet.", { status: 503 });
  }

  let messages: { role: "user" | "assistant"; content: string }[];
  let pathname: string;
  try {
    const body = await request.json();
    messages = Array.isArray(body.messages) ? body.messages : [];
    pathname = typeof body.pathname === "string" ? body.pathname : "";
  } catch {
    return new Response("Invalid request body", { status: 400 });
  }

  if (messages.length === 0) {
    return new Response("messages array is required", { status: 400 });
  }

  const systemPrompt = buildSystemPrompt(pathname);
  const encoder = new TextEncoder();

  const textStream = new ReadableStream({
    async start(controller) {
      const forwardText = (chunk: string) =>
        controller.enqueue(encoder.encode(chunk));

      const workingMessages: ChatMessage[] = [
        { role: "system", content: systemPrompt },
        ...messages,
      ];

      try {
        for (let hop = 0; hop < MAX_TOOL_HOPS; hop++) {
          const { toolCalls, finishReason } = await streamOneTurn(
            workingMessages,
            forwardText
          );

          if (toolCalls.length === 0 || finishReason === "stop") {
            break;
          }

          // Execute all tool calls in parallel
          const results: ToolResult[] = await Promise.all(
            toolCalls.map(async (tc) => {
              let parsedArgs: unknown = {};
              try {
                parsedArgs = JSON.parse(tc.arguments || "{}");
              } catch {
                parsedArgs = {};
              }
              const content = await dispatchTool(tc.name, parsedArgs);
              return { id: tc.id, content };
            })
          );

          // Append assistant tool_calls message
          workingMessages.push({
            role: "assistant",
            content: null,
            tool_calls: toolCalls.map((tc) => ({
              id: tc.id,
              type: "function" as const,
              function: { name: tc.name, arguments: tc.arguments || "{}" },
            })),
          });

          // Append tool result messages
          for (const r of results) {
            workingMessages.push({
              role: "tool",
              tool_call_id: r.id,
              content: JSON.stringify(r.content),
            });
          }
        }
      } catch (err) {
        const isTimeout = err instanceof Error && err.name === "TimeoutError";
        const msg = isTimeout
          ? "Request timed out. Please try again."
          : "Could not reach model provider.";
        console.error("[toffel-ai] stream error:", err);
        try {
          forwardText(`\n\n_${msg}_`);
        } catch {
          /* controller may already be closed */
        }
      } finally {
        controller.close();
      }
    },
  });

  return new Response(textStream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
