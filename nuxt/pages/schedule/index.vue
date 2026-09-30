<script setup lang="ts">
import type { YearMonth } from '~/utils/calendar'

useHead({ title: 'Schedule · Susi Air Pilot' })

const route = useRoute()
const schedules = useSchedulesStore()

const shown = computed<YearMonth | null>(() =>
  schedules.year && schedules.month ? { year: schedules.year, month: schedules.month } : null,
)

// Hide leftovers from the previous month while loading.
const monthEntries = computed(() => {
  if (!shown.value) return []
  const prefix = isoDate(shown.value.year, shown.value.month, 1).slice(0, 7)
  return schedules.entries.filter((entry) => entry.date.startsWith(prefix))
})

const isBusy = computed(() => schedules.status === 'loading' && shown.value !== null)
const isEmptyMonth = computed(() => schedules.status === 'success' && monthEntries.value.length === 0)
const sectionStatus = computed(() => {
  if (schedules.status === 'error') return 'error'
  return shown.value ? 'success' : schedules.status
})

// The month lives in the URL, so a refresh keeps it.
watch(
  () => route.query,
  async (query) => {
    const requested = parseMonthQuery(query)
    if (requested?.year === schedules.year && requested?.month === schedules.month) return

    await schedules.load(requested ?? undefined)
    if (!requested && schedules.year && schedules.month) {
      await navigateTo({ query: { year: schedules.year, month: schedules.month } }, { replace: true })
    }
  },
  { immediate: true },
)

function goToMonth(delta: number) {
  if (!shown.value) return
  const target = shiftMonth(shown.value, delta)
  devLog('ui', `${delta < 0 ? 'Previous' : 'Next'} month clicked: ${monthTitle(target)}`)
  // Load first so fast taps count from the new month.
  schedules.load(target)
  navigateTo({ query: { year: target.year, month: target.month } }, { replace: true })
}

function retry() {
  devLog('ui', 'Try again clicked: schedule')
  schedules.load(parseMonthQuery(route.query) ?? undefined)
}
</script>

<template>
  <div class="schedule">
    <h1 class="page-title">Schedule</h1>

    <BaseAsyncSection :status="sectionStatus" :error-message="schedules.errorMessage" @retry="retry">
      <template #loading>
        <div class="skeleton schedule__placeholder" />
      </template>

      <ScheduleCalendar
        v-if="shown"
        :year-month="shown"
        :entries="monthEntries"
        :legend="schedules.legend"
        :today="schedules.today"
        :busy="isBusy"
        @previous="goToMonth(-1)"
        @next="goToMonth(1)"
      />
      <p v-if="isEmptyMonth" class="schedule__empty">No duties scheduled this month.</p>
    </BaseAsyncSection>
  </div>
</template>

<style lang="scss" scoped>
.schedule__placeholder {
  height: 420px;
  border-radius: $radius-lg;
}

.schedule__empty {
  margin-top: $space-3;
  color: $color-text-muted;
  font-size: $text-sm;
  text-align: center;
}
</style>
