# Chatgeist

**Tagline:** Turn Twitch chat into a living 3D co-host.

## Inspiration

Twitch chat is a community until it becomes too fast to understand. Streamers can read individual messages, run polls, or add fixed alerts, but they cannot ask the whole room a question and hear a grounded answer without losing the people and disagreement behind it.

We wanted to make the community itself visible.

## What it does

Chatgeist turns eligible Twitch chat into a procedural 3D spirit. Messages shape four visible dimensions—energy, consensus, warmth, and chaos. The streamer asks a question from a private control room, and Chatgeist considers a bounded evidence window before returning a concise answer with the exact representative source messages that shaped it.

When the room disagrees, Chatgeist does not flatten it into fake consensus. The spirit physically splits into two grounded factions. The streamer can then play an AI-generated community voice while the answer remains captioned and the source messages stay visible.

The project includes:

- Twitch EventSub chat ingestion
- a deterministic simulator using the same normalized input path
- Structured Outputs with source-ID validation
- AI-generated speech with visible disclosure
- an original procedural 3D spirit and CSS fallback
- separate private control and broadcast overlay surfaces
- explicit live, simulator, and fallback provenance
- streamer-owned playback and clear-session controls

## How we built it

The frontend uses React, TypeScript, Vite, React Three Fiber, Drei, Three.js, and postprocessing. A Fastify server owns the authoritative session state and broadcasts redacted snapshots through WebSockets.

Twitch EventSub subscribes to `channel.chat.message`. Simulator events use the same `ChatMessage` contract, so the UI and grounding pipeline cannot silently diverge.

For every question, the server sends only the active eligible evidence window to the OpenAI Responses API. A strict Zod schema requires:

- the grounded answer;
- three to five source message IDs;
- visual mood axes;
- a bounded faction split;
- a short memory phrase.

Every returned source ID must exist in the active window. If the API fails or the response cannot be trusted, Chatgeist uses an explicitly labeled local fallback. OpenAI's speech endpoint produces the community voice, while the exact answer remains visible as text.

## How we used Codex

Codex was our primary product and engineering collaborator. We used it to:

- inspect the official rules, deadlines, and judging criteria;
- research Twitch's current EventSub and chat authentication contracts;
- challenge an earlier AI-minigame direction that was reliable but not memorable;
- study repeatable patterns from highly successful hackathon projects without copying their work;
- write and adversarially review the product design;
- implement the state, grounding, voice, Twitch adapter, simulator, 3D experience, WebGL fallback, tests, and documentation;
- run strict TypeScript, production builds, browser console checks, and visual screenshot review.

The final submission includes the Codex session ID for this build thread.

## Challenges we ran into

### Designing for disagreement

A normal summarizer wants to collapse chat into one answer. That would misrepresent the room. We made disagreement a first-class visual state: low consensus can split the spirit into two factions, each backed by visible messages.

### Preserving truth during failure

The demo cannot depend on perfect GPU, Twitch, or model behavior. Chatgeist labels simulator and fallback states, keeps captions visible, and degrades from WebGL to a CSS procedural spirit instead of crashing.

### Making the interface part of the product

We rejected a generic dashboard. The public surface is a stellar signal observatory where chat fragments physically assemble the community. Operational controls remain on a separate private surface.

## Accomplishments that we're proud of

- A complete simulator-to-grounded-answer-to-voice loop runs today.
- Structured OpenAI output returns real source-backed factions and visual axes.
- The AI-generated community voice is playable and remains captioned.
- The interface survives a forced WebGL failure without losing product state.
- Tests, strict TypeScript, and production bundling pass.
- The product can be explained in one sentence: **we turn Twitch chat into a living 3D co-host.**

## What we learned

The highest-leverage decision was not technical. We stopped before implementation because the first idea was polished but familiar. Codex helped us replace it with a product where Twitch, voice, grounding, and 3D are one interaction rather than sponsor integrations placed side by side.

We also learned that provenance can be a design material. The source messages do not live in a debug panel; they orbit the entity and become part of the show.

## What's next

- Persistent opt-in community memories across streams
- channel-specific visual DNA and emote-derived materials
- raid fusion between two community spirits
- richer accessibility and streamer moderation controls
- downloadable Memory Seal clips in addition to still images

## Built with

React, TypeScript, Vite, React Three Fiber, Drei, Three.js, postprocessing, Fastify, WebSockets, Zod, Vitest, OpenAI Responses API, OpenAI Audio Speech API, Twitch EventSub, Codex
