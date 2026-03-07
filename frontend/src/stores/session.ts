import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '@/api/auth'

export interface UserInfo {
  username: string
  role: 'viewer' | 'operator' | 'admin'
  displayName: string
  currentAgent: string
}

export const useSessionStore = defineStore('session', () => {
  // Token stored ONLY in memory - never in localStorage/sessionStorage
  const token = ref<string | null>(null)
  const userInfo = ref<UserInfo | null>(null)

  const isAuthenticated = computed(() => !!token.value)

  async function login(username: string, password: string) {
    const response = await authApi.login({ username, password })
    const { token: newToken, user } = response.data
    token.value = newToken
    userInfo.value = {
      username: user.username,
      role: user.role,
      displayName: user.displayName,
      currentAgent: ''
    }
  }

  async function logout() {
    try {
      await authApi.logout()
    } catch {
      // ignore errors on logout
    }
    clearSession()
  }

  function clearSession() {
    token.value = null
    userInfo.value = null
  }

  function setCurrentAgent(agentId: string) {
    if (userInfo.value) {
      userInfo.value.currentAgent = agentId
    }
  }

  return {
    token,
    userInfo,
    isAuthenticated,
    login,
    logout,
    clearSession,
    setCurrentAgent
  }
})
