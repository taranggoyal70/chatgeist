# Title

Chatgeist

## One-line Summary

Turn Twitch chat into a living 3D community co-host.

## Problem

Twitch chat is the emotional center of a stream, but its best moments disappear inside a fast-moving wall of messages. Polls reduce a community to percentages, and generic AI chatbots flatten thousands of distinct voices into one untraceable answer. Streamers need a way to make the room's collective mood, disagreement, and creativity visible without surrendering trust or control.

## Solution

Chatgeist transforms eligible Twitch chat into a living procedural 3D decision co-host. Its shape, color, energy, and two visible factions respond to the room in real time. A streamer opens a timed evidence window; Chatgeist answers using only those post-question messages, shows which voices shaped each faction, and lets the streamer lock one outcome into the show. The broadcast overlay becomes a dramatic community ritual, and the final decision exports as a shareable card.

The result is not another chatbot. It is a new character jointly performed by the streamer and their community.

## Why This Matters

Chatgeist gives viewers an immediate sense that their participation changes the show. It gives streamers a repeatable ritual for decisions, debates, predictions, recaps, and community storytelling. Most importantly, it keeps AI accountable: the audience can see whether an answer came from chat, the stream context, or the system fallback.

## How We Used AI

Chatgeist uses OpenAI Structured Outputs to convert a bounded window of eligible chat into a grounded response, representative source IDs, supported faction IDs, and visual mood axes. Those mood axes drive the spirit's procedural form, while OpenAI text-to-speech gives the summoned answer a distinctive voice. If an AI request is unavailable, Chatgeist falls back to transparent lexical clustering and labels the provenance instead of inventing a successful state.

## How We Used Codex

Codex was our end-to-end build partner. We used it to study the hackathon requirements, challenge and refine the product concept, design the interaction and visual system, implement the Twitch EventSub adapter, build the Fastify/WebSocket backend and React/Three.js interfaces, add grounded Structured Output and voice generation, write tests, run TypeScript and production-build checks, perform browser QA, create the public documentation, and author the HyperFrames launch film.

The primary Codex session ID is `01a183dc-c058-70b1-8cf6-3f99cc1b1cc7` (pending participant confirmation before submission).

## Key Features

- Living procedural 3D community spirit whose form reflects chat mood and energy
- Timed decision windows with live participation proof
- Two visible opinion factions with unique-support counts instead of a misleading single consensus
- Grounded answers with representative Twitch-message evidence and source provenance
- Explicit faction locking that turns discussion into an on-stream objective
- Downloadable 1600×900 decision artifact with sources and provenance
- Separate streamer control room and broadcast-safe overlay
- OpenAI voice co-host with a deterministic text fallback
- Real Twitch EventSub WebSocket adapter plus a clearly labeled simulator for local testing
- Privacy-minded ingestion that stores only the bounded data needed for the current ritual
- WebGL fallback so the demo remains legible on unsupported devices

## Architecture

Twitch EventSub chat messages enter a Fastify server through a normalized adapter. The same contract powers the deterministic simulator used for local development. Each question clears the summoning messages and opens a fresh bounded evidence window. The server broadcasts the countdown, participant count, visual axes, and normalized messages over WebSocket. OpenAI Structured Outputs returns the grounded response, representative message IDs, two optional faction labels, and faction-support IDs; every ID is validated against the active window. The streamer chooses which supported outcome to lock. The server then generates a downloadable SVG decision artifact, while the client animates and voices the result.

## Testing Instructions

1. Clone the public repository.
2. Run `npm install`.
3. Copy `.env.example` to `.env.local` and add an OpenAI API key for grounded answers and voice.
4. Run `npm run dev`.
5. Open `http://localhost:4173/control` for the streamer control room.
6. Open `http://localhost:4173/overlay` for the broadcast overlay.
7. Use the simulator to verify summon → timed window → grounded factions → lock → decision-card download, or configure the documented Twitch environment variables to connect a real channel.
8. Run `npm run verify` to execute tests, strict TypeScript checking, and a production build.

## Public Demo Link

The app is currently demonstrated locally at `http://localhost:4173/control` and `http://localhost:4173/overlay`. A public hosted demo is not required by the hackathon and is not yet provided.

## Public Repository Link

https://github.com/taranggoyal70/chatgeist

## Demo Video

Unlisted YouTube demo: https://youtu.be/977clRaoDzw

The 72-second delivery film opens with verified real Twitch EventSub ingestion, then uses a permanently labeled simulator for the complete multi-viewer decision ritual. It includes AI narration, Chatgeist's disclosed product voice, grounded factions, explicit streamer locking, Codex implementation evidence, and the public repository. YouTube reports no copyright or Community Guidelines issues.

## Screenshot Shot List

1. Verified **LIVE TWITCH** overlay receiving three real `taranggoyal` chat messages
2. Control room with Twitch health `ready` and input source set to Twitch
3. Summoning ritual with the spirit reacting to chat
4. Timed decision window with participant count
5. Grounded faction split with representative sources and support counts
6. Explicit faction lock and clean broadcast outcome
7. Downloaded decision card
8. Brief Codex evidence and public repository proof

## Submission Readiness Notes

- Public repository is available and contains all source code, assets, setup instructions, and tests.
- The project title, tagline, description, technology list, repository link, and thumbnail are saved on Devpost.
- The app has passed unit tests, strict TypeScript checking, production build, and browser QA.
- Twitch public-client device authorization, token validation, EventSub subscription, and real chat ingestion are verified end to end.
- The final HyperFrames film passes its technical, layout, contrast, craft, and audio checks and is uploaded to YouTube.
- The Devpost project is **not submitted**. `submitted_at` is null.

## Known Limitations

- The live proof uses one authenticated Twitch account; the labeled simulator demonstrates the multi-viewer ritual because no additional real chatters were available.
- The checked-in simulator is for development and judging reproducibility; it must not be presented as the required real-Twitch proof.
- The Three.js experience uses a CSS visual fallback when WebGL is unavailable.
- The YouTube video is Unlisted and available to judges with the link.

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
