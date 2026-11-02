import { useCallback, useEffect, useState } from "react";
import type { ChatgeistState } from "./types";

async function api(path: string, body?: unknown, method: "GET" | "POST" = "GET") {
  const response = await fetch(path, {
    method,
    headers: method === "POST" ? { "Content-Type": "application/json" } : undefined,
    body: method === "POST" ? JSON.stringify(body ?? {}) : undefined
  });
  if (!response.ok) throw new Error((await response.json().catch(() => ({}))).error ?? response.statusText);
  return response.json();
}

export function useChatgeist() {
  const [state, setState] = useState<ChatgeistState | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let socket: WebSocket | undefined;
    let retry: number | undefined;

    const connect = () => {
      const protocol = location.protocol === "https:" ? "wss" : "ws";
      socket = new WebSocket(`${protocol}://${location.host}/ws`);
      socket.onmessage = (event) => {
        const message = JSON.parse(event.data);
        if (message.type === "snapshot") setState(message.state);
      };
      socket.onclose = () => { retry = window.setTimeout(connect, 800); };
    };

    api("/api/state").then(setState).catch((reason) => setError(String(reason)));
    connect();
    return () => { if (retry) clearTimeout(retry); socket?.close(); };
  }, []);

  const act = useCallback(async (path: string, body?: unknown) => {
    setError("");
    try { return await api(path, body ?? {}, "POST"); }
    catch (reason) { setError(reason instanceof Error ? reason.message : String(reason)); throw reason; }
  }, []);

  return { state, error, act };
}
