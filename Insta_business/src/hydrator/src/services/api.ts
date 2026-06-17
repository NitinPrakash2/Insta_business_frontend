import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/client/api/i/ona/instagram',
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwt_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('jwt_token')
    }
    return Promise.reject(new Error(err.response?.data?.message ?? err.message))
  }
)

export function call<T = unknown>(typ: string, body: Record<string, unknown> = {}) {
  const userId = localStorage.getItem('user_id') || 'seller_nitin_001'
  return api.post<{ success: boolean; data: T; message?: string }>(
    `?typ=${typ}`,
    { user_id: userId, ...body }
  )
}

export default api
