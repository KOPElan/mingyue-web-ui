<template>
  <el-dropdown
    trigger="click"
    @command="handleLangChange"
  >
    <el-button
      text
      :title="$t('ui.language')"
    >
      <el-icon size="18">
        <ChatDotSquare />
      </el-icon>
      <span class="lang-label">{{ uiStore.language === 'zh-CN' ? '中' : 'EN' }}</span>
    </el-button>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item
          command="zh-CN"
          :disabled="uiStore.language === 'zh-CN'"
        >
          🇨🇳 {{ $t('ui.chinese') }}
        </el-dropdown-item>
        <el-dropdown-item
          command="en-US"
          :disabled="uiStore.language === 'en-US'"
        >
          🇺🇸 {{ $t('ui.english') }}
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup lang="ts">
  import { useI18n } from 'vue-i18n'
  import { useUiStore } from '@/stores/ui'
  import type { Language } from '@/stores/ui'

  const { locale } = useI18n()
  const uiStore = useUiStore()

  function handleLangChange(lang: string) {
    uiStore.setLanguage(lang as Language)
    locale.value = lang
  }
</script>

<style scoped>
  .lang-label {
    font-size: 13px;
    margin-left: 2px;
  }
</style>
