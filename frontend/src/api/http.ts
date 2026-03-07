import axios from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'
import router from '@/router'
import { i18n } from '@/locales'

const t = (key: string) => i18n.global.t(key)

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
      // Only treat as session expiry when the user was already authenticated
      // (i.e. a token was sent but the server rejected it as expired/invalid).
      // If there is no current token, the 401 came from the login endpoint
      // (invalid credentials); let the caller handle the error message.
      if (_tokenGetter()) {
        _clearSession()
        ElMessage.error(t('auth.sessionExpired'))
        router.push('/login')
      }
      return Promise.reject(error)
    }

    if (status === 403) {
      ElMessage.error(t('auth.forbidden'))
      return Promise.reject(error)
    }

    if (status === 404) {
      ElMessageBox.alert(`${t('error.notFound')}: ${message}`, '404 Not Found', { type: 'warning' })
      return Promise.reject(error)
    }

    if (status === 409) {
      ElMessageBox.alert(`${t('error.conflict')}: ${message}`, '409 Conflict', { type: 'warning' })
      return Promise.reject(error)
    }

    if (status && status >= 500) {
      ElMessageBox.alert(`${t('error.serverError')}: ${message}`, t('error.serverError'), { type: 'error' })
      return Promise.reject(error)
    }

    if (!status) {
      ElMessage.error(t('error.networkError'))
    }

    return Promise.reject(error)
  }
)

export default http
