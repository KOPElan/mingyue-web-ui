<template>
  <el-dropdown
    trigger="click"
    @command="handleThemeChange"
  >
    <el-button
      text
      :title="$t('ui.theme')"
    >
      <el-icon size="18">
        <Sunny v-if="uiStore.theme === 'light'" />
        <Moon v-else-if="uiStore.theme === 'dark'" />
        <Monitor v-else />
      </el-icon>
    </el-button>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item command="light">
          <el-icon><Sunny /></el-icon> {{ $t('ui.light') }}
        </el-dropdown-item>
        <el-dropdown-item command="dark">
          <el-icon><Moon /></el-icon> {{ $t('ui.dark') }}
        </el-dropdown-item>
        <el-dropdown-item command="auto">
          <el-icon><Monitor /></el-icon> {{ $t('ui.auto') }}
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup lang="ts">
  import { useUiStore } from '@/stores/ui'
  import type { Theme } from '@/stores/ui'

  const uiStore = useUiStore()

  function handleThemeChange(theme: string) {
    uiStore.setTheme(theme as Theme)
  }
</script>
