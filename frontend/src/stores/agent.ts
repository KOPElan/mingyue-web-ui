import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { proxyApi } from '@/api/proxy'
import type { Agent } from '@/api/proxy'

export const useAgentStore = defineStore('agent', () => {
  const agents = ref<Agent[]>([])
  const currentAgentId = ref<string>('')
  const loading = ref(false)

  const currentAgent = computed(() => agents.value.find((a) => a.id === currentAgentId.value))

  async function fetchAgents() {
    loading.value = true
    try {
      const response = await proxyApi.getAgents()
      agents.value = response.data
      // Auto-select first online agent if none selected
      if (!currentAgentId.value && agents.value.length > 0) {
        const onlineAgent = agents.value.find((a) => a.status === 'online')
        currentAgentId.value = onlineAgent?.id || agents.value[0].id
      }
    } finally {
      loading.value = false
    }
  }

  async function createAgent(agent: Omit<Agent, 'status' | 'version'>) {
    const response = await proxyApi.createAgent(agent)
    agents.value.push(response.data)
    return response.data
  }

  async function updateAgent(agentId: string, data: Partial<Agent>) {
    const response = await proxyApi.updateAgent(agentId, data)
    const idx = agents.value.findIndex((a) => a.id === agentId)
    if (idx >= 0) {
      agents.value[idx] = { ...agents.value[idx], ...response.data }
    }
    return response.data
  }

  async function deleteAgent(agentId: string) {
    await proxyApi.deleteAgent(agentId)
    agents.value = agents.value.filter((a) => a.id !== agentId)
    if (currentAgentId.value === agentId) {
      currentAgentId.value = agents.value[0]?.id || ''
    }
  }

  async function pingAgent(agentId: string) {
    const response = await proxyApi.pingAgent(agentId)
    const idx = agents.value.findIndex((a) => a.id === agentId)
    if (idx >= 0) {
      agents.value[idx].status = response.data.status as 'online' | 'offline'
    }
    return response.data
  }

  function selectAgent(agentId: string) {
    currentAgentId.value = agentId
  }

  return {
    agents,
    currentAgentId,
    currentAgent,
    loading,
    fetchAgents,
    createAgent,
    updateAgent,
    deleteAgent,
    pingAgent,
    selectAgent
  }
})
