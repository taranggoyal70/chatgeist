import type { ChatMessage, ChatgeistState, DecisionSelection, Phase, SpiritAxes } from "./types";

const warmWords = new Set(["love", "great", "yes", "kind", "beautiful", "together", "we", "win", "good", "please", "heart", "gg"]);
const chaoticWords = new Set(["chaos", "wild", "random", "crazy", "impossible", "no", "never", "fight", "versus", "vs"]);
const clusterStopWords = new Set(["a", "an", "and", "are", "but", "for", "i", "in", "is", "it", "of", "on", "one", "or", "the", "to", "we", "with"]);

const clamp = (value: number) => Math.max(0, Math.min(1, value));

export interface GroundedResult {
  answer: string;
  sourceIds: string[];
  axes: SpiritAxes;
  memoryPhrase: string;
  split: {
    active: boolean;
    leftLabel: string;
    rightLabel: string;
    leftSupportIds: string[];
    rightSupportIds: string[];
  };
}

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

export function meetsEvidenceThreshold(messages: ChatMessage[]): boolean {
  return messages.length >= 5 && new Set(messages.map((message) => message.userId)).size >= 3;
}

export function selectVisibleMessages(messages: ChatMessage[], sourceIds: string[], phase: Phase): ChatMessage[] {
  const sources = messages.filter((message) => sourceIds.includes(message.id)).slice(-5);
  if (phase === "collecting") return messages.slice(-5);
  return sources.length ? sources : messages.slice(-5);
}

export function resolveDecisionChoice(state: ChatgeistState, selection: DecisionSelection) {
  if (state.split.active && selection !== "recommendation") {
    const title = selection === "left" ? state.split.leftLabel : state.split.rightLabel;
    return {
      title,
      objective: `The streamer locked “${title}” from the community’s factions. Put it on stream now and let chat hold the decision.`,
      selection
    };
  }
  return {
    title: state.memoryPhrase || "The community recommendation",
    objective: state.answer,
    selection: "recommendation" as const
  };
}

export function deriveFallbackFactions(messages: ChatMessage[]) {
  const clusters: Array<{ messages: ChatMessage[]; tokens: Set<string> }> = [];
  for (const message of messages) {
    const tokens = new Set((message.text.toLowerCase().match(/[a-z0-9']+/g) ?? []).filter((token) => token.length > 2 && !clusterStopWords.has(token)));
    let best: { cluster: (typeof clusters)[number]; overlap: number } | undefined;
    for (const cluster of clusters) {
      const overlap = [...tokens].filter((token) => cluster.tokens.has(token)).length;
      if (!best || overlap > best.overlap) best = { cluster, overlap };
    }
    if (best && best.overlap > 0) {
      best.cluster.messages.push(message);
      for (const token of tokens) best.cluster.tokens.add(token);
    } else {
      clusters.push({ messages: [message], tokens });
    }
  }
  const supported = clusters.sort((a, b) => b.messages.length - a.messages.length).filter((cluster) => cluster.messages.length >= 2).slice(0, 2);
  const label = (cluster: (typeof clusters)[number]) => {
    const text = cluster.messages[0].text.replace(/[.!?]+$/g, "");
    return text.length > 42 ? `${text.slice(0, 41).trim()}…` : text;
  };
  return supported.length === 2 ? {
    active: true,
    leftLabel: label(supported[0]),
    rightLabel: label(supported[1]),
    leftSupportIds: supported[0].messages.map((message) => message.id),
    rightSupportIds: supported[1].messages.map((message) => message.id)
  } : { active: false, leftLabel: "", rightLabel: "", leftSupportIds: [] as string[], rightSupportIds: [] as string[] };
}

export function localFallback(messages: ChatMessage[], question: string): GroundedResult {
  const axes = computeAxes(messages);
  const visible = messages.slice(-5);
  const keyPhrases = visible.map((m) => m.text.replace(/[.!?]+$/g, "")).slice(0, 3);
  const split = deriveFallbackFactions(messages);
  const answer = keyPhrases.length
    ? `The room is leaning toward ${keyPhrases.join(", then ")}. The signal is ${axes.consensus > 0.62 ? "converging" : "still divided"}, so treat this as a grounded snapshot, not a unanimous vote.`
    : `I do not have enough eligible voices to answer “${question}” yet.`;
  return {
    answer,
    sourceIds: visible.map((m) => m.id),
    axes,
    memoryPhrase: keyPhrases[0] || "The signal is still forming",
    split
  };
}
