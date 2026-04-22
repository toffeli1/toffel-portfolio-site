import { buildSystemPrompt } from "@/lib/toffel-ai/systemPrompt";

export const dynamic = "force-dynamic";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
// Free tier — OpenAI-oss-20b via OpenInference; supports system messages,
// follows instructions cleanly, and streams delta.content correctly.
// Override by setting OPENROUTER_MODEL env var.
const MODEL =
  process.env.OPENROUTER_MODEL ?? "openai/gpt-oss-20b:free";

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

  let upstream: Response;
  try {
    upstream = await fetch(OPENROUTER_URL, {
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
        messages: [{ role: "system", content: systemPrompt }, ...messages],
      }),
      signal: AbortSignal.timeout(45_000),
    });
  } catch (err) {
    const isTimeout = err instanceof Error && err.name === "TimeoutError";
    console.error("[toffel-ai] OpenRouter fetch failed:", err);
    return new Response(
      isTimeout ? "Request timed out. Please try again." : "Could not reach model provider.",
      { status: 502 }
    );
  }

  if (!upstream.ok) {
    const errBody = await upstream.text().catch(() => "");
    console.error(`[toffel-ai] OpenRouter ${upstream.status}:`, errBody);
    // 429 = rate limited — surface a specific message
    if (upstream.status === 429) {
      return new Response("Model is temporarily rate-limited. Please try again in a moment.", { status: 429 });
    }
    return new Response("Model provider returned an error. Please try again.", {
      status: 502,
    });
  }

  // OpenRouter streams SSE: `data: {...}\n\n` and `data: [DONE]\n\n`
  // Parse deltas server-side and forward plain text to the client so the
  // existing frontend reader works without changes.
  const encoder = new TextEncoder();

  const textStream = new ReadableStream({
    async start(controller) {
      const reader = upstream.body?.getReader();
      if (!reader) {
        controller.close();
        return;
      }

      const decoder = new TextDecoder();
      let buffer = "";

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          // Split on newlines; keep the last incomplete fragment in buffer
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
              continue; // Ignore malformed chunks
            }

            // Standard OpenAI streaming delta path
            const choices = json.choices as Array<{
              delta?: { content?: string };
            }> | undefined;
            const delta = choices?.[0]?.delta?.content;
            if (typeof delta === "string" && delta.length > 0) {
              controller.enqueue(encoder.encode(delta));
            }
          }
        }
      } catch (err) {
        console.error("[toffel-ai] stream read error:", err);
        controller.error(err);
      } finally {
        controller.close();
        reader.releaseLock();
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
