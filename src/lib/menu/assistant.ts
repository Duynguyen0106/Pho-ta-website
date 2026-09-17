import { getMenu } from "../db/menu-store";
import {
  buildFullMenuCatalog,
  buildMenuContextText,
  searchMenuFallback,
} from "./assistant-context";
import {
  buildAssistantKnowledgeText,
  findPreparedAnswer,
} from "./assistant-knowledge";
import type { MenuLocationSlug, MenuType } from "./types";

export type AssistantReplyMode = "ai" | "prepared" | "search";

export interface AssistantMessage {
  role: "user" | "assistant";
  content: string;
}

const SYSTEM_PROMPT = `You are the Pho Ta menu expert — a warm, knowledgeable specialist in Vietnamese cuisine, focused on Pho Ta Finchley Road in London.

Your role:
- Explain Vietnamese dishes, ingredients, cooking styles, and how to choose between similar items (pho vs bun vs broken rice, spring rolls vs summer rolls, etc.)
- Answer using ONLY the RESTAURANT FACTS, VIETNAMESE EXPERTISE, and COMPLETE MENU DATA below — every dish name, price, description, tag, and protein variant must come from that data
- When asked about a specific dish, quote its menu code (e.g. M01), exact name, price, description, tags, and protein options
- Mention which menu it is on (Daily or Lunch) and note if the guest is viewing a different tab
- For recommendations, suggest signature ★ dishes and explain why in plain English

Rules:
- Never invent dishes, prices, ingredients, or allergen guarantees
- For allergies: tags (Gluten free, Vegetarian, Vegan, Mild) are guides only — always say we cannot guarantee an allergen-free kitchen; direct guests to /food-safety and to speak to staff
- Keep answers helpful and concise (2–5 short paragraphs). Use bullet points for lists of dishes
- Encourage booking at /book for reservations
- Decline unrelated topics politely — you only discuss Pho Ta food, menu, Vietnamese dining, and visiting the restaurant`;

function resolveApiKey(): string | null {
  return process.env.OPENAI_API_KEY?.trim() || null;
}

function resolveChatEndpoint(apiKey: string): string {
  const custom = process.env.OPENAI_BASE_URL?.trim();
  if (custom) return `${custom.replace(/\/$/, "")}/chat/completions`;
  if (apiKey.startsWith("sk-or-")) {
    return "https://openrouter.ai/api/v1/chat/completions";
  }
  return "https://api.openai.com/v1/chat/completions";
}

function resolveModel(apiKey: string): string {
  const configured = process.env.OPENAI_MODEL?.trim();
  if (configured) return configured;
  if (apiKey.startsWith("sk-or-")) return "openai/gpt-4o-mini";
  return "gpt-4o-mini";
}

export async function askMenuAssistant(input: {
  message: string;
  locationSlug: MenuLocationSlug;
  menuType: MenuType;
  history?: AssistantMessage[];
}): Promise<{ reply: string; mode: AssistantReplyMode }> {
  const menu = await getMenu();
  const ctx = {
    menu,
    locationSlug: input.locationSlug,
    menuType: input.menuType,
  };
  const fullMenuCatalog = buildFullMenuCatalog(menu, input.locationSlug);
  const currentView = buildMenuContextText(
    menu,
    input.locationSlug,
    input.menuType,
  );
  const knowledgeContext = buildAssistantKnowledgeText(ctx);

  const prepared = findPreparedAnswer(input.message, ctx);
  if (prepared) {
    return { reply: prepared.reply, mode: "prepared" };
  }

  const apiKey = resolveApiKey();
  if (!apiKey) {
    return {
      reply: searchMenuFallback(
        menu,
        input.locationSlug,
        input.menuType,
        input.message,
      ),
      mode: "search",
    };
  }

  const history = (input.history ?? []).slice(-6).map((m) => ({
    role: m.role,
    content: m.content.slice(0, 2000),
  }));

  try {
    const endpoint = resolveChatEndpoint(apiKey);
    const headers: Record<string, string> = {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    };
    if (endpoint.includes("openrouter.ai")) {
      headers["HTTP-Referer"] =
        process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://phota.vercel.app";
      headers["X-Title"] = "Pho Ta Menu Helper";
    }

    const response = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: resolveModel(apiKey),
        temperature: 0.4,
        max_tokens: 900,
        messages: [
          {
            role: "system",
            content: [
              SYSTEM_PROMPT,
              "",
              "--- RESTAURANT & VIETNAMESE EXPERTISE ---",
              knowledgeContext,
              "",
              "--- COMPLETE MENU DATA (Daily + Lunch — source of truth for all dishes) ---",
              fullMenuCatalog,
              "",
              "--- GUEST CURRENT VIEW ---",
              currentView,
            ].join("\n"),
          },
          ...history,
          { role: "user", content: input.message.slice(0, 1000) },
        ],
      }),
    });

    if (!response.ok) {
      console.error("[menu-assistant] OpenAI error", await response.text());
      return {
        reply: searchMenuFallback(
          menu,
          input.locationSlug,
          input.menuType,
          input.message,
        ),
        mode: "search",
      };
    }

    const data = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const reply = data.choices?.[0]?.message?.content?.trim();

    if (!reply) {
      return {
        reply: searchMenuFallback(
          menu,
          input.locationSlug,
          input.menuType,
          input.message,
        ),
        mode: "search",
      };
    }

    return { reply, mode: "ai" };
  } catch (error) {
    console.error("[menu-assistant]", error);
    return {
      reply: searchMenuFallback(
        menu,
        input.locationSlug,
        input.menuType,
        input.message,
      ),
      mode: "search",
    };
  }
}
