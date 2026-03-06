import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export type Theme = 'light' | 'dark' | 'auto'
export type Language = 'zh-CN' | 'en-US'

const applyTheme = (theme: Theme) => {
  const dark =
    theme === 'auto'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
      : theme === 'dark'
  if (dark) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

export const useUiStore = defineStore('ui', () => {
  const theme = ref<Theme>((localStorage.getItem('mingyue-theme') as Theme) || 'light')
  const language = ref<Language>(
    (localStorage.getItem('mingyue-language') as Language) || 'zh-CN'
  )

  // Listen for system color scheme changes and re-apply when in 'auto' mode.
  // This listener is intentionally not removed because the store is a singleton
  // that lives for the entire application lifetime.
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  const onSystemThemeChange = () => {
    if (theme.value === 'auto') {
      applyTheme('auto')
    }
  }
  mediaQuery.addEventListener('change', onSystemThemeChange)

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
  watch(theme, applyTheme, { immediate: true })

  return {
    theme,
    language,
    setTheme,
    setLanguage
  }
})
