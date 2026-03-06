<template>
  <div class="disk-manager">
    <div class="page-header">
      <h2>{{ $t('nav.disks') }}</h2>
      <el-button
        type="primary"
        :icon="Refresh"
        :loading="loading"
        @click="fetchData"
      >
        {{ $t('common.refresh') }}
      </el-button>
    </div>

    <el-alert
      v-if="!agentStore.currentAgentId"
      :title="$t('agent.noAgents')"
      type="warning"
      show-icon
      :closable="false"
    />

    <template v-else>
      <!-- Disk Devices -->
      <h3 class="section-title">
        {{ $t('disk.devices') }}
      </h3>
      <el-table
        v-loading="loading"
        :data="disks"
        border
        stripe
        class="mb-16"
      >
        <el-table-column
          prop="name"
          :label="$t('common.name')"
        />
        <el-table-column :label="$t('disk.size')">
          <template #default="{ row }">
            {{ formatBytes(row.size_bytes) }}
          </template>
        </el-table-column>
        <el-table-column
          prop="type"
          :label="$t('disk.type')"
          width="100"
        />
        <el-table-column
          prop="model"
          :label="$t('disk.model')"
        />
        <el-table-column
          prop="mount_point"
          :label="$t('disk.mountPoint')"
        />
        <el-table-column
          :label="$t('disk.removable')"
          width="100"
        >
          <template #default="{ row }">
            <el-tag
              :type="row.removable ? 'warning' : 'info'"
              size="small"
            >
              {{ row.removable ? $t('common.yes') : $t('common.no') }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>

      <!-- Mount Points -->
      <h3 class="section-title">
        {{ $t('disk.mounts') }}
      </h3>
      <el-table
        :data="mounts"
        border
        stripe
      >
        <el-table-column
          prop="device"
          :label="$t('disk.device')"
        />
        <el-table-column
          prop="mount_point"
          :label="$t('disk.mountPoint')"
        />
        <el-table-column
          prop="fs_type"
          :label="$t('disk.fsType')"
          width="120"
        />
        <el-table-column
          prop="options"
          :label="$t('disk.options')"
          show-overflow-tooltip
        />
      </el-table>
    </template>
  </div>
</template>

<script setup lang="ts">
  import { ref, watch } from 'vue'
  import { Refresh } from '@element-plus/icons-vue'
  import { useAgentStore } from '@/stores/agent'
  import agentApi from '@/api/agent'
  import type { DiskDevice, Mount } from '@/api/agent'
  import { formatBytes } from '@/utils/error'

  const agentStore = useAgentStore()
  const disks = ref<DiskDevice[]>([])
  const mounts = ref<Mount[]>([])
  const loading = ref(false)

  async function fetchData() {
    if (!agentStore.currentAgentId) return
    loading.value = true
    try {
      const [diskRes, mountRes] = await Promise.all([
        agentApi(agentStore.currentAgentId).getDisks(),
        agentApi(agentStore.currentAgentId).getMounts()
      ])
      disks.value = diskRes.data
      mounts.value = mountRes.data
    } catch {
      // handled
    } finally {
      loading.value = false
    }
  }

  watch(() => agentStore.currentAgentId, fetchData, { immediate: true })
</script>

<style scoped>
  .disk-manager { padding: 24px; }
  .page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
  .page-header h2 { margin: 0; font-size: 20px; font-weight: 600; }
  .section-title { font-size: 16px; font-weight: 600; margin: 0 0 12px; color: var(--el-text-color-primary); }
  .mb-16 { margin-bottom: 24px; }
</style>
