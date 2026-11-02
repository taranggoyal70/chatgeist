import { ControlRoom } from "./ControlRoom";
import { Overlay } from "./Overlay";
import { useChatgeist } from "./useChatgeist";

export default function App() {
  const { state, error, act } = useChatgeist();
  if (!state) return <main className="boot-screen"><span className="sigil">◐</span><p>Finding the signal…</p>{error && <small>{error}</small>}</main>;
  return location.pathname === "/overlay" ? <Overlay state={state} /> : <ControlRoom state={state} error={error} act={act} />;
}
