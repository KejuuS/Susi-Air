<script setup lang="ts">
import type { LegendItem } from '~/types/api'

defineProps<{ items: LegendItem[] }>()
</script>

<template>
  <section class="legend" aria-labelledby="legend-title">
    <h2 id="legend-title" class="section-title">Legend</h2>
    <ul class="legend__list">
      <li v-for="item in items" :key="item.code" class="legend__item">
        <span class="legend__swatch" :style="{ backgroundColor: item.color }" aria-hidden="true" />
        <span class="legend__text">
          <span class="legend__code">{{ item.code }}</span>
          <span class="legend__label">{{ item.label }}</span>
        </span>
      </li>
    </ul>
  </section>
</template>

<style lang="scss" scoped>
.legend {
  @include card;
  padding: $space-4;
}

.legend__list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: $space-3 $space-4;
  margin: $space-3 0 0;
  padding: 0;
  list-style: none;
}

.legend__item {
  display: flex;
  align-items: flex-start;
  gap: $space-2;
  min-width: 0;
}

.legend__swatch {
  flex-shrink: 0;
  width: 14px;
  height: 14px;
  margin-top: 2px;
  border-radius: 4px;
}

.legend__text {
  display: flex;
  flex-direction: column;
  min-width: 0;
  line-height: 1.3;
}

.legend__code {
  font-size: $text-sm;
  font-weight: $font-bold;
}

.legend__label {
  color: $color-text-muted;
  font-size: $text-xs;
}
</style>
