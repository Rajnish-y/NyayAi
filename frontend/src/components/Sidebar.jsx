export default function Sidebar({ activeView, setActiveView, docInfo, onNewAnalysis }) {
    const navItems = [
        { id: 'upload', icon: '⊕', label: 'New Analysis' },
        { id: 'analyze', icon: '⬡', label: 'Ask AI', disabled: !docInfo },
        { id: 'entities', icon: '◈', label: 'Entities', disabled: !docInfo },
        { id: 'risk', icon: '⚠', label: 'Risk Profile', disabled: !docInfo },
    ]

    return (
        <aside className="sidebar">
            {/* Logo */}
            <div className="sidebar-logo">
                <div className="logo-icon">⚖</div>
                <div className="logo-text">
                    <div className="logo-name">NyayAI</div>
                    <div className="logo-sub">LEGAL INTELLIGENCE</div>
                </div>
            </div>

            {/* Nav */}
            <nav className="sidebar-nav">
                {navItems.map(item => (
                    <button
                        key={item.id}
                        className={`nav-item ${activeView === item.id ? 'active' : ''} ${item.disabled ? 'disabled' : ''}`}
                        onClick={() => !item.disabled && (item.id === 'upload' ? onNewAnalysis() : setActiveView(item.id))}
                    >
                        <span className="nav-icon">{item.icon}</span>
                        <span className="nav-label">{item.label}</span>
                        {activeView === item.id && <span className="nav-active-bar" />}
                    </button>
                ))}
            </nav>

            <style>{`
        .sidebar {
          width: 220px;
          flex-shrink: 0;
          background: var(--bg-surface);
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .sidebar-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 20px 16px;
          border-bottom: 1px solid var(--border);
        }

        .logo-icon {
          font-size: 22px;
          line-height: 1;
          color: var(--accent-blue);
        }

        .logo-name {
          font-family: var(--font-display);
          font-size: 16px;
          font-weight: 800;
          letter-spacing: -0.01em;
          color: var(--text-primary);
        }

        .logo-sub {
          font-family: var(--font-mono);
          font-size: 8px;
          letter-spacing: 0.15em;
          color: var(--text-muted);
          margin-top: 1px;
        }

        .sidebar-nav {
          flex: 1;
          padding: 12px 8px;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .nav-item {
          position: relative;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          border-radius: 4px;
          border: none;
          background: transparent;
          cursor: pointer;
          color: var(--text-muted);
          font-family: var(--font-body);
          font-size: 13px;
          font-weight: 400;
          text-align: left;
          transition: all 0.15s;
          width: 100%;
        }

        .nav-item:hover:not(.disabled) {
          background: var(--bg-hover);
          color: var(--text-secondary);
        }

        .nav-item.active {
          background: rgba(59,130,246,0.08);
          color: var(--text-primary);
        }

        .nav-item.disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .nav-icon {
          font-size: 14px;
          width: 18px;
          text-align: center;
          color: inherit;
        }

        .nav-label { font-weight: 500; }

        .nav-active-bar {
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 2px;
          height: 60%;
          background: var(--accent-blue);
          border-radius: 0 2px 2px 0;
        }

        .sidebar-footer {
          padding: 12px;
          border-top: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .system-status {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 4px;
          padding: 10px 12px;
        }

        .system-status-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .system-label {
          font-family: var(--font-mono);
          font-size: 9px;
          letter-spacing: 0.12em;
          color: var(--text-muted);
        }

        .system-badge {
          font-family: var(--font-mono);
          font-size: 9px;
          color: var(--accent-green);
          background: rgba(16,185,129,0.1);
          border: 1px solid rgba(16,185,129,0.2);
          padding: 2px 6px;
          border-radius: 2px;
          letter-spacing: 0.08em;
        }

        .system-items { display: flex; flex-direction: column; gap: 5px; }

        .system-item {
          display: flex;
          align-items: center;
          gap: 7px;
        }

        .system-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .system-dot.ok { background: var(--accent-green); }
        .system-dot.err { background: var(--accent-red); }

        .system-item-name {
          font-size: 11px;
          color: var(--text-muted);
          font-family: var(--font-body);
        }

        .sidebar-version {
          font-family: var(--font-mono);
          font-size: 9px;
          color: var(--text-muted);
          text-align: center;
          letter-spacing: 0.05em;
        }
      `}</style>
        </aside>
    )
}