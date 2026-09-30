<script setup lang="ts">
import { Check } from 'lucide-vue-next'
import type { ScheduleEntry } from '~/types/api'

const props = defineProps<{
  date: string
  entry?: ScheduleEntry
  dutyLabel?: string
  isToday: boolean
}>()

const day = computed(() => Number(props.date.slice(8)))

const colors = computed(() =>
  props.entry
    ? { backgroundColor: props.entry.baseColor, color: readableTextColor(props.entry.baseColor) }
    : undefined,
)

const description = computed(() => {
  const parts = [formatWeekdayDate(props.date)]
  if (props.isToday) parts.push('today')
  if (!props.entry) return [...parts, 'no duty'].join(', ')
  const { baseName, isComplete, remaining, countSchedules } = props.entry
  parts.push(`${props.dutyLabel ?? props.entry.dutyType} at ${baseName}`)
  parts.push(isComplete ? 'all logbooks done' : `${remaining} of ${countSchedules} still to log`)
  return parts.join(', ')
})
</script>

<template>
  <div class="day" :class="{ 'day--duty': entry, 'day--today': isToday }" :style="colors">
    <span class="visually-hidden">{{ description }}</span>
    <span class="day__number" aria-hidden="true">{{ day }}</span>
    <span v-if="entry" class="day__status" aria-hidden="true">
      <Check v-if="entry.isComplete" :size="12" :stroke-width="3" />
      <template v-else>{{ entry.remaining }}</template>
    </span>
    <span v-if="entry" class="day__base" aria-hidden="true">{{ entry.baseName }}</span>
  </div>
</template>

<style lang="scss" scoped>
.day {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 56px;
  padding: $space-1 6px;
  border-radius: $radius-sm;
  background: $color-bg;
  color: $color-text-muted;
}

.day--today {
  outline: 2px solid $color-navy;
  outline-offset: 2px;

  .day__number {
    color: inherit;
  }
}

.day:not(.day--duty).day--today {
  color: $color-navy;
}

.day__number {
  font-size: $text-xs;
  font-weight: $font-bold;
  line-height: 1.2;
}

.day__status {
  position: absolute;
  top: 3px;
  right: 3px;
  display: grid;
  place-items: center;
  min-width: 16px;
  height: 16px;
  padding: 0 3px;
  border-radius: $radius-pill;
  background: color-mix(in srgb, currentColor 22%, transparent);
  font-size: 10px;
  font-weight: $font-extrabold;
}

.day__base {
  font-size: 10px;
  font-weight: $font-bold;
  letter-spacing: 0.02em;
  text-align: center;
}
</style>
