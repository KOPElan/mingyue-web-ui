import { createRouter, createWebHistory } from 'vue-router'
import { useSessionStore } from '@/stores/session'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/pages/Login.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/',
      component: () => import('@/pages/Layout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          redirect: '/dashboard'
        },
        {
          path: 'dashboard',
          name: 'Dashboard',
          component: () => import('@/pages/Dashboard.vue'),
          meta: { title: 'nav.dashboard' }
        },
        {
          path: 'agents',
          name: 'AgentManager',
          component: () => import('@/pages/AgentManager.vue'),
          meta: { title: 'nav.agents' }
        },
        {
          path: 'system',
          name: 'SystemOverview',
          component: () => import('@/pages/SystemOverview.vue'),
          meta: { title: 'nav.system' }
        },
        {
          path: 'processes',
          name: 'ProcessManager',
          component: () => import('@/pages/ProcessManager.vue'),
          meta: { title: 'nav.processes' }
        },
        {
          path: 'disks',
          name: 'DiskManager',
          component: () => import('@/pages/DiskManager.vue'),
          meta: { title: 'nav.disks' }
        },
        {
          path: 'files',
          name: 'FileManager',
          component: () => import('@/pages/FileManager.vue'),
          meta: { title: 'nav.files' }
        },
        {
          path: 'shares',
          name: 'ShareManager',
          component: () => import('@/pages/ShareManager.vue'),
          meta: { title: 'nav.shares' }
        },
        {
          path: 'network',
          name: 'NetworkAclManager',
          component: () => import('@/pages/NetworkAclManager.vue'),
          meta: { title: 'nav.network' }
        }
      ]
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/'
    }
  ]
})

// Navigation guard
router.beforeEach((to) => {
  const sessionStore = useSessionStore()
  if (to.meta.requiresAuth !== false && !sessionStore.isAuthenticated) {
    return { name: 'Login', query: { redirect: to.fullPath } }
  }
  if (to.name === 'Login' && sessionStore.isAuthenticated) {
    return { path: '/dashboard' }
  }
  // Explicit fallthrough: allow navigation
  return true
})

export default router
