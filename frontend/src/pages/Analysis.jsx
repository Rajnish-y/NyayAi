// Screen 3 — Document Analysis (exact match to reference)
import { useState, useRef, useEffect } from 'react'
import { analyzeDocument } from '../services/api'

export default function Analysis({ documentId, docInfo, analysisData, onAnalysisResult }) {
    const [messages, setMessages] = useState([{
        role: 'assistant',
        content: `Document loaded: **${docInfo?.filename || 'Document'}**. Ask me anything about this document in plain language.`
    }])
    const [question, setQuestion] = useState('')
    const [loading, setLoading] = useState(false)
    const [entities, setEntities] = useState([])
    const [riskReport, setRiskReport] = useState(null)
    const [activeSection, setActiveSection] = useState(0)
    const bottomRef = useRef(null)

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

    const getRiskLevel = (score) => {
        if (!score && score !== 0) return { label: 'PENDING', color: 'var(--text3)' }
        if (score < 30) return { label: 'LOW RISK', color: 'var(--green)' }
        if (score < 60) return { label: 'MODERATE', color: 'var(--amber)' }
        return { label: 'HIGH RISK', color: 'var(--red)' }
    }

    const riskLevel = getRiskLevel(riskReport?.overall_risk_score)

    const sections = [
        '01. SERVICES AND WORK ORDERS',
        '02. INTELLECTUAL PROPERTY',
        '03. LIMITATION OF LIABILITY',
        '04. TERMINATION FOR CONVENIENCE',
    ]

    return (
        <div className="analysis-page">
            {/* Breadcrumb */}
            <div className="breadcrumb-row">
                <span className="bc-item">ANALYSIS</span>
                <span className="bc-sep">/</span>
                <span className="bc-active">{docInfo?.filename?.replace('.pdf', '').toUpperCase() || 'DOCUMENT'}</span>
            </div>

            <div className="analysis-grid">
                {/* Left: Document viewer */}
                <div className="doc-viewer">
                    <div className="doc-viewer-head">
                        <div>
                            <h2 className="doc-viewer-title">{docInfo?.filename?.replace('.pdf', '') || 'Document'}</h2>
                            <div className="doc-viewer-meta">
                                <span className="doc-id">ID: {documentId?.toUpperCase()}</span>
                                <span className="analysis-complete">● ANALYSIS COMPLETE</span>
                            </div>
                        </div>
                        <button className="download-btn">DOWNLOAD REPORT</button>
                    </div>

                    {/* Sections */}
                    <div className="doc-sections">
                        {sections.map((section, i) => (
                            <div
                                key={i}
                                className={`doc-section ${activeSection === i ? 'active' : ''}`}
                                onClick={() => setActiveSection(i)}
                            >
                                <div className="section-label">{section}</div>
                                <div className="section-content">
                                    {i === 0 && 'This agreement is entered into as of the Effective Date by and between the Client and the Service Provider. Service Provider shall perform the services as described in each Work Order executed by both parties.'}
                                    {i === 1 && 'Client shall own all rights, title, and interest in and to the Deliverables. However, Service Provider retains all rights to any pre-existing materials, tools, or methodologies used in the performance of the Services.'}
                                    {i === 2 && 'EXCEPT FOR A PARTY\'S GROSS NEGLIGENCE OR WILLFUL MISCONDUCT, NEITHER PARTY SHALL BE LIABLE TO THE OTHER FOR ANY INDIRECT, CONSEQUENTIAL, INCIDENTAL, OR PUNITIVE DAMAGES.'}
                                    {i === 3 && 'Either party may terminate this Agreement or any Work Order for convenience upon sixty (60) days\' prior written notice to the other party.'}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Chat */}
                    <div className="doc-chat">
                        <div className="chat-header">ASK AI ABOUT THIS DOCUMENT</div>
                        <div className="chat-messages">
                            {messages.slice(-3).map((msg, i) => (
                                <div key={i} className={`chat-msg ${msg.role}`}>
                                    <span className={`chat-tag ${msg.role}`}>{msg.role === 'user' ? 'YOU' : 'AI'}</span>
                                    <span className="chat-text">{msg.content}</span>
                                </div>
                            ))}
                            {loading && (
                                <div className="chat-msg assistant">
                                    <span className="chat-tag assistant">AI</span>
                                    <span className="chat-typing">
                                        <span />
                                        <span />
                                        <span />
                                    </span>
                                </div>
                            )}
                            <div ref={bottomRef} />
                        </div>
                        <div className="chat-input-row">
                            <input
                                value={question}
                                onChange={e => setQuestion(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleAsk()}
                                placeholder="Ask anything about this document..."
                                className="chat-input"
                            />
                            <button
                                onClick={handleAsk}
                                disabled={!question.trim() || loading}
                                className="chat-send"
                            >
                                ↑
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right: Security profile */}
                <div className="security-profile">
                    <div className="sp-head">
                        <span className="sp-label">SECURITY PROFILE</span>
                        <span className="sp-risk" style={{ color: riskLevel.color }}>{riskLevel.label}</span>
                    </div>

                    {/* Big score */}
                    <div className="sp-score">
                        <div className="sp-score-num" style={{ color: riskLevel.color }}>
                            {riskReport?.overall_risk_score ?? '—'}
                        </div>
                        <div className="sp-score-den">/ 100</div>
                    </div>

                    <p className="sp-desc">
                        {riskReport
                            ? `Document analyzed across ${docInfo?.pages || '—'} pages. ${riskReport.risk_counts?.DANGEROUS || 0} dangerous clauses detected.`
                            : 'Ask a question to trigger full risk analysis.'}
                    </p>

                    <div className="sp-divider" />

                    {/* Executive summary */}
                    <div className="sp-section-title">EXECUTIVE SUMMARY</div>
                    <div className="sp-items">
                        {(riskReport?.dangerous_clauses?.length > 0 || riskReport?.caution_clauses?.length > 0) ? (
                            <>
                                {riskReport.dangerous_clauses?.slice(0, 2).map((c, i) => (
                                    <div key={i} className="sp-item danger">
                                        <div className="sp-item-icon danger-icon">▲</div>
                                        <div>
                                            <div className="sp-item-title">DANGEROUS CLAUSE</div>
                                            <div className="sp-item-desc">{c.clause?.slice(0, 80)}...</div>
                                        </div>
                                    </div>
                                ))}
                                {riskReport.caution_clauses?.slice(0, 2).map((c, i) => (
                                    <div key={i} className="sp-item caution">
                                        <div className="sp-item-icon caution-icon">●</div>
                                        <div>
                                            <div className="sp-item-title">CAUTION</div>
                                            <div className="sp-item-desc">{c.clause?.slice(0, 80)}...</div>
                                        </div>
                                    </div>
                                ))}
                            </>
                        ) : (
                            <>
                                <div className="sp-item safe">
                                    <div className="sp-item-icon safe-icon">✓</div>
                                    <div>
                                        <div className="sp-item-title">OWNERSHIP</div>
                                        <div className="sp-item-desc">Standard ownership clauses detected. Rights appear balanced.</div>
                                    </div>
                                </div>
                                <div className="sp-item safe">
                                    <div className="sp-item-icon safe-icon">✓</div>
                                    <div>
                                        <div className="sp-item-title">LIABILITY</div>
                                        <div className="sp-item-desc">Liability caps appear standard for this document type.</div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="sp-divider" />

                    {/* Key observations */}
                    {riskReport && (
                        <>
                            <div className="sp-section-title">KEY OBSERVATIONS</div>
                            <div className="sp-counts">
                                {[
                                    { label: 'SAFE', count: riskReport.risk_counts?.SAFE || 0, color: 'var(--green)' },
                                    { label: 'CAUTION', count: riskReport.risk_counts?.CAUTION || 0, color: 'var(--amber)' },
                                    { label: 'DANGEROUS', count: riskReport.risk_counts?.DANGEROUS || 0, color: 'var(--red)' },
                                ].map(item => (
                                    <div key={item.label} className="sp-count-item">
                                        <div className="sp-count-num" style={{ color: item.color }}>{item.count}</div>
                                        <div className="sp-count-label">{item.label}</div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {/* Entities */}
                    {entities.length > 0 && (
                        <>
                            <div className="sp-divider" />
                            <div className="sp-section-title">EXTRACTED ENTITIES</div>
                            <div className="sp-entities">
                                {entities.slice(0, 6).map((ent, i) => (
                                    <span key={i} className={`sp-entity ${ent.type?.toLowerCase()}`}>
                                        {ent.text}
                                    </span>
                                ))}
                            </div>
                        </>
                    )}

                    <div className="sp-footer">
                        <div>ANALYZED BY NYAYAI v1.0</div>
                        <div>InLegalBERT · BERT Classifier</div>
                    </div>
                </div>
            </div>

            <style>{`
        .analysis-page { display: flex; flex-direction: column; gap: 14px; height: 100%; }

        .breadcrumb-row {
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: var(--mono);
          font-size: 10px;
          letter-spacing: 0.1em;
        }

        .bc-item { color: var(--text3); }
        .bc-sep { color: var(--border2); }
        .bc-active { color: var(--text2); }

        .analysis-grid {
          display: grid;
          grid-template-columns: 1fr 300px;
          gap: 16px;
          flex: 1;
          overflow: hidden;
        }

        /* Doc viewer */
        .doc-viewer {
          background: var(--bg3);
          border: 1px solid var(--border);
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .doc-viewer-head {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          padding: 20px 22px 16px;
          border-bottom: 1px solid var(--border);
          flex-shrink: 0;
        }

        .doc-viewer-title {
          font-size: 22px;
          font-weight: 700;
          letter-spacing: -0.02em;
          color: var(--text1);
        }

        .doc-viewer-meta {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: 5px;
        }

        .doc-id {
          font-family: var(--mono);
          font-size: 10px;
          letter-spacing: 0.08em;
          color: var(--text3);
        }

        .analysis-complete {
          font-family: var(--mono);
          font-size: 10px;
          letter-spacing: 0.08em;
          color: var(--blue2);
        }

        .download-btn {
          font-family: var(--mono);
          font-size: 10px;
          letter-spacing: 0.08em;
          padding: 8px 16px;
          background: var(--bg4);
          border: 1px solid var(--border2);
          border-radius: 6px;
          color: var(--text1);
          cursor: pointer;
          flex-shrink: 0;
        }

        .doc-sections {
          flex: 1;
          overflow-y: auto;
          padding: 16px 22px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .doc-section {
          padding: 14px 16px;
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.15s;
          border-left: 3px solid transparent;
        }

        .doc-section:hover { background: rgba(255,255,255,0.02); }

        .doc-section.active {
          background: rgba(74,122,255,0.05);
          border-left-color: var(--blue);
        }

        .section-label {
          font-family: var(--mono);
          font-size: 10px;
          letter-spacing: 0.1em;
          color: var(--blue2);
          margin-bottom: 6px;
        }

        .section-content {
          font-size: 13px;
          color: var(--text2);
          line-height: 1.6;
          font-style: italic;
        }

        /* Chat */
        .doc-chat {
          border-top: 1px solid var(--border);
          padding: 14px 18px;
          flex-shrink: 0;
          background: rgba(0,0,0,0.15);
        }

        .chat-header {
          font-family: var(--mono);
          font-size: 9px;
          letter-spacing: 0.15em;
          color: var(--text3);
          margin-bottom: 10px;
        }

        .chat-messages {
          display: flex;
          flex-direction: column;
          gap: 6px;
          max-height: 100px;
          overflow-y: auto;
          margin-bottom: 10px;
        }

        .chat-msg {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          font-size: 12px;
        }

        .chat-tag {
          font-family: var(--mono);
          font-size: 8px;
          letter-spacing: 0.1em;
          padding: 2px 6px;
          border-radius: 3px;
          flex-shrink: 0;
          margin-top: 1px;
        }

        .chat-tag.user {
          color: var(--blue2);
          background: rgba(74,122,255,0.1);
          border: 1px solid rgba(74,122,255,0.2);
        }

        .chat-tag.assistant {
          color: var(--cyan);
          background: rgba(0,200,255,0.08);
          border: 1px solid rgba(0,200,255,0.15);
        }

        .chat-text { color: var(--text2); line-height: 1.5; }

        .chat-typing {
          display: flex;
          gap: 4px;
          align-items: center;
          padding: 4px 0;
        }

        .chat-typing span {
          width: 5px;
          height: 5px;
          background: var(--cyan);
          border-radius: 50%;
          animation: blink 1.2s infinite;
        }

        .chat-typing span:nth-child(2) { animation-delay: 0.2s; }
        .chat-typing span:nth-child(3) { animation-delay: 0.4s; }

        @keyframes blink { 0%, 80%, 100% { opacity: 0.2; } 40% { opacity: 1; } }

        .chat-input-row {
          display: flex;
          gap: 8px;
        }

        .chat-input {
          flex: 1;
          background: var(--bg4);
          border: 1px solid var(--border);
          border-radius: 6px;
          padding: 8px 12px;
          color: var(--text1);
          font-family: var(--font);
          font-size: 13px;
          outline: none;
        }

        .chat-input::placeholder { color: var(--text3); }
        .chat-input:focus { border-color: var(--blue); }

        .chat-send {
          width: 36px;
          height: 36px;
          background: var(--blue);
          border: none;
          border-radius: 6px;
          color: white;
          font-size: 16px;
          cursor: pointer;
          flex-shrink: 0;
        }

        .chat-send:disabled { opacity: 0.3; cursor: not-allowed; }

        /* Security profile */
        .security-profile {
          background: var(--bg3);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 18px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          overflow-y: auto;
        }

        .sp-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .sp-label {
          font-family: var(--mono);
          font-size: 9px;
          letter-spacing: 0.15em;
          color: var(--text3);
        }

        .sp-risk {
          font-family: var(--mono);
          font-size: 10px;
          letter-spacing: 0.1em;
          font-weight: 600;
        }

        .sp-score {
          display: flex;
          align-items: baseline;
          gap: 4px;
        }

        .sp-score-num {
          font-size: 52px;
          font-weight: 700;
          letter-spacing: -0.04em;
          line-height: 1;
        }

        .sp-score-den {
          font-family: var(--mono);
          font-size: 14px;
          color: var(--text3);
        }

        .sp-desc { font-size: 12px; color: var(--text2); line-height: 1.5; }

        .sp-divider { height: 1px; background: var(--border); }

        .sp-section-title {
          font-family: var(--mono);
          font-size: 9px;
          letter-spacing: 0.15em;
          color: var(--text3);
        }

        .sp-items { display: flex; flex-direction: column; gap: 10px; }

        .sp-item {
          display: flex;
          gap: 10px;
          align-items: flex-start;
        }

        .sp-item-icon {
          width: 20px;
          height: 20px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          flex-shrink: 0;
          margin-top: 1px;
        }

        .safe-icon { background: rgba(0,212,160,0.15); color: var(--green); }
        .danger-icon { background: rgba(255,74,110,0.15); color: var(--red); }
        .caution-icon { background: rgba(255,176,32,0.15); color: var(--amber); }

        .sp-item-title {
          font-family: var(--mono);
          font-size: 9px;
          letter-spacing: 0.1em;
          font-weight: 600;
          margin-bottom: 3px;
          color: var(--text1);
        }

        .sp-item-desc { font-size: 11.5px; color: var(--text2); line-height: 1.4; }

        .sp-counts {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
        }

        .sp-count-item {
          background: var(--bg4);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 10px 8px;
          text-align: center;
        }

        .sp-count-num {
          font-size: 22px;
          font-weight: 700;
          line-height: 1;
        }

        .sp-count-label {
          font-family: var(--mono);
          font-size: 8px;
          letter-spacing: 0.1em;
          color: var(--text3);
          margin-top: 4px;
        }

        .sp-entities { display: flex; flex-wrap: wrap; gap: 5px; }

        .sp-entity {
          font-family: var(--mono);
          font-size: 10px;
          padding: 3px 8px;
          border-radius: 4px;
          background: rgba(74,122,255,0.08);
          border: 1px solid rgba(74,122,255,0.18);
          color: var(--blue2);
        }

        .sp-entity.party { color: var(--blue2); background: rgba(74,122,255,0.08); border-color: rgba(74,122,255,0.18); }
        .sp-entity.date { color: var(--green); background: rgba(0,212,160,0.08); border-color: rgba(0,212,160,0.18); }
        .sp-entity.money { color: var(--amber); background: rgba(255,176,32,0.08); border-color: rgba(255,176,32,0.18); }

        .sp-footer {
          margin-top: auto;
          display: flex;
          flex-direction: column;
          gap: 2px;
          border-top: 1px solid var(--border);
          padding-top: 10px;
        }

        .sp-footer div {
          font-family: var(--mono);
          font-size: 9px;
          color: var(--text3);
          letter-spacing: 0.05em;
        }
      `}</style>
        </div>
    )
}