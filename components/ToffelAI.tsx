"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Message {
  role: "user" | "assistant";
  content: string;
}

// ── Suggested prompts ─────────────────────────────────────────────────────────

const GLOBAL_PROMPTS = [
  "How do the Individual Brokerage and Roth Retirement Account differ?",
  "What are the largest sources of portfolio concentration?",
  "How does ETF exposure affect the overall risk profile?",
  "What recent decisions changed the portfolio?",
];

function getSuggestedPrompts(pathname: string | null): string[] {
  if (!pathname) return GLOBAL_PROMPTS;

  const tickerMatch = pathname.match(/^\/positions\/([A-Za-z]+)/);
  if (tickerMatch) {
    const t = tickerMatch[1].toUpperCase();
    return [
      `What's the bull case for ${t}?`,
      `What are the key risks for ${t}?`,
      `Why is ${t} sized this way?`,
      `What am I watching for ${t}?`,
    ];
  }

  const archiveMatch = pathname.match(/^\/archive\/([A-Za-z]+)/);
  if (archiveMatch) {
    const t = archiveMatch[1].toUpperCase();
    return [
      `Why was ${t} exited?`,
      `What was the original thesis for ${t}?`,
      `What's the key lesson from ${t}?`,
      `How did the ${t} trade play out?`,
    ];
  }

  if (pathname.includes("/portfolio/retail-with-friends")) {
    return [
      "How is the brokerage account allocated across ETFs and MU?",
      "What is the semiconductor exposure through SMH and MU?",
      "Why use FBTC for Bitcoin exposure?",
      "How does the brokerage account differ from the Roth Retirement Account?",
    ];
  }

  if (pathname.includes("/portfolio/roth-ira")) {
    return [
      "What are the largest Roth Retirement Account positions?",
      "How does the Roth balance core exposure with compounders?",
      "Which positions drive the most concentration risk?",
      "What archived decisions changed the Roth account?",
    ];
  }

  if (pathname.includes("/portfolio/etfs")) {
    return [
      "What ETFs am I holding?",
      "What's the semiconductor weight across ETFs?",
      "How does the ETF Exposure account serve as a benchmark?",
      "What are the total returns across ETF positions?",
    ];
  }

  return GLOBAL_PROMPTS;
}

// ── Response post-processor ───────────────────────────────────────────────────

function cleanAssistantContent(raw: string): string {
  // 1. Strip bare [text, text] citation markers that aren't markdown links
  let out = raw.replace(/\[[^\]]+,\s*[^\]]+\](?!\()/g, "");

  // 2. Convert markdown pipe tables into bullet lines so they render cleanly.
  //    First pipe row = header (skipped). Separator row (---) = skipped.
  //    Data rows become: "- TICKER — col2 — col3"
  const tableNormalized: string[] = [];
  let tablePhase: "none" | "header" | "data" = "none";
  for (const line of out.split("\n")) {
    if (/^\s*\|/.test(line)) {
      const cells = line.split("|").map((c) => c.trim()).filter(Boolean);
      if (cells.every((c) => /^[-:\s]+$/.test(c))) {
        // separator row — marks transition from header to data
        tablePhase = "data";
        continue;
      }
      if (tablePhase === "none") {
        // first pipe row is the header
        tablePhase = "header";
        continue;
      }
      // data row
      const [first, ...rest] = cells;
      const restStr = rest.filter(Boolean).join(" — ");
      tableNormalized.push(`- ${first}${restStr ? " — " + restStr : ""}`);
    } else {
      tablePhase = "none";
      tableNormalized.push(line);
    }
  }
  out = tableNormalized.join("\n");

  // 3. Remove bullet lines that are model meta-commentary (not real holdings)
  const metaPattern = /\b(same|duplicate|already counted|already listed|see above)\b/i;
  out = out
    .split("\n")
    .filter((line) => {
      const isBullet = line.startsWith("- ") || line.startsWith("• ");
      return !(isBullet && metaPattern.test(line));
    })
    .join("\n");

  // 4. Deduplicate bullet lines by ticker.
  //    Handles: [TICKER](url), **TICKER**, bare TICKER at start of bullet content.
  const seenTickers = new Set<string>();
  const deduped = out.split("\n").filter((line) => {
    const isBullet = line.startsWith("- ") || line.startsWith("• ");
    if (!isBullet) return true;
    const linkTicker   = line.match(/\[([A-Z]{1,6})\]\(/)?.[1];
    const boldTicker   = line.match(/\*\*([A-Z]{1,6})\*\*/)?.[1];
    const bareTicker   = line.match(/^[-•]\s+([A-Z]{2,6})(?=[\s—\-:*])/)?.[1];
    const key = linkTicker ?? boldTicker ?? bareTicker;
    if (!key) return true;
    if (seenTickers.has(key)) return false;
    seenTickers.add(key);
    return true;
  });

  // 5. Collapse 3+ consecutive blank lines to 2
  return deduped.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

// ── Inline markdown renderer ──────────────────────────────────────────────────

function renderInline(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    const linkMatch = remaining.match(/\[([^\]]+)\]\(([^)]+)\)/);
    const boldMatch = remaining.match(/\*\*([^*]+)\*\*/);

    const linkIdx = linkMatch ? remaining.indexOf(linkMatch[0]) : Infinity;
    const boldIdx = boldMatch ? remaining.indexOf(boldMatch[0]) : Infinity;

    if (linkIdx === Infinity && boldIdx === Infinity) {
      parts.push(remaining);
      break;
    }

    if (linkIdx <= boldIdx && linkMatch) {
      if (linkIdx > 0) parts.push(remaining.slice(0, linkIdx));
      const isInternal =
        linkMatch[2].startsWith("/") && !linkMatch[2].startsWith("//");
      if (isInternal) {
        parts.push(
          <Link
            key={key++}
            href={linkMatch[2]}
            className="underline underline-offset-2 font-medium hover:opacity-70 transition-opacity"
          >
            {linkMatch[1]}
          </Link>
        );
      } else {
        parts.push(
          <a
            key={key++}
            href={linkMatch[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 font-medium hover:opacity-70 transition-opacity"
          >
            {linkMatch[1]}
          </a>
        );
      }
      remaining = remaining.slice(linkIdx + linkMatch[0].length);
    } else if (boldMatch) {
      if (boldIdx > 0) parts.push(remaining.slice(0, boldIdx));
      parts.push(<strong key={key++}>{boldMatch[1]}</strong>);
      remaining = remaining.slice(boldIdx + boldMatch[0].length);
    } else {
      parts.push(remaining);
      break;
    }
  }

  return <>{parts}</>;
}

function MessageContent({ content }: { content: string }) {
  const lines = cleanAssistantContent(content).split("\n");
  const nodes: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line === "") {
      i++;
      continue;
    }

    // Bullet list
    if (line.startsWith("- ") || line.startsWith("• ")) {
      const bullets: string[] = [];
      while (
        i < lines.length &&
        (lines[i].startsWith("- ") || lines[i].startsWith("• "))
      ) {
        bullets.push(lines[i].slice(2));
        i++;
      }
      const nodeKey = nodes.length;
      nodes.push(
        <ul key={nodeKey} className="space-y-1 pl-0">
          {bullets.map((b, bi) => (
            <li key={`${nodeKey}-${bi}`} className="flex gap-2">
              <span className="mt-[5px] shrink-0 w-1 h-1 rounded-full bg-current opacity-50 self-start" />
              <span>{renderInline(b)}</span>
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // Numbered list
    const numMatch = line.match(/^(\d+)\.\s(.*)/);
    if (numMatch) {
      const items: [string, string][] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        const m = lines[i].match(/^(\d+)\.\s(.*)/);
        if (m) items.push([m[1], m[2]]);
        i++;
      }
      const nodeKey = nodes.length;
      nodes.push(
        <ol key={nodeKey} className="space-y-1">
          {items.map(([num, text], ni) => (
            <li key={`${nodeKey}-${ni}`} className="flex gap-2">
              <span className="shrink-0 font-medium opacity-60">{num}.</span>
              <span>{renderInline(text)}</span>
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // Heading (##)
    if (line.startsWith("## ")) {
      nodes.push(
        <p key={nodes.length} className="font-semibold">
          {renderInline(line.slice(3))}
        </p>
      );
      i++;
      continue;
    }

    // Regular paragraph
    nodes.push(<p key={nodes.length}>{renderInline(line)}</p>);
    i++;
  }

  return <div className="space-y-2 text-[13px] leading-relaxed">{nodes}</div>;
}

// ── Loading dots ──────────────────────────────────────────────────────────────

function ThinkingDots() {
  return (
    <span className="flex gap-1 items-center py-0.5">
      {[0, 150, 300].map((delay) => (
        <span
          key={delay}
          className="w-1.5 h-1.5 rounded-full bg-[#9ca3af] animate-bounce"
          style={{ animationDelay: `${delay}ms` }}
        />
      ))}
    </span>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function ToffelAI() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const pathname = usePathname();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const textareaRef = inputRef;

  const suggestedPrompts = getSuggestedPrompts(pathname);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when panel opens
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Trap focus: close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  const autoResizeTextarea = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  };

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || streaming) return;

      const userMsg: Message = { role: "user", content: text.trim() };
      const history = [...messages, userMsg];
      setMessages([...history, { role: "assistant", content: "" }]);
      setInput("");
      setStreaming(true);

      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = "24px";
      }

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await fetch("/api/toffel-ai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: history, pathname }),
          signal: controller.signal,
        });

        if (!res.ok) {
          const errText = await res.text().catch(() => "");
          console.error(`[toffel-ai] HTTP ${res.status}:`, errText);
          throw new Error(errText || `HTTP ${res.status}`);
        }

        const reader = res.body?.getReader();
        if (!reader) throw new Error("No response stream");

        const decoder = new TextDecoder();
        let accumulated = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          accumulated += decoder.decode(value, { stream: true });
          const snap = accumulated;
          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = { role: "assistant", content: snap };
            return updated;
          });
        }
      } catch (err) {
        if (err instanceof Error && err.name !== "AbortError") {
          const raw = err.message ?? "";
          // Show server-supplied messages verbatim when they're short and
          // user-facing (e.g. "Model is temporarily rate-limited…").
          // Fall back to a generic message for raw HTTP codes or unexpected errors.
          const isUserFacing =
            raw.length > 0 && raw.length < 160 && !raw.startsWith("HTTP ");
          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = {
              role: "assistant",
              content: isUserFacing ? raw : "Something went wrong. Please try again.",
            };
            return updated;
          });
        }
      } finally {
        setStreaming(false);
        abortRef.current = null;
      }
    },
    [messages, streaming, pathname, textareaRef]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const handleClear = () => {
    abortRef.current?.abort();
    setMessages([]);
    setStreaming(false);
  };

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/10 backdrop-blur-[1px]"
          onClick={() => setOpen(false)}
          aria-hidden
        />
      )}

      {/* Slide-in panel */}
      <aside
        className={`fixed top-0 right-0 bottom-0 z-50 flex flex-col bg-white border-l border-[#e2ddd8] shadow-2xl transition-transform duration-300 ease-in-out w-full sm:w-[420px] ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        aria-label="Toffel AI chat panel"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#e2ddd8] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-[#0f1e35] flex items-center justify-center shrink-0">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden
              >
                <path
                  d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"
                  stroke="white"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-[14px] font-semibold tracking-tight text-[#0f1e35] leading-none">
                Toffel AI
              </h2>
              <p className="text-[11px] text-[#9ca3af] mt-0.5">
                Portfolio research assistant
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {messages.length > 0 && (
              <button
                onClick={handleClear}
                className="text-[11px] text-[#9ca3af] hover:text-[#0f1e35] transition-colors px-2 py-1 rounded"
              >
                Clear
              </button>
            )}
            <button
              onClick={() => setOpen(false)}
              aria-label="Close Toffel AI"
              className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-[#f0ede8] transition-colors text-[#9ca3af] hover:text-[#0f1e35]"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
                <path
                  d="M1 1L11 11M11 1L1 11"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Message area */}
        <div className="flex-1 overflow-y-auto px-4 py-5 scroll-smooth">
          {messages.length === 0 ? (
            /* Empty state — suggested prompts */
            <div className="space-y-5">
              <div className="text-center">
                <p className="text-[12px] text-[#9ca3af] uppercase tracking-widest font-medium mb-4">
                  Suggested
                </p>
              </div>
              <div className="space-y-2">
                {suggestedPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => sendMessage(prompt)}
                    className="w-full text-left px-4 py-3 rounded-xl border border-[#e8e4de] text-[12.5px] text-[#374151] hover:border-[#0f1e35] hover:bg-[#f8f6f2] transition-all duration-150 leading-snug"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
              <p className="text-center text-[11px] text-[#c4bfba] pt-2">
                Ask anything about the portfolio
              </p>
            </div>
          ) : (
            /* Message thread */
            <div className="space-y-4">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[88%] px-4 py-3 rounded-2xl ${
                      msg.role === "user"
                        ? "bg-[#0f1e35] text-white rounded-br-sm text-[13px]"
                        : "bg-[#f0ede8] text-[#0f1e35] rounded-bl-sm"
                    }`}
                  >
                    {msg.role === "assistant" &&
                    msg.content === "" &&
                    streaming ? (
                      <ThinkingDots />
                    ) : msg.role === "assistant" ? (
                      <MessageContent content={msg.content} />
                    ) : (
                      <p className="leading-relaxed">{msg.content}</p>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input bar */}
        <div className="px-4 pb-4 pt-2 border-t border-[#e8e4de] shrink-0">
          <div className="flex items-end gap-2.5 bg-[#f8f6f2] rounded-xl px-3.5 py-2.5 border border-[#e2ddd8] focus-within:border-[#0f1e35] transition-colors duration-150">
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                autoResizeTextarea();
              }}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your portfolio…"
              disabled={streaming}
              className="flex-1 bg-transparent text-[13px] text-[#0f1e35] placeholder:text-[#c4bfba] resize-none outline-none leading-relaxed disabled:opacity-50"
              style={{ height: "24px", maxHeight: "120px" }}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || streaming}
              aria-label="Send"
              className="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg bg-[#07111f] text-white disabled:opacity-25 transition-opacity hover:opacity-75 active:scale-95"
            >
              <svg
                width="11"
                height="11"
                viewBox="0 0 12 12"
                fill="none"
                aria-hidden
              >
                <path
                  d="M6 10.5V1.5M6 1.5L2 5.5M6 1.5L10 5.5"
                  stroke="white"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
          <p className="text-center text-[10.5px] text-[#c4bfba] mt-2">
            Powered by Claude · For research only
          </p>
        </div>
      </aside>

      {/* Floating launcher */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Open Toffel AI"
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#07111f] text-white shadow-lg hover:shadow-xl hover:scale-[1.06] active:scale-100 transition-all duration-150 flex items-center justify-center"
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden
          >
            <path
              d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"
              stroke="white"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}
    </>
  );
}
