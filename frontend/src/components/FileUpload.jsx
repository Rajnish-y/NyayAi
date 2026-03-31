import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { uploadDocument } from '../services/api'

export default function FileUpload({ onUploadSuccess, compact = false }) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)
  const [progress, setProgress] = useState(0)

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0]
    if (!file) return
    setUploading(true)
    setError(null)
    setProgress(0)

    const interval = setInterval(() => {
      setProgress(p => Math.min(p + Math.random() * 15, 85))
    }, 400)

    try {
      const result = await uploadDocument(file)
      setProgress(100)
      setTimeout(() => {
        onUploadSuccess(result)
        setUploading(false)
        setProgress(0)
      }, 400)
    } catch (err) {
      setError(err.response?.data?.detail || 'Upload failed. Is the backend running?')
      setUploading(false)
      setProgress(0)
    } finally {
      clearInterval(interval)
    }
  }, [onUploadSuccess])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
  })

  if (compact) {
    return (
      <div {...getRootProps()} className={`upload-compact ${isDragActive ? 'drag' : ''}`}>
        <input {...getInputProps()} />
        <span className="compact-icon">↑</span>
        <span className="compact-text">{uploading ? 'Processing...' : 'Upload new document'}</span>
        <style>{`
          .upload-compact {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px 12px;
            border: 1px dashed var(--border-bright);
            border-radius: 4px;
            cursor: pointer;
            transition: all 0.2s;
            background: transparent;
          }
          .upload-compact:hover, .upload-compact.drag {
            border-color: var(--accent-blue);
            background: rgba(59,130,246,0.05);
          }
          .compact-icon {
            font-size: 14px;
            color: var(--accent-blue);
            font-weight: 300;
          }
          .compact-text {
            font-family: var(--font-mono);
            font-size: 10px;
            letter-spacing: 0.05em;
            color: var(--text-muted);
          }
        `}</style>
      </div>
    )
  }

  return (
    <div
      {...getRootProps()}
      className={`upload-zone ${isDragActive ? 'drag' : ''} ${uploading ? 'uploading' : ''}`}
    >
      <input {...getInputProps()} />

      <div className="upload-icon-wrap">
        {uploading ? (
          <div className="upload-spinner" />
        ) : (
          <div className="upload-icon">{isDragActive ? '▽' : '△'}</div>
        )}
      </div>

      <div className="upload-text">
        {uploading ? (
          <>
            <div className="upload-title">Ingesting document...</div>
            <div className="upload-sub">Extracting text, building semantic index</div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <div className="progress-label">{Math.round(progress)}%</div>
          </>
        ) : (
          <>
            <div className="upload-title">
              {isDragActive ? 'Release to upload' : 'Drop PDF document here'}
            </div>
            <div className="upload-sub">or click to browse · PDF only · any size</div>
          </>
        )}
      </div>

      {error && <div className="upload-error">{error}</div>}

      <style>{`
        .upload-zone {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
          padding: 48px 32px;
          border: 1px solid var(--border-bright);
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.25s;
          background: var(--bg-card);
          width: 100%;
          max-width: 480px;
          position: relative;
          overflow: hidden;
        }

        .upload-zone::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse at 50% 0%, rgba(59,130,246,0.06) 0%, transparent 70%);
          pointer-events: none;
        }

        .upload-zone:hover:not(.uploading),
        .upload-zone.drag {
          border-color: var(--accent-blue);
          background: rgba(59,130,246,0.04);
        }

        .upload-zone.uploading { cursor: default; pointer-events: none; }

        .upload-icon-wrap {
          width: 56px;
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid var(--border-bright);
          border-radius: 4px;
          background: var(--bg-elevated);
        }

        .upload-icon {
          font-size: 24px;
          color: var(--accent-blue);
          line-height: 1;
        }

        .upload-spinner {
          width: 24px;
          height: 24px;
          border: 2px solid var(--border);
          border-top-color: var(--accent-blue);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        .upload-text {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          width: 100%;
        }

        .upload-title {
          font-family: var(--font-display);
          font-size: 17px;
          font-weight: 600;
          color: var(--text-primary);
          letter-spacing: -0.01em;
        }

        .upload-sub {
          font-size: 12px;
          color: var(--text-muted);
          font-family: var(--font-mono);
        }

        .progress-bar {
          width: 200px;
          height: 2px;
          background: var(--border);
          border-radius: 1px;
          overflow: hidden;
          margin-top: 8px;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--accent-blue), var(--accent-cyan));
          transition: width 0.3s ease;
        }

        .progress-label {
          font-family: var(--font-mono);
          font-size: 11px;
          color: var(--accent-blue);
        }

        .upload-error {
          font-family: var(--font-mono);
          font-size: 11px;
          color: var(--accent-red);
          background: rgba(239,68,68,0.08);
          border: 1px solid rgba(239,68,68,0.2);
          padding: 8px 14px;
          border-radius: 4px;
          width: 100%;
          text-align: center;
        }
      `}</style>
    </div>
  )
}