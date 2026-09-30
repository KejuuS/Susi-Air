<script setup lang="ts">
useHead({ title: 'Home · Susi Air Pilot' })

const pilot = usePilotStore()
const flightHours = useFlightHoursStore()
const documents = useDocumentsStore()

onMounted(() => {
  pilot.load()
  flightHours.load()
  documents.load()
})
</script>

<template>
  <div class="home">
    <HomeHeader />
    <HomeLimitCards />
    <HomeHoursTrend />
    <HomeDocumentList />
  </div>
</template>

<style lang="scss" scoped>
.home {
  display: flex;
  flex-direction: column;
  gap: $space-6;
}
</style>
