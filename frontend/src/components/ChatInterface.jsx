import { useState, useRef, useEffect } from 'react'
import { analyzeDocument } from '../services/api'

export default function ChatInterface({ documentId, messages, setMessages, onAnalysisResult, loading, setLoading }) {
  const [question, setQuestion] = useState('')
  const bottomRef = useRef(null)
  const textareaRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleAsk = async () => {
    if (!question.trim() || loading) return
    const q = question.trim()
    setQuestion('')
    setMessages(prev => [...prev, { role: 'user', content: q }])
    setLoading(true)
    try {
      const result = await analyzeDocument(documentId, q)
      setMessages(prev => [...prev, { role: 'assistant', content: result.answer }])
      onAnalysisResult(result)
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Error: ' + (err.response?.data?.detail || err.message),
        error: true
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleAsk()
    }
  }

  const suggestions = [
    'What is this document about?',
    'Who are the main parties involved?',
    'What are the payment terms?',
    'Are there any risky or unfair clauses?',
    'What happens if either party breaches the agreement?',
    'What is the notice period for termination?',
  ]

  return (
    <div className="chat-wrap">
      {/* Messages area */}
      <div className="messages-area">
        {messages.length === 0 && (
          <div className="chat-empty">
            <div className="empty-icon">◈</div>
            <div className="empty-title">Analysis Ready</div>
            <div className="empty-sub">Ask anything about your document in plain language</div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.role} ${msg.error ? 'error' : ''}`}>
            <div className="message-meta">
              {msg.role === 'user' ? (
                <span className="msg-tag user-tag">YOU</span>
              ) : (
                <span className="msg-tag ai-tag">NYAYAI</span>
              )}
            </div>
            <div className="message-body">
              {msg.content.split('\n').map((line, j) => (
                <p key={j}>{line}</p>
              ))}
            </div>
          </div>
        ))}

        {loading && (
          <div className="message assistant">
            <div className="message-meta">
              <span className="msg-tag ai-tag">NYAYAI</span>
            </div>
            <div className="message-body typing">
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="typing-label">Analyzing document...</span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      {messages.length <= 1 && (
        <div className="suggestions">
          <div className="suggestions-label">SUGGESTED QUERIES</div>
          <div className="suggestions-grid">
            {suggestions.map((s, i) => (
              <button key={i} className="suggestion-btn" onClick={() => setQuestion(s)}>
                <span className="suggestion-arrow">→</span>
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="chat-input-area">
        <div className="input-wrap">
          <textarea
            ref={textareaRef}
            value={question}
            onChange={e => setQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything about your document..."
            rows={2}
            className="chat-textarea"
          />
          <button
            onClick={handleAsk}
            disabled={loading || !question.trim()}
            className="send-btn"
          >
            <span className="send-icon">↑</span>
          </button>
        </div>
        <div className="input-hint">
          <span>↵ Enter to send</span>
          <span className="hint-divider">·</span>
          <span>⇧↵ New line</span>
        </div>
      </div>

      <style>{`
        .chat-wrap {
          display: flex;
          flex-direction: column;
          height: 100%;
          overflow: hidden;
        }

        .messages-area {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          scrollbar-width: thin;
          scrollbar-color: var(--border) transparent;
        }

        .chat-empty {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 60px 0;
          opacity: 0.5;
        }

        .empty-icon {
          font-size: 28px;
          color: var(--accent-blue);
        }

        .empty-title {
          font-family: var(--font-display);
          font-size: 18px;
          font-weight: 700;
          color: var(--text-primary);
        }

        .empty-sub {
          font-size: 13px;
          color: var(--text-muted);
          font-family: var(--font-mono);
        }

        .message {
          display: flex;
          flex-direction: column;
          gap: 8px;
          max-width: 88%;
          animation: fadeUp 0.2s ease;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .message.user { align-self: flex-end; align-items: flex-end; }
        .message.assistant { align-self: flex-start; align-items: flex-start; }

        .message-meta { display: flex; align-items: center; gap: 8px; }

        .msg-tag {
          font-family: var(--font-mono);
          font-size: 9px;
          letter-spacing: 0.15em;
          padding: 2px 8px;
          border-radius: 2px;
        }

        .user-tag {
          color: var(--accent-blue);
          background: rgba(59,130,246,0.1);
          border: 1px solid rgba(59,130,246,0.2);
        }

        .ai-tag {
          color: var(--accent-cyan);
          background: rgba(6,182,212,0.08);
          border: 1px solid rgba(6,182,212,0.2);
        }

        .message-body {
          padding: 14px 18px;
          border-radius: 4px;
          font-size: 13.5px;
          line-height: 1.65;
          color: var(--text-primary);
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .message.user .message-body {
          background: rgba(59,130,246,0.1);
          border: 1px solid rgba(59,130,246,0.2);
        }

        .message.assistant .message-body {
          background: var(--bg-elevated);
          border: 1px solid var(--border);
        }

        .message.error .message-body {
          background: rgba(239,68,68,0.06);
          border-color: rgba(239,68,68,0.2);
          color: var(--accent-red);
        }

        .typing {
          display: flex !important;
          flex-direction: row !important;
          align-items: center;
          gap: 6px;
        }

        .typing-dot {
          width: 6px;
          height: 6px;
          background: var(--accent-cyan);
          border-radius: 50%;
          animation: blink 1.2s infinite;
        }

        .typing-dot:nth-child(2) { animation-delay: 0.2s; }
        .typing-dot:nth-child(3) { animation-delay: 0.4s; }

        @keyframes blink {
          0%, 80%, 100% { opacity: 0.2; }
          40% { opacity: 1; }
        }

        .typing-label {
          font-family: var(--font-mono);
          font-size: 11px;
          color: var(--text-muted);
          margin-left: 4px;
        }

        .suggestions {
          padding: 0 24px 16px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          flex-shrink: 0;
        }

        .suggestions-label {
          font-family: var(--font-mono);
          font-size: 9px;
          letter-spacing: 0.15em;
          color: var(--text-muted);
        }

        .suggestions-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 6px;
        }

        .suggestion-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
          color: var(--text-secondary);
          font-family: var(--font-body);
          text-align: left;
          transition: all 0.15s;
        }

        .suggestion-btn:hover {
          border-color: var(--accent-blue);
          color: var(--text-primary);
          background: rgba(59,130,246,0.05);
        }

        .suggestion-arrow { color: var(--accent-blue); font-size: 12px; flex-shrink: 0; }

        .chat-input-area {
          padding: 16px 24px;
          border-top: 1px solid var(--border);
          background: var(--bg-surface);
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .input-wrap {
          display: flex;
          gap: 10px;
          align-items: flex-end;
        }

        .chat-textarea {
          flex: 1;
          background: var(--bg-elevated);
          border: 1px solid var(--border);
          border-radius: 4px;
          padding: 12px 16px;
          color: var(--text-primary);
          font-family: var(--font-body);
          font-size: 13.5px;
          resize: none;
          outline: none;
          transition: border-color 0.15s;
          line-height: 1.5;
        }

        .chat-textarea::placeholder { color: var(--text-muted); }

        .chat-textarea:focus { border-color: var(--accent-blue); }

        .send-btn {
          width: 44px;
          height: 44px;
          flex-shrink: 0;
          background: var(--accent-blue);
          border: none;
          border-radius: 4px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s;
        }

        .send-btn:hover:not(:disabled) { background: #2563eb; }
        .send-btn:disabled { opacity: 0.35; cursor: not-allowed; }

        .send-icon { color: white; font-size: 16px; font-weight: 300; }

        .input-hint {
          font-family: var(--font-mono);
          font-size: 10px;
          color: var(--text-muted);
          display: flex;
          gap: 8px;
        }

        .hint-divider { color: var(--border-bright); }
      `}</style>
    </div>
  )
}