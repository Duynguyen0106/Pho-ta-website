"use client";

import { MessageCircle, Send, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
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
  "What are your signature dishes?",
  "Gluten-free options?",
  "Tell me about the pho",
  "Vegetarian dishes?",
];

export function MenuAssistant({ menuTab, branchLabel }: MenuAssistantProps) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: `Hello! I can help you explore the ${menuTab === "daily" ? "daily" : "lunch"} menu at Pho Ta ${branchLabel}. Ask about dishes, prices, dietary tags, or recommendations.`,
    },
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, open, loading]);

  useEffect(() => {
    setMessages([
      {
        role: "assistant",
        content: `Showing the ${menuTab === "daily" ? "daily" : "lunch"} menu for ${branchLabel}. What would you like to know?`,
      },
    ]);
  }, [menuTab, branchLabel]);

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

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

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Sorry, I couldn't answer that just now. Please try again or ask our team when you visit.",
        },
      ]);
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
          className="fixed bottom-6 right-6 z-40 flex items-center gap-3 rounded-full border border-gold/40 bg-gold px-5 py-4 text-base font-medium uppercase tracking-[0.1em] text-white shadow-lg transition hover:bg-gold-light sm:bottom-8 sm:right-8"
          aria-label="Open menu assistant"
        >
          <MessageCircle size={22} strokeWidth={1.5} />
          <span className="hidden sm:inline">Menu helper</span>
        </button>
      )}

      {open && (
        <div
          className="fixed bottom-0 right-0 z-50 flex h-[min(560px,100dvh)] w-full flex-col border border-gold/20 bg-background shadow-2xl sm:bottom-8 sm:right-8 sm:h-[520px] sm:max-w-md sm:rounded-lg"
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
                Thinking…
              </div>
            )}
          </div>

          <div className="border-t border-gold/15 px-5 py-4">
            <div className="mb-3 flex flex-wrap gap-2">
              {SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  disabled={loading}
                  onClick={() => sendMessage(suggestion)}
                  className="rounded-full border border-gold/20 px-3 py-1.5 text-xs uppercase tracking-[0.06em] text-muted transition hover:border-gold/40 hover:text-gold disabled:opacity-50"
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
                disabled={loading}
                className="luxury-input flex-1 py-3 text-base"
                maxLength={1000}
              />
              <Button
                type="submit"
                size="sm"
                disabled={loading || !input.trim()}
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
