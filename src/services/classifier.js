// classifier.js — AI classification via Claude API, keyword fallback on error

import { CATEGORIES } from "../utils/constants";
import { keywordFallback } from "../utils/helpers";

const API_URL = "https://api.anthropic.com/v1/messages";
const MODEL   = "claude-sonnet-4-20250514";

export async function classifyDocument(text, filename) {
  const snippet = text.slice(0, 3500);
  const catList = CATEGORIES
    .filter((c) => c.id !== "all")
    .map((c) => `- ${c.id}: ${c.label}`)
    .join("\n");

  const prompt =
    "You are a document classification system. Classify into exactly one category.\n\n" +
    "Categories:\n" + catList + "\n\n" +
    'Filename: "' + filename + '"\nText:\n"""\n' + snippet + '\n"""\n\n' +
    'Reply ONLY with raw JSON: {"categoryId":"<id>","confidence":<0.0-1.0>,"summary":"<one sentence>"}';

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 200,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    if (!res.ok) throw new Error("API " + res.status);
    const data   = await res.json();
    const raw    = data.content.map((b) => b.text || "").join("").trim();
    const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
    const validIds = CATEGORIES.filter((c) => c.id !== "all").map((c) => c.id);
    if (!validIds.includes(parsed.categoryId)) parsed.categoryId = "personal";
    parsed.confidence = Math.min(1, Math.max(0, parseFloat(parsed.confidence) || 0.7));
    return parsed;
  } catch {
    return keywordFallback(text, filename);
  }
}
