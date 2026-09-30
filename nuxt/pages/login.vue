<script setup lang="ts">
import { CircleAlert } from 'lucide-vue-next'
import { ApiError } from '~/composables/useApi'

definePageMeta({ layout: 'auth' })
useHead({ title: 'Sign in · Susi Air Pilot' })

const auth = useAuthStore()

const username = ref('')
const password = ref('')
const isSubmitting = ref(false)
const errorMessage = ref<string | null>(null)
const credentialsRejected = ref(false)

async function onSubmit() {
  devLog('ui', 'Sign in button clicked')
  errorMessage.value = null
  credentialsRejected.value = false

  if (!username.value.trim() || !password.value) {
    devLog('ui', 'Form incomplete, request not sent')
    errorMessage.value = 'Enter your username and password.'
    return
  }

  isSubmitting.value = true
  try {
    await auth.login(username.value.trim(), password.value)
    await navigateTo('/')
  } catch (error) {
    credentialsRejected.value = error instanceof ApiError && error.kind === 'unauthorized'
    errorMessage.value = loginErrorMessage(error)
  } finally {
    isSubmitting.value = false
  }
}

function loginErrorMessage(error: unknown): string {
  if (!(error instanceof ApiError)) return 'Something went wrong. Please try again.'
  if (error.kind === 'unauthorized') return 'Username or password is incorrect.'
  if (error.kind === 'network') return error.message
  return 'Something went wrong on our side. Please try again.'
}
</script>

<template>
  <div class="login">
    <header class="login__header">
      <img src="/susiair-logo.png" alt="Susi Air" class="login__logo" width="160" height="40">
      <h1 class="login__title">Sign in</h1>
      <p class="login__subtitle">Use your pilot account to continue.</p>
    </header>

    <form class="login__form" novalidate @submit.prevent="onSubmit">
      <BaseTextField
        v-model="username"
        label="Username"
        autocomplete="username"
        :invalid="credentialsRejected"
      />
      <BaseTextField
        v-model="password"
        label="Password"
        type="password"
        autocomplete="current-password"
        :invalid="credentialsRejected"
      />

      <p v-if="errorMessage" class="login__error" role="alert">
        <CircleAlert :size="18" class="login__error-icon" aria-hidden="true" />
        {{ errorMessage }}
      </p>

      <BaseButton type="submit" :loading="isSubmitting">
        {{ isSubmitting ? 'Signing in…' : 'Sign in' }}
      </BaseButton>
    </form>
  </div>
</template>

<style lang="scss" scoped>
.login {
  display: flex;
  flex-direction: column;
  gap: $space-8;
}

.login__header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $space-2;
  text-align: center;
}

.login__logo {
  width: 160px;
  height: auto;
  margin-bottom: $space-4;
}

.login__title {
  font-size: $text-2xl;
  font-weight: $font-extrabold;
}

.login__subtitle {
  color: $color-text-muted;
}

.login__form {
  display: flex;
  flex-direction: column;
  gap: $space-5;
}

.login__error {
  display: flex;
  align-items: flex-start;
  gap: $space-2;
  padding: $space-3 $space-4;
  border-left: 4px solid $color-danger;
  border-radius: $radius-sm;
  background: $color-danger-soft;
  font-size: $text-sm;
  font-weight: $font-medium;
}

.login__error-icon {
  flex-shrink: 0;
  margin-top: 1px;
  color: $color-danger;
}
</style>
