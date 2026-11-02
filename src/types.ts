export type SourceMode = "simulator" | "twitch";
export type Phase = "dormant" | "summoning" | "present" | "collecting" | "grounding" | "answer-ready" | "speaking" | "locked" | "remembered" | "error";
export type DecisionSelection = "left" | "right" | "recommendation";

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  text: string;
  timestamp: number;
  source: SourceMode;
}

export interface SpiritAxes {
  energy: number;
  consensus: number;
  warmth: number;
  chaos: number;
}

export interface SplitState {
  active: boolean;
  leftLabel: string;
  rightLabel: string;
  leftCount: number;
  rightCount: number;
}

export interface LockedDecision {
  title: string;
  objective: string;
  selection: DecisionSelection;
  lockedAt: number;
  participantCount: number;
  sourceCount: number;
}

export interface CollectionWindow {
  startedAt: number;
  endsAt: number;
}

export interface ServiceHealth {
  server: "ready" | "error";
  openai: "ready" | "missing" | "error";
  twitch: "ready" | "missing" | "connecting" | "error";
  overlayClients: number;
}

export interface ChatgeistState {
  phase: Phase;
  mode: SourceMode;
  provenance: "live" | "simulated" | "fallback";
  sessionId: string;
  question: string;
  answer: string;
  memoryPhrase: string;
  messages: ChatMessage[];
  sourceIds: string[];
  axes: SpiritAxes;
  split: SplitState;
  participantCount: number;
  collectionWindow: CollectionWindow | null;
  decision: LockedDecision | null;
  statusText: string;
  voiceReady: boolean;
  voiceUrl: string;
  voiceDisclosure: string;
  health: ServiceHealth;
  updatedAt: number;
}

export const neutralAxes: SpiritAxes = {
  energy: 0.18,
  consensus: 0.5,
  warmth: 0.56,
  chaos: 0.2
};

export const emptySplitState = (): SplitState => ({ active: false, leftLabel: "", rightLabel: "", leftCount: 0, rightCount: 0 });
