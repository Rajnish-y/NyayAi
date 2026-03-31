const ENTITY_CONFIG = {
  PARTY: { color: '#3b82f6', bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.2)', label: 'PARTIES' },
  DATE: { color: '#10b981', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.2)', label: 'DATES' },
  MONEY: { color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)', label: 'AMOUNTS' },
  CLAUSE: { color: '#8b5cf6', bg: 'rgba(139,92,246,0.08)', border: 'rgba(139,92,246,0.2)', label: 'CLAUSES' },
  OBLIGATION: { color: '#ef4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)', label: 'OBLIGATIONS' },
}

export default function EntityPanel({ entities }) {
  const grouped = entities.reduce((acc, ent) => {
    if (!acc[ent.type]) acc[ent.type] = new Set()
    acc[ent.type].add(ent.text)
    return acc
  }, {})

  const totalCount = entities.length

  return (
    <div className="entity-panel">
      <div className="panel-header">
        <span className="panel-title">EXTRACTED ENTITIES</span>
        {totalCount > 0 && (
          <span className="entity-count">{totalCount}</span>
        )}
      </div>

      <div className="entity-content">
        {totalCount === 0 ? (
          <div className="entity-empty">
            <div className="empty-glyph">◈</div>
            <div className="empty-msg">Entities will appear after your first query</div>
          </div>
        ) : (
          Object.entries(grouped).map(([type, itemSet]) => {
            const items = [...itemSet]
            const cfg = ENTITY_CONFIG[type] || ENTITY_CONFIG.PARTY
            return (
              <div key={type} className="entity-group">
                <div className="group-header">
                  <span className="group-dot" style={{ background: cfg.color }} />
                  <span className="group-label">{cfg.label}</span>
                  <span className="group-count">{items.length}</span>
                </div>
                <div className="group-items">
                  {items.map((item, i) => (
                    <div
                      key={i}
                      className="entity-chip"
                      style={{
                        background: cfg.bg,
                        border: `1px solid ${cfg.border}`,
                        color: cfg.color,
                      }}
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            )
          })
        )}
      </div>

      <style>{`
        .entity-panel {
          flex: 1;
          overflow: hidden;
          display: flex;
          flex-direction: column;
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

        .entity-count {
          font-family: var(--font-mono);
          font-size: 10px;
          color: var(--accent-blue);
          background: rgba(59,130,246,0.1);
          border: 1px solid rgba(59,130,246,0.2);
          padding: 1px 7px;
          border-radius: 2px;
        }

        .entity-content {
          flex: 1;
          overflow-y: auto;
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          scrollbar-width: thin;
          scrollbar-color: var(--border) transparent;
        }

        .entity-empty {
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

        .entity-group { display: flex; flex-direction: column; gap: 7px; }

        .group-header {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .group-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .group-label {
          font-family: var(--font-mono);
          font-size: 9px;
          letter-spacing: 0.12em;
          color: var(--text-muted);
          flex: 1;
        }

        .group-count {
          font-family: var(--font-mono);
          font-size: 9px;
          color: var(--text-muted);
        }

        .group-items {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .entity-chip {
          font-family: var(--font-mono);
          font-size: 11px;
          padding: 5px 10px;
          border-radius: 3px;
          line-height: 1.4;
          word-break: break-word;
        }
      `}</style>
    </div>
  )
}