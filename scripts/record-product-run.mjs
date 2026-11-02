import { spawn, spawnSync } from "node:child_process";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const repo = resolve(import.meta.dirname, "..");
const assets = join(repo, "video/chatgeist-demo/assets");
const frames = join(assets, "product-run-frames");
const chromeProfile = "/tmp/chatgeist-product-recording-profile";
const liveProof = join(repo, "docs/assets/overlay-live-twitch.png");
const chromePath = "/Users/tarang/Library/Caches/ms-playwright/chromium-1248/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing";
const debugPort = 9331;

mkdirSync(assets, { recursive: true });
rmSync(frames, { recursive: true, force: true });
rmSync(chromeProfile, { recursive: true, force: true });
mkdirSync(frames, { recursive: true });

const chrome = spawn(chromePath, [
  "--headless=new",
  `--remote-debugging-port=${debugPort}`,
  `--user-data-dir=${chromeProfile}`,
  "--window-size=1280,720",
  "--hide-scrollbars",
  "--autoplay-policy=no-user-gesture-required",
  "--use-gl=angle",
  "--use-angle=swiftshader",
  "--enable-webgl",
  "--ignore-gpu-blocklist",
  "http://[::1]:4173/overlay"
], { stdio: "ignore" });

const sleep = (ms) => new Promise((resolvePromise) => setTimeout(resolvePromise, ms));

async function waitForTarget() {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    try {
      const targets = await fetch(`http://127.0.0.1:${debugPort}/json/list`).then((response) => response.json());
      const target = targets.find((item) => item.type === "page" && item.url.includes("4173/overlay"));
      if (target?.webSocketDebuggerUrl) return target.webSocketDebuggerUrl;
    } catch {}
    await sleep(100);
  }
  throw new Error("Chrome DevTools target did not become ready.");
}

class Cdp {
  constructor(url) {
    this.socket = new WebSocket(url);
    this.nextId = 1;
    this.pending = new Map();
    this.handlers = new Map();
  }
  async open() {
    await new Promise((resolvePromise, reject) => {
      this.socket.addEventListener("open", resolvePromise, { once: true });
      this.socket.addEventListener("error", reject, { once: true });
    });
    this.socket.addEventListener("message", (event) => {
      const message = JSON.parse(event.data);
      if (!message.id) {
        const handler = this.handlers.get(message.method);
        if (handler) handler(message.params);
        return;
      }
      const pending = this.pending.get(message.id);
      if (!pending) return;
      this.pending.delete(message.id);
      if (message.error) pending.reject(new Error(message.error.message));
      else pending.resolve(message.result);
    });
  }
  send(method, params = {}) {
    const id = this.nextId++;
    return new Promise((resolvePromise, reject) => {
      this.pending.set(id, { resolve: resolvePromise, reject });
      this.socket.send(JSON.stringify({ id, method, params }));
    });
  }
  on(method, handler) { this.handlers.set(method, handler); }
  close() { this.socket.close(); }
}

const base = "http://127.0.0.1:4317";
async function post(path, body = {}) {
  const response = await fetch(`${base}${path}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  if (!response.ok) throw new Error(`${path} returned ${response.status}: ${await response.text()}`);
  return response.json();
}
async function state() { return fetch(`${base}/api/state`).then((response) => response.json()); }

let frame = 0;
let recordingStartedAt = 0;
const phases = [];
const cdp = new Cdp(await waitForTarget());

async function captureFor(ms) {
  await sleep(ms);
}

async function captureUntil(targetPhase, maxMs) {
  const end = Date.now() + maxMs;
  let current = await state();
  while (Date.now() < end && current.phase !== targetPhase) {
    await sleep(250);
    current = await state();
  }
  if (current.phase !== targetPhase) throw new Error(`Timed out waiting for ${targetPhase}; current phase is ${current.phase}.`);
  return current;
}

try {
  await cdp.open();
  await cdp.send("Page.enable");
  await cdp.send("Emulation.setDeviceMetricsOverride", { width: 1280, height: 720, deviceScaleFactor: 1, mobile: false });
  await sleep(1200);

  cdp.on("Page.screencastFrame", (params) => {
    frame += 1;
    writeFileSync(join(frames, `frame-${String(frame).padStart(5, "0")}.jpg`), Buffer.from(params.data, "base64"));
    void cdp.send("Page.screencastFrameAck", { sessionId: params.sessionId });
  });
  await cdp.send("Page.startScreencast", { format: "jpeg", quality: 90, maxWidth: 1280, maxHeight: 720, everyNthFrame: 1 });
  recordingStartedAt = Date.now();

  phases.push({ name: "live-proof", at: 0 });
  await post("/api/mode", { mode: "simulator" });
  await captureFor(800);
  phases.push({ name: "summoning", at: 5 + (Date.now() - recordingStartedAt) / 1000 });
  await post("/api/summon");
  await captureFor(2600);

  phases.push({ name: "decision-window", at: 5 + (Date.now() - recordingStartedAt) / 1000 });
  await post("/api/ask", { question: "Chat, what challenge should I do next?" });
  const grounded = await captureUntil("answer-ready", 28_000);
  phases.push({ name: "grounded-factions", at: 5 + (Date.now() - recordingStartedAt) / 1000 });
  await captureFor(4000);

  const selection = grounded.split?.active ? "right" : "recommendation";
  await post("/api/lock", { selection });
  phases.push({ name: "locked", at: 5 + (Date.now() - recordingStartedAt) / 1000 });
  await captureFor(4500);
  await cdp.send("Page.stopScreencast");
  await sleep(300);
} finally {
  cdp.close();
  chrome.kill("SIGTERM");
}

const dynamicDuration = (Date.now() - recordingStartedAt) / 1000;
const duration = 5 + dynamicDuration;
const fps = frame / duration;
const dynamicFps = frame / dynamicDuration;
writeFileSync(join(assets, "product-run-timeline.json"), JSON.stringify({ fps: dynamicFps, frames: frame, duration, dynamicDuration, phases }, null, 2));

const webm = join(assets, "product-run.webm");
const mp4 = join(assets, "product-run.mp4");
const input = join(frames, "frame-%05d.jpg");
const videoFilter = "[0:v]scale=1280:720,fps=30,format=yuv420p[v0];[1:v]scale=1280:720,fps=30,format=yuv420p[v1];[v0][v1]concat=n=2:v=1:a=0[v]";
let result = spawnSync("ffmpeg", ["-y", "-loop", "1", "-t", "5", "-i", liveProof, "-framerate", String(dynamicFps), "-i", input, "-filter_complex", videoFilter, "-map", "[v]", "-c:v", "libvpx-vp9", "-crf", "28", "-b:v", "0", "-pix_fmt", "yuv420p", webm], { stdio: "inherit" });
if (result.status !== 0) process.exit(result.status ?? 1);
result = spawnSync("ffmpeg", ["-y", "-loop", "1", "-t", "5", "-i", liveProof, "-framerate", String(dynamicFps), "-i", input, "-filter_complex", videoFilter, "-map", "[v]", "-c:v", "libx264", "-preset", "slow", "-crf", "18", "-pix_fmt", "yuv420p", "-movflags", "+faststart", mp4], { stdio: "inherit" });
if (result.status !== 0) process.exit(result.status ?? 1);

console.log(JSON.stringify({ frameCount: frame, duration, dynamicDuration, dynamicFps, webm, mp4, phases }, null, 2));
