import http from './http'

export interface Agent {
  id: string
  name: string
  address: string
  status: 'online' | 'offline'
  version: string
  apiKey?: string
}

export const proxyApi = {
  // Agent management
  getAgents(): Promise<{ data: Agent[] }> {
    return http.get('/api/agents')
  },

  createAgent(agent: Omit<Agent, 'status' | 'version'> & { status?: string; version?: string }): Promise<{ data: Agent }> {
    return http.post('/api/agents', agent)
  },

  updateAgent(agentId: string, agent: Partial<Agent>): Promise<{ data: Agent }> {
    return http.put(`/api/agents/${agentId}`, agent)
  },

  deleteAgent(agentId: string): Promise<void> {
    return http.delete(`/api/agents/${agentId}`)
  },

  pingAgent(agentId: string): Promise<{ data: { status: string; agentId: string } }> {
    return http.get(`/api/agents/${agentId}/ping`)
  },

  health(): Promise<{ data: { status: string } }> {
    return http.get('/health')
  }
}
