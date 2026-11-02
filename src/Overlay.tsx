import { useEffect, useState } from "react";
import type { ChatgeistState } from "./types";
import { SpiritScene } from "./SpiritScene";
import { selectVisibleMessages } from "./domain";

const phaseLabel: Record<ChatgeistState["phase"], string> = {
  dormant: "Signal dormant",
  summoning: "The room is taking form",
  present: "Chatgeist is present",
  collecting: "Listening to the room",
  grounding: "Finding the shared signal",
  "answer-ready": "A grounded voice has formed",
  speaking: "The room speaks",
  locked: "Decision locked by chat",
  remembered: "Memory sealed",
  error: "The signal broke"
};

export function Overlay({ state, compact = false }: { state: ChatgeistState; compact?: boolean }) {
  const visible = selectVisibleMessages(state.messages, state.sourceIds, state.phase);
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (state.phase !== "collecting") return;
    const timer = window.setInterval(() => setNow(Date.now()), 100);
    return () => window.clearInterval(timer);
  }, [state.phase]);
  const totalCollectionMs = state.collectionStartedAt && state.collectionEndsAt ? state.collectionEndsAt - state.collectionStartedAt : 1;
  const remainingMs = state.collectionEndsAt ? Math.max(0, state.collectionEndsAt - now) : 0;
  const collectionProgress = state.collectionStartedAt ? Math.min(1, Math.max(0, (now - state.collectionStartedAt) / totalCollectionMs)) : 0;
  const heading = state.phase === "locked" && state.decision ? state.decision.title : state.phase === "dormant" ? "Summon your community." : state.question || "The room is becoming visible.";
  const answer = state.phase === "locked" && state.decision ? state.decision.objective : state.answer;
  const factionTotal = Math.max(1, state.split.leftCount + state.split.rightCount);

  return (
    <main className={`observatory ${compact ? "is-compact" : ""}`} data-phase={state.phase}>
      <div className="sky"><SpiritScene state={state} /></div>
      <div className="observatory__chrome">
        <header className="signal-header">
          <div><span className="sigil">◐</span><strong>CHATGEIST</strong></div>
          <div className="mode-ribbon" data-mode={state.provenance}>{state.provenance === "simulated" ? "SIMULATED CHAT" : state.provenance === "fallback" ? "GROUNDED FALLBACK" : "LIVE TWITCH"}</div>
        </header>

        {state.phase === "collecting" && <section className="collection-window" aria-label={`${Math.ceil(remainingMs / 1000)} seconds left in the decision window`}>
          <div><strong>{Math.ceil(remainingMs / 1000)}</strong><span>seconds</span></div>
          <p>Community decision window</p>
          <b>{state.participantCount} voices</b>
          <i style={{ transform: `scaleX(${collectionProgress})` }} />
        </section>}

        <section className="ritual-copy" aria-live="polite">
          <p className="eyebrow">{phaseLabel[state.phase]}</p>
          <h1>{heading}</h1>
          {answer && <blockquote>{answer}</blockquote>}
          {state.voiceReady && <p className="voice-disclosure">{state.voiceDisclosure}</p>}
          {state.phase === "locked" && state.decision && <div className="lock-proof"><strong>Decision locked</strong><span>{state.decision.participantCount} voices</span><span>{state.decision.sourceCount} grounded sources</span></div>}
        </section>

        <section className="message-orbit" aria-label="Representative chat messages">
          {visible.map((message, index) => {
            const isSource = state.sourceIds.includes(message.id);
            return (
            <article key={message.id} className={`message-fragment fragment-${index + 1} ${isSource ? "is-source" : ""}`} aria-label={`${isSource ? `Grounding source ${index + 1}. ` : ""}${message.userName}: ${message.text}`}>
              <span>{message.userName}</span>
              {isSource && <em className="source-badge">Source {index + 1}</em>}
              <p>{message.text}</p>
            </article>
          );})}
        </section>

        {state.split.active && <div className="faction-key">
          <div><strong>{state.split.leftLabel}</strong><small>{state.split.leftCount} voices</small><b style={{ transform: `scaleX(${state.split.leftCount / factionTotal})` }} /></div>
          <p>the room is divided</p>
          <div><strong>{state.split.rightLabel}</strong><small>{state.split.rightCount} voices</small><b style={{ transform: `scaleX(${state.split.rightCount / factionTotal})` }} /></div>
        </div>}

        <footer className="signal-footer">
          <div className="axis"><span>Energy</span><output>{Math.round(state.axes.energy * 100)}</output><b style={{ width: `${state.axes.energy * 100}%` }} /></div>
          <div className="axis"><span>Consensus</span><output>{Math.round(state.axes.consensus * 100)}</output><b style={{ width: `${state.axes.consensus * 100}%` }} /></div>
          <div className="axis"><span>Warmth</span><output>{Math.round(state.axes.warmth * 100)}</output><b style={{ width: `${state.axes.warmth * 100}%` }} /></div>
          <div className="axis"><span>Chaos</span><output>{Math.round(state.axes.chaos * 100)}</output><b style={{ width: `${state.axes.chaos * 100}%` }} /></div>
          <p>{state.statusText}</p>
        </footer>
      </div>
    </main>
  );
}
