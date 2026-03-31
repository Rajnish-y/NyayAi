export default function Dashboard({ onNavigate, docCount }) {
    return (
        <div className="dashboard">
            <div className="dash-header">
                <div>
                    <h1 className="dash-title">Safety Dashboard</h1>
                    <p className="dash-sub">Monitor your digital legal footprint and manage AI analysis across all active document processing streams.</p>
                </div>
            </div>

            {/* Hero card */}
            <div className="hero-card">
                <div className="hero-left">
                    <div className="hero-label">SECURITY OVERVIEW</div>
                    <h2 className="hero-status">Analysis Ready</h2>
                    <div className="hero-tier">
                        Active Shielding: NyayAI Intelligence Engine
                    </div>
                    <div className="hero-stats">
                        {[
                            { label: 'RISK LEVEL', value: 'Minimal' },
                            { label: 'CLASSIFIER', value: '77%' },
                            { label: 'VULNERABILITIES', value: '0' },
                            { label: 'DOMAINS', value: '5 Types' },
                        ].map((s, i) => (
                            <div key={s.label} className={`hstat ${i < 3 ? 'sep' : ''}`}>
                                <div className="hstat-l">{s.label}</div>
                                <div className="hstat-v">{s.value}</div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="hero-right">
                    <img
                        src="/src/assets/legal-hero.png"
                        alt="Legal scales"
                        className="hero-img"
                        onError={e => e.target.style.display = 'none'}
                    />
                </div>
            </div>

            {/* Real stats grid */}
            <div className="stats-grid">
                {[
                    { label: 'NER MODEL', value: 'InLegalBERT', sub: 'Fine-tuned on Indian legal text', icon: '◈' },
                    { label: 'RISK CLASSIFIER', value: '77% Accuracy', sub: 'Trained on 130 labelled clauses', icon: '⚠' },
                    { label: 'RAG ENGINE', value: 'Llama 3.3 70B', sub: 'Via Groq · Citation-grounded', icon: '🤖' },
                    { label: 'VECTOR STORE', value: 'FAISS · 384-dim', sub: 'Semantic similarity search', icon: '⬡' },
                    { label: 'DOCUMENTS', value: docCount > 0 ? `${docCount} Uploaded` : '', sub: 'Ready for analysis', icon: '📄' },
                    { label: 'PIPELINE', value: 'Hybrid NER', sub: 'Rules + ML for max precision', icon: '⚙' },
                ].map(s => (
                    <div key={s.label} className="stat-card">
                        <div className="stat-card-top">
                            <span className="stat-icon">{s.icon}</span>
                            <span className="stat-label">{s.label}</span>
                        </div>
                        <div className="stat-value">{s.value}</div>
                        <div className="stat-sub">{s.sub}</div>
                    </div>
                ))}
            </div>

            {/* CTA */}
            <div className="cta-card">
                <div className="cta-left">
                    <div className="cta-title">Ready to analyze a legal document?</div>
                    <div className="cta-sub">Upload any PDF — rental agreement, employment contract, loan document, court order, or vendor contract. NyayAI extracts entities, flags risks, and answers your questions in plain language.</div>
                </div>
                <div className="cta-actions">
                    <button className="cta-btn" onClick={() => onNavigate('documents')}>
                        Upload Document →
                    </button>
                </div>
            </div>

            <style>{`
        .dashboard { display: flex; flex-direction: column; gap: 20px; }

        .dash-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; }

        .dash-title { font-size: 22px; font-weight: 700; letter-spacing: -0.02em; color: var(--text1); }

        .dash-sub { font-size: 13px; color: var(--text2); margin-top: 4px; max-width: 500px; line-height: 1.5; }

        .system-active {
          font-family: var(--mono);
          font-size: 10px;
          letter-spacing: 0.1em;
          color: var(--green);
          background: rgba(0,212,160,0.08);
          border: 1px solid rgba(0,212,160,0.2);
          padding: 5px 12px;
          border-radius: 4px;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .hero-card {
          background: var(--bg3);
          border: 1px solid var(--border);
          border-radius: 12px;
          display: flex;
          overflow: hidden;
          position: relative;
          min-height: 200px;
        }

        .hero-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse at 0% 50%, rgba(74,122,255,0.07) 0%, transparent 60%);
          pointer-events: none;
        }

        .hero-left {
          flex: 1;
          padding: 26px 30px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          position: relative;
          z-index: 1;
        }

        .hero-label {
          font-family: var(--mono);
          font-size: 10px;
          letter-spacing: 0.18em;
          color: var(--blue2);
        }

        .hero-status {
          font-size: 34px;
          font-weight: 700;
          letter-spacing: -0.03em;
          color: var(--text1);
          line-height: 1;
        }

        .hero-tier {
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 13px;
          color: var(--blue2);
        }

        .hero-stats {
          display: flex;
          margin-top: 6px;
          border: 1px solid var(--border);
          border-radius: 8px;
          overflow: hidden;
          background: rgba(0,0,0,0.2);
          width: fit-content;
        }

        .hstat { padding: 10px 18px; }
        .hstat.sep { border-right: 1px solid var(--border); }

        .hstat-l {
          font-family: var(--mono);
          font-size: 9px;
          letter-spacing: 0.12em;
          color: var(--text3);
          margin-bottom: 4px;
        }

        .hstat-v { font-size: 15px; font-weight: 600; color: var(--text1); }

        .hero-right {
          width: 280px;
          flex-shrink: 0;
          overflow: hidden;
        }

        .hero-img { width: 100%; height: 100%; object-fit: cover; opacity: 0.9; }

        /* Stats grid */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }

        .stat-card {
          background: var(--bg3);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 16px 18px;
          display: flex;
          flex-direction: column;
          gap: 5px;
          transition: border-color 0.15s;
        }

        .stat-card:hover { border-color: var(--border2); }

        .stat-card-top {
          display: flex;
          align-items: center;
          gap: 7px;
          margin-bottom: 4px;
        }

        .stat-icon { font-size: 13px; }

        .stat-label {
          font-family: var(--mono);
          font-size: 9px;
          letter-spacing: 0.12em;
          color: var(--text3);
        }

        .stat-value {
          font-size: 16px;
          font-weight: 600;
          color: var(--text1);
          letter-spacing: -0.01em;
        }

        .stat-sub { font-size: 11px; color: var(--text3); line-height: 1.4; }

        /* CTA */
        .cta-card {
          background: var(--bg3);
          border: 1px solid rgba(74,122,255,0.2);
          border-radius: 12px;
          padding: 20px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          background: linear-gradient(135deg, rgba(74,122,255,0.06) 0%, var(--bg3) 60%);
        }

        .cta-title {
          font-size: 15px;
          font-weight: 600;
          color: var(--text1);
          margin-bottom: 5px;
        }

        .cta-sub {
          font-size: 12.5px;
          color: var(--text2);
          line-height: 1.5;
          max-width: 600px;
        }

        .cta-btn {
          padding: 11px 22px;
          background: var(--blue);
          border: none;
          border-radius: 8px;
          color: white;
          font-family: var(--font);
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
          flex-shrink: 0;
          transition: background 0.15s;
        }

        .cta-btn:hover { background: #3a6aef; }
      `}</style>
        </div>
    )
}