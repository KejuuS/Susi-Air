<script setup lang="ts">
import { BookOpen, CalendarDays, House, Menu } from 'lucide-vue-next'

const items = [
  { to: '/', label: 'Home', icon: House },
  { to: '/schedule', label: 'Schedule', icon: CalendarDays },
  { to: '/logbook', label: 'Logbook', icon: BookOpen },
  { to: '/more', label: 'More', icon: Menu },
]

const route = useRoute()

// Schedule stays active on its detail pages too.
function isActive(to: string): boolean {
  return to === '/' ? route.path === '/' : route.path.startsWith(to)
}
</script>

<template>
  <nav class="bottom-nav" aria-label="Main">
    <ul class="bottom-nav__list">
      <li v-for="item in items" :key="item.to">
        <NuxtLink
          :to="item.to"
          class="bottom-nav__link"
          :class="{ 'bottom-nav__link--active': isActive(item.to) }"
          :aria-current="isActive(item.to) ? 'page' : undefined"
        >
          <component :is="item.icon" :size="22" aria-hidden="true" />
          <span>{{ item.label }}</span>
        </NuxtLink>
      </li>
    </ul>
  </nav>
</template>

<style lang="scss" scoped>
.bottom-nav {
  position: fixed;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 10;
  border-top: 1px solid $color-border;
  background: $color-surface;
  padding-bottom: env(safe-area-inset-bottom);
}

.bottom-nav__list {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  max-width: $container-max-width;
  margin: 0 auto;
  padding: 0;
  list-style: none;
}

.bottom-nav__link {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  height: $bottom-nav-height;
  color: $color-text-muted;
  font-size: $text-xs;
  font-weight: $font-semibold;
  text-decoration: none;

  &--active {
    color: $color-navy;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      width: 28px;
      height: 3px;
      border-radius: 0 0 3px 3px;
      background: $color-red;
    }
  }
}
</style>
