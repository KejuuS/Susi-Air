<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()

const isNotFound = computed(() => props.error.statusCode === 404)
const title = computed(() => (isNotFound.value ? 'Page not found' : 'Something went wrong'))

const pageTitle = `${title.value} · Susi Air Pilot`
useHead({ title: pageTitle })

// Nuxt skips head rendering when the app fails while starting, e.g. an unknown URL.
onMounted(() => {
  document.title = pageTitle
})

function goHome() {
  devLog('ui', 'Back to Home clicked on error page')
  clearError({ redirect: '/' })
}
</script>

<template>
  <NuxtLayout name="auth">
    <div class="error-page">
      <img src="/susiair-logo.png" alt="Susi Air" class="error-page__logo" width="160" height="40">
      <p class="error-page__code">{{ error.statusCode }}</p>
      <h1 class="error-page__title">{{ title }}</h1>
      <p class="error-page__message">
        {{ isNotFound ? "This page doesn't exist or has moved." : 'Please try again in a moment.' }}
      </p>
      <BaseButton @click="goHome">Back to Home</BaseButton>
    </div>
  </NuxtLayout>
</template>

<style lang="scss" scoped>
.error-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $space-2;
  text-align: center;
}

.error-page__logo {
  width: 160px;
  height: auto;
  margin-bottom: $space-6;
}

.error-page__code {
  color: $color-red;
  font-size: $text-sm;
  font-weight: $font-bold;
  letter-spacing: 0.1em;
}

.error-page__title {
  font-size: $text-2xl;
  font-weight: $font-extrabold;
}

.error-page__message {
  margin-bottom: $space-6;
  color: $color-text-muted;
}
</style>
