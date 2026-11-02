import type { ChatgeistState } from "./types";

const escapeXml = (value: string) => value.replace(/[<>&"']/g, (character) => ({
  "<": "&lt;",
  ">": "&gt;",
  "&": "&amp;",
  '"': "&quot;",
  "'": "&apos;"
}[character] ?? character));

export function wrapArtifactText(value: string, limit = 52): string[] {
  const lines: string[] = [];
  for (const word of value.trim().split(/\s+/)) {
    const last = lines.at(-1);
    if (!last || `${last} ${word}`.length > limit) lines.push(word);
    else lines[lines.length - 1] = `${last} ${word}`;
  }
  return lines.slice(0, 6);
}

export function buildDecisionArtifact(state: ChatgeistState): string {
  if (!state.decision) throw new Error("A locked decision is required to build an artifact.");
  const title = escapeXml(state.decision.title);
  const lines = wrapArtifactText(state.decision.objective).map((line, index) =>
    `<text x="112" y="${350 + index * 58}" class="answer">${escapeXml(line)}</text>`
  ).join("");
  const sources = state.messages.filter((message) => state.sourceIds.includes(message.id)).slice(0, 3).map((message, index) =>
    `<text x="112" y="${760 + index * 34}" class="source">SOURCE ${index + 1} · ${escapeXml(message.userName)} — ${escapeXml(message.text)}</text>`
  ).join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900">
  <defs>
    <radialGradient id="spirit" cx="40%" cy="30%"><stop stop-color="#f2c96d"/><stop offset=".36" stop-color="#ff7d73"/><stop offset="1" stop-color="#a78bfa"/></radialGradient>
    <linearGradient id="signal"><stop stop-color="#a78bfa"/><stop offset="1" stop-color="#72f7ff"/></linearGradient>
  </defs>
  <rect width="1600" height="900" fill="#050815"/>
  <circle cx="1310" cy="420" r="285" fill="none" stroke="#72f7ff" stroke-opacity=".18"/>
  <circle cx="1310" cy="420" r="208" fill="url(#spirit)" opacity=".82"/>
  <circle cx="1240" cy="395" r="12" fill="#fff6c8"/><circle cx="1375" cy="395" r="12" fill="#fff6c8"/>
  <text x="112" y="105" class="brand">◐ CHATGEIST · COMMUNITY DECISION</text>
  <text x="112" y="180" class="kicker">DECISION LOCKED</text>
  <text x="112" y="270" class="title">${title}</text>
  ${lines}
  <rect x="112" y="690" width="920" height="4" fill="url(#signal)"/>
  <text x="112" y="730" class="proof">${state.decision.participantCount} VOICES · ${state.decision.sourceCount} GROUNDED SOURCES · ${escapeXml(state.provenance.toUpperCase())}</text>
  ${sources}
  <style>
    .brand,.kicker,.proof,.source{font-family:ui-monospace,monospace;letter-spacing:3px}.brand{fill:#f6f2e8;font-size:22px;font-weight:700}.kicker{fill:#72f7ff;font-size:18px}.title{fill:#f6f2e8;font-family:Georgia,serif;font-size:62px}.answer{fill:#f6f2e8;font-family:Georgia,serif;font-size:38px}.proof{fill:#f2c96d;font-size:16px}.source{fill:#98a5bd;font-size:14px;letter-spacing:1px}
  </style>
</svg>`;
}
