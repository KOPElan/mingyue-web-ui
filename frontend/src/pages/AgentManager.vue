<template>
  <div class="agent-manager">
    <div class="page-header">
      <h2>{{ $t('nav.agents') }}</h2>
      <el-button
        type="primary"
        :icon="Plus"
        @click="openAddDialog"
      >
        {{ $t('agent.addAgent') }}
      </el-button>
    </div>

    <el-table
      v-loading="agentStore.loading"
      :data="agentStore.agents"
      border
      stripe
    >
      <el-table-column
        prop="id"
        :label="$t('agent.id')"
        width="140"
      />
      <el-table-column
        prop="name"
        :label="$t('agent.name')"
      />
      <el-table-column
        prop="address"
        :label="$t('agent.address')"
      />
      <el-table-column
        prop="version"
        :label="$t('agent.version')"
        width="100"
      />
      <el-table-column
        :label="$t('common.status')"
        width="100"
      >
        <template #default="{ row }">
          <el-tag
            :type="row.status === 'online' ? 'success' : 'danger'"
            size="small"
          >
            {{ row.status === 'online' ? $t('common.online') : $t('common.offline') }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('common.actions')"
        width="260"
        fixed="right"
      >
        <template #default="{ row }">
          <el-button
            size="small"
            @click="pingAgent(row)"
          >
            {{ $t('agent.testConnection') }}
          </el-button>
          <el-button
            size="small"
            type="primary"
            @click="openEditDialog(row)"
          >
            {{ $t('common.edit') }}
          </el-button>
          <el-button
            size="small"
            type="danger"
            @click="confirmDelete(row)"
          >
            {{ $t('common.delete') }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- Add/Edit Dialog -->
    <el-dialog
      v-model="dialogVisible"
      :title="editingAgent ? $t('agent.editAgent') : $t('agent.addAgent')"
      width="500px"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-position="top"
      >
        <el-form-item
          v-if="!editingAgent"
          :label="$t('agent.id')"
          prop="id"
        >
          <el-input
            v-model="form.id"
            :placeholder="$t('agent.enterId')"
          />
        </el-form-item>
        <el-form-item
          :label="$t('agent.name')"
          prop="name"
        >
          <el-input
            v-model="form.name"
            :placeholder="$t('agent.enterName')"
          />
        </el-form-item>
        <el-form-item
          :label="$t('agent.address')"
          prop="address"
        >
          <el-input
            v-model="form.address"
            :placeholder="$t('agent.enterAddress')"
          />
        </el-form-item>
        <el-form-item :label="$t('agent.apiKey')">
          <el-input
            v-model="form.apiKey"
            type="password"
            :placeholder="$t('agent.enterApiKey')"
            show-password
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">
          {{ $t('common.cancel') }}
        </el-button>
        <el-button
          type="primary"
          :loading="saving"
          @click="saveAgent"
        >
          {{ $t('common.save') }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, computed, onMounted } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import type { FormInstance, FormRules } from 'element-plus'
  import { Plus } from '@element-plus/icons-vue'
  import { useAgentStore } from '@/stores/agent'
  import type { Agent } from '@/api/proxy'
  import { useI18n } from 'vue-i18n'

  const agentStore = useAgentStore()
  const { t } = useI18n()

  const dialogVisible = ref(false)
  const saving = ref(false)
  const editingAgent = ref<Agent | null>(null)
  const formRef = ref<FormInstance>()

  const form = reactive({
    id: '',
    name: '',
    address: '',
    apiKey: ''
  })

  const rules = computed<FormRules>(() => ({
    id: [{ required: true, message: t('agent.idRequired'), trigger: 'blur' }],
    name: [{ required: true, message: t('agent.nameRequired'), trigger: 'blur' }],
    address: [{ required: true, message: t('agent.addressRequired'), trigger: 'blur' }]
  }))

  onMounted(() => agentStore.fetchAgents())

  function openAddDialog() {
    editingAgent.value = null
    Object.assign(form, { id: '', name: '', address: '', apiKey: '' })
    dialogVisible.value = true
  }

  function openEditDialog(agent: Agent) {
    editingAgent.value = agent
    Object.assign(form, { id: agent.id, name: agent.name, address: agent.address, apiKey: '' })
    dialogVisible.value = true
  }

  async function saveAgent() {
    if (!formRef.value) return
    const valid = await formRef.value.validate().catch(() => false)
    if (!valid) return

    saving.value = true
    try {
      if (editingAgent.value) {
        await agentStore.updateAgent(editingAgent.value.id, {
          name: form.name,
          address: form.address,
          ...(form.apiKey ? { apiKey: form.apiKey } : {})
        })
      } else {
        await agentStore.createAgent({
          id: form.id,
          name: form.name,
          address: form.address,
          apiKey: form.apiKey
        })
      }
      ElMessage.success(t('common.success'))
      dialogVisible.value = false
    } catch {
      // Error handled by http interceptor
    } finally {
      saving.value = false
    }
  }

  async function pingAgent(agent: Agent) {
    try {
      const result = await agentStore.pingAgent(agent.id)
      if (result.status === 'online') {
        ElMessage.success(t('agent.testSuccess'))
      } else {
        ElMessage.warning(t('agent.testFailed'))
      }
    } catch {
      ElMessage.error(t('agent.testFailed'))
    }
  }

  async function confirmDelete(agent: Agent) {
    try {
      await ElMessageBox.confirm(
        t('agent.confirmDelete', { name: agent.name }),
        t('agent.deleteAgent'),
        { type: 'warning' }
      )
      await agentStore.deleteAgent(agent.id)
      ElMessage.success(t('common.success'))
    } catch {
      // User cancelled or API error (API errors shown by http interceptor)
    }
  }
</script>

<style scoped>
  .agent-manager {
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
</style>
