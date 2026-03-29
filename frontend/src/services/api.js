import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 60000, // 60s timeout — ML inference can be slow
})

export const uploadDocument = async (file) => {
  const formData = new FormData()
  formData.append('file', file)
  const response = await api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return response.data
}

export const analyzeDocument = async (documentId, question) => {
  const response = await api.post('/analyze', {
    document_id: documentId,
    question: question
  })
  return response.data
}

export const getDocumentInfo = async (documentId) => {
  const response = await api.get(`/document/${documentId}`)
  return response.data
}

export const checkHealth = async () => {
  const response = await api.get('/health')
  return response.data
}