<script setup lang="ts">
useHead({ title: 'Home · Susi Air Pilot' })

const pilot = usePilotStore()

onMounted(() => {
  pilot.load()
})
</script>

<template>
  <div class="home">
    <HomeHeader />
  </div>
</template>

<style lang="scss" scoped>
.home {
  display: flex;
  flex-direction: column;
  gap: $space-6;
}
</style>
