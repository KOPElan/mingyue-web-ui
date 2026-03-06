<template>
  <div class="share-manager">
    <div class="page-header">
      <h2>{{ $t('nav.shares') }}</h2>
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
    />

    <template v-else>
      <!-- Samba Shares -->
      <h3 class="section-title">{{ $t('share.samba') }}</h3>
      <el-table :data="smbShares" v-loading="loading" border stripe class="mb-24">
        <el-table-column prop="name" :label="$t('share.shareName')" />
        <el-table-column prop="path" :label="$t('share.path')" />
        <el-table-column prop="comment" :label="$t('share.comment')" show-overflow-tooltip />
        <el-table-column prop="valid_users" :label="$t('share.validUsers')" />
        <el-table-column :label="$t('share.readOnly')" width="100">
          <template #default="{ row }">
            <el-tag :type="row.read_only ? 'warning' : 'success'" size="small">
              {{ row.read_only ? $t('common.yes') : $t('common.no') }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>

      <!-- NFS Exports -->
      <h3 class="section-title">{{ $t('share.nfs') }}</h3>
      <el-table :data="nfsExports" border stripe>
        <el-table-column prop="path" :label="$t('share.path')" />
        <el-table-column prop="clients_spec" :label="$t('share.clientsSpec')" />
        <el-table-column prop="options" :label="$t('share.options')" show-overflow-tooltip />
      </el-table>
    </template>
  </div>
</template>

<script setup lang="ts">
  import { ref, watch } from 'vue'
  import { Refresh } from '@element-plus/icons-vue'
  import { useAgentStore } from '@/stores/agent'
  import agentApi from '@/api/agent'
  import type { SmbShare, NfsExport } from '@/api/agent'

  const agentStore = useAgentStore()
  const smbShares = ref<SmbShare[]>([])
  const nfsExports = ref<NfsExport[]>([])
  const loading = ref(false)

  async function fetchData() {
    if (!agentStore.currentAgentId) return
    loading.value = true
    try {
      const [smbRes, nfsRes] = await Promise.all([
        agentApi(agentStore.currentAgentId).getSmbShares(),
        agentApi(agentStore.currentAgentId).getNfsExports()
      ])
      smbShares.value = smbRes.data
      nfsExports.value = nfsRes.data
    } catch {
      // handled
    } finally {
      loading.value = false
    }
  }

  watch(() => agentStore.currentAgentId, fetchData, { immediate: true })
</script>

<style scoped>
  .share-manager { padding: 24px; }
  .page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
  .page-header h2 { margin: 0; font-size: 20px; font-weight: 600; }
  .section-title { font-size: 16px; font-weight: 600; margin: 0 0 12px; }
  .mb-24 { margin-bottom: 24px; }
</style>
