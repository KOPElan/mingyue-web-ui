<template>
  <div class="file-manager">
    <div class="page-header">
      <h2>{{ $t('nav.files') }}</h2>
      <div class="header-actions">
        <el-button
          type="primary"
          :icon="Refresh"
          :loading="loading"
          @click="loadFiles(currentPath)"
        >
          {{ $t('common.refresh') }}
        </el-button>
        <el-button
          :icon="Upload"
          @click="triggerUpload"
        >
          {{ $t('file.uploadFile') }}
        </el-button>
        <el-button
          :icon="FolderAdd"
          @click="showNewFolderDialog"
        >
          {{ $t('file.newFolder') }}
        </el-button>
        <input
          ref="fileInputRef"
          type="file"
          style="display:none"
          @change="handleFileUpload"
        >
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
      <!-- Path navigation -->
      <div class="path-bar">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item
            class="clickable"
            @click="loadFiles('/')"
          >
            {{ $t('file.path') }}
          </el-breadcrumb-item>
          <el-breadcrumb-item
            v-for="(part, idx) in pathParts"
            :key="idx"
            class="clickable"
            @click="loadFiles(buildPath(idx))"
          >
            {{ part }}
          </el-breadcrumb-item>
        </el-breadcrumb>
      </div>

      <el-table
        v-loading="loading"
        :data="files"
        border
        stripe
        @row-dblclick="onRowDoubleClick"
      >
        <el-table-column width="36">
          <template #default="{ row }">
            <el-icon>
              <FolderOpened v-if="row.is_dir" />
              <Document v-else />
            </el-icon>
          </template>
        </el-table-column>
        <el-table-column
          prop="name"
          :label="$t('file.name')"
          min-width="200"
        />
        <el-table-column
          :label="$t('file.type')"
          width="100"
        >
          <template #default="{ row }">
            <el-tag
              size="small"
              :type="row.is_dir ? 'success' : row.is_symlink ? 'warning' : 'info'"
            >
              {{ row.is_dir ? $t('file.directory') : row.is_symlink ? $t('file.symlink') : $t('file.file') }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('file.size')"
          width="120"
        >
          <template #default="{ row }">
            {{ row.is_dir ? '-' : formatBytes(row.size) }}
          </template>
        </el-table-column>
        <el-table-column
          prop="mode"
          :label="$t('file.mode')"
          width="110"
        />
        <el-table-column
          prop="mod_time"
          :label="$t('file.modTime')"
          width="180"
        >
          <template #default="{ row }">
            {{ new Date(row.mod_time).toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('common.actions')"
          width="150"
          fixed="right"
        >
          <template #default="{ row }">
            <el-button
              v-if="!row.is_dir"
              size="small"
              @click="downloadFile(row)"
            >
              {{ $t('common.download') }}
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
    </template>

    <!-- New Folder Dialog -->
    <el-dialog
      v-model="folderDialogVisible"
      :title="$t('file.newFolder')"
      width="400px"
    >
      <el-input
        v-model="newFolderName"
        :placeholder="$t('file.enterFolderName')"
      />
      <template #footer>
        <el-button @click="folderDialogVisible = false">
          {{ $t('common.cancel') }}
        </el-button>
        <el-button
          type="primary"
          @click="createFolder"
        >
          {{ $t('common.confirm') }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, watch } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { Refresh, Upload, FolderAdd, FolderOpened, Document } from '@element-plus/icons-vue'
  import { useAgentStore } from '@/stores/agent'
  import agentApi from '@/api/agent'
  import type { FileEntry } from '@/api/agent'
  import { formatBytes } from '@/utils/error'
  import { useI18n } from 'vue-i18n'

  const agentStore = useAgentStore()
  const { t } = useI18n()
  const files = ref<FileEntry[]>([])
  const loading = ref(false)
  const currentPath = ref('/')
  const fileInputRef = ref<HTMLInputElement | null>(null)
  const folderDialogVisible = ref(false)
  const newFolderName = ref('')

  const pathParts = computed(() => {
    return currentPath.value.split('/').filter(Boolean)
  })

  function buildPath(upToIdx: number): string {
    const parts = pathParts.value.slice(0, upToIdx + 1)
    return '/' + parts.join('/')
  }

  async function loadFiles(path: string) {
    if (!agentStore.currentAgentId) return
    loading.value = true
    currentPath.value = path
    try {
      const res = await agentApi(agentStore.currentAgentId).getFiles(path)
      files.value = res.data
    } catch {
      // handled
    } finally {
      loading.value = false
    }
  }

  function onRowDoubleClick(row: FileEntry) {
    if (row.is_dir) {
      const newPath = currentPath.value.endsWith('/')
        ? `${currentPath.value}${row.name}`
        : `${currentPath.value}/${row.name}`
      loadFiles(newPath)
    }
  }

  function triggerUpload() {
    fileInputRef.value?.click()
  }

  async function handleFileUpload(e: Event) {
    const input = e.target as HTMLInputElement
    if (!input.files?.length) return
    const file = input.files[0]
    try {
      await agentApi(agentStore.currentAgentId).uploadFile(currentPath.value, file)
      ElMessage.success(t('common.success'))
      await loadFiles(currentPath.value)
    } catch {
      // handled
    }
    input.value = ''
  }

  function downloadFile(row: FileEntry) {
    const path = currentPath.value.endsWith('/')
      ? `${currentPath.value}${row.name}`
      : `${currentPath.value}/${row.name}`
    const url = agentApi(agentStore.currentAgentId).getFileDownloadUrl(path)
    window.open(url, '_blank')
  }

  async function confirmDelete(row: FileEntry) {
    try {
      await ElMessageBox.confirm(t('file.confirmDelete', { name: row.name }), t('file.deleteFile'), { type: 'warning' })
      const path = currentPath.value.endsWith('/')
        ? `${currentPath.value}${row.name}`
        : `${currentPath.value}/${row.name}`
      await agentApi(agentStore.currentAgentId).deleteFile(path)
      ElMessage.success(t('common.success'))
      await loadFiles(currentPath.value)
    } catch {
      // User cancelled or API error (API errors shown by http interceptor)
    }
  }

  function showNewFolderDialog() {
    newFolderName.value = ''
    folderDialogVisible.value = true
  }

  async function createFolder() {
    if (!newFolderName.value.trim()) return
    const path = currentPath.value.endsWith('/')
      ? `${currentPath.value}${newFolderName.value}`
      : `${currentPath.value}/${newFolderName.value}`
    try {
      await agentApi(agentStore.currentAgentId).createDirectory(path)
      ElMessage.success(t('common.success'))
      folderDialogVisible.value = false
      await loadFiles(currentPath.value)
    } catch {
      // handled
    }
  }

  watch(() => agentStore.currentAgentId, () => loadFiles('/'), { immediate: true })
</script>

<style scoped>
  .file-manager { padding: 24px; }
  .page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
  .page-header h2 { margin: 0; font-size: 20px; font-weight: 600; }
  .header-actions { display: flex; gap: 8px; flex-wrap: wrap; }
  .path-bar { padding: 10px 0; margin-bottom: 12px; }
  .clickable { cursor: pointer; }
  .clickable:hover { color: var(--el-color-primary); }
</style>
