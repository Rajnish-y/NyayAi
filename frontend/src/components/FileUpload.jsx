import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { uploadDocument } from '../services/api'

export default function FileUpload({ onUploadSuccess, compact = false }) {
  const [uploading, setUploading] = useState(false)
  const [error, setError]         = useState(null)

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0]
    if (!file) return
    setUploading(true)
    setError(null)
    try {
      const result = await uploadDocument(file)
      onUploadSuccess(result)
    } catch (err) {
      setError(err.response?.data?.detail || 'Upload failed. Is the server running?')
    } finally {
      setUploading(false)
    }
  }, [onUploadSuccess])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
  })

  if (compact) {
    return (
      <div
        {...getRootProps()}
        className="border border-dashed border-gray-700 rounded-lg p-3 
                   text-center cursor-pointer hover:border-blue-500 
                   transition-colors"
      >
        <input {...getInputProps()} />
        <p className="text-xs text-gray-400">
          {uploading ? '⏳ Processing...' : '📄 Upload new document'}
        </p>
      </div>
    )
  }

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-2xl p-12 text-center 
                  cursor-pointer transition-all w-full max-w-lg
                  ${isDragActive
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-gray-700 hover:border-gray-500'}`}
    >
      <input {...getInputProps()} />
      <div className="text-5xl mb-4">
        {uploading ? '⏳' : isDragActive ? '📂' : '📄'}
      </div>
      {uploading ? (
        <div>
          <p className="text-white font-medium">Processing document...</p>
          <p className="text-gray-400 text-sm mt-1">
            Extracting text and building AI index
          </p>
        </div>
      ) : (
        <div>
          <p className="text-white font-medium text-lg">
            {isDragActive ? 'Drop your PDF here' : 'Upload a legal document'}
          </p>
          <p className="text-gray-400 text-sm mt-1">
            Drag & drop or click to browse · PDF only
          </p>
        </div>
      )}
      {error && (
        <p className="text-red-400 text-sm mt-3 bg-red-400/10 
                      rounded-lg px-3 py-2">
          {error}
        </p>
      )}
    </div>
  )
}