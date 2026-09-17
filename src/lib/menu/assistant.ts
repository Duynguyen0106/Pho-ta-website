import { getMenu } from "../db/menu-store";
import {
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

const SYSTEM_PROMPT = `You are the Pho Ta menu assistant — a warm, knowledgeable guide for guests browsing Vietnamese cuisine at Pho Ta Finchley Road in London.

Rules:
- Use the RESTAURANT FACTS and MENU DATA below. For common topics (hours, booking, allergies, signatures, dietary tags), follow the prepared guidance.
- Mention dish names, descriptions, prices, and tags (Gluten free, Mild, Vegetarian, Vegan) when relevant.
- If asked about allergens or severe allergies: be helpful but ALWAYS say we cannot guarantee an allergen-free kitchen; guests must speak to a manager/server and read /food-safety. Never invent allergen-free guarantees.
- If a dish is not on the menu, say so politely and suggest similar options from the menu.
- Keep answers concise (2–4 short paragraphs max). Use plain English.
- Encourage booking at /book for reservations.
- Do not discuss topics unrelated to Pho Ta food, menu, dining, or visiting the restaurant.`;

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
  const menuContext = buildMenuContextText(
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
        temperature: 0.35,
        max_tokens: 600,
        messages: [
          {
            role: "system",
            content: `${SYSTEM_PROMPT}\n\n--- RESTAURANT & GUIDANCE ---\n${knowledgeContext}\n\n--- MENU DATA ---\n${menuContext}`,
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
