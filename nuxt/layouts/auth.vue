<template>
  <div class="auth-layout">
    <main class="auth-layout__main">
      <slot />
    </main>
  </div>
</template>

<style lang="scss" scoped>
.auth-layout {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100dvh;
  padding: $space-6 $gutter;
  background: $color-surface;
}

.auth-layout__main {
  width: 100%;
  max-width: 400px;
}
</style>
