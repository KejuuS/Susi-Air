<script setup lang="ts">
import { Hammer } from 'lucide-vue-next'

defineProps<{ title: string; message: string }>()
</script>

<template>
  <div class="coming-soon">
    <Hammer :size="32" class="coming-soon__icon" aria-hidden="true" />
    <h2 class="coming-soon__title">{{ title }}</h2>
    <p class="coming-soon__message">{{ message }}</p>
    <slot />
  </div>
</template>

<style lang="scss" scoped>
.coming-soon {
  @include card;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $space-2;
  padding: $space-8 $space-6;
  text-align: center;
}

.coming-soon__icon {
  margin-bottom: $space-2;
  color: $color-text-muted;
}

.coming-soon__title {
  font-size: $text-lg;
  font-weight: $font-bold;
}

.coming-soon__message {
  color: $color-text-muted;
  font-size: $text-sm;
}
</style>
