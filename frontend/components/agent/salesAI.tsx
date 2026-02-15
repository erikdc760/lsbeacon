import React, { useMemo, useState } from "react";
import {
  salesCreateSession,
  salesPostMessage,
  salesGradeSession,
  salesLeaderboard,
  salesUploadFromText,
} from "../../api/salesAi";

type Msg = { role: "agent" | "ai"; text: string };

const tabBtn =
  "px-3 py-2 rounded-lg text-sm font-medium border border-white/10 hover:border-white/20";
const card =
  "rounded-2xl border border-white/10 bg-white/5 p-4 shadow-sm";

export default function SalesAI() {
  const [subTab, setSubTab] = useState<"roleplay" | "coach" | "upload">("roleplay");

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 14 }}>
        <button className={tabBtn} onClick={() => setSubTab("roleplay")}>
          1) Roleplay Arena
        </button>
        <button className={tabBtn} onClick={() => setSubTab("coach")}>
          2) Live Coach
        </button>
        <button className={tabBtn} onClick={() => setSubTab("upload")}>
          3) Upload & Drill
        </button>
      </div>

      {subTab === "roleplay" && <RoleplayArena />}
      {subTab === "coach" && <LiveCoach />}
      {subTab === "upload" && <UploadAndDrill />}
    </div>
  );
}

function RoleplayArena() {
  const [sessionId, setSessionId] = useState<string>("");
  const [difficulty, setDifficulty] = useState<"easy" | "normal" | "hard">("normal");
  const [scenarioName, setScenarioName] = useState("Life Insurance — Mortgage Protection");
  const [persona, setPersona] = useState("Skeptical prospect, busy, price-sensitive");
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(false);
  const [score, setScore] = useState<any>(null);

  const canChat = useMemo(() => !!sessionId && msgs.length >= 0, [sessionId, msgs.length]);

  async function start() {
    setLoading(true);
    setScore(null);
    setMsgs([]);
    try {
      const resp: any = await salesCreateSession({
        mode: "roleplay",
        difficulty,
        scenario: { name: scenarioName },
        persona: { description: persona },
      });

      const id = resp?.data?.session?.id;
      setSessionId(id || "");
    } finally {
      setLoading(false);
    }
  }

  async function send() {
    if (!input.trim() || !sessionId) return;
    const text = input.trim();
    setInput("");
    setMsgs((m) => [...m, { role: "agent", text }]);
    setLoading(true);
    try {
      const resp: any = await salesPostMessage({ sessionId, agentText: text });
      const aiText = resp?.data?.aiText || "";
      setMsgs((m) => [...m, { role: "ai", text: aiText }]);
    } finally {
      setLoading(false);
    }
  }

  async function grade() {
    if (!sessionId) return;
    setLoading(true);
    try {
      const resp: any = await salesGradeSession({ sessionId });
      setScore(resp?.data);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={card}>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 12, opacity: 0.8 }}>Scenario</div>
          <input
            value={scenarioName}
            onChange={(e) => setScenarioName(e.target.value)}
            style={inputStyle}
            placeholder="Scenario name"
          />
        </div>

        <div>
          <div style={{ fontSize: 12, opacity: 0.8 }}>Prospect persona</div>
          <input
            value={persona}
            onChange={(e) => setPersona(e.target.value)}
            style={inputStyle}
            placeholder="Persona"
          />
        </div>

        <div>
          <div style={{ fontSize: 12, opacity: 0.8 }}>Difficulty</div>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as any)}
            style={inputStyle}
          >
            <option value="easy">Easy</option>
            <option value="normal">Normal</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        <button className={tabBtn} onClick={start} disabled={loading}>
          {sessionId ? "Restart" : "Start Roleplay"}
        </button>

        <button className={tabBtn} onClick={grade} disabled={loading || !sessionId}>
          Grade Me
        </button>

        <div style={{ fontSize: 12, opacity: 0.7 }}>
          Session: {sessionId ? sessionId.slice(0, 8) + "..." : "—"}
        </div>
      </div>

      <div style={{ marginTop: 14, height: 320, overflow: "auto", padding: 10, borderRadius: 14, border: "1px solid rgba(255,255,255,0.12)" }}>
        {msgs.length === 0 ? (
          <div style={{ opacity: 0.7, fontSize: 14 }}>
            Start the roleplay, then type your response. The AI will throw objections like a real call.
          </div>
        ) : (
          msgs.map((m, idx) => (
            <div key={idx} style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 12, opacity: 0.75 }}>
                {m.role === "agent" ? "YOU" : "PROSPECT"}
              </div>
              <div style={{ fontSize: 14, whiteSpace: "pre-wrap" }}>{m.text}</div>
            </div>
          ))
        )}
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={{ ...inputStyle, flex: 1 }}
          placeholder={canChat ? "Type your response…" : "Start roleplay first…"}
          disabled={!canChat || loading}
          onKeyDown={(e) => {
            if (e.key === "Enter") send();
          }}
        />
        <button className={tabBtn} onClick={send} disabled={!canChat || loading}>
          Send
        </button>
      </div>

      {score && (
        <div style={{ marginTop: 14 }} className={card}>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>
            Score: {score?.score?.score_total ?? score?.score_total ?? "—"}
          </div>
          <pre style={{ margin: 0, whiteSpace: "pre-wrap", fontSize: 13, opacity: 0.9 }}>
            {JSON.stringify(score, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

function LiveCoach() {
  // This is the UI shell now. Next step is wiring it to your live-call feed (Telnyx events/transcripts)
  // so it can suggest rebuttals in real time.
  const [notes, setNotes] = useState(
    "Next step: stream live call transcripts into the backend and return real-time suggestions."
  );

  return (
    <div className={card}>
      <div style={{ fontWeight: 700, marginBottom: 8 }}>Live Coach (Real-time Rebuttals)</div>
      <div style={{ opacity: 0.75, marginBottom: 10 }}>
        This will listen to a live call (or live transcript) and show short “say this next” prompts.
      </div>

      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        style={{ ...inputStyle, width: "100%", height: 220, resize: "vertical" }}
      />

      <div style={{ opacity: 0.75, fontSize: 13, marginTop: 10 }}>
        When you’re ready, paste your <b>authMiddleware.js</b> + your Telnyx webhook flow you’re using (or the call transcript source),
        and I’ll add the exact backend endpoint + realtime feed.
      </div>
    </div>
  );
}

function UploadAndDrill() {
  const [transcriptText, setTranscriptText] = useState("");
  const [objectionsText, setObjectionsText] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function analyze() {
    setLoading(true);
    setResult(null);
    try {
      const resp: any = await salesUploadFromText({ transcriptText, objectionsText });
      setResult(resp?.data);
    } finally {
      setLoading(false);
    }
  }

  async function getBoard() {
    setLoading(true);
    try {
      const resp: any = await salesLeaderboard();
      setResult(resp?.data);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={card}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontWeight: 700 }}>Upload & Drill</div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className={tabBtn} onClick={getBoard} disabled={loading}>
            Leaderboard
          </button>
          <button className={tabBtn} onClick={analyze} disabled={loading}>
            Analyze
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }}>
        <div>
          <div style={{ fontSize: 12, opacity: 0.8 }}>Paste call transcript (optional)</div>
          <textarea
            value={transcriptText}
            onChange={(e) => setTranscriptText(e.target.value)}
            style={{ ...inputStyle, width: "100%", height: 220, resize: "vertical" }}
            placeholder="Paste transcript here…"
          />
        </div>
        <div>
          <div style={{ fontSize: 12, opacity: 0.8 }}>Or paste objections you faced (optional)</div>
          <textarea
            value={objectionsText}
            onChange={(e) => setObjectionsText(e.target.value)}
            style={{ ...inputStyle, width: "100%", height: 220, resize: "vertical" }}
            placeholder="Example: 'Too expensive', 'I already have coverage', 'Call me later'…"
          />
        </div>
      </div>

      {result && (
        <div style={{ marginTop: 14 }} className={card}>
          <pre style={{ margin: 0, whiteSpace: "pre-wrap", fontSize: 13 }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.05)",
  color: "inherit",
  outline: "none",
};
