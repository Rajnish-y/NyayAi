import { useState } from 'react'
import Dashboard from './pages/Dashboard'
import Documents from './pages/Documents'
import Analysis from './pages/Analysis'

export default function App() {
  const [page, setPage] = useState('dashboard')
  const [documentId, setDocumentId] = useState(null)
  const [docInfo, setDocInfo] = useState(null)
  const [uploadedDocs, setUploadedDocs] = useState([])
  const [analysisData, setAnalysisData] = useState(null)

  const handleUploadSuccess = (data) => {
    setDocumentId(data.document_id)
    setDocInfo(data)
    setUploadedDocs(prev => {
      const exists = prev.find(d => d.document_id === data.document_id)
      if (exists) return prev
      return [{ ...data, uploadedAt: new Date() }, ...prev]
    })
    setPage('analysis')
  }

  const handleAnalysisResult = (result) => {
    setAnalysisData(result)
  }

  const navItems = [
    { id: 'dashboard', icon: '🛡', label: 'Safety Check' },
    { id: 'documents', icon: '📄', label: 'My Documents' },
    { id: 'analysis', icon: '🤖', label: 'Ask AI', disabled: !documentId },
  ]

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-icon">⚖</span>
          <div>
            <div className="brand-name">NyayAI</div>
            <div className="brand-sub">LEGAL AI PROTECTION</div>
          </div>
        </div>

        <nav className="nav">
          {navItems.map(item => (
            <button
              key={item.id}
              className={`nav-btn ${page === item.id ? 'active' : ''} ${item.disabled ? 'disabled' : ''}`}
              onClick={() => !item.disabled && setPage(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
              {page === item.id && <span className="nav-bar" />}
            </button>
          ))}
        </nav>

        <div className="nav-bottom">
          <button className="new-analysis-btn" onClick={() => setPage('documents')}>
            New Analysis
          </button>
        </div>
      </aside>

      <div className="main">
        <div className="topnav">
          <div className="topnav-left">
            <span className="topnav-title">
              {page === 'dashboard' && 'Dashboard'}
              {page === 'documents' && 'My Documents'}
              {page === 'analysis' && `Analysis · ${docInfo?.filename || ''}`}
            </span>
            {docInfo && page === 'analysis' && (
              <span className="topnav-pill">
                <span className="pill-dot" />
                ACTIVE
              </span>
            )}
          </div>
          <div className="topnav-right">
            <div className="avatar">R</div>
          </div>
        </div>

        <div className="content">
          {page === 'dashboard' && (
            <Dashboard onNavigate={setPage} docCount={uploadedDocs.length} />
          )}
          {page === 'documents' && (
            <Documents
              onUploadSuccess={handleUploadSuccess}
              uploadedDocs={uploadedDocs}
              onSelectDoc={(doc) => {
                setDocumentId(doc.document_id)
                setDocInfo(doc)
                setPage('analysis')
              }}
            />
          )}
          {page === 'analysis' && (
            <Analysis
              documentId={documentId}
              docInfo={docInfo}
              onAnalysisResult={handleAnalysisResult}
            />
          )}
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --bg: #0a0c12;
          --bg2: #0d1018;
          --bg3: #111420;
          --bg4: #161a26;
          --border: rgba(255,255,255,0.07);
          --border2: rgba(255,255,255,0.13);
          --blue: #4a7aff;
          --blue2: #6b94ff;
          --cyan: #00c8ff;
          --green: #00d4a0;
          --red: #ff4a6e;
          --amber: #ffb020;
          --text1: #e8eeff;
          --text2: #8899c0;
          --text3: #4a5878;
          --font: 'Inter', sans-serif;
          --mono: 'JetBrains Mono', monospace;
        }

        html, body, #root {
          height: 100%;
          background: var(--bg);
          color: var(--text1);
          font-family: var(--font);
          -webkit-font-smoothing: antialiased;
        }

        .shell { display: flex; height: 100vh; overflow: hidden; }

        .sidebar {
          width: 210px;
          flex-shrink: 0;
          background: var(--bg2);
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 18px 16px 16px;
          border-bottom: 1px solid var(--border);
        }

        .brand-icon { font-size: 22px; }

        .brand-name {
          font-size: 16px;
          font-weight: 700;
          letter-spacing: -0.01em;
        }

        .brand-sub {
          font-family: var(--mono);
          font-size: 8px;
          letter-spacing: 0.12em;
          color: var(--text3);
          margin-top: 1px;
        }

        .nav {
          flex: 1;
          padding: 12px 8px;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .nav-btn {
          position: relative;
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 9px 12px;
          border: none;
          background: transparent;
          color: var(--text2);
          font-family: var(--font);
          font-size: 13px;
          font-weight: 400;
          border-radius: 6px;
          cursor: pointer;
          text-align: left;
          width: 100%;
          transition: all 0.15s;
        }

        .nav-btn:hover:not(.disabled) { background: var(--bg4); color: var(--text1); }
        .nav-btn.active { background: rgba(74,122,255,0.1); color: var(--text1); font-weight: 500; }
        .nav-btn.disabled { opacity: 0.3; cursor: not-allowed; }

        .nav-icon { font-size: 14px; width: 18px; text-align: center; }

        .nav-bar {
          position: absolute;
          left: 0; top: 20%; height: 60%;
          width: 2px;
          background: var(--blue);
          border-radius: 0 2px 2px 0;
        }

        .nav-bottom {
          padding: 12px;
          border-top: 1px solid var(--border);
        }

        .new-analysis-btn {
          width: 100%;
          padding: 10px;
          background: var(--blue);
          border: none;
          border-radius: 8px;
          color: white;
          font-family: var(--font);
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s;
        }

        .new-analysis-btn:hover { background: #3a6aef; }

        .main { flex: 1; display: flex; flex-direction: column; overflow: hidden; }

        .topnav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 24px;
          height: 50px;
          border-bottom: 1px solid var(--border);
          background: var(--bg2);
          flex-shrink: 0;
        }

        .topnav-left { display: flex; align-items: center; gap: 12px; }

        .topnav-title {
          font-size: 13px;
          font-weight: 500;
          color: var(--text2);
        }

        .topnav-pill {
          display: flex;
          align-items: center;
          gap: 5px;
          font-family: var(--mono);
          font-size: 9px;
          letter-spacing: 0.1em;
          color: var(--cyan);
          background: rgba(0,200,255,0.07);
          border: 1px solid rgba(0,200,255,0.15);
          padding: 3px 10px;
          border-radius: 20px;
        }

        .pill-dot {
          width: 5px; height: 5px;
          border-radius: 50%;
          background: var(--cyan);
          animation: pulse 2s infinite;
        }

        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.3; } }

        .topnav-right { display: flex; align-items: center; gap: 8px; }

        .avatar {
          width: 30px; height: 30px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--blue), var(--cyan));
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 700;
          color: white;
        }

        .content {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
        }

        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 2px; }
      `}</style>
    </div>
  )
}