<script setup lang="ts">
import { CircleAlert, RotateCw } from 'lucide-vue-next'
import type { LoadStatus } from '~/types/ui'

withDefaults(
  defineProps<{
    status: LoadStatus
    errorMessage?: string | null
    isEmpty?: boolean
    emptyMessage?: string
  }>(),
  { errorMessage: null, isEmpty: false, emptyMessage: 'Nothing to show yet.' },
)

defineEmits<{ retry: [] }>()
</script>

<template>
  <div v-if="status === 'idle' || status === 'loading'" aria-busy="true">
    <span class="visually-hidden">Loading…</span>
    <slot name="loading">
      <div class="async__lines">
        <div v-for="n in 3" :key="n" class="skeleton async__line" />
      </div>
    </slot>
  </div>

  <div v-else-if="status === 'error'" class="async__error" role="alert">
    <p class="async__error-text">
      <CircleAlert :size="18" class="async__error-icon" aria-hidden="true" />
      {{ errorMessage ?? 'Something went wrong. Please try again.' }}
    </p>
    <button type="button" class="async__retry" @click="$emit('retry')">
      <RotateCw :size="16" aria-hidden="true" />
      Try again
    </button>
  </div>

  <p v-else-if="isEmpty" class="async__empty">{{ emptyMessage }}</p>

  <slot v-else />
</template>

<style lang="scss" scoped>
.async__lines {
  display: flex;
  flex-direction: column;
  gap: $space-3;
}

.async__line {
  height: 16px;

  &:last-child {
    width: 60%;
  }
}

.async__error {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: $space-3;
  padding: $space-3 $space-4;
  border-left: 4px solid $color-danger;
  border-radius: $radius-sm;
  background: $color-danger-soft;
}

.async__error-text {
  display: flex;
  gap: $space-2;
  font-size: $text-sm;
  font-weight: $font-medium;
}

.async__error-icon {
  flex-shrink: 0;
  margin-top: 1px;
  color: $color-danger;
}

.async__retry {
  display: inline-flex;
  align-items: center;
  gap: $space-2;
  min-height: 40px;
  padding: 0 $space-4;
  border: 1.5px solid $color-navy;
  border-radius: $radius-pill;
  background: $color-surface;
  font-size: $text-sm;
  font-weight: $font-semibold;
}

.async__empty {
  color: $color-text-muted;
  font-size: $text-sm;
}
</style>
