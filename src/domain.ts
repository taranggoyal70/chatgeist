import type { ChatMessage, Phase, SpiritAxes } from "./types";

const warmWords = new Set(["love", "great", "yes", "kind", "beautiful", "together", "we", "win", "good", "please", "heart", "gg"]);
const chaoticWords = new Set(["chaos", "wild", "random", "crazy", "impossible", "no", "never", "fight", "versus", "vs"]);

const clamp = (value: number) => Math.max(0, Math.min(1, value));

export function computeAxes(messages: ChatMessage[]): SpiritAxes {
  if (!messages.length) return { energy: 0.18, consensus: 0.5, warmth: 0.56, chaos: 0.2 };

  const tokens = messages.flatMap((message) => message.text.toLowerCase().match(/[a-z0-9']+/g) ?? []);
  const counts = new Map<string, number>();
  for (const token of tokens) counts.set(token, (counts.get(token) ?? 0) + 1);

  const repeated = [...counts.values()].filter((count) => count > 1).reduce((sum, count) => sum + count, 0);
  const warm = tokens.filter((token) => warmWords.has(token)).length;
  const chaotic = tokens.filter((token) => chaoticWords.has(token)).length;
  const uniqueRatio = counts.size / Math.max(1, tokens.length);

  return {
    energy: clamp(0.22 + messages.length / 14),
    consensus: clamp(0.34 + repeated / Math.max(4, tokens.length)),
    warmth: clamp(0.42 + warm / Math.max(3, tokens.length) * 2.4),
    chaos: clamp(0.16 + uniqueRatio * 0.4 + chaotic / Math.max(3, tokens.length) * 1.8)
  };
}

export function sanitizeChatText(text: string): string | null {
  const clean = text.replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim();
  if (!clean || clean.length > 180 || /https?:\/\//i.test(clean)) return null;
  return clean;
}

export function selectVisibleMessages(messages: ChatMessage[], sourceIds: string[], phase: Phase): ChatMessage[] {
  const sources = messages.filter((message) => sourceIds.includes(message.id)).slice(-5);
  if (phase === "collecting") return messages.slice(-5);
  return sources.length ? sources : messages.slice(-5);
}

export function localFallback(messages: ChatMessage[], question: string) {
  const axes = computeAxes(messages);
  const visible = messages.slice(-5);
  const keyPhrases = visible.map((m) => m.text.replace(/[.!?]+$/g, "")).slice(0, 3);
  const answer = keyPhrases.length
    ? `The room is leaning toward ${keyPhrases.join(", then ")}. The signal is ${axes.consensus > 0.62 ? "converging" : "still divided"}, so treat this as a grounded snapshot, not a unanimous vote.`
    : `I do not have enough eligible voices to answer “${question}” yet.`;
  return {
    answer,
    sourceIds: visible.map((m) => m.id),
    axes,
    memoryPhrase: keyPhrases[0] || "The signal is still forming",
    split: {
      active: axes.consensus < 0.5 && messages.length >= 4,
      leftLabel: keyPhrases[0] || "One side",
      rightLabel: keyPhrases[1] || "Another side"
    }
  };
}
