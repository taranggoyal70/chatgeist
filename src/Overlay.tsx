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
  remembered: "Memory sealed",
  error: "The signal broke"
};

export function Overlay({ state, compact = false }: { state: ChatgeistState; compact?: boolean }) {
  const visible = selectVisibleMessages(state.messages, state.sourceIds, state.phase);

  return (
    <main className={`observatory ${compact ? "is-compact" : ""}`} data-phase={state.phase}>
      <div className="sky"><SpiritScene state={state} /></div>
      <div className="observatory__chrome">
        <header className="signal-header">
          <div><span className="sigil">◐</span><strong>CHATGEIST</strong></div>
          <div className="mode-ribbon" data-mode={state.provenance}>{state.provenance === "simulated" ? "SIMULATED CHAT" : state.provenance === "fallback" ? "GROUNDED FALLBACK" : "LIVE TWITCH"}</div>
        </header>

        <section className="ritual-copy" aria-live="polite">
          <p className="eyebrow">{phaseLabel[state.phase]}</p>
          <h1>{state.phase === "dormant" ? "Summon your community." : state.question || "The room is becoming visible."}</h1>
          {state.answer && <blockquote>{state.answer}</blockquote>}
          {state.voiceReady && <p className="voice-disclosure">{state.voiceDisclosure}</p>}
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

        {state.split.active && <div className="faction-key"><span>{state.split.leftLabel}</span><i>the room is divided</i><span>{state.split.rightLabel}</span></div>}

        <footer className="signal-footer">
          <div className="axis"><span>Energy</span><b style={{ width: `${state.axes.energy * 100}%` }} /></div>
          <div className="axis"><span>Consensus</span><b style={{ width: `${state.axes.consensus * 100}%` }} /></div>
          <div className="axis"><span>Warmth</span><b style={{ width: `${state.axes.warmth * 100}%` }} /></div>
          <div className="axis"><span>Chaos</span><b style={{ width: `${state.axes.chaos * 100}%` }} /></div>
          <p>{state.statusText}</p>
        </footer>
      </div>
    </main>
  );
}
