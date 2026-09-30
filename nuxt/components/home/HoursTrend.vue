<script setup lang="ts">
import type { ChartRange } from '~/types/api'

const flightHours = useFlightHoursStore()

const range = computed({
  get: () => flightHours.range,
  set: (next: ChartRange) => {
    devLog('ui', `Chart range ${next} selected`)
    flightHours.setRange(next)
  },
})

const isRefreshing = computed(() => flightHours.status === 'loading' && flightHours.summary !== null)
const sectionStatus = computed(() => {
  if (flightHours.status === 'error') return 'error'
  return flightHours.summary ? 'success' : flightHours.status
})

function retry() {
  devLog('ui', 'Try again clicked: hours trend')
  flightHours.load()
}
</script>

<template>
  <section class="trend" aria-labelledby="trend-title">
    <div class="section-heading">
      <h2 id="trend-title" class="section-title">Rolling hours</h2>
      <p v-if="flightHours.summary" class="section-subtitle">
        {{ flightHours.summary.windowDays }}-day total
      </p>
    </div>

    <HomeRangeToggle v-model="range" />

    <div class="trend__card">
      <BaseAsyncSection
        :status="sectionStatus"
        :error-message="flightHours.errorMessage"
        :is-empty="flightHours.summary?.points.length === 0"
        empty-message="No flight hours to chart."
        @retry="retry"
      >
        <template #loading>
          <div class="skeleton trend__placeholder" />
        </template>

        <div :class="{ 'trend__chart--refreshing': isRefreshing }" :aria-busy="isRefreshing">
          <HomeHoursTrendChart v-if="flightHours.summary" :summary="flightHours.summary" />
        </div>
      </BaseAsyncSection>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.trend {
  display: flex;
  flex-direction: column;
  gap: $space-3;

  .section-heading {
    margin-bottom: 0;
  }
}

.trend__card {
  @include card;
  padding: $space-4;
}

.trend__placeholder {
  height: 220px;
}

.trend__chart--refreshing {
  opacity: 0.5;
  transition: opacity 0.2s ease;
}
</style>
