<script setup lang="ts">
import type { ChartRange } from '~/types/api'

const model = defineModel<ChartRange>({ required: true })

const options: { value: ChartRange; label: string }[] = [
  { value: '1w', label: '1 week' },
  { value: '1m', label: '1 month' },
  { value: '3m', label: '3 months' },
  { value: '6m', label: '6 months' },
  { value: '1y', label: '1 year' },
]
</script>

<template>
  <div class="range-toggle" role="group" aria-label="Chart range">
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      class="range-toggle__option"
      :class="{ 'range-toggle__option--active': option.value === model }"
      :aria-pressed="option.value === model"
      :aria-label="option.label"
      @click="model = option.value"
    >
      {{ option.value.toUpperCase() }}
    </button>
  </div>
</template>

<style lang="scss" scoped>
.range-toggle {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: $space-1;
  padding: $space-1;
  border-radius: $radius-pill;
  background: $color-border;
}

.range-toggle__option {
  min-height: 36px;
  border: 0;
  border-radius: $radius-pill;
  background: transparent;
  color: $color-text-muted;
  font-size: $text-sm;
  font-weight: $font-semibold;

  &--active {
    background: $color-surface;
    color: $color-navy;
    box-shadow: 0 1px 3px rgba(14, 33, 56, 0.12);
  }
}
</style>
