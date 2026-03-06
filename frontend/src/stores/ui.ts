import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export type Theme = 'light' | 'dark' | 'auto'
export type Language = 'zh-CN' | 'en-US'

export const useUiStore = defineStore('ui', () => {
  const theme = ref<Theme>((localStorage.getItem('mingyue-theme') as Theme) || 'light')
  const language = ref<Language>(
    (localStorage.getItem('mingyue-language') as Language) || 'zh-CN'
  )

  function setTheme(newTheme: Theme) {
    theme.value = newTheme
    localStorage.setItem('mingyue-theme', newTheme)
  }

  function setLanguage(newLang: Language) {
    language.value = newLang
    localStorage.setItem('mingyue-language', newLang)
    // Update i18n locale (accessed via composable in components)
  }

  // Watch theme changes and apply to document
  watch(
    theme,
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

  return {
    theme,
    language,
    setTheme,
    setLanguage
  }
})
