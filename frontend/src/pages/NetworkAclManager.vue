<template>
  <div class="network-acl-manager">
    <div class="page-header">
      <h2>{{ $t('nav.network') }}</h2>
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
      <!-- Network Interfaces -->
      <h3 class="section-title">{{ $t('network.interfaces') }}</h3>
      <el-table :data="interfaces" v-loading="loading" border stripe class="mb-24">
        <el-table-column prop="ifname" :label="$t('network.ifname')" width="150" />
        <el-table-column :label="$t('network.addresses')">
          <template #default="{ row }">
            <el-tag
              v-for="addr in (row.addresses || [])"
              :key="addr"
              size="small"
              class="mr-4"
            >{{ addr }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="mac" :label="$t('network.mac')" width="160" />
        <el-table-column prop="mtu" :label="$t('network.mtu')" width="80" />
        <el-table-column :label="$t('network.state')" width="100">
          <template #default="{ row }">
            <el-tag :type="row.state === 'up' ? 'success' : 'danger'" size="small">
              {{ row.state }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>

      <!-- ACL Section -->
      <h3 class="section-title">{{ $t('network.acl') }}</h3>
      <div class="acl-search">
        <el-input
          v-model="aclPath"
          :placeholder="$t('network.aclPath')"
          style="width: 360px"
          @keyup.enter="fetchAcl"
        />
        <el-button type="primary" @click="fetchAcl" :loading="aclLoading">
          {{ $t('common.search') }}
        </el-button>
      </div>

      <el-card v-if="aclData" class="mt-16">
        <template #header>{{ $t('network.aclEntries') }}: {{ aclData.path }}</template>
        <el-table :data="aclEntryRows" border stripe>
          <el-table-column prop="entry" :label="$t('network.aclEntries')" />
        </el-table>
      </el-card>
    </template>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, watch } from 'vue'
  import { Refresh } from '@element-plus/icons-vue'
  import { useAgentStore } from '@/stores/agent'
  import agentApi from '@/api/agent'
  import type { NetworkInterface, AclEntry } from '@/api/agent'

  const agentStore = useAgentStore()
  const interfaces = ref<NetworkInterface[]>([])
  const loading = ref(false)
  const aclPath = ref('')
  const aclData = ref<AclEntry | null>(null)
  const aclLoading = ref(false)

  const aclEntryRows = computed(() =>
    (aclData.value?.entries || []).map((e) => ({ entry: e }))
  )

  async function fetchData() {
    if (!agentStore.currentAgentId) return
    loading.value = true
    try {
      const res = await agentApi(agentStore.currentAgentId).getNetworkInterfaces()
      interfaces.value = res.data
    } catch {
      // handled
    } finally {
      loading.value = false
    }
  }

  async function fetchAcl() {
    if (!aclPath.value.trim() || !agentStore.currentAgentId) return
    aclLoading.value = true
    try {
      const res = await agentApi(agentStore.currentAgentId).getAcl(aclPath.value)
      aclData.value = res.data
    } catch {
      // handled
    } finally {
      aclLoading.value = false
    }
  }

  watch(() => agentStore.currentAgentId, fetchData, { immediate: true })
</script>

<style scoped>
  .network-acl-manager { padding: 24px; }
  .page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
  .page-header h2 { margin: 0; font-size: 20px; font-weight: 600; }
  .section-title { font-size: 16px; font-weight: 600; margin: 0 0 12px; }
  .mb-24 { margin-bottom: 24px; }
  .acl-search { display: flex; gap: 8px; align-items: center; }
  .mt-16 { margin-top: 16px; }
  .mr-4 { margin-right: 4px; }
</style>
