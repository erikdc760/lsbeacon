import { apiFetch } from "./client";

export type SalesMode = "roleplay" | "coach" | "upload";
export type SalesMessageRole = "agent" | "prospect" | "system";

export type SalesMessage = {
  role: SalesMessageRole;
  content: string;
  ts?: string;
};

export type SalesSession = {
  id: string;
  mode: SalesMode;
  createdAt?: string;
  updatedAt?: string;
};

export type SalesCreateSessionInput = {
  mode: SalesMode;
  persona?: string;
  difficulty?: "easy" | "medium" | "hard";
  objective?: string;
};

export type SalesPostMessageInput = {
  sessionId: string;
  role: SalesMessageRole;
  content: string;
};

export type SalesGradeSessionInput = {
  sessionId: string;
};

export type SalesGrade = {
  score: number; // 0-100
  clarity?: number;
  empathy?: number;
  control?: number;
  objectionHandling?: number;
  compliance?: number;
  feedback?: string[];
};

export type SalesAIReply = {
  reply: string;
  session?: SalesSession;
  messages?: SalesMessage[];
  grade?: SalesGrade;
};

export type SalesLeaderboardRow = {
  userId?: string;
  name?: string;
  score: number;
  createdAt?: string;
};

export type SalesLeaderboardResponse = {
  rows: SalesLeaderboardRow[];
};

export type SalesUploadFromTextInput = {
  /** Plain text transcript OR pasted call */
  text: string;
  /** Optional: what to focus on */
  notes?: string;
  persona?: string;
  difficulty?: "easy" | "medium" | "hard";
  objective?: string;
};

export type SalesUploadFromTextResponse = {
  session: SalesSession;
  inferredObjections?: string[];
};

/**
 * Change these paths ONLY if your backend uses different routes.
 */
const ENDPOINTS = {
  createSession: "/api/sales-ai/session",
  postMessage: "/api/sales-ai/message",
  gradeSession: "/api/sales-ai/grade",
  leaderboard: "/api/sales-ai/leaderboard",
  uploadFromText: "/api/sales-ai/upload/text",
};

// 1) Create session
export async function salesCreateSession(payload: SalesCreateSessionInput) {
  return apiFetch<{ session: SalesSession }>(ENDPOINTS.createSession, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// 2) Post message
export async function salesPostMessage(payload: SalesPostMessageInput) {
  return apiFetch<SalesAIReply>(ENDPOINTS.postMessage, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// 3) Grade session
export async function salesGradeSession(payload: SalesGradeSessionInput) {
  return apiFetch<{ grade: SalesGrade }>(ENDPOINTS.gradeSession, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// 4) Leaderboard
export async function salesLeaderboard() {
  return apiFetch<SalesLeaderboardResponse>(ENDPOINTS.leaderboard, {
    method: "GET",
  });
}

// 5) Upload from pasted text -> creates a session ready for roleplay
export async function salesUploadFromText(payload: SalesUploadFromTextInput) {
  return apiFetch<SalesUploadFromTextResponse>(ENDPOINTS.uploadFromText, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * Backwards compatible helper (if anything still calls runSalesAI)
 */
export async function runSalesAI(payload: {
  mode: SalesMode;
  agentResponse?: string;
  objection?: string;
  liveTranscript?: string;
  callTranscript?: string;
  notes?: string;
  difficulty?: "easy" | "medium" | "hard";
  persona?: string;
}) {
  const sessionRes = await salesCreateSession({
    mode: payload.mode,
    difficulty: payload.difficulty,
    persona: payload.persona,
  });

  const content =
    payload.agentResponse ||
    payload.objection ||
    payload.liveTranscript ||
    payload.callTranscript ||
    payload.notes ||
    "";

  return salesPostMessage({
    sessionId: sessionRes.session.id,
    role: "agent",
    content,
  });
}
