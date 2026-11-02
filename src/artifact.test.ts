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
      provenance: "simulated"
    } as ChatgeistState;
    const svg = buildDecisionArtifact(state);
    expect(svg).toContain("Chat &lt;wins&gt;");
    expect(svg).toContain("Do A &amp; B");
    expect(svg).not.toContain("one <life>");
  });
});
