<script setup lang="ts">
import { ChevronLeft } from 'lucide-vue-next'

definePageMeta({
  validate: (route) => {
    const date = route.params.date
    if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return false
    const parsed = new Date(`${date}T00:00:00Z`)
    return !Number.isNaN(parsed.getTime()) && parsed.toISOString().startsWith(date)
  },
})

const route = useRoute()
const router = useRouter()
const date = route.params.date as string

useHead({ title: `${formatDate(date)} · Susi Air Pilot` })

function goBack() {
  devLog('ui', 'Back clicked on day detail')
  // Back to the calendar, or to this date's month if opened directly.
  if (window.history.state?.back) {
    router.back()
  } else {
    navigateTo({ path: '/schedule', query: { year: Number(date.slice(0, 4)), month: Number(date.slice(5, 7)) } })
  }
}
</script>

<template>
  <div class="day-detail">
    <button type="button" class="day-detail__back" @click="goBack">
      <ChevronLeft :size="20" aria-hidden="true" />
      Back
    </button>
    <h1 class="page-title">{{ formatWeekdayDate(date) }} {{ date.slice(0, 4) }}</h1>
    <ComingSoon title="Detail page coming soon" message="Flights and logbook entries for this day will appear here." />
  </div>
</template>

<style lang="scss" scoped>
.day-detail__back {
  display: inline-flex;
  align-items: center;
  gap: $space-1;
  min-height: 40px;
  margin: 0 0 $space-3 (-$space-2);
  padding: 0 $space-3 0 $space-1;
  border: 0;
  border-radius: $radius-pill;
  background: transparent;
  color: $color-navy;
  font-weight: $font-semibold;
}
</style>
