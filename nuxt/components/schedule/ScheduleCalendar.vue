<script setup lang="ts">
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
import type { LegendItem, ScheduleEntry } from '~/types/api'
import type { YearMonth } from '~/utils/calendar'

const props = defineProps<{
  yearMonth: YearMonth
  entries: ScheduleEntry[]
  legend: LegendItem[]
  today: string | null
  busy: boolean
}>()

defineEmits<{ previous: []; next: [] }>()

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const cells = computed(() => buildMonthGrid(props.yearMonth))
const entriesByDate = computed(() => new Map(props.entries.map((entry) => [entry.date, entry])))
const dutyLabels = computed(() => new Map(props.legend.map((item) => [item.code, item.label])))

function entryFor(date: string) {
  return entriesByDate.value.get(date)
}
</script>

<template>
  <div class="calendar">
    <div class="calendar__header">
      <button type="button" class="calendar__nav" aria-label="Previous month" @click="$emit('previous')">
        <ChevronLeft :size="20" aria-hidden="true" />
      </button>
      <h2 class="calendar__title" aria-live="polite">{{ monthTitle(yearMonth) }}</h2>
      <button type="button" class="calendar__nav" aria-label="Next month" @click="$emit('next')">
        <ChevronRight :size="20" aria-hidden="true" />
      </button>
    </div>

    <div class="calendar__weekdays" aria-hidden="true">
      <span v-for="weekday in WEEKDAYS" :key="weekday">{{ weekday }}</span>
    </div>

    <ol class="calendar__grid" :class="{ 'calendar__grid--busy': busy }" :aria-busy="busy">
      <li v-for="(date, index) in cells" :key="date ?? `blank-${index}`" :aria-hidden="date ? undefined : 'true'">
        <ScheduleDay
          v-if="date"
          :date="date"
          :entry="entryFor(date)"
          :duty-label="dutyLabels.get(entryFor(date)?.dutyType ?? '')"
          :is-today="date === today"
        />
      </li>
    </ol>
  </div>
</template>

<style lang="scss" scoped>
.calendar {
  @include card;
  padding: $space-4 $space-3;
}

.calendar__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: $space-3;
}

.calendar__title {
  font-size: $text-lg;
  font-weight: $font-bold;
}

.calendar__nav {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border: 1px solid $color-border;
  border-radius: 50%;
  background: $color-surface;
  color: $color-navy;
}

.calendar__weekdays,
.calendar__grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: $space-1;
}

.calendar__weekdays {
  margin-bottom: $space-2;
  color: $color-text-muted;
  font-size: $text-xs;
  font-weight: $font-semibold;
  text-align: center;
}

.calendar__grid {
  margin: 0;
  padding: 0;
  list-style: none;
  transition: opacity 0.2s ease;

  &--busy {
    opacity: 0.5;
  }
}
</style>
