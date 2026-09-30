<script setup lang="ts">
const flightHours = useFlightHoursStore()

// Keep the cards on screen while the chart range changes.
const sectionStatus = computed(() => (flightHours.summary ? 'success' : flightHours.status))

function retry() {
  devLog('ui', 'Try again clicked: hours to limit')
  flightHours.load()
}
</script>

<template>
  <section aria-labelledby="limits-title">
    <div class="section-heading">
      <h2 id="limits-title" class="section-title">Hours to Limit</h2>
      <p v-if="flightHours.summary" class="section-subtitle">
        As of {{ formatDate(flightHours.summary.today) }}
      </p>
    </div>

    <BaseAsyncSection
      :status="sectionStatus"
      :error-message="flightHours.errorMessage"
      :is-empty="flightHours.summary?.cards.length === 0"
      empty-message="No limits to show."
      @retry="retry"
    >
      <template #loading>
        <div class="limit-cards">
          <div v-for="n in 4" :key="n" class="skeleton limit-cards__placeholder" />
        </div>
      </template>

      <div class="limit-cards">
        <HomeLimitCard v-for="card in flightHours.summary?.cards" :key="card.key" :card="card" />
      </div>
    </BaseAsyncSection>
  </section>
</template>

<style lang="scss" scoped>
.limit-cards {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: $space-3;
}

.limit-cards__placeholder {
  height: 124px;
  border-radius: $radius-lg;
}
</style>
