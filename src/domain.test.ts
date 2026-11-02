import { describe, expect, it } from "vitest";
import { computeAxes, deriveFallbackFactions, localFallback, meetsEvidenceThreshold, resolveDecisionChoice, sanitizeChatText, selectVisibleMessages } from "./domain";
import type { ChatgeistState } from "./types";
import type { ChatMessage } from "./types";

const messages: ChatMessage[] = [
  { id: "1", userId: "a", userName: "Maya", text: "we love impossible mode", timestamp: 1, source: "simulator" },
  { id: "2", userId: "b", userName: "Jon", text: "yes impossible mode", timestamp: 2, source: "simulator" },
  { id: "3", userId: "c", userName: "Rin", text: "no healing, pure chaos", timestamp: 3, source: "simulator" }
];

describe("Chatgeist domain", () => {
  it("derives bounded visual axes", () => {
    const axes = computeAxes(messages);
    for (const value of Object.values(axes)) expect(value).toBeGreaterThanOrEqual(0);
    for (const value of Object.values(axes)) expect(value).toBeLessThanOrEqual(1);
    expect(axes.energy).toBeGreaterThan(0.3);
  });

  it("rejects URLs and overlength chat", () => {
    expect(sanitizeChatText("https://example.com" )).toBeNull();
    expect(sanitizeChatText("x".repeat(181))).toBeNull();
    expect(sanitizeChatText("  one   more run  ")).toBe("one more run");
  });

  it("requires five messages from at least three unique community voices", () => {
    expect(meetsEvidenceThreshold(Array.from({ length: 5 }, (_, index) => ({ ...messages[0], id: String(index) })))).toBe(false);
    expect(meetsEvidenceThreshold([...messages, { ...messages[0], id: "4" }, { ...messages[1], id: "5" }])).toBe(true);
  });

  it("creates a truthful local fallback", () => {
    const result = localFallback(messages, "What next?");
    expect(result.sourceIds).toEqual(["1", "2", "3"]);
    expect(result.answer).toContain("grounded snapshot");
    expect(result.split).toMatchObject({ active: false, leftSupportIds: [], rightSupportIds: [] });
  });

  it("caps the visible orbit and prioritizes grounded sources", () => {
    const expanded = Array.from({ length: 8 }, (_, index) => ({
      ...messages[index % messages.length],
      id: String(index + 1),
      timestamp: index + 1
    }));

    expect(selectVisibleMessages(expanded, [], "collecting").map((message) => message.id)).toEqual(["4", "5", "6", "7", "8"]);
    expect(selectVisibleMessages(expanded, ["1", "3", "6"], "answer-ready").map((message) => message.id)).toEqual(["1", "3", "6"]);
  });

  it("turns a faction choice into a concrete locked objective", () => {
    const state = {
      split: { active: true, leftLabel: "No healing", rightLabel: "One shield", leftCount: 3, rightCount: 2 },
      memoryPhrase: "Still divided",
      answer: "The room is split."
    } as ChatgeistState;
    expect(resolveDecisionChoice(state, "right")).toEqual({
      title: "One shield",
      objective: "The streamer locked “One shield” from the community’s factions. Put it on stream now and let chat hold the decision.",
      selection: "right"
    });
  });

  it("derives fallback factions only from repeated lexical themes", () => {
    const themed: ChatMessage[] = [
      { ...messages[0], id: "a", text: "one life with inverted controls" },
      { ...messages[1], id: "b", text: "keep one life, chat picks controls" },
      { ...messages[2], id: "c", text: "give us a mercy shield" },
      { ...messages[0], id: "d", text: "one mercy shield on impossible mode" }
    ];
    const split = deriveFallbackFactions(themed);
    expect(split.active).toBe(true);
    expect(split.leftSupportIds).toHaveLength(2);
    expect(split.rightSupportIds).toHaveLength(2);
    expect(deriveFallbackFactions(themed.slice(0, 3)).active).toBe(false);
  });

  it("keeps the shipped simulator's life and mercy themes separate", () => {
    const simulatorEvidence = [
      "inverted controls, but keep one life",
      "no healing, pure chaos",
      "one life and the room picks the rules",
      "give the streamer one mercy shield",
      "impossible mode with one mercy shield",
      "one more run if we lose"
    ].map((text, index) => ({ ...messages[index % messages.length], id: `sim-${index}`, userId: `sim-user-${index}`, text }));
    const split = deriveFallbackFactions(simulatorEvidence);
    expect(split.active).toBe(true);
    expect(split.leftSupportIds).toEqual(["sim-0", "sim-2"]);
    expect(split.rightSupportIds).toEqual(["sim-3", "sim-4"]);
  });
});
