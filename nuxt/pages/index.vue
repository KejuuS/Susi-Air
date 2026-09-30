<script setup lang="ts">
useHead({ title: 'Home · Susi Air Pilot' })

const pilot = usePilotStore()
const flightHours = useFlightHoursStore()

onMounted(() => {
  pilot.load()
  flightHours.load()
})
</script>

<template>
  <div class="home">
    <HomeHeader />
    <HomeLimitCards />
    <HomeHoursTrend />
  </div>
</template>

<style lang="scss" scoped>
.home {
  display: flex;
  flex-direction: column;
  gap: $space-6;
}
</style>
