import { useState, useRef, useEffect } from 'react'
import { analyzeDocument } from '../services/api'
import ReactMarkdown from 'react-markdown'

export default function ChatInterface({
  documentId, messages, setMessages,
  onAnalysisResult, loading, setLoading
}) {
  const [question, setQuestion] = useState('')
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
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: result.answer
      }])
      onAnalysisResult(result)
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '❌ Error: ' + (err.response?.data?.detail || err.message)
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleAsk()
    }
  }

  // Suggested questions
  const suggestions = [
    "What is this document about?",
    "Who are the main parties involved?",
    "What are the payment terms?",
    "Are there any risky clauses I should know about?",
    "What happens if either party breaks this agreement?",
  ]

  return (
    <div className="flex flex-col h-[85vh] bg-gray-900 rounded-2xl 
                    border border-gray-800">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            <p className="text-lg">Ask anything about your document</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user'
              ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm
                ${msg.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-100'}`}
            >
              <ReactMarkdown>{msg.content}</ReactMarkdown>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-800 rounded-2xl px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full 
                                 animate-bounce [animation-delay:0ms]"/>
                <span className="w-2 h-2 bg-gray-400 rounded-full 
                                 animate-bounce [animation-delay:150ms]"/>
                <span className="w-2 h-2 bg-gray-400 rounded-full 
                                 animate-bounce [animation-delay:300ms]"/>
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      {messages.length <= 1 && (
        <div className="px-4 pb-2 flex flex-wrap gap-2">
          {suggestions.map((s, i) => (
            <button
              key={i}
              onClick={() => setQuestion(s)}
              className="text-xs bg-gray-800 hover:bg-gray-700 
                         text-gray-300 px-3 py-1.5 rounded-full 
                         transition-colors border border-gray-700"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-gray-800">
        <div className="flex gap-2">
          <textarea
            value={question}
            onChange={e => setQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything about your document..."
            rows={2}
            className="flex-1 bg-gray-800 text-white placeholder-gray-500 
                       rounded-xl px-4 py-3 text-sm resize-none 
                       border border-gray-700 focus:outline-none 
                       focus:border-blue-500 transition-colors"
          />
          <button
            onClick={handleAsk}
            disabled={loading || !question.trim()}
            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-40
                       disabled:cursor-not-allowed text-white px-4 
                       rounded-xl transition-colors font-medium text-sm"
          >
            Ask
          </button>
        </div>
        <p className="text-xs text-gray-600 mt-1 ml-1">
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  )
}