<script setup lang="ts">
import { LogOut } from 'lucide-vue-next'

useHead({ title: 'More · Susi Air Pilot' })

const auth = useAuthStore()

async function signOut() {
  devLog('ui', 'Sign out button clicked')
  auth.logout()
  await navigateTo('/login')
}
</script>

<template>
  <div class="more">
    <h1 class="page-title">More</h1>
    <ComingSoon title="Coming soon" message="Settings and other tools will appear here." />
    <BaseButton variant="secondary" @click="signOut">
      <LogOut :size="20" aria-hidden="true" />
      Sign out
    </BaseButton>
  </div>
</template>

<style lang="scss" scoped>
.more {
  display: flex;
  flex-direction: column;
  gap: $space-5;

  .page-title {
    margin-bottom: 0;
  }
}
</style>
