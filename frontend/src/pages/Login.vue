<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <div class="logo">
          <el-icon size="48" color="#409eff"><Moon /></el-icon>
        </div>
        <h1 class="title">{{ $t('auth.systemTitle') }}</h1>
        <p class="subtitle">{{ $t('auth.welcomeBack') }}</p>
      </div>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-position="top"
        class="login-form"
        @submit.prevent="handleLogin"
      >
        <el-form-item :label="$t('auth.username')" prop="username">
          <el-input
            v-model="form.username"
            :placeholder="$t('auth.enterUsername')"
            prefix-icon="User"
            size="large"
            autocomplete="username"
          />
        </el-form-item>

        <el-form-item :label="$t('auth.password')" prop="password">
          <el-input
            v-model="form.password"
            type="password"
            :placeholder="$t('auth.enterPassword')"
            prefix-icon="Lock"
            size="large"
            show-password
            autocomplete="current-password"
            @keyup.enter="handleLogin"
          />
        </el-form-item>

        <el-button
          type="primary"
          size="large"
          class="login-btn"
          :loading="loading"
          @click="handleLogin"
        >
          {{ $t('auth.login') }}
        </el-button>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive } from 'vue'
  import { useRouter, useRoute } from 'vue-router'
  import { ElMessage } from 'element-plus'
  import type { FormInstance, FormRules } from 'element-plus'
  import { useSessionStore } from '@/stores/session'
  import { useI18n } from 'vue-i18n'

  const router = useRouter()
  const route = useRoute()
  const sessionStore = useSessionStore()
  const { t } = useI18n()

  const formRef = ref<FormInstance>()
  const loading = ref(false)

  const form = reactive({
    username: '',
    password: ''
  })

  const rules: FormRules = {
    username: [{ required: true, message: t('auth.enterUsername'), trigger: 'blur' }],
    password: [{ required: true, message: t('auth.enterPassword'), trigger: 'blur' }]
  }

  async function handleLogin() {
    if (!formRef.value) return
    const valid = await formRef.value.validate().catch(() => false)
    if (!valid) return

    loading.value = true
    try {
      await sessionStore.login(form.username, form.password)
      ElMessage.success(t('auth.loginSuccess'))
      const redirect = (route.query.redirect as string) || '/dashboard'
      router.push(redirect)
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } }
      const msg = err.response?.data?.error || t('auth.invalidCredentials')
      ElMessage.error(msg)
    } finally {
      loading.value = false
    }
  }
</script>

<style scoped>
  .login-container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }

  .login-card {
    background: var(--el-bg-color);
    border-radius: 12px;
    padding: 48px 40px;
    width: 420px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  }

  .login-header {
    text-align: center;
    margin-bottom: 32px;
  }

  .logo {
    margin-bottom: 16px;
  }

  .title {
    font-size: 24px;
    font-weight: 700;
    color: var(--el-text-color-primary);
    margin: 0 0 8px;
  }

  .subtitle {
    color: var(--el-text-color-secondary);
    margin: 0;
  }

  .login-form {
    width: 100%;
  }

  .login-btn {
    width: 100%;
    margin-top: 8px;
  }
</style>
