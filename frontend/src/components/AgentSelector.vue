<template>
  <el-select
    v-model="agentStore.currentAgentId"
    :placeholder="$t('agent.selectAgent')"
    style="width: 200px"
    size="default"
    @change="handleChange"
  >
    <el-option
      v-for="agent in agentStore.agents"
      :key="agent.id"
      :value="agent.id"
      :label="agent.name"
    >
      <span style="display: flex; align-items: center; gap: 8px">
        <el-badge
          is-dot
          :type="agent.status === 'online' ? 'success' : 'danger'"
        />
        {{ agent.name }}
      </span>
    </el-option>
    <template #empty>
      <div style="padding: 12px; text-align: center; color: var(--el-text-color-secondary)">
        {{ $t('agent.noAgents') }}
      </div>
    </template>
  </el-select>
</template>

<script setup lang="ts">
  import { onMounted } from 'vue'
  import { useAgentStore } from '@/stores/agent'
  import { useSessionStore } from '@/stores/session'

  const agentStore = useAgentStore()
  const sessionStore = useSessionStore()

  onMounted(async () => {
    if (sessionStore.isAuthenticated) {
      await agentStore.fetchAgents()
    }
  })

  function handleChange(agentId: string) {
    sessionStore.setCurrentAgent(agentId)
  }
</script>
