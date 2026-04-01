import { useState, useRef, useEffect } from 'react'
import { analyzeDocument } from '../services/api'

export default function Analysis({ documentId, docInfo, onAnalysisResult }) {
  const [messages, setMessages] = useState([])
  const [question, setQuestion] = useState('')
  const [loading, setLoading] = useState(false)
  const [entities, setEntities] = useState([])
  const [riskReport, setRiskReport] = useState(null)
  const [autoAnalyzed, setAutoAnalyzed] = useState(false)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  // Auto-analyze on mount
  useEffect(() => {
    if (documentId && !autoAnalyzed) {
      setAutoAnalyzed(true)
      runAnalysis('Give me a complete overview of this document: what it is about, who the parties are, key terms, and any risks I should know about.')
    }
  }, [documentId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const runAnalysis = async (q, isAuto = true) => {
    if (!q.trim() || loading) return

    if (!isAuto) {
      setMessages(prev => [...prev, { role: 'user', content: q }])
    } else {
      setMessages([{ role: 'system', content: `📄 Analyzing **${docInfo?.filename}** — ${docInfo?.pages} pages, ${docInfo?.chunks} chunks...` }])
    }

    setLoading(true)
    try {
      const result = await analyzeDocument(documentId, q)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: result.answer,
        isAutoAnalysis: isAuto
      }])
      setEntities(result.entities || [])
      setRiskReport(result.risk_report || null)
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

  const handleAsk = async () => {
    if (!question.trim() || loading) return
    const q = question.trim()
    setQuestion('')
    await runAnalysis(q, false)
  }

  const getRiskLevel = (score) => {
    if (score === null || score === undefined) return { label: 'PENDING', color: 'var(--text3)' }
    if (score < 30) return { label: 'LOW RISK', color: 'var(--green)' }
    if (score < 60) return { label: 'MODERATE', color: 'var(--amber)' }
    return { label: 'HIGH RISK', color: 'var(--red)' }
  }

  const riskLevel = getRiskLevel(riskReport?.overall_risk_score)

  const suggestions = [
    'What are the payment terms?',
    'Are there any dangerous clauses?',
    'What is the notice period?',
    'Who are the parties involved?',
    'What happens if either party breaches?',
    'Summarize the termination clauses',
  ]

  return (
    <div className="analysis-page">
      {/* Breadcrumb */}
      <div className="breadcrumb-row">
        <span className="bc-dim">ANALYSIS</span>
        <span className="bc-sep">/</span>
        <span className="bc-active">{docInfo?.filename?.replace('.pdf', '').toUpperCase()}</span>
      </div>

      <div className="analysis-layout">
        {/* LEFT: Chat takes up most space */}
        <div className="chat-col">
          {/* Doc header */}
          <div className="doc-head">
            <div>
              <h2 className="doc-title">{docInfo?.filename?.replace('.pdf', '')}</h2>
              <div className="doc-meta-row">
                <span className="doc-id">ID: {documentId?.toUpperCase()}</span>
                <span className="doc-status">● ANALYSIS COMPLETE</span>
              </div>
            </div>
            <button className="download-btn">DOWNLOAD REPORT</button>
          </div>

          {/* Messages — main area */}
          <div className="messages-area">
            {messages.map((msg, i) => (
              <div key={i} className={`msg msg-${msg.role} ${msg.error ? 'msg-error' : ''}`}>
                {msg.role === 'system' && (
                  <div className="msg-system">{msg.content}</div>
                )}
                {msg.role === 'user' && (
                  <div className="msg-user-wrap">
                    <span className="msg-tag user-tag">YOU</span>
                    <div className="msg-bubble user-bubble">{msg.content}</div>
                  </div>
                )}
                {msg.role === 'assistant' && (
                  <div className="msg-ai-wrap">
                    <span className="msg-tag ai-tag">NYAYAI</span>
                    <div className={`msg-bubble ai-bubble ${msg.isAutoAnalysis ? 'auto-analysis' : ''}`}>
                      {msg.isAutoAnalysis && (
                        <div className="auto-label">📋 Document Overview</div>
                      )}
                      <div className="msg-text">{msg.content}</div>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="msg">
                <div className="msg-ai-wrap">
                  <span className="msg-tag ai-tag">NYAYAI</span>
                  <div className="msg-bubble ai-bubble">
                    <div className="typing-indicator">
                      <span /><span /><span />
                      <span className="typing-text">
                        {autoAnalyzed && messages.length <= 1 ? 'Analyzing document...' : 'Thinking...'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Suggestions — only show after auto-analysis done */}
          {!loading && messages.length > 0 && messages.length <= 2 && (
            <div className="suggestions-row">
              <div className="suggestions-label">ASK A FOLLOW-UP</div>
              <div className="suggestions-list">
                {suggestions.map((s, i) => (
                  <button key={i} className="suggestion" onClick={() => setQuestion(s)}>
                    → {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="input-area">
            <textarea
              ref={inputRef}
              value={question}
              onChange={e => setQuestion(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAsk() } }}
              placeholder="Ask anything about this document..."
              rows={2}
              className="chat-input"
              disabled={loading}
            />
            <button
              onClick={handleAsk}
              disabled={!question.trim() || loading}
              className="send-btn"
            >↑</button>
          </div>
        </div>

        {/* RIGHT: Security profile sidebar */}
        <div className="profile-col">
          <div className="profile-head">
            <span className="profile-label">SECURITY PROFILE</span>
            <span className="profile-risk" style={{ color: riskLevel.color }}>{riskLevel.label}</span>
          </div>

          {/* Score */}
          <div className="score-wrap">
            <div className="score-num" style={{ color: riskReport ? riskLevel.color : 'var(--text3)' }}>
              {riskReport?.overall_risk_score ?? '—'}
            </div>
            <div className="score-den">/ 100</div>
          </div>

          {riskReport && (
            <div className="score-bar-wrap">
              <div className="score-bar">
                <div
                  className="score-fill"
                  style={{
                    width: `${riskReport.overall_risk_score}%`,
                    background: riskLevel.color
                  }}
                />
              </div>
            </div>
          )}

          <p className="profile-desc">
            {riskReport
              ? `Document analyzed across ${docInfo?.pages} pages. ${riskReport.risk_counts?.DANGEROUS || 0} dangerous clauses detected.`
              : 'Ask a question to trigger full risk analysis.'}
          </p>

          <div className="divider" />

          {/* Executive summary */}
          <div className="section-label">EXECUTIVE SUMMARY</div>
          <div className="summary-items">
            {(riskReport?.dangerous_clauses?.length || riskReport?.caution_clauses?.length) ? (
              <>
                {riskReport.dangerous_clauses?.slice(0, 2).map((c, i) => (
                  <div key={i} className="summary-item">
                    <div className="si-icon danger">▲</div>
                    <div>
                      <div className="si-title">DANGEROUS CLAUSE</div>
                      <div className="si-desc">{c.clause?.slice(0, 90)}...</div>
                    </div>
                  </div>
                ))}
                {riskReport.caution_clauses?.slice(0, 2).map((c, i) => (
                  <div key={i} className="summary-item">
                    <div className="si-icon caution">●</div>
                    <div>
                      <div className="si-title">CAUTION</div>
                      <div className="si-desc">{c.clause?.slice(0, 90)}...</div>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <>
                <div className="summary-item">
                  <div className="si-icon safe">✓</div>
                  <div>
                    <div className="si-title">OWNERSHIP</div>
                    <div className="si-desc">Standard ownership clauses detected. Rights appear balanced.</div>
                  </div>
                </div>
                <div className="summary-item">
                  <div className="si-icon safe">✓</div>
                  <div>
                    <div className="si-title">LIABILITY</div>
                    <div className="si-desc">Liability caps appear standard for this document type.</div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Key observations */}
          {riskReport && (
            <>
              <div className="divider" />
              <div className="section-label">KEY OBSERVATIONS</div>
              <div className="counts-grid">
                {[
                  { label: 'SAFE', count: riskReport.risk_counts?.SAFE || 0, color: 'var(--green)' },
                  { label: 'CAUTION', count: riskReport.risk_counts?.CAUTION || 0, color: 'var(--amber)' },
                  { label: 'DANGEROUS', count: riskReport.risk_counts?.DANGEROUS || 0, color: 'var(--red)' },
                ].map(item => (
                  <div key={item.label} className="count-card">
                    <div className="count-num" style={{ color: item.color }}>{item.count}</div>
                    <div className="count-label">{item.label}</div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Entities */}
          {entities.length > 0 && (
            <>
              <div className="divider" />
              <div className="section-label">EXTRACTED ENTITIES</div>
              <div className="entities-wrap">
                {entities.slice(0, 8).map((ent, i) => (
                  <span key={i} className={`entity-chip ent-${ent.type?.toLowerCase()}`}>
                    {ent.text}
                  </span>
                ))}
              </div>
            </>
          )}

          <div className="profile-footer">
            <div>ANALYZED BY NYAYAI v1.0</div>
            <div>InLegalBERT · BERT Classifier</div>
          </div>
        </div>
      </div>

      <style>{`
        .analysis-page {
          display: flex;
          flex-direction: column;
          gap: 12px;
          height: calc(100vh - 98px);
          overflow: hidden;
        }

        .breadcrumb-row {
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: var(--mono);
          font-size: 10px;
          letter-spacing: 0.08em;
          flex-shrink: 0;
        }

        .bc-dim { color: var(--text3); }
        .bc-sep { color: var(--border2); }
        .bc-active { color: var(--text2); }

        .analysis-layout {
          display: grid;
          grid-template-columns: 1fr 290px;
          gap: 16px;
          flex: 1;
          overflow: hidden;
          min-height: 0;
        }

        /* Chat column */
        .chat-col {
          background: var(--bg3);
          border: 1px solid var(--border);
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          min-height: 0;
        }

        .doc-head {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          padding: 18px 22px 14px;
          border-bottom: 1px solid var(--border);
          flex-shrink: 0;
        }

        .doc-title {
          font-size: 20px;
          font-weight: 700;
          letter-spacing: -0.02em;
          color: var(--text1);
        }

        .doc-meta-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: 5px;
        }

        .doc-id {
          font-family: var(--mono);
          font-size: 10px;
          letter-spacing: 0.06em;
          color: var(--text3);
        }

        .doc-status {
          font-family: var(--mono);
          font-size: 10px;
          letter-spacing: 0.06em;
          color: var(--blue2);
        }

        .download-btn {
          font-family: var(--mono);
          font-size: 10px;
          letter-spacing: 0.08em;
          padding: 7px 14px;
          background: var(--bg4);
          border: 1px solid var(--border2);
          border-radius: 6px;
          color: var(--text1);
          cursor: pointer;
          flex-shrink: 0;
          transition: border-color 0.15s;
        }

        .download-btn:hover { border-color: var(--blue); }

        /* Messages */
        .messages-area {
          flex: 1;
          overflow-y: auto;
          padding: 20px 22px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          min-height: 0;
        }

        .msg { display: flex; flex-direction: column; }

        .msg-system {
          font-family: var(--mono);
          font-size: 11px;
          color: var(--text3);
          letter-spacing: 0.04em;
          padding: 8px 0;
        }

        .msg-user-wrap, .msg-ai-wrap {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .msg-user-wrap { align-items: flex-end; }
        .msg-ai-wrap { align-items: flex-start; }

        .msg-tag {
          font-family: var(--mono);
          font-size: 9px;
          letter-spacing: 0.12em;
          padding: 2px 8px;
          border-radius: 3px;
        }

        .user-tag {
          color: var(--blue2);
          background: rgba(74,122,255,0.1);
          border: 1px solid rgba(74,122,255,0.2);
        }

        .ai-tag {
          color: var(--cyan);
          background: rgba(0,200,255,0.07);
          border: 1px solid rgba(0,200,255,0.15);
        }

        .msg-bubble {
          padding: 14px 18px;
          border-radius: 8px;
          max-width: 90%;
        }

        .user-bubble {
          background: rgba(74,122,255,0.1);
          border: 1px solid rgba(74,122,255,0.2);
          color: var(--text1);
          font-size: 13.5px;
          line-height: 1.6;
          align-self: flex-end;
        }

        .ai-bubble {
          background: var(--bg4);
          border: 1px solid var(--border);
          color: var(--text1);
          font-size: 13.5px;
          line-height: 1.7;
          max-width: 100%;
        }

        .ai-bubble.auto-analysis {
          background: rgba(74,122,255,0.04);
          border-color: rgba(74,122,255,0.15);
        }

        .auto-label {
          font-family: var(--mono);
          font-size: 10px;
          letter-spacing: 0.08em;
          color: var(--blue2);
          margin-bottom: 10px;
          padding-bottom: 8px;
          border-bottom: 1px solid rgba(74,122,255,0.15);
        }

        .msg-text { white-space: pre-wrap; }

        .msg-error .ai-bubble {
          background: rgba(255,74,110,0.06);
          border-color: rgba(255,74,110,0.2);
          color: var(--red);
        }

        .typing-indicator {
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .typing-indicator span:not(.typing-text) {
          width: 6px; height: 6px;
          background: var(--cyan);
          border-radius: 50%;
          animation: blink 1.2s infinite;
        }

        .typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
        .typing-indicator span:nth-child(3) { animation-delay: 0.4s; }

        @keyframes blink { 0%,80%,100% { opacity:0.2; } 40% { opacity:1; } }

        .typing-text {
          font-family: var(--mono);
          font-size: 11px;
          color: var(--text3);
          margin-left: 4px;
          animation: none !important;
          width: auto !important;
          height: auto !important;
          background: transparent !important;
          border-radius: 0 !important;
        }

        /* Suggestions */
        .suggestions-row {
          padding: 0 22px 12px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          flex-shrink: 0;
        }

        .suggestions-label {
          font-family: var(--mono);
          font-size: 9px;
          letter-spacing: 0.12em;
          color: var(--text3);
        }

        .suggestions-list {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .suggestion {
          padding: 5px 12px;
          background: var(--bg4);
          border: 1px solid var(--border);
          border-radius: 20px;
          color: var(--text2);
          font-family: var(--font);
          font-size: 12px;
          cursor: pointer;
          transition: all 0.15s;
        }

        .suggestion:hover {
          border-color: var(--blue);
          color: var(--text1);
          background: rgba(74,122,255,0.06);
        }

        /* Input */
        .input-area {
          display: flex;
          gap: 10px;
          padding: 14px 18px;
          border-top: 1px solid var(--border);
          background: rgba(0,0,0,0.15);
          flex-shrink: 0;
          align-items: flex-end;
        }

        .chat-input {
          flex: 1;
          background: var(--bg4);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 12px 16px;
          color: var(--text1);
          font-family: var(--font);
          font-size: 13.5px;
          resize: none;
          outline: none;
          transition: border-color 0.15s;
          line-height: 1.5;
        }

        .chat-input::placeholder { color: var(--text3); }
        .chat-input:focus { border-color: var(--blue); }
        .chat-input:disabled { opacity: 0.5; }

        .send-btn {
          width: 46px;
          height: 46px;
          background: var(--blue);
          border: none;
          border-radius: 8px;
          color: white;
          font-size: 18px;
          cursor: pointer;
          flex-shrink: 0;
          transition: background 0.15s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .send-btn:hover:not(:disabled) { background: #3a6aef; }
        .send-btn:disabled { opacity: 0.3; cursor: not-allowed; }

        /* Profile sidebar */
        .profile-col {
          background: var(--bg3);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 18px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          overflow-y: auto;
          min-height: 0;
        }

        .profile-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .profile-label {
          font-family: var(--mono);
          font-size: 9px;
          letter-spacing: 0.15em;
          color: var(--text3);
        }

        .profile-risk {
          font-family: var(--mono);
          font-size: 10px;
          letter-spacing: 0.1em;
          font-weight: 600;
        }

        .score-wrap {
          display: flex;
          align-items: baseline;
          gap: 4px;
        }

        .score-num {
          font-size: 54px;
          font-weight: 700;
          letter-spacing: -0.04em;
          line-height: 1;
          transition: color 0.3s;
        }

        .score-den {
          font-family: var(--mono);
          font-size: 14px;
          color: var(--text3);
        }

        .score-bar-wrap { width: 100%; }

        .score-bar {
          height: 3px;
          background: rgba(255,255,255,0.06);
          border-radius: 2px;
          overflow: hidden;
        }

        .score-fill {
          height: 100%;
          border-radius: 2px;
          transition: width 0.8s ease, background 0.3s;
        }

        .profile-desc { font-size: 12px; color: var(--text2); line-height: 1.5; }

        .divider { height: 1px; background: var(--border); }

        .section-label {
          font-family: var(--mono);
          font-size: 9px;
          letter-spacing: 0.15em;
          color: var(--text3);
        }

        .summary-items { display: flex; flex-direction: column; gap: 10px; }

        .summary-item {
          display: flex;
          gap: 10px;
          align-items: flex-start;
        }

        .si-icon {
          width: 20px; height: 20px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          flex-shrink: 0;
        }

        .si-icon.safe { background: rgba(0,212,160,0.12); color: var(--green); }
        .si-icon.danger { background: rgba(255,74,110,0.12); color: var(--red); }
        .si-icon.caution { background: rgba(255,176,32,0.12); color: var(--amber); }

        .si-title {
          font-family: var(--mono);
          font-size: 9px;
          letter-spacing: 0.1em;
          color: var(--text1);
          font-weight: 600;
          margin-bottom: 3px;
        }

        .si-desc { font-size: 11px; color: var(--text2); line-height: 1.4; }

        .counts-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 6px;
        }

        .count-card {
          background: var(--bg4);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 10px 6px;
          text-align: center;
        }

        .count-num { font-size: 22px; font-weight: 700; line-height: 1; }

        .count-label {
          font-family: var(--mono);
          font-size: 8px;
          letter-spacing: 0.1em;
          color: var(--text3);
          margin-top: 4px;
        }

        .entities-wrap { display: flex; flex-wrap: wrap; gap: 5px; }

        .entity-chip {
          font-family: var(--mono);
          font-size: 10px;
          padding: 3px 8px;
          border-radius: 4px;
          background: rgba(74,122,255,0.08);
          border: 1px solid rgba(74,122,255,0.18);
          color: var(--blue2);
        }

        .entity-chip.ent-date { color: var(--green); background: rgba(0,212,160,0.08); border-color: rgba(0,212,160,0.18); }
        .entity-chip.ent-money { color: var(--amber); background: rgba(255,176,32,0.08); border-color: rgba(255,176,32,0.18); }
        .entity-chip.ent-clause { color: #c084fc; background: rgba(192,132,252,0.08); border-color: rgba(192,132,252,0.18); }

        .profile-footer {
          margin-top: auto;
          border-top: 1px solid var(--border);
          padding-top: 10px;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .profile-footer div {
          font-family: var(--mono);
          font-size: 9px;
          color: var(--text3);
          letter-spacing: 0.05em;
        }

        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 2px; }
      `}</style>
    </div>
  )
}