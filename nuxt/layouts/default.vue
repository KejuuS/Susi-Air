<template>
  <div class="layout">
    <main class="layout__main">
      <slot />
    </main>
  </div>
</template>

<style lang="scss" scoped>
.layout {
  min-height: 100dvh;
}

.layout__main {
  max-width: $container-max-width;
  margin: 0 auto;
  padding: $space-5 $gutter;
}
</style>
