<script setup lang="ts">
import { Eye, EyeOff } from 'lucide-vue-next'

const props = withDefaults(
  defineProps<{
    label: string
    type?: 'text' | 'password'
    autocomplete?: string
    invalid?: boolean
  }>(),
  { type: 'text', autocomplete: undefined, invalid: false },
)

const model = defineModel<string>({ required: true })

const id = useId()
const isRevealed = ref(false)
const inputType = computed(() => (props.type === 'password' && !isRevealed.value ? 'password' : 'text'))

function toggleReveal() {
  isRevealed.value = !isRevealed.value
  devLog('ui', isRevealed.value ? 'Password shown' : 'Password hidden')
}
</script>

<template>
  <div class="field">
    <label :for="id" class="field__label">{{ label }}</label>
    <div class="field__control" :class="{ 'field__control--invalid': invalid }">
      <input
        :id="id"
        v-model="model"
        :type="inputType"
        :autocomplete="autocomplete"
        :aria-invalid="invalid || undefined"
        class="field__input"
        autocapitalize="none"
        spellcheck="false"
      >
      <button
        v-if="type === 'password'"
        type="button"
        class="field__toggle"
        :aria-label="isRevealed ? 'Hide password' : 'Show password'"
        :aria-pressed="isRevealed"
        @click="toggleReveal"
      >
        <EyeOff v-if="isRevealed" :size="20" aria-hidden="true" />
        <Eye v-else :size="20" aria-hidden="true" />
      </button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.field {
  display: flex;
  flex-direction: column;
  gap: $space-2;
}

.field__label {
  font-size: $text-sm;
  font-weight: $font-semibold;
}

.field__control {
  display: flex;
  align-items: center;
  min-height: 52px;
  border: 1px solid $color-border-strong;
  border-radius: $radius-md;
  background: $color-surface;

  &:focus-within {
    border-color: $color-navy;
    box-shadow: 0 0 0 1px $color-navy;
  }

  &--invalid,
  &--invalid:focus-within {
    border-color: $color-danger;
    box-shadow: 0 0 0 1px $color-danger;
  }
}

.field__input {
  flex: 1;
  min-width: 0;
  height: 50px;
  padding: 0 $space-4;
  border: 0;
  border-radius: $radius-md;
  background: transparent;
  // Prevents iOS zoom on focus.
  font-size: $text-md;

  &:focus-visible {
    outline: none;
  }
}

.field__toggle {
  display: grid;
  place-items: center;
  width: 48px;
  height: 48px;
  margin-right: 2px;
  border: 0;
  border-radius: $radius-md;
  background: transparent;
  color: $color-text-muted;
}
</style>
