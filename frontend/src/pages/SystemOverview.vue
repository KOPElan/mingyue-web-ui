<template>
  <div class="system-overview">
    <div class="page-header">
      <h2>{{ $t('nav.system') }}</h2>
      <div class="header-actions">
        <el-switch
          v-model="autoRefresh"
          :active-text="$t('system.autoRefresh')"
          @change="(val: string | number | boolean) => toggleAutoRefresh(val as boolean)"
        />
        <el-button type="primary" :icon="Refresh" @click="fetchData" :loading="loading">
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

    <template v-else>
      <el-row :gutter="16">
        <!-- CPU -->
        <el-col :xs="24" :md="12">
          <el-card shadow="hover" class="metric-card">
            <template #header>
              <div class="card-header">
                <el-icon><Cpu /></el-icon>
                <span>{{ $t('system.cpu') }}</span>
              </div>
            </template>
            <div v-if="overview" class="metric-display">
              <div class="big-number">{{ overview.cpu_percent.toFixed(1) }}%</div>
              <el-progress
                :percentage="overview.cpu_percent"
                :color="getColorByPercent(overview.cpu_percent)"
                :stroke-width="16"
              />
            </div>
            <el-skeleton v-else animated :rows="2" />
          </el-card>
        </el-col>

        <!-- Memory -->
        <el-col :xs="24" :md="12">
          <el-card shadow="hover" class="metric-card">
            <template #header>
              <div class="card-header">
                <el-icon><DataBoard /></el-icon>
                <span>{{ $t('system.memory') }}</span>
              </div>
            </template>
            <div v-if="overview" class="metric-display">
              <div class="big-number">{{ overview.mem_percent.toFixed(1) }}%</div>
              <el-progress
                :percentage="overview.mem_percent"
                :color="getColorByPercent(overview.mem_percent)"
                :stroke-width="16"
              />
              <div class="mem-details">
                <span>{{ $t('system.used') }}: {{ formatBytes(overview.mem_used) }}</span>
                <span>{{ $t('system.total') }}: {{ formatBytes(overview.mem_total) }}</span>
              </div>
            </div>
            <el-skeleton v-else animated :rows="2" />
          </el-card>
        </el-col>
      </el-row>

      <!-- Uptime Info -->
      <el-card shadow="hover" class="mt-16" v-if="overview">
        <el-descriptions :column="3" border>
          <el-descriptions-item :label="$t('system.uptime')">
            {{ formatUptime(overview.uptime) }}
          </el-descriptions-item>
          <el-descriptions-item :label="$t('system.timestamp')">
            {{ new Date(overview.timestamp).toLocaleString() }}
          </el-descriptions-item>
          <el-descriptions-item :label="$t('system.free')">
            {{ formatBytes(overview.mem_total - overview.mem_used) }}
          </el-descriptions-item>
        </el-descriptions>
      </el-card>
    </template>
  </div>
</template>

<script setup lang="ts">
  import { ref, watch, onUnmounted } from 'vue'
  import { Refresh, Cpu, DataBoard } from '@element-plus/icons-vue'
  import { useAgentStore } from '@/stores/agent'
  import agentApi from '@/api/agent'
  import type { SystemOverview } from '@/api/agent'
  import { formatBytes, formatUptime } from '@/utils/error'

  const agentStore = useAgentStore()
  const overview = ref<SystemOverview | null>(null)
  const loading = ref(false)
  const autoRefresh = ref(false)
  let refreshTimer: ReturnType<typeof setInterval> | null = null

  async function fetchData() {
    if (!agentStore.currentAgentId) return
    loading.value = true
    try {
      const res = await agentApi(agentStore.currentAgentId).getSystemOverview()
      overview.value = res.data
    } catch {
      // handled
    } finally {
      loading.value = false
    }
  }

  function toggleAutoRefresh(val: boolean) {
    if (val) {
      refreshTimer = setInterval(fetchData, 5000)
    } else {
      if (refreshTimer) clearInterval(refreshTimer)
    }
  }

  watch(() => agentStore.currentAgentId, fetchData, { immediate: true })
  onUnmounted(() => { if (refreshTimer) clearInterval(refreshTimer) })

  function getColorByPercent(p: number) {
    if (p < 60) return '#67c23a'
    if (p < 80) return '#e6a23c'
    return '#f56c6c'
  }
</script>

<style scoped>
  .system-overview { padding: 24px; }
  .page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
  .page-header h2 { margin: 0; font-size: 20px; font-weight: 600; }
  .header-actions { display: flex; align-items: center; gap: 12px; }
  .card-header { display: flex; align-items: center; gap: 8px; font-weight: 600; }
  .metric-card { height: 200px; }
  .metric-display { padding: 8px 0; }
  .big-number { font-size: 48px; font-weight: 700; color: var(--el-color-primary); margin-bottom: 12px; }
  .mem-details { display: flex; justify-content: space-between; margin-top: 8px; font-size: 13px; color: var(--el-text-color-secondary); }
  .mt-16 { margin-top: 16px; }
</style>
