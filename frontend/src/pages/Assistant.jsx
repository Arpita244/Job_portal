// src/pages/Assistant.jsx
import React, { useState } from "react";
import api from "../api";

export default function Assistant() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]); // each message: { from, text, resources?, jobs? }

  const send = async () => {
    if (!input.trim()) return;

    // push user message locally
    setMessages((p) => [...p, { from: "you", text: input }]);
    const userQuery = input;
    setInput("");

    try {
      const res = await api.post("/ai/chat", {
        query: userQuery,
        profile: {}, // optional: you may pass saved profile here
      });

      if (res.data && res.data.reply) {
        const reply = res.data.reply;
        // normalize jobs array if present
        const jobs = Array.isArray(reply.jobs) ? reply.jobs : [];
        setMessages((p) => [...p, { from: "bot", text: reply.text, resources: reply.resources || [], jobs }]);
      } else {
        // fallback
        const text = res.data ? JSON.stringify(res.data) : "No reply from server";
        setMessages((p) => [...p, { from: "bot", text }]);
      }
    } catch (e) {
      setMessages((p) => [...p, { from: "bot", text: "Assistant is unavailable (fallback)." }]);
      console.error("Assistant error:", e);
    }
  };

  return (
    <div>
      <h2>Buddy Bot</h2>

      <div style={{ minHeight: 180, border: "1px solid #eee", padding: 12, borderRadius: 8, background: "#fff" }}>
        {messages.length === 0 && <p className="muted">Ask about roles, how to learn, or job search...</p>}

        {messages.map((m, i) => (
          <div key={i} style={{ marginBottom: 14 }}>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>{m.from === "you" ? "You:" : "Bot:"}</div>
            <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.45 }}>{m.text}</div>

            {m.resources && m.resources.length > 0 && (
              <div style={{ marginTop: 8 }}>
                <div style={{ fontWeight: 600, marginBottom: 6 }}>Resources:</div>
                <ul>
                  {m.resources.map((r, idx) => (
                    <li key={idx}>
                      <a href={r.url} target="_blank" rel="noreferrer">{r.title || r.url}</a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {m.jobs && m.jobs.length > 0 && (
              <div style={{ marginTop: 8 }}>
                <div style={{ fontWeight: 600, marginBottom: 6 }}>Job results:</div>
                <ul>
                  {m.jobs.map((j, idx) => (
                    <li key={idx}>
                      <div style={{ fontWeight: 700 }}>{j.title || j.role}</div>
                      {j.company && <div className="muted">{j.company} • {j.location}</div>}
                      <div>{j.description || j.desc}</div>
                      {j.salary && <div className="muted">₹{j.salary}</div>}
                    </li>
                  ))}
                </ul>
              </div>
            )}

          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <input value={input} onChange={e => setInput(e.target.value)} placeholder="Ask about roles, how to learn, or job search..." style={{ flex: 1 }} />
        <button className="btn" onClick={send}>Send</button>
      </div>
    </div>
  );
}
