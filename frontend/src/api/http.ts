import axios from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'
import router from '@/router'

const http = axios.create({
  baseURL: '',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Token provider - avoids circular dependency between http.ts ↔ session.ts → auth.ts → http.ts
let _tokenGetter: () => string | null = () => null
let _clearSession: () => void = () => undefined

export function setTokenGetter(fn: () => string | null): void {
  _tokenGetter = fn
}

export function setClearSession(fn: () => void): void {
  _clearSession = fn
}

// Request interceptor: attach JWT token
http.interceptors.request.use(
  (config) => {
    const token = _tokenGetter()
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor: handle errors
http.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status
    const message = error.response?.data?.error || error.message

    if (status === 401) {
      _clearSession()
      ElMessage.error('会话已过期，请重新登录')
      router.push('/login')
      return Promise.reject(error)
    }

    if (status === 403) {
      ElMessage.error('权限不足，无法执行此操作')
      return Promise.reject(error)
    }

    if (status === 404) {
      ElMessageBox.alert(`资源未找到: ${message}`, '404 Not Found', { type: 'warning' })
      return Promise.reject(error)
    }

    if (status === 409) {
      ElMessageBox.alert(`资源冲突: ${message}`, '409 Conflict', { type: 'warning' })
      return Promise.reject(error)
    }

    if (status && status >= 500) {
      ElMessageBox.alert(`服务器错误: ${message}`, '服务器错误', { type: 'error' })
      return Promise.reject(error)
    }

    if (!status) {
      ElMessage.error('网络错误，请检查连接')
    }

    return Promise.reject(error)
  }
)

export default http
