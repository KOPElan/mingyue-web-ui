<template>
  <el-container class="layout-container">
    <!-- Sidebar -->
    <el-aside
      :width="isCollapsed ? '64px' : '220px'"
      class="sidebar"
    >
      <div class="sidebar-header">
        <el-icon
          size="28"
          color="#409eff"
        >
          <Moon />
        </el-icon>
        <span
          v-if="!isCollapsed"
          class="brand-name"
        >明月管理</span>
      </div>

      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapsed"
        :collapse-transition="false"
        router
        class="sidebar-menu"
      >
        <el-menu-item index="/dashboard">
          <el-icon><Odometer /></el-icon>
          <template #title>
            {{ $t('nav.dashboard') }}
          </template>
        </el-menu-item>
        <el-menu-item index="/agents">
          <el-icon><Connection /></el-icon>
          <template #title>
            {{ $t('nav.agents') }}
          </template>
        </el-menu-item>
        <el-menu-item index="/system">
          <el-icon><Monitor /></el-icon>
          <template #title>
            {{ $t('nav.system') }}
          </template>
        </el-menu-item>
        <el-menu-item index="/processes">
          <el-icon><Cpu /></el-icon>
          <template #title>
            {{ $t('nav.processes') }}
          </template>
        </el-menu-item>
        <el-menu-item index="/disks">
          <el-icon><HardDisk /></el-icon>
          <template #title>
            {{ $t('nav.disks') }}
          </template>
        </el-menu-item>
        <el-menu-item index="/files">
          <el-icon><FolderOpened /></el-icon>
          <template #title>
            {{ $t('nav.files') }}
          </template>
        </el-menu-item>
        <el-menu-item index="/shares">
          <el-icon><Share /></el-icon>
          <template #title>
            {{ $t('nav.shares') }}
          </template>
        </el-menu-item>
        <el-menu-item index="/network">
          <el-icon><SetUp /></el-icon>
          <template #title>
            {{ $t('nav.network') }}
          </template>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <!-- Main content -->
    <el-container class="main-container">
      <!-- Header -->
      <el-header class="header">
        <div class="header-left">
          <el-button
            text
            @click="toggleSidebar"
          >
            <el-icon size="20">
              <Fold v-if="!isCollapsed" /><Expand v-else />
            </el-icon>
          </el-button>
        </div>

        <div class="header-right">
          <AgentSelector />
          <ThemeSwitcher />
          <LangSwitcher />

          <el-dropdown @command="handleCommand">
            <div class="user-info">
              <el-avatar
                size="small"
                :icon="UserFilled"
              />
              <span class="username">{{ sessionStore.userInfo?.displayName || 'User' }}</span>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="logout">
                  <el-icon><SwitchButton /></el-icon>
                  {{ $t('auth.logout') }}
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <!-- Content -->
      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { useI18n } from 'vue-i18n'
  import { ElMessage } from 'element-plus'
  import { UserFilled } from '@element-plus/icons-vue'
  import { useSessionStore } from '@/stores/session'
  import AgentSelector from '@/components/AgentSelector.vue'
  import ThemeSwitcher from '@/components/ThemeSwitcher.vue'
  import LangSwitcher from '@/components/LangSwitcher.vue'

  const { t } = useI18n()
  const route = useRoute()
  const router = useRouter()
  const sessionStore = useSessionStore()
  const isCollapsed = ref(false)

  const activeMenu = computed(() => route.path)

  function toggleSidebar() {
    isCollapsed.value = !isCollapsed.value
  }

  async function handleCommand(cmd: string) {
    if (cmd === 'logout') {
      await sessionStore.logout()
      ElMessage.success(t('auth.logoutSuccess'))
      router.push('/login')
    }
  }
</script>

<style scoped>
  .layout-container {
    height: 100vh;
    overflow: hidden;
  }

  .sidebar {
    background: var(--el-bg-color);
    border-right: 1px solid var(--el-border-color-light);
    transition: width 0.3s;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .sidebar-header {
    height: 60px;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 0 16px;
    border-bottom: 1px solid var(--el-border-color-light);
    overflow: hidden;
  }

  .brand-name {
    font-size: 16px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    white-space: nowrap;
  }

  .sidebar-menu {
    border-right: none;
    flex: 1;
  }

  .header {
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid var(--el-border-color-light);
    background: var(--el-bg-color);
    padding: 0 16px;
  }

  .header-left {
    display: flex;
    align-items: center;
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .user-info {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 6px;
    transition: background 0.2s;
  }

  .user-info:hover {
    background: var(--el-fill-color-light);
  }

  .username {
    font-size: 14px;
    color: var(--el-text-color-primary);
  }

  .main-container {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .main-content {
    flex: 1;
    overflow-y: auto;
    background: var(--el-bg-color-page);
  }
</style>
