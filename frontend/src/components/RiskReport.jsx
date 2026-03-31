export default function RiskReport({ riskReport }) {
  const getRiskLevel = (score) => {
    if (score < 30) return { label: 'LOW RISK', color: '#10b981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.25)' }
    if (score < 60) return { label: 'MODERATE RISK', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.25)' }
    return { label: 'HIGH RISK', color: '#ef4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.25)' }
  }

  const getScoreColor = (score) => {
    if (score < 30) return '#10b981'
    if (score < 60) return '#f59e0b'
    return '#ef4444'
  }

  return (
    <div className="risk-panel">
      <div className="panel-header">
        <span className="panel-title">RISK PROFILE</span>
        {riskReport && (
          <span
            className="risk-badge"
            style={{
              color: getRiskLevel(riskReport.overall_risk_score).color,
              background: getRiskLevel(riskReport.overall_risk_score).bg,
              border: `1px solid ${getRiskLevel(riskReport.overall_risk_score).border}`,
            }}
          >
            {getRiskLevel(riskReport.overall_risk_score).label}
          </span>
        )}
      </div>

      <div className="risk-content">
        {!riskReport ? (
          <div className="risk-empty">
            <div className="empty-glyph">⚠</div>
            <div className="empty-msg">Risk analysis will appear after your first query</div>
          </div>
        ) : (
          <>
            {/* Score display */}
            <div className="score-section">
              <div className="score-display">
                <div
                  className="score-number"
                  style={{ color: getScoreColor(riskReport.overall_risk_score) }}
                >
                  {riskReport.overall_risk_score}
                </div>
                <div className="score-denom">/ 100</div>
              </div>
              <div className="score-bar-wrap">
                <div className="score-bar-label">
                  <span>SECURITY PROFILE</span>
                  <span>{riskReport.overall_risk_score < 30 ? 'WITHIN STANDARD' : riskReport.overall_risk_score < 60 ? 'REVIEW ADVISED' : 'LEGAL REVIEW REQUIRED'}</span>
                </div>
                <div className="score-bar">
                  <div
                    className="score-fill"
                    style={{
                      width: `${riskReport.overall_risk_score}%`,
                      background: getScoreColor(riskReport.overall_risk_score),
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Counts */}
            <div className="counts-grid">
              {[
                { key: 'SAFE', count: riskReport.risk_counts.SAFE, color: '#10b981', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.2)' },
                { key: 'CAUTION', count: riskReport.risk_counts.CAUTION, color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)' },
                { key: 'DANGEROUS', count: riskReport.risk_counts.DANGEROUS, color: '#ef4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)' },
              ].map(item => (
                <div key={item.key} className="count-card" style={{ background: item.bg, border: `1px solid ${item.border}` }}>
                  <div className="count-num" style={{ color: item.color }}>{item.count}</div>
                  <div className="count-label" style={{ color: item.color }}>{item.key}</div>
                </div>
              ))}
            </div>

            {/* Dangerous clauses */}
            {riskReport.dangerous_clauses?.length > 0 && (
              <div className="clause-section">
                <div className="clause-section-header">
                  <span className="clause-indicator dangerous" />
                  <span className="clause-section-title">DANGEROUS CLAUSES</span>
                  <span className="clause-section-count">{riskReport.dangerous_clauses.length}</span>
                </div>
                <div className="clause-list">
                  {riskReport.dangerous_clauses.slice(0, 4).map((c, i) => (
                    <div key={i} className="clause-item dangerous">
                      <div className="clause-index">{String(i + 1).padStart(2, '0')}</div>
                      <div className="clause-text">{c.clause}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Caution clauses */}
            {riskReport.caution_clauses?.length > 0 && (
              <div className="clause-section">
                <div className="clause-section-header">
                  <span className="clause-indicator caution" />
                  <span className="clause-section-title">CAUTION CLAUSES</span>
                  <span className="clause-section-count">{riskReport.caution_clauses.length}</span>
                </div>
                <div className="clause-list">
                  {riskReport.caution_clauses.slice(0, 3).map((c, i) => (
                    <div key={i} className="clause-item caution">
                      <div className="clause-index">{String(i + 1).padStart(2, '0')}</div>
                      <div className="clause-text">{c.clause}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="analysis-footer">
              <span className="footer-label">ANALYZED BY NYAYAI v1.0</span>
              <span className="footer-label">InLegalBERT · BERT Classifier</span>
            </div>
          </>
        )}
      </div>

      <style>{`
        .risk-panel {
          display: flex;
          flex-direction: column;
          height: 100%;
          overflow: hidden;
        }

        .panel-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 16px;
          border-bottom: 1px solid var(--border);
          flex-shrink: 0;
        }

        .panel-title {
          font-family: var(--font-mono);
          font-size: 9px;
          letter-spacing: 0.15em;
          color: var(--text-muted);
        }

        .risk-badge {
          font-family: var(--font-mono);
          font-size: 9px;
          letter-spacing: 0.1em;
          padding: 2px 8px;
          border-radius: 2px;
        }

        .risk-content {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          scrollbar-width: thin;
          scrollbar-color: var(--border) transparent;
        }

        .risk-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          padding: 40px 16px;
          text-align: center;
          opacity: 0.4;
        }

        .empty-glyph { font-size: 22px; color: var(--text-muted); }

        .empty-msg {
          font-size: 11px;
          color: var(--text-muted);
          font-family: var(--font-mono);
          line-height: 1.5;
        }

        .score-section {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 4px;
          padding: 16px;
          display: flex;
          gap: 16px;
          align-items: center;
        }

        .score-display { display: flex; align-items: baseline; gap: 3px; flex-shrink: 0; }

        .score-number {
          font-family: var(--font-display);
          font-size: 42px;
          font-weight: 800;
          line-height: 1;
          letter-spacing: -0.03em;
        }

        .score-denom {
          font-family: var(--font-mono);
          font-size: 12px;
          color: var(--text-muted);
        }

        .score-bar-wrap { flex: 1; display: flex; flex-direction: column; gap: 6px; }

        .score-bar-label {
          display: flex;
          justify-content: space-between;
          font-family: var(--font-mono);
          font-size: 8px;
          letter-spacing: 0.1em;
          color: var(--text-muted);
        }

        .score-bar {
          height: 3px;
          background: var(--border);
          border-radius: 2px;
          overflow: hidden;
        }

        .score-fill {
          height: 100%;
          border-radius: 2px;
          transition: width 0.8s ease;
        }

        .counts-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 6px;
        }

        .count-card {
          border-radius: 4px;
          padding: 12px 8px;
          text-align: center;
        }

        .count-num {
          font-family: var(--font-display);
          font-size: 24px;
          font-weight: 800;
          line-height: 1;
        }

        .count-label {
          font-family: var(--font-mono);
          font-size: 8px;
          letter-spacing: 0.1em;
          margin-top: 4px;
          opacity: 0.8;
        }

        .clause-section { display: flex; flex-direction: column; gap: 8px; }

        .clause-section-header {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .clause-indicator {
          width: 6px;
          height: 6px;
          border-radius: 1px;
          flex-shrink: 0;
        }

        .clause-indicator.dangerous { background: #ef4444; }
        .clause-indicator.caution { background: #f59e0b; }

        .clause-section-title {
          font-family: var(--font-mono);
          font-size: 9px;
          letter-spacing: 0.12em;
          color: var(--text-muted);
          flex: 1;
        }

        .clause-section-count {
          font-family: var(--font-mono);
          font-size: 9px;
          color: var(--text-muted);
        }

        .clause-list { display: flex; flex-direction: column; gap: 4px; }

        .clause-item {
          display: flex;
          gap: 10px;
          padding: 10px 12px;
          border-radius: 3px;
          border-left: 2px solid;
          align-items: flex-start;
        }

        .clause-item.dangerous {
          background: rgba(239,68,68,0.06);
          border-left-color: #ef4444;
        }

        .clause-item.caution {
          background: rgba(245,158,11,0.06);
          border-left-color: #f59e0b;
        }

        .clause-index {
          font-family: var(--font-mono);
          font-size: 9px;
          color: var(--text-muted);
          flex-shrink: 0;
          margin-top: 1px;
        }

        .clause-text {
          font-size: 11.5px;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        .analysis-footer {
          display: flex;
          flex-direction: column;
          gap: 3px;
          padding-top: 4px;
          border-top: 1px solid var(--border);
        }

        .footer-label {
          font-family: var(--font-mono);
          font-size: 9px;
          letter-spacing: 0.08em;
          color: var(--text-muted);
        }
      `}</style>
    </div>
  )
}