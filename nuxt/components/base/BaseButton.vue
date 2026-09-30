<script setup lang="ts">
import { LoaderCircle } from 'lucide-vue-next'

withDefaults(
  defineProps<{
    type?: 'button' | 'submit'
    variant?: 'primary' | 'secondary'
    loading?: boolean
    disabled?: boolean
  }>(),
  { type: 'button', variant: 'primary', loading: false, disabled: false },
)
</script>

<template>
  <button
    :type="type"
    class="button"
    :class="`button--${variant}`"
    :disabled="disabled || loading"
    :aria-busy="loading"
  >
    <LoaderCircle v-if="loading" class="button__spinner" :size="20" aria-hidden="true" />
    <slot />
  </button>
</template>

<style lang="scss" scoped>
.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: $space-2;
  width: 100%;
  min-height: 52px;
  padding: 0 $space-6;
  border: 0;
  border-radius: $radius-pill;
  background: $color-red;
  color: $color-text-on-dark;
  font-size: 1.1875rem;
  font-weight: $font-bold;
  transition: filter 0.15s ease;

  &:hover:not(:disabled) {
    filter: brightness(0.93);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.7;
  }
}

.button--secondary {
  border: 1.5px solid $color-navy;
  background: $color-surface;
  color: $color-navy;
  font-size: $text-md;
}

.button__spinner {
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .button__spinner {
    animation: none;
  }
}
</style>
