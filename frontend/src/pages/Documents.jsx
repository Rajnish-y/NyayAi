import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { uploadDocument } from '../services/api'

export default function Documents({ onUploadSuccess, uploadedDocs, onSelectDoc }) {
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState(null)
    const [progress, setProgress] = useState(0)

    const onDrop = useCallback(async (files) => {
        const file = files[0]
        if (!file) return
        setUploading(true)
        setError(null)
        setProgress(0)
        const iv = setInterval(() => setProgress(p => Math.min(p + 10, 85)), 400)
        try {
            const result = await uploadDocument(file)
            setProgress(100)
            setTimeout(() => { onUploadSuccess(result); setUploading(false); setProgress(0) }, 400)
        } catch (err) {
            setError(err.response?.data?.detail || 'Upload failed. Is the backend running?')
            setUploading(false); setProgress(0)
        } finally { clearInterval(iv) }
    }, [onUploadSuccess])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'application/pdf': ['.pdf'] },
        maxFiles: 1,
    })

    const formatTime = (date) => {
        const diff = Math.floor((Date.now() - date) / 1000)
        if (diff < 60) return 'Just now'
        if (diff < 3600) return `${Math.floor(diff / 60)} mins ago`
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    return (
        <div className="docs-page">
            <div className="docs-header">
                <div>
                    <h1 className="docs-title">My Documents</h1>
                    <p className="docs-sub">Secure repository for legal documents undergoing active AI surveillance and safety verification.</p>
                </div>
            </div>

            <div className="docs-grid">
                {/* Upload zone */}
                <div
                    {...getRootProps()}
                    className={`upload-zone ${isDragActive ? 'drag' : ''} ${uploading ? 'loading' : ''}`}
                >
                    <input {...getInputProps()} />
                    <div className="upload-icon-box">
                        {uploading ? <div className="spinner" /> : <span className="upload-arrow">↑</span>}
                    </div>
                    <div className="upload-main">
                        {uploading ? 'Processing document...' : isDragActive ? 'Release to upload' : 'Drop files here to analyze'}
                    </div>
                    <div className="upload-hint">PDF documents only. Any file size.</div>
                    {uploading && (
                        <div className="progress-wrap">
                            <div className="progress-bar">
                                <div className="progress-fill" style={{ width: `${progress}%` }} />
                            </div>
                            <span className="progress-pct">{progress}%</span>
                        </div>
                    )}
                    <div className="upload-tags">
                        <span className="utag">SECURE UPLOAD</span>
                        <span className="utag">NyayAI PIPELINE</span>
                    </div>
                    {error && <div className="upload-err">{error}</div>}
                </div>

                {/* Vault gauge */}
                <div className="vault-card">
                    <div className="vault-label">VAULT SAFETY LEVEL</div>
                    <div className="vault-gauge">
                        <svg viewBox="0 0 120 120">
                            <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
                            <circle
                                cx="60" cy="60" r="50"
                                fill="none"
                                stroke="url(#gg)"
                                strokeWidth="10"
                                strokeDasharray={`${2 * Math.PI * 50 * 0.92} ${2 * Math.PI * 50}`}
                                strokeDashoffset={2 * Math.PI * 50 * 0.25}
                                strokeLinecap="round"
                            />
                            <defs>
                                <linearGradient id="gg" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#4a7aff" />
                                    <stop offset="100%" stopColor="#00c8ff" />
                                </linearGradient>
                            </defs>
                            <text x="60" y="56" textAnchor="middle" fill="#e8eeff" fontSize="22" fontWeight="700" fontFamily="Inter">92%</text>
                            <text x="60" y="72" textAnchor="middle" fill="#8899c0" fontSize="9" fontFamily="Inter" letterSpacing="2">OPTIMAL</text>
                        </svg>
                    </div>
                    <p className="vault-desc">Safety level is calculated based on active threats across all monitored documents.</p>
                    <div className="vault-stats">
                        <div className="vault-stat">
                            <div className="vs-num">{uploadedDocs.length}</div>
                            <div className="vs-label">UPLOADED</div>
                        </div>
                        <div className="vault-stat">
                            <div className="vs-num">0</div>
                            <div className="vs-label">THREATS</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Real documents table */}
            <div className="docs-card">
                <div className="docs-card-head">
                    <span className="card-title">Active Repository</span>
                    <span className="docs-count">
                        {uploadedDocs.length > 0
                            ? `${uploadedDocs.length} document${uploadedDocs.length > 1 ? 's' : ''} uploaded`
                            : 'No documents yet'}
                    </span>
                </div>

                {uploadedDocs.length === 0 ? (
                    <div className="docs-empty">
                        <div className="empty-icon">📄</div>
                        <div className="empty-title">No documents uploaded yet</div>
                        <div className="empty-sub">Upload a PDF above to get started with AI analysis</div>
                    </div>
                ) : (
                    <table className="docs-table">
                        <thead>
                            <tr>
                                <th>DOCUMENT NAME</th>
                                <th>PAGES</th>
                                <th>CHUNKS</th>
                                <th>UPLOADED</th>
                                <th>STATUS</th>
                                <th>ACTION</th>
                            </tr>
                        </thead>
                        <tbody>
                            {uploadedDocs.map(doc => (
                                <tr key={doc.document_id} onClick={() => onSelectDoc(doc)} className="doc-row">
                                    <td>
                                        <div className="doc-name">{doc.filename}</div>
                                        <div className="doc-method">{doc.method}</div>
                                    </td>
                                    <td className="doc-meta">{doc.pages}</td>
                                    <td className="doc-meta">{doc.chunks}</td>
                                    <td className="doc-time">{formatTime(doc.uploadedAt)}</td>
                                    <td>
                                        <span className="status-badge verified">● Processed</span>
                                    </td>
                                    <td>
                                        <button className="analyze-btn" onClick={e => { e.stopPropagation(); onSelectDoc(doc) }}>
                                            Analyze →
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                <div className="docs-footer">
                    <span>ENCRYPTION <strong>End-to-End</strong></span>
                    <span>PROCESSING <strong>NyayAI Pipeline</strong></span>
                    <span>MODELS <strong>InLegalBERT · Llama 3.3</strong></span>
                </div>
            </div>

            <style>{`
        .docs-page { display: flex; flex-direction: column; gap: 20px; }

        .docs-header { display: flex; justify-content: space-between; align-items: flex-start; }

        .docs-title { font-size: 22px; font-weight: 700; letter-spacing: -0.02em; color: var(--text1); }

        .docs-sub { font-size: 13px; color: var(--text2); margin-top: 4px; max-width: 460px; line-height: 1.5; }

        .docs-grid {
          display: grid;
          grid-template-columns: 1fr 220px;
          gap: 16px;
          align-items: start;
        }

        .upload-zone {
          border: 2px dashed var(--border2);
          border-radius: 12px;
          padding: 36px 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          transition: all 0.2s;
          background: var(--bg3);
          text-align: center;
        }

        .upload-zone:hover:not(.loading), .upload-zone.drag {
          border-color: var(--blue);
          background: rgba(74,122,255,0.04);
        }

        .upload-zone.loading { cursor: default; pointer-events: none; }

        .upload-icon-box {
          width: 52px; height: 52px;
          background: var(--bg4);
          border: 1px solid var(--border2);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .upload-arrow { font-size: 22px; color: var(--blue); }

        .spinner {
          width: 22px; height: 22px;
          border: 2px solid var(--border);
          border-top-color: var(--blue);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        .upload-main { font-size: 15px; font-weight: 600; color: var(--text1); }
        .upload-hint { font-size: 12px; color: var(--text2); }

        .progress-wrap {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 240px;
        }

        .progress-bar {
          flex: 1;
          height: 4px;
          background: rgba(255,255,255,0.06);
          border-radius: 2px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--blue), var(--cyan));
          transition: width 0.3s;
        }

        .progress-pct {
          font-family: var(--mono);
          font-size: 10px;
          color: var(--blue2);
          width: 30px;
        }

        .upload-tags { display: flex; gap: 8px; }

        .utag {
          font-family: var(--mono);
          font-size: 9px;
          letter-spacing: 0.1em;
          color: var(--text3);
          background: var(--bg4);
          border: 1px solid var(--border);
          padding: 3px 8px;
          border-radius: 4px;
        }

        .upload-err {
          font-family: var(--mono);
          font-size: 11px;
          color: var(--red);
          background: rgba(255,74,110,0.08);
          border: 1px solid rgba(255,74,110,0.2);
          padding: 7px 12px;
          border-radius: 6px;
          width: 100%;
        }

        /* Vault */
        .vault-card {
          background: var(--bg3);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 18px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          text-align: center;
        }

        .vault-label {
          font-family: var(--mono);
          font-size: 9px;
          letter-spacing: 0.15em;
          color: var(--text3);
          align-self: flex-start;
        }

        .vault-gauge { width: 120px; height: 120px; }
        .vault-gauge svg { width: 100%; height: 100%; }

        .vault-desc { font-size: 11px; color: var(--text2); line-height: 1.5; }

        .vault-stats {
          display: flex;
          gap: 16px;
          width: 100%;
          justify-content: center;
        }

        .vault-stat { text-align: center; }

        .vs-num { font-size: 20px; font-weight: 700; color: var(--text1); }

        .vs-label {
          font-family: var(--mono);
          font-size: 9px;
          letter-spacing: 0.1em;
          color: var(--text3);
          margin-top: 2px;
        }

        /* Docs table */
        .docs-card {
          background: var(--bg3);
          border: 1px solid var(--border);
          border-radius: 12px;
          overflow: hidden;
        }

        .docs-card-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          border-bottom: 1px solid var(--border);
        }

        .card-title { font-size: 14px; font-weight: 600; color: var(--text1); }

        .docs-count {
          font-family: var(--mono);
          font-size: 10px;
          color: var(--text3);
          letter-spacing: 0.05em;
        }

        .docs-empty {
          padding: 48px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        .empty-icon { font-size: 32px; opacity: 0.3; }
        .empty-title { font-size: 14px; font-weight: 500; color: var(--text2); }
        .empty-sub { font-size: 12px; color: var(--text3); }

        .docs-table { width: 100%; border-collapse: collapse; }

        .docs-table th {
          font-family: var(--mono);
          font-size: 9px;
          letter-spacing: 0.1em;
          color: var(--text3);
          text-align: left;
          padding: 10px 20px;
          border-bottom: 1px solid var(--border);
          background: rgba(0,0,0,0.1);
        }

        .docs-table td {
          padding: 13px 20px;
          border-bottom: 1px solid var(--border);
          vertical-align: middle;
        }

        .doc-row { cursor: pointer; transition: background 0.1s; }
        .doc-row:hover td { background: rgba(255,255,255,0.02); }
        .docs-table tr:last-child td { border-bottom: none; }

        .doc-name { font-size: 13px; font-weight: 500; color: var(--text1); }
        .doc-method { font-family: var(--mono); font-size: 10px; color: var(--text3); margin-top: 2px; }
        .doc-meta { font-family: var(--mono); font-size: 12px; color: var(--text2); }
        .doc-time { font-family: var(--mono); font-size: 11px; color: var(--text3); }

        .status-badge {
          font-size: 12px;
          font-weight: 500;
        }

        .verified { color: var(--blue2); }

        .analyze-btn {
          padding: 5px 12px;
          background: rgba(74,122,255,0.1);
          border: 1px solid rgba(74,122,255,0.2);
          border-radius: 6px;
          color: var(--blue2);
          font-family: var(--font);
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s;
        }

        .analyze-btn:hover {
          background: rgba(74,122,255,0.2);
          border-color: var(--blue);
        }

        .docs-footer {
          display: flex;
          gap: 28px;
          padding: 12px 20px;
          border-top: 1px solid var(--border);
          background: rgba(0,0,0,0.1);
        }

        .docs-footer span {
          font-family: var(--mono);
          font-size: 10px;
          color: var(--text3);
          letter-spacing: 0.05em;
        }

        .docs-footer strong { color: var(--text2); font-weight: 500; }
      `}</style>
        </div>
    )
}