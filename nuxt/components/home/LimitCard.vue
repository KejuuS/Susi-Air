<script setup lang="ts">
import type { LimitCard, LimitStatus } from '~/types/api'

const props = defineProps<{ card: LimitCard }>()

const statusLabels: Record<LimitStatus, string> = {
  safe: 'Within limit',
  warning: 'Near limit',
  over: 'Over limit',
}

const barWidth = computed(() => `${Math.min(props.card.percent, 100)}%`)
</script>

<template>
  <article class="limit-card" :class="`limit-card--${card.status}`">
    <h3 class="limit-card__label">{{ card.label }}</h3>
    <p class="limit-card__value">
      <strong>{{ formatHours(card.current) }}</strong>
      <span>/ {{ formatNumber(card.limit) }} hrs</span>
    </p>
    <div
      class="limit-card__track"
      role="progressbar"
      :aria-label="`${card.label} hours used`"
      :aria-valuenow="card.current"
      aria-valuemin="0"
      :aria-valuemax="card.limit"
      :aria-valuetext="`${formatHours(card.current)} of ${formatNumber(card.limit)} hours`"
    >
      <div class="limit-card__bar" :style="{ width: barWidth }" />
    </div>
    <p class="limit-card__status">
      <span class="limit-card__dot" aria-hidden="true" />
      {{ formatNumber(card.percent) }}% · {{ statusLabels[card.status] }}
    </p>
  </article>
</template>

<style lang="scss" scoped>
.limit-card {
  @include card;
  display: flex;
  flex-direction: column;
  gap: $space-2;
  padding: $space-4;
  --status-color: #{$color-success};

  &--warning {
    --status-color: #{$color-warning};
  }

  &--over {
    --status-color: #{$color-danger};
  }
}

.limit-card__label {
  color: $color-text-muted;
  font-size: $text-sm;
  font-weight: $font-semibold;
}

.limit-card__value {
  @include tabular-nums;
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  column-gap: $space-1;

  strong {
    font-size: $text-xl;
    font-weight: $font-extrabold;
  }

  span {
    color: $color-text-muted;
    font-size: $text-sm;
    white-space: nowrap;
  }
}

.limit-card__track {
  height: 8px;
  overflow: hidden;
  border-radius: $radius-pill;
  background: $color-border;
}

.limit-card__bar {
  height: 100%;
  border-radius: inherit;
  background: var(--status-color);
}

.limit-card__status {
  @include tabular-nums;
  display: flex;
  align-items: center;
  gap: $space-2;
  font-size: $text-xs;
  font-weight: $font-semibold;
}

.limit-card__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--status-color);
}
</style>
