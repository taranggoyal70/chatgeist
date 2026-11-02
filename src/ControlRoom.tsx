import { useRef, useState } from "react";
import type { ChatgeistState } from "./types";
import { Overlay } from "./Overlay";

export function ControlRoom({ state, error, act }: { state: ChatgeistState; error: string; act: (path: string, body?: unknown) => Promise<unknown> }) {
  const [question, setQuestion] = useState("Chat, what challenge should I do next?");
  const [busy, setBusy] = useState(false);
  const [twitchDevice, setTwitchDevice] = useState<{ userCode: string; verificationUri: string } | null>(null);
  const audio = useRef<HTMLAudioElement>(null);

  async function run(path: string, body?: unknown) {
    setBusy(true);
    try { return await act(path, body); } finally { setBusy(false); }
  }

  async function ask() {
    await run("/api/ask", { question });
  }

  async function startTwitchAuth() {
    const result = await run("/api/twitch/device") as { userCode: string; verificationUri: string };
    setTwitchDevice(result);
  }

  async function checkTwitchAuth() {
    const result = await run("/api/twitch/device/poll") as { status: string };
    if (result.status === "authorized") setTwitchDevice(null);
  }

  function playVoice() {
    if (!audio.current || !state.voiceReady) return;
    audio.current.src = `${state.voiceUrl}?t=${state.updatedAt}`;
    void audio.current.play();
  }

  const decisionInFlight = state.phase === "collecting" || state.phase === "grounding";

  return (
    <main className="control-shell">
      <section className="control-preview"><Overlay state={state} compact /></section>
      <aside className="control-panel">
        <header><span className="sigil">◐</span><div><b>CHATGEIST</b><small>Private control room</small></div></header>

        <div className="health-grid">
          {Object.entries(state.health).map(([key, value]) => <div key={key}><span>{key}</span><strong>{String(value)}</strong></div>)}
        </div>

        <section className="control-section">
          <p className="eyebrow">Input source</p>
          <div className="segmented" role="radiogroup" aria-label="Chat input source">
            <button role="radio" aria-checked={state.mode === "simulator"} className={state.mode === "simulator" ? "active" : ""} onClick={() => run("/api/mode", { mode: "simulator" })}>Simulator</button>
            <button role="radio" aria-checked={state.mode === "twitch"} className={state.mode === "twitch" ? "active" : ""} onClick={() => run("/api/mode", { mode: "twitch" })} disabled={state.health.twitch !== "ready"}>Twitch</button>
          </div>
          {state.health.twitch !== "ready" && !twitchDevice && <button className="twitch-connect" onClick={startTwitchAuth} disabled={busy}>Connect Twitch securely</button>}
          {twitchDevice && <div className="twitch-device-card">
            <span>Activation code</span>
            <strong>{twitchDevice.userCode}</strong>
            <a href={twitchDevice.verificationUri} target="_blank" rel="noreferrer">Open Twitch authorization ↗</a>
            <button onClick={checkTwitchAuth} disabled={busy}>I authorized Chatgeist</button>
          </div>}
          <button className="action action--summon" onClick={() => run("/api/summon")} disabled={busy}>Summon the room</button>
        </section>

        <section className="control-section">
          <label htmlFor="question">Ask the community</label>
          <textarea id="question" value={question} onChange={(event) => setQuestion(event.target.value)} maxLength={160} />
          <button className="action" onClick={ask} disabled={busy || state.phase === "dormant" || decisionInFlight}>{decisionInFlight ? "Decision window open…" : "Ask the room"}</button>
          <div className="button-row">
            <button onClick={playVoice} disabled={!state.voiceReady}>Play AI voice</button>
            <button onClick={() => run("/api/reset")}>Clear session</button>
          </div>
          {(state.phase === "answer-ready" || state.phase === "speaking") && (state.split.active
            ? <div className="decision-choice-grid" aria-label="Lock a community faction">
                <button className="lock-action" onClick={() => run("/api/lock", { selection: "left" })}>Lock: {state.split.leftLabel}</button>
                <button className="lock-action" onClick={() => run("/api/lock", { selection: "right" })}>Lock: {state.split.rightLabel}</button>
              </div>
            : <button className="lock-action" onClick={() => run("/api/lock", { selection: "recommendation" })}>Lock the recommendation</button>)}
          {state.phase === "locked" && <a className="artifact-action" href="/api/artifact.svg" download={`chatgeist-decision-${state.sessionId.slice(0, 8)}.svg`}>Download decision card</a>}
          <audio ref={audio} onEnded={() => void run("/api/voice-ended")} />
        </section>

        <section className="control-section provenance-panel">
          <p className="eyebrow">Current proof</p>
          <strong>{state.messages.length} eligible messages</strong>
          <span>{state.participantCount} unique community voices</span>
          <span>{state.sourceIds.length} sources ground the answer</span>
          <span>Mode: {state.provenance}</span>
          <a href="/overlay" target="_blank" rel="noreferrer">Open broadcast overlay ↗</a>
        </section>

        {error && <p className="control-error">{error}</p>}
      </aside>
    </main>
  );
}
