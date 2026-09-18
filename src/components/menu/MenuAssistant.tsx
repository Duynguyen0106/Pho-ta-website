"use client";

import { MessageCircle, Send, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { LOCATION_SLUG } from "@/lib/constants";
import { cn } from "@/lib/utils";

type MenuTab = "daily" | "lunch";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface MenuAssistantProps {
  menuTab: MenuTab;
  branchLabel: string;
}

const SUGGESTIONS = [
  "What should I order first visit?",
  "Tell me about M01 Pho Bo Tai",
  "Bun cha vs pho?",
  "Gluten-free options?",
  "Vegetarian dishes?",
  "Allergies & hygiene info",
  "How do I book?",
];

function ThinkingIndicator() {
  return (
    <div
      className="flex items-center gap-1.5 py-0.5"
      role="status"
      aria-label="Thinking"
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-2 w-2 rounded-full bg-gold/70 animate-pulse"
          style={{ animationDelay: `${i * 180}ms`, animationDuration: "1s" }}
        />
      ))}
    </div>
  );
}

function tokenizeForTyping(text: string): string[] {
  return text.match(/\S+\s*/g) ?? [text];
}

function useTypingReply(onComplete: (fullText: string) => void) {
  const [visibleText, setVisibleText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const onCompleteRef = useRef(onComplete);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancelledRef = useRef(false);

  onCompleteRef.current = onComplete;

  const cancelTyping = useCallback(() => {
    cancelledRef.current = true;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setVisibleText("");
    setIsTyping(false);
  }, []);

  const startTyping = useCallback(
    (text: string) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      cancelledRef.current = false;

      const tokens = tokenizeForTyping(text);
      let index = 0;
      setVisibleText("");
      setIsTyping(true);

      const tick = () => {
        if (cancelledRef.current) return;

        if (index >= tokens.length) {
          setIsTyping(false);
          setVisibleText("");
          onCompleteRef.current(text);
          return;
        }

        const token = tokens[index];
        index += 1;
        setVisibleText((prev) => prev + token);

        const delay = /[.!?]\s*$/.test(token)
          ? 120
          : token.length > 12
            ? 55
            : 38;
        timeoutRef.current = setTimeout(tick, delay);
      };

      timeoutRef.current = setTimeout(tick, 100);
    },
    [],
  );

  useEffect(() => () => cancelTyping(), [cancelTyping]);

  return { visibleText, isTyping, startTyping, cancelTyping };
}

export function MenuAssistant({ menuTab, branchLabel }: MenuAssistantProps) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: `Hello! I'm your Vietnamese food guide for Pho Ta ${branchLabel}. Ask about any dish, ingredients, dietary tags, or what to order — I know our full menu. Tap a suggestion below or ask anything.`,
    },
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const commitAssistantReply = useCallback((content: string) => {
    setMessages((prev) => [...prev, { role: "assistant", content }]);
  }, []);

  const { visibleText, isTyping, startTyping, cancelTyping } =
    useTypingReply(commitAssistantReply);

  const busy = loading || isTyping;

  useEffect(() => {
    if (open) {
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, open, loading, visibleText, isTyping]);

  useEffect(() => {
    cancelTyping();
    setMessages([
      {
        role: "assistant",
        content: `Showing the ${menuTab === "daily" ? "daily" : "lunch"} menu for ${branchLabel}. Try "What should I order first visit?" or ask about any dish by name.`,
      },
    ]);
  }, [menuTab, branchLabel, cancelTyping]);

  useEffect(() => () => cancelTyping(), [cancelTyping]);

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || busy) return;

    setInput("");
    const userMessage: ChatMessage = { role: "user", content: trimmed };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setLoading(true);

    try {
      const res = await fetch("/api/menu/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          locationSlug: LOCATION_SLUG,
          menuType: menuTab,
          history: nextMessages.slice(-8),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Request failed");

      startTyping(data.reply);
    } catch {
      startTyping(
        "Sorry, I couldn't answer that just now. Please try again or ask our team when you visit.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-4 z-40 flex min-h-12 items-center gap-2 rounded-full border border-gold/40 bg-gold px-4 py-3 text-sm font-medium uppercase tracking-[0.1em] text-white shadow-lg transition hover:bg-gold-light sm:bottom-8 sm:right-8 sm:gap-3 sm:px-5 sm:py-4 sm:text-base"
          aria-label="Open menu assistant"
        >
          <MessageCircle size={22} strokeWidth={1.5} />
          <span className="hidden sm:inline">Menu helper</span>
        </button>
      )}

      {open && (
        <div
          className="fixed inset-x-0 bottom-0 z-50 flex h-[min(560px,85dvh)] w-full flex-col border border-gold/20 bg-background shadow-2xl sm:inset-x-auto sm:bottom-8 sm:right-8 sm:h-[520px] sm:max-w-md sm:rounded-lg"
          role="dialog"
          aria-label="Menu assistant"
        >
          <header className="flex items-start justify-between gap-3 border-b border-gold/15 bg-surface-alt/80 px-5 py-4">
            <div>
              <p className="label-caps">Menu helper</p>
              <p className="mt-1 font-display text-xl text-foreground">
                Pho Ta {branchLabel}
              </p>
              <p className="mt-1 text-sm text-muted">
                {menuTab === "daily" ? "Daily menu" : "Lunch menu"} · AI-guided
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded border border-gold/25 p-2 text-muted hover:text-foreground"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </header>

          <div
            ref={scrollRef}
            className="flex-1 space-y-4 overflow-y-auto px-5 py-4"
          >
            {messages.map((msg, index) => (
              <div
                key={`${msg.role}-${index}`}
                className={cn(
                  "max-w-[92%] rounded-lg px-4 py-3 text-base leading-relaxed",
                  msg.role === "user"
                    ? "ml-auto bg-gold/20 text-foreground"
                    : "mr-auto border border-gold/15 bg-surface-alt/50 text-muted",
                )}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            ))}
            {loading && (
              <div className="mr-auto rounded-lg border border-gold/15 bg-surface-alt/50 px-4 py-3 text-muted">
                <p className="mb-1 text-xs uppercase tracking-[0.12em] text-gold/80">
                  Thinking
                </p>
                <ThinkingIndicator />
              </div>
            )}
            {isTyping && (
              <div className="mr-auto rounded-lg border border-gold/15 bg-surface-alt/50 px-4 py-3 text-muted">
                <p className="whitespace-pre-wrap">
                  {visibleText}
                  <span
                    className="ml-0.5 inline-block h-[1.1em] w-0.5 animate-pulse bg-gold/70 align-text-bottom"
                    aria-hidden
                  />
                </p>
              </div>
            )}
          </div>

          <div className="border-t border-gold/15 px-5 py-4">
            <div className="menu-category-rail mb-3 flex gap-2 overflow-x-auto pb-1">
              {SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  disabled={busy}
                  onClick={() => sendMessage(suggestion)}
                  className="min-h-11 shrink-0 whitespace-nowrap rounded-full border border-gold/20 px-4 py-2 text-xs uppercase tracking-[0.06em] text-muted transition hover:border-gold/40 hover:text-gold disabled:opacity-50"
                >
                  {suggestion}
                </button>
              ))}
            </div>
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage(input);
              }}
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about a dish…"
                disabled={busy}
                className="luxury-input flex-1 py-3 text-base"
                maxLength={1000}
              />
              <Button
                type="submit"
                size="sm"
                disabled={busy || !input.trim()}
                aria-label="Send"
              >
                <Send size={18} />
              </Button>
            </form>
            <p className="mt-3 text-xs leading-relaxed text-muted">
              For severe allergies, always confirm with our team.{" "}
              <a href="/food-safety" className="text-gold hover:underline">
                Allergen info
              </a>
            </p>
          </div>
        </div>
      )}
    </>
  );
}
