# Title

Chatgeist

## One-line Summary

Turn Twitch chat into a living 3D community co-host.

## Problem

Twitch chat is the emotional center of a stream, but its best moments disappear inside a fast-moving wall of messages. Polls reduce a community to percentages, and generic AI chatbots flatten thousands of distinct voices into one untraceable answer. Streamers need a way to make the room's collective mood, disagreement, and creativity visible without surrendering trust or control.

## Solution

Chatgeist transforms eligible Twitch chat into a living procedural 3D spirit. Its shape, color, energy, and two orbiting factions respond to the room in real time. When the streamer summons it, Chatgeist answers as a voice co-host using only the visible messages and stream context in its grounding window. The control room shows which messages shaped the answer, while a broadcast-safe overlay turns that state into a dramatic audience moment.

The result is not another chatbot. It is a new character jointly performed by the streamer and their community.

## Why This Matters

Chatgeist gives viewers an immediate sense that their participation changes the show. It gives streamers a repeatable ritual for decisions, debates, predictions, recaps, and community storytelling. Most importantly, it keeps AI accountable: the audience can see whether an answer came from chat, the stream context, or the system fallback.

## How We Used AI

Chatgeist uses OpenAI Structured Outputs to convert a bounded window of eligible chat into a grounded response, representative source IDs, a confidence value, and visual mood axes. Those mood axes drive the spirit's procedural form, while OpenAI text-to-speech gives the summoned answer a distinctive voice. If an AI request is unavailable, Chatgeist falls back deterministically and labels the provenance instead of inventing a successful state.

## How We Used Codex

Codex was our end-to-end build partner. We used it to study the hackathon requirements, challenge and refine the product concept, design the interaction and visual system, implement the Twitch EventSub adapter, build the Fastify/WebSocket backend and React/Three.js interfaces, add grounded Structured Output and voice generation, write tests, run TypeScript and production-build checks, perform browser QA, create the public documentation, and author the HyperFrames launch film.

The primary Codex session ID is `01a183dc-c058-70b1-8cf6-3f99cc1b1cc7` (pending participant confirmation before submission).

## Key Features

- Living procedural 3D community spirit whose form reflects chat mood and energy
- Two visible opinion factions instead of a misleading single consensus
- Grounded answers with representative Twitch-message evidence and source provenance
- Separate streamer control room and broadcast-safe overlay
- OpenAI voice co-host with a deterministic text fallback
- Real Twitch EventSub WebSocket adapter plus a clearly labeled simulator for local testing
- Privacy-minded ingestion that stores only the bounded data needed for the current ritual
- WebGL fallback so the demo remains legible on unsupported devices

## Architecture

Twitch EventSub chat messages enter a Fastify server through a normalized adapter. The same contract powers the deterministic simulator used for local development. The server maintains a bounded session state and broadcasts updates over WebSocket to the React control room and overlay. A summon request sends only eligible, visible messages and stream context to OpenAI Structured Outputs. The validated result includes the response, representative message IDs, confidence, faction balance, and visual axes. The client then animates the Three.js spirit and plays the generated voice response.

## Testing Instructions

1. Clone the public repository.
2. Run `npm install`.
3. Copy `.env.example` to `.env.local` and add an OpenAI API key for grounded answers and voice.
4. Run `npm run dev`.
5. Open `http://localhost:4173/control` for the streamer control room.
6. Open `http://localhost:4173/overlay` for the broadcast overlay.
7. Use the simulator to verify the complete ritual without credentials, or configure the documented Twitch environment variables to connect a real channel.
8. Run `npm run verify` to execute tests, strict TypeScript checking, and a production build.

## Public Demo Link

The app is currently demonstrated locally at `http://localhost:4173/control` and `http://localhost:4173/overlay`. A public hosted demo is not required by the hackathon and is not yet provided.

## Public Repository Link

https://github.com/taranggoyal70/chatgeist

## Demo Video

Provisional local render: `video/chatgeist-demo/renders/chatgeist-demo_2026-11-02_09-55-56.mp4`

This render is intentionally marked provisional because its simulator shot must be replaced with a visible real-Twitch capture before upload. The final public video URL is still required.

## Screenshot Shot List

1. Control room in ready state with source provenance visible
2. Summoning ritual with the spirit reacting to chat
3. Grounded answer with representative messages and confidence
4. Broadcast overlay with the final voice co-host moment
5. Brief Codex evidence and public repository proof

## Submission Readiness Notes

- Public repository is available and contains all source code, assets, setup instructions, and tests.
- The project title, tagline, description, technology list, repository link, and thumbnail are saved on Devpost.
- The app has passed unit tests, strict TypeScript checking, production build, and browser QA.
- The provisional HyperFrames film passes its technical and accessibility checks.
- The Devpost project is **not submitted**. `submitted_at` is null.

## Known Limitations

- A real Twitch developer application, user token, and channel capture are still required for the final eligibility video.
- The checked-in simulator is for development and judging reproducibility; it must not be presented as the required real-Twitch proof.
- The Three.js experience uses a CSS visual fallback when WebGL is unavailable.
- The final public video URL has not been added to Devpost.

## TODO Official Form Fields

- Confirm submitter type: Individual or Team of Individuals
- Confirm country
- Confirm the Codex session ID above
- Choose Codex learning impact (recommended: Significantly)
- Choose likelihood of using Codex again (recommended: Very likely)
- Confirm age-of-majority eligibility
- Confirm eligible jurisdiction
- Confirm participant is not an employee or agent of the organizers/sponsors
- Record and upload the final video showing Chatgeist working with real Twitch
- Add the final video URL and perform the final readiness review before explicit submission approval
