import { useState } from 'react'
import FileUpload from './components/FileUpload'
import ChatInterface from './components/ChatInterface'
import EntityPanel from './components/EntityPanel'
import RiskReport from './components/RiskReport'

export default function App() {
  const [documentId, setDocumentId] = useState(null)
  const [docInfo, setDocInfo]       = useState(null)
  const [entities, setEntities]     = useState([])
  const [riskReport, setRiskReport] = useState(null)
  const [messages, setMessages]     = useState([])
  const [loading, setLoading]       = useState(false)

  const handleUploadSuccess = (data) => {
    setDocumentId(data.document_id)
    setDocInfo(data)
    setMessages([{
      role: 'assistant',
      content: `✅ Document uploaded successfully! 
**${data.filename}** — ${data.pages} pages, ${data.chunks} chunks processed.
You can now ask me anything about this document.`
    }])
    setEntities([])
    setRiskReport(null)
  }

  const handleAnalysisResult = (result) => {
    setEntities(result.entities || [])
    setRiskReport(result.risk_report || null)
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚖️</span>
            <div>
              <h1 className="text-xl font-bold text-white">NyayAI</h1>
              <p className="text-xs text-gray-400">
                Legal Document Intelligence
              </p>
            </div>
          </div>
          {docInfo && (
            <div className="text-sm text-gray-400 bg-gray-800 
                            px-3 py-1 rounded-full">
              📄 {docInfo.filename} · {docInfo.pages} pages
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6">
        {!documentId ? (
          /* Upload Screen */
          <div className="flex flex-col items-center justify-center 
                          min-h-[80vh]">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold mb-3">
                Understand any legal document
              </h2>
              <p className="text-gray-400 text-lg max-w-xl">
                Upload a contract, FIR, rental agreement, or court order.
                NyayAI extracts key information, flags risky clauses,
                and answers your questions in plain language.
              </p>
            </div>
            <FileUpload onUploadSuccess={handleUploadSuccess} />
            <div className="flex gap-6 mt-8 text-sm text-gray-500">
              <span>✓ Rental agreements</span>
              <span>✓ Employment contracts</span>
              <span>✓ Loan agreements</span>
              <span>✓ Court orders / FIRs</span>
            </div>
          </div>
        ) : (
          /* Analysis Screen */
          <div className="grid grid-cols-12 gap-6">
            {/* Left panel */}
            <div className="col-span-3 flex flex-col gap-4">
              <FileUpload
                onUploadSuccess={handleUploadSuccess}
                compact={true}
              />
              <EntityPanel entities={entities} />
            </div>

            {/* Center — chat */}
            <div className="col-span-6">
              <ChatInterface
                documentId={documentId}
                messages={messages}
                setMessages={setMessages}
                onAnalysisResult={handleAnalysisResult}
                loading={loading}
                setLoading={setLoading}
              />
            </div>

            {/* Right — risk report */}
            <div className="col-span-3">
              <RiskReport riskReport={riskReport} />
            </div>
          </div>
        )}
      </main>
    </div>
  )
}