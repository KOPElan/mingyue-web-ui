import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { i18n } from './locales'
import router from './router'
import App from './App.vue'
import { setTokenGetter, setClearSession } from './api/http'
import { useSessionStore } from './stores/session'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(ElementPlus)
app.use(i18n)

// Register all Element Plus icons globally
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// Wire up token getter after pinia is installed (avoids circular dep)
const sessionStore = useSessionStore()
setTokenGetter(() => sessionStore.token)
setClearSession(() => sessionStore.clearSession())

app.mount('#app')
