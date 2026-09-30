<script setup lang="ts">
import { CircleCheck, CircleX, TriangleAlert } from 'lucide-vue-next'

const props = defineProps<{
  tone: 'success' | 'warning' | 'danger'
  label: string
}>()

const icon = computed(() => ({ success: CircleCheck, warning: TriangleAlert, danger: CircleX })[props.tone])
</script>

<template>
  <span class="badge" :class="`badge--${tone}`">
    <component :is="icon" :size="14" class="badge__icon" aria-hidden="true" />
    {{ label }}
  </span>
</template>

<style lang="scss" scoped>
.badge {
  display: inline-flex;
  align-items: center;
  gap: $space-1;
  padding: 2px $space-2;
  border-radius: $radius-pill;
  background: color-mix(in srgb, var(--tone) 16%, $color-surface);
  color: $color-text;
  font-size: $text-xs;
  font-weight: $font-semibold;
  white-space: nowrap;

  &--success {
    --tone: #{$color-success};
  }

  &--warning {
    --tone: #{$color-warning};
  }

  &--danger {
    --tone: #{$color-danger};
  }
}

.badge__icon {
  color: var(--tone);
}
</style>
