// src/pages/Assistant.jsx
import React, { useState } from "react";
import api from "../api";

export default function Assistant() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);

  const send = async () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, { from: "you", text: input }]);
    try {
      const res = await api.post("/ai/match", { skills: [], interests: [], query: input });
      const reply = (res.data && (res.data.text || res.data.matches || JSON.stringify(res.data))) || "Sorry, no reply";
      setMessages(prev => [...prev, { from: "bot", text: typeof reply === "string" ? reply : JSON.stringify(reply) }]);
    } catch (e) {
      setMessages(prev => [...prev, { from: "bot", text: "Assistant is unavailable (fallback)." }]);
    } finally {
      setInput("");
    }
  };

  return (
    <div>
      <h2>Buddy Bot</h2>
      <div style={{ minHeight: 160, border: "1px solid #eee", padding: 12, borderRadius: 8 }}>
        {messages.map((m,i)=> <div key={i} style={{ marginBottom: 8 }}>
          <b style={{ marginRight: 8 }}>{m.from === "you" ? "You:" : "Bot:"}</b> {m.text}
        </div>)}
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        <input value={input} onChange={e=>setInput(e.target.value)} placeholder="Ask about roles, how to learn, or job search..." style={{ flex: 1 }} />
        <button className="btn" onClick={send}>Send</button>
      </div>
    </div>
  );
}
