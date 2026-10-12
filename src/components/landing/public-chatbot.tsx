"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Bot, Eraser, MessageCircle, RotateCcw, Send, ShieldAlert, X } from "lucide-react";

const OPEN_CHAT_EVENT = "gcc-pulse:open-public-chat";
const starterQuestions = [
  "How should I compare GCC cities?",
  "What should I verify about incentives?",
  "How do I assess talent needs?",
];

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

function answerQuestion(question: string) {
  const query = question.toLowerCase();
  if (/(city|cities|location|compare|hub)/.test(query)) {
    return "Start with the same decision criteria and definitions for every city—such as role-specific talent needs, connectivity, operating requirements, and workspace constraints. Then compare current, dated sources side by side. GCC Pulse's public demo data is fictional and should not be used to rank locations.";
  }
  if (/(incentive|policy|scheme|tax|legal|eligib)/.test(query)) {
    return "Treat incentives as a verification checklist, not an assumption. Confirm the current programme, geography, applicant and activity eligibility, deadlines, obligations, and application process directly from official central or state sources. This demo cannot confirm availability or provide legal or tax advice.";
  }
  if (/(talent|hire|hiring|skills|salary|compensation|workforce)/.test(query)) {
    return "Begin with the roles, skills, seniority, hiring sequence, and location assumptions your operating model requires. Validate supply and compensation using current, role-specific evidence; a single city-level number can hide important differences. This demo contains no live talent or salary data.";
  }
  if (/(provider|vendor|partner|service)/.test(query)) {
    return "Define the service scope and selection criteria first, then verify provider credentials, references, local coverage, commercial terms, and delivery responsibilities. The provider records in the GCC Pulse demo are fictional examples, not referrals or endorsements.";
  }
  if (/(data|source|evidence|trust|verify|citation)/.test(query)) {
    return "For a decision-ready finding, capture the primary source, publication and retrieval dates, the exact claim it supports, and any uncertainty. Separate sourced evidence from interpretation and confirm the source is still current. This public Q&A is general guidance and does not retrieve or verify sources.";
  }
  return "I can offer general planning guidance on GCC objectives, city comparisons, talent, workplace research, policy questions, and provider evaluation. I don't access live sources or generate market findings; use current primary sources and qualified advisers to verify decisions. What part of your planning would you like to focus on?";
}

export function PublicChatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [retryPrompt, setRetryPrompt] = useState("");
  const messageNumber = useRef(0);
  const activeRequest = useRef(0);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const openChat = () => setOpen(true);
    window.addEventListener(OPEN_CHAT_EVENT, openChat);
    return () => window.removeEventListener(OPEN_CHAT_EVENT, openChat);
  }, []);

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loading, open]);

  const makeId = () => String(messageNumber.current++);

  const ask = async (question: string, appendUser = true) => {
    const normalized = question.trim();
    if (!normalized || loading) return;
    const requestId = ++activeRequest.current;
    if (appendUser) {
      setMessages((current) => [...current, { id: makeId(), role: "user", content: normalized }]);
      setDraft("");
    }
    setRetryPrompt(normalized);
    setError("");
    setLoading(true);
    try {
      await new Promise((resolve) => window.setTimeout(resolve, 400));
      if (requestId !== activeRequest.current) return;
      setMessages((current) => [...current, { id: makeId(), role: "assistant", content: answerQuestion(normalized) }]);
    } catch (cause) {
      console.error("Unable to prepare a public demo Q&A response.", cause);
      if (requestId === activeRequest.current) setError("The answer could not be prepared. Try again.");
    } finally {
      if (requestId === activeRequest.current) setLoading(false);
    }
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void ask(draft);
  };

  return (
    <div className="public-chatbot" id="ask-gcc-pulse">
      {open && (
        <section className="public-chat-panel" id="public-chat-panel" aria-labelledby="public-chat-title">
          <header className="public-chat-header">
            <span className="public-chat-avatar"><Bot size={19} /></span>
            <div><h2 id="public-chat-title">Ask GCC Pulse</h2><p>Public demo Q&amp;A · general guidance</p></div>
            <button className="public-chat-icon-button" aria-label="Clear conversation" title="Clear conversation" type="button" onClick={() => { activeRequest.current += 1; setLoading(false); setMessages([]); setError(""); setRetryPrompt(""); setDraft(""); }}><Eraser size={16} /></button>
            <button className="public-chat-icon-button" aria-label="Close chat" type="button" onClick={() => setOpen(false)}><X size={18} /></button>
          </header>

          <div className="public-chat-disclaimer"><ShieldAlert size={14} /><span>Not live research. No Gemini or external service is called; don&apos;t share confidential information.</span></div>

          <div className="public-chat-transcript" role="log" aria-live="polite" aria-relevant="additions text">
            {messages.length === 0 ? (
              <div className="public-chat-welcome">
                <span className="public-chat-welcome-icon"><MessageCircle size={17} /></span>
                <p>Ask a general question about planning or researching an India GCC.</p>
                <span>Choose a starter or type your own question.</span>
              </div>
            ) : messages.map((message) => (
              <div className={`public-chat-message is-${message.role}`} key={message.id}>
                <span>{message.role === "user" ? "You" : "GCC Pulse demo"}</span>
                <p>{message.content}</p>
              </div>
            ))}
            {messages.length === 0 && (
              <div className="public-chat-starters">
                {starterQuestions.map((question) => <button type="button" key={question} onClick={() => void ask(question)}>{question}<Send size={12} /></button>)}
              </div>
            )}
            {loading && <p className="public-chat-loading" role="status"><span /><span /><span />Preparing general guidance…</p>}
            {error && <div className="public-chat-error" role="alert"><span>{error}</span><button type="button" onClick={() => void ask(retryPrompt, false)}><RotateCcw size={13} />Retry</button></div>}
            <div ref={bottomRef} />
          </div>

          <form className="public-chat-form" onSubmit={submit}>
            <label className="sr-only" htmlFor="public-chat-input">Ask a question about GCC planning</label>
            <textarea
              id="public-chat-input"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  void ask(draft);
                }
              }}
              placeholder="Ask a general planning question…"
              rows={2}
              maxLength={800}
              disabled={loading}
            />
            <button type="submit" aria-label="Send question" disabled={!draft.trim() || loading}><Send size={16} /></button>
            <span>Enter to send · Shift+Enter for a new line</span>
          </form>
        </section>
      )}
      <button
        className="public-chat-launcher"
        type="button"
        aria-expanded={open}
        aria-controls="public-chat-panel"
        onClick={() => setOpen((current) => !current)}
      >
        {open ? <X size={19} /> : <MessageCircle size={19} />}
        <span>{open ? "Close" : "Ask GCC Pulse"}</span>
      </button>
    </div>
  );
}

export function openPublicChat() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(OPEN_CHAT_EVENT));
}

export function ChatSectionButton() {
  return <button className="public-chat-section-button" type="button" onClick={openPublicChat}>Ask GCC Pulse <MessageCircle size={16} /></button>;
}
