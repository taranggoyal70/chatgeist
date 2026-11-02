import { describe, expect, it } from "vitest";
import { buildDecisionArtifact, wrapArtifactText } from "./artifact";
import type { ChatgeistState } from "./types";

describe("decision artifact", () => {
  it("wraps long objectives into bounded lines", () => {
    expect(wrapArtifactText("one two three four five", 9)).toEqual(["one two", "three", "four five"]);
  });

  it("escapes community content in the exported SVG", () => {
    const state = {
      decision: { title: "Chat <wins>", objective: "Do A & B", lockedAt: 1, participantCount: 4, sourceCount: 1 },
      messages: [{ id: "1", userId: "u", userName: "Maya", text: "one <life>", timestamp: 1, source: "simulator" }],
      sourceIds: ["1"],
      memoryPhrase: "Choose <wisely>",
      axes: { energy: 0.8, consensus: 0.4, warmth: 0.7, chaos: 0.6 },
      mode: "simulator",
      provenance: "simulated"
    } as ChatgeistState;
    const svg = buildDecisionArtifact(state);
    expect(svg).toContain("Chat &lt;wins&gt;");
    expect(svg).toContain("Do A &amp; B");
    expect(svg).not.toContain("one <life>");
  });
});
