<template>
  <el-config-provider :locale="elLocale" :size="'default'">
    <div :class="['app-wrapper', themeClass]">
      <router-view />
    </div>
  </el-config-provider>
</template>

<script setup lang="ts">
  import { computed, watch } from 'vue'
  import zhCn from 'element-plus/es/locale/lang/zh-cn'
  import en from 'element-plus/es/locale/lang/en'
  import { useUiStore } from '@/stores/ui'

  const uiStore = useUiStore()

  const elLocale = computed(() => {
    return uiStore.language === 'zh-CN' ? zhCn : en
  })

  const themeClass = computed(() => {
    const theme = uiStore.theme
    if (theme === 'auto') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    return theme
  })

  watch(
    () => uiStore.theme,
    (newTheme) => {
      const resolved =
        newTheme === 'auto'
          ? window.matchMedia('(prefers-color-scheme: dark)').matches
            ? 'dark'
            : 'light'
          : newTheme
      if (resolved === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    },
    { immediate: true }
  )
</script>

<style>
  :root {
    --el-color-primary: #409eff;
    font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
  }

  html.dark {
    color-scheme: dark;
  }

  .app-wrapper {
    min-height: 100vh;
    background-color: var(--el-bg-color-page);
    color: var(--el-text-color-primary);
  }

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body {
    margin: 0;
  }
</style>
