import { getMenu } from "../db/menu-store";
import {
  buildMenuContextText,
  searchMenuFallback,
} from "./assistant-context";
import type { MenuLocationSlug, MenuType } from "./types";

export interface AssistantMessage {
  role: "user" | "assistant";
  content: string;
}

const SYSTEM_PROMPT = `You are the Pho Ta menu assistant — a warm, knowledgeable guide for guests browsing Vietnamese cuisine at Pho Ta Finchley Road in London.

Rules:
- Answer ONLY using the menu data provided below for the guest's selected location and menu type.
- Mention dish names, descriptions, prices, and tags (Gluten free, Mild, Vegetarian, Vegan) when relevant.
- If asked about allergens or severe allergies: be helpful but ALWAYS say we cannot guarantee an allergen-free kitchen; guests must speak to a manager/server and read the food safety page. Never invent allergen-free guarantees.
- If a dish is not on the menu, say so politely and suggest similar options from the menu.
- Keep answers concise (2–4 short paragraphs max). Use plain English.
- Encourage booking at /book for reservations.
- Do not discuss topics unrelated to Pho Ta food, menu, dining, or visiting the restaurant.`;

function resolveOpenAiKey(): string | null {
  return process.env.OPENAI_API_KEY?.trim() || null;
}

function resolveModel(): string {
  return process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini";
}

export async function askMenuAssistant(input: {
  message: string;
  locationSlug: MenuLocationSlug;
  menuType: MenuType;
  history?: AssistantMessage[];
}): Promise<{ reply: string; mode: "ai" | "search" }> {
  const menu = await getMenu();
  const menuContext = buildMenuContextText(
    menu,
    input.locationSlug,
    input.menuType,
  );

  const apiKey = resolveOpenAiKey();
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
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: resolveModel(),
        temperature: 0.35,
        max_tokens: 600,
        messages: [
          {
            role: "system",
            content: `${SYSTEM_PROMPT}\n\n--- MENU DATA ---\n${menuContext}`,
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
