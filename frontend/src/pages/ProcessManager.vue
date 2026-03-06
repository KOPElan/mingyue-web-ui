<template>
  <div class="process-manager">
    <div class="page-header">
      <h2>{{ $t('nav.processes') }}</h2>
      <div class="header-actions">
        <el-input
          v-model="searchQuery"
          :placeholder="$t('process.filterByName')"
          :prefix-icon="Search"
          clearable
          style="width: 220px"
        />
        <el-button
          type="primary"
          :icon="Refresh"
          :loading="loading"
          @click="fetchData"
        >
          {{ $t('common.refresh') }}
        </el-button>
      </div>
    </div>

    <el-alert
      v-if="!agentStore.currentAgentId"
      :title="$t('agent.noAgents')"
      type="warning"
      show-icon
      :closable="false"
    />

    <el-table
      v-else
      v-loading="loading"
      :data="filteredProcesses"
      border
      stripe
      :default-sort="{ prop: 'cpu_percent', order: 'descending' }"
      max-height="600"
    >
      <el-table-column
        prop="pid"
        :label="$t('process.pid')"
        width="80"
        sortable
      />
      <el-table-column
        prop="name"
        :label="$t('process.name')"
        min-width="150"
        sortable
      />
      <el-table-column
        prop="status"
        :label="$t('process.status')"
        width="100"
      >
        <template #default="{ row }">
          <el-tag
            :type="row.status === 'running' ? 'success' : 'info'"
            size="small"
          >
            {{ row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        prop="cpu_percent"
        :label="$t('process.cpu')"
        width="100"
        sortable
      >
        <template #default="{ row }">
          {{ row.cpu_percent.toFixed(1) }}%
        </template>
      </el-table-column>
      <el-table-column
        prop="mem_rss"
        :label="$t('process.memory')"
        width="130"
        sortable
      >
        <template #default="{ row }">
          {{ formatBytes(row.mem_rss) }}
        </template>
      </el-table-column>
      <el-table-column
        prop="user"
        :label="$t('process.user')"
        width="100"
      />
      <el-table-column
        prop="cmdline"
        :label="$t('process.cmdline')"
        min-width="200"
        show-overflow-tooltip
      />
      <el-table-column
        :label="$t('common.actions')"
        width="100"
        fixed="right"
      >
        <template #default="{ row }">
          <el-button
            size="small"
            type="danger"
            @click="confirmKill(row)"
          >
            {{ $t('process.kill') }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, watch } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { Refresh, Search } from '@element-plus/icons-vue'
  import { useAgentStore } from '@/stores/agent'
  import agentApi from '@/api/agent'
  import type { Process } from '@/api/agent'
  import { formatBytes } from '@/utils/error'
  import { useI18n } from 'vue-i18n'

  const agentStore = useAgentStore()
  const { t } = useI18n()
  const processes = ref<Process[]>([])
  const loading = ref(false)
  const searchQuery = ref('')

  const filteredProcesses = computed(() => {
    if (!searchQuery.value) return processes.value
    return processes.value.filter((p) =>
      p.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  })

  async function fetchData() {
    if (!agentStore.currentAgentId) return
    loading.value = true
    try {
      const res = await agentApi(agentStore.currentAgentId).getProcesses()
      processes.value = res.data
    } catch {
      // handled
    } finally {
      loading.value = false
    }
  }

  async function confirmKill(proc: Process) {
    try {
      await ElMessageBox.confirm(
        t('process.confirmKill', { name: proc.name, pid: proc.pid }),
        t('process.kill'),
        { type: 'warning' }
      )
      await agentApi(agentStore.currentAgentId).killProcess(proc.pid)
      ElMessage.success(t('process.killSuccess'))
      await fetchData()
    } catch {
      // User cancelled or API error (API errors shown by http interceptor)
    }
  }

  watch(() => agentStore.currentAgentId, fetchData, { immediate: true })
</script>

<style scoped>
  .process-manager { padding: 24px; }
  .page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
  .page-header h2 { margin: 0; font-size: 20px; font-weight: 600; }
  .header-actions { display: flex; align-items: center; gap: 12px; }
</style>
