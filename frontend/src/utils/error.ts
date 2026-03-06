import { ElMessage, ElMessageBox } from 'element-plus'
import router from '@/router'
import { useSessionStore } from '@/stores/session'

export function handleApiError(error: unknown): void {
  if (!error || typeof error !== 'object') {
    ElMessage.error('未知错误')
    return
  }

  const err = error as { response?: { status: number; data?: { error?: string } }; message?: string }
  const status = err.response?.status
  const message = err.response?.data?.error || err.message || '未知错误'

  switch (status) {
    case 401: {
      const sessionStore = useSessionStore()
      sessionStore.clearSession()
      ElMessage.error('会话已过期，请重新登录')
      router.push('/login')
      break
    }
    case 403:
      ElMessage.error('权限不足，无法执行此操作')
      break
    case 404:
      ElMessageBox.alert(`资源未找到: ${message}`, '404 Not Found', { type: 'warning' })
      break
    case 409:
      ElMessageBox.alert(`资源冲突: ${message}`, '409 Conflict', { type: 'warning' })
      break
    default:
      if (status && status >= 500) {
        ElMessageBox.alert(`服务器错误: ${message}`, '服务器错误', { type: 'error' })
      } else if (!status) {
        ElMessage.error('网络错误，请检查连接')
      } else {
        ElMessage.error(message)
      }
  }
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const parts = []
  if (days > 0) parts.push(`${days}天`)
  if (hours > 0) parts.push(`${hours}小时`)
  if (minutes > 0) parts.push(`${minutes}分钟`)
  return parts.join(' ') || '< 1 分钟'
}
