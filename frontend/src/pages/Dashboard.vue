<template>
  <div class="dashboard">
    <div class="page-header">
      <h2>{{ $t('nav.dashboard') }}</h2>
      <el-button type="primary" :icon="Refresh" @click="fetchData" :loading="loading">
        {{ $t('common.refresh') }}
      </el-button>
    </div>

    <el-alert
      v-if="!agentStore.currentAgentId"
      :title="$t('agent.noAgents')"
      type="warning"
      show-icon
      :closable="false"
      class="mb-16"
    />

    <template v-else>
      <!-- Overview Cards -->
      <el-row :gutter="16" class="overview-cards">
        <el-col :xs="24" :sm="8">
          <el-card class="metric-card" shadow="hover">
            <div class="metric-content">
              <div class="metric-icon cpu">
                <el-icon size="32"><Cpu /></el-icon>
              </div>
              <div class="metric-info">
                <div class="metric-label">{{ $t('system.cpu') }}</div>
                <div class="metric-value">
                  <span v-if="overview">{{ overview.cpu_percent.toFixed(1) }}%</span>
                  <el-skeleton-item v-else variant="text" style="width: 60px" />
                </div>
                <el-progress
                  v-if="overview"
                  :percentage="overview.cpu_percent"
                  :color="getColorByPercent(overview.cpu_percent)"
                  :show-text="false"
                  style="margin-top: 8px"
                />
              </div>
            </div>
          </el-card>
        </el-col>

        <el-col :xs="24" :sm="8">
          <el-card class="metric-card" shadow="hover">
            <div class="metric-content">
              <div class="metric-icon memory">
                <el-icon size="32"><DataBoard /></el-icon>
              </div>
              <div class="metric-info">
                <div class="metric-label">{{ $t('system.memory') }}</div>
                <div class="metric-value">
                  <span v-if="overview">{{ overview.mem_percent.toFixed(1) }}%</span>
                  <el-skeleton-item v-else variant="text" style="width: 60px" />
                </div>
                <div v-if="overview" class="metric-sub">
                  {{ formatBytes(overview.mem_used) }} / {{ formatBytes(overview.mem_total) }}
                </div>
                <el-progress
                  v-if="overview"
                  :percentage="overview.mem_percent"
                  :color="getColorByPercent(overview.mem_percent)"
                  :show-text="false"
                  style="margin-top: 8px"
                />
              </div>
            </div>
          </el-card>
        </el-col>

        <el-col :xs="24" :sm="8">
          <el-card class="metric-card" shadow="hover">
            <div class="metric-content">
              <div class="metric-icon uptime">
                <el-icon size="32"><Timer /></el-icon>
              </div>
              <div class="metric-info">
                <div class="metric-label">{{ $t('system.uptime') }}</div>
                <div class="metric-value">
                  <span v-if="overview">{{ formatUptime(overview.uptime) }}</span>
                  <el-skeleton-item v-else variant="text" style="width: 100px" />
                </div>
                <div v-if="overview" class="metric-sub">
                  {{ $t('system.timestamp') }}: {{ formatTime(overview.timestamp) }}
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- Quick links -->
      <el-row :gutter="16" class="mt-16">
        <el-col :xs="24" :sm="12" :md="6" v-for="item in quickLinks" :key="item.path">
          <el-card
            class="quick-link-card"
            shadow="hover"
            @click="$router.push(item.path)"
            style="cursor: pointer"
          >
            <div class="quick-link-content">
              <el-icon size="24" :style="{ color: item.color }">
                <component :is="item.icon" />
              </el-icon>
              <span>{{ $t(item.label) }}</span>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </template>
  </div>
</template>

<script setup lang="ts">
  import { ref, watch } from 'vue'
  import { Refresh, Cpu, DataBoard, Timer, Monitor, FolderOpened, Share, SetUp } from '@element-plus/icons-vue'
  import { useAgentStore } from '@/stores/agent'
  import agentApi from '@/api/agent'
  import type { SystemOverview } from '@/api/agent'
  import { formatBytes, formatUptime } from '@/utils/error'

  const agentStore = useAgentStore()
  const overview = ref<SystemOverview | null>(null)
  const loading = ref(false)

  const quickLinks = [
    { path: '/processes', label: 'nav.processes', icon: 'Cpu', color: '#409eff' },
    { path: '/disks', label: 'nav.disks', icon: 'HardDisk', color: '#67c23a' },
    { path: '/files', label: 'nav.files', icon: 'FolderOpened', color: '#e6a23c' },
    { path: '/network', label: 'nav.network', icon: 'SetUp', color: '#f56c6c' }
  ]

  async function fetchData() {
    if (!agentStore.currentAgentId) return
    loading.value = true
    try {
      const res = await agentApi(agentStore.currentAgentId).getSystemOverview()
      overview.value = res.data
    } catch {
      // error handled by interceptor
    } finally {
      loading.value = false
    }
  }

  watch(() => agentStore.currentAgentId, fetchData, { immediate: true })

  function getColorByPercent(percent: number): string {
    if (percent < 60) return '#67c23a'
    if (percent < 80) return '#e6a23c'
    return '#f56c6c'
  }

  function formatTime(ts: string): string {
    return new Date(ts).toLocaleTimeString()
  }
</script>

<style scoped>
  .dashboard {
    padding: 24px;
  }

  .page-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24px;
  }

  .page-header h2 {
    margin: 0;
    font-size: 20px;
    font-weight: 600;
  }

  .mb-16 {
    margin-bottom: 16px;
  }

  .mt-16 {
    margin-top: 16px;
  }

  .metric-card {
    margin-bottom: 16px;
  }

  .metric-content {
    display: flex;
    align-items: flex-start;
    gap: 16px;
  }

  .metric-icon {
    width: 56px;
    height: 56px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .metric-icon.cpu {
    background: rgba(64, 158, 255, 0.15);
    color: #409eff;
  }

  .metric-icon.memory {
    background: rgba(103, 194, 58, 0.15);
    color: #67c23a;
  }

  .metric-icon.uptime {
    background: rgba(230, 162, 60, 0.15);
    color: #e6a23c;
  }

  .metric-info {
    flex: 1;
    min-width: 0;
  }

  .metric-label {
    font-size: 13px;
    color: var(--el-text-color-secondary);
    margin-bottom: 4px;
  }

  .metric-value {
    font-size: 28px;
    font-weight: 700;
    color: var(--el-text-color-primary);
  }

  .metric-sub {
    font-size: 12px;
    color: var(--el-text-color-secondary);
    margin-top: 4px;
  }

  .quick-link-content {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 14px;
    font-weight: 500;
  }
</style>
