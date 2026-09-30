<script setup lang="ts">
const pilot = usePilotStore()

// The greeting follows the pilot's local clock, not the app's fixed "today".
const greeting = greetingFor(new Date().getHours())

const avatarFailed = ref(false)
const initials = computed(() =>
  (pilot.profile?.name ?? '')
    .split(' ')
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase(),
)

// Keep showing the last profile while it refreshes.
const sectionStatus = computed(() => (pilot.profile ? 'success' : pilot.status))

function retry() {
  devLog('ui', 'Try again clicked: pilot profile')
  pilot.load()
}
</script>

<template>
  <BaseAsyncSection
    :status="sectionStatus"
    :error-message="pilot.errorMessage"
    @retry="retry"
  >
    <template #loading>
      <div class="home-header">
        <div class="home-header__text">
          <div class="skeleton" style="width: 110px; height: 14px" />
          <div class="skeleton" style="width: 170px; height: 26px" />
          <div class="skeleton" style="width: 190px; height: 14px" />
        </div>
        <div class="skeleton home-header__avatar" />
      </div>
    </template>

    <header v-if="pilot.profile" class="home-header">
      <div class="home-header__text">
        <p class="home-header__greeting">{{ greeting }},</p>
        <h1 class="home-header__name">{{ pilot.profile.name }}</h1>
        <p class="home-header__hours">
          Total flight hours
          <strong>{{ formatHours(pilot.profile.totalFlightHours) }}</strong>
        </p>
      </div>
      <img
        v-if="!avatarFailed"
        :src="pilot.profile.avatarUrl"
        alt=""
        class="home-header__avatar"
        width="56"
        height="56"
        @error="avatarFailed = true"
      >
      <div v-else class="home-header__avatar home-header__avatar--fallback" aria-hidden="true">
        {{ initials }}
      </div>
    </header>
  </BaseAsyncSection>
</template>

<style lang="scss" scoped>
.home-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: $space-4;
}

.home-header__text {
  display: flex;
  flex-direction: column;
  gap: $space-1;
  min-width: 0;
}

.home-header__greeting {
  color: $color-text-muted;
  font-size: $text-sm;
  font-weight: $font-medium;
}

.home-header__name {
  font-size: $text-xl;
  font-weight: $font-extrabold;
  line-height: 1.2;
}

.home-header__hours {
  color: $color-text-muted;
  font-size: $text-sm;

  strong {
    margin-left: $space-1;
    color: $color-text;
    font-weight: $font-extrabold;
  }
}

.home-header__avatar {
  flex-shrink: 0;
  width: 56px;
  height: 56px;
  border-radius: 50%;
}

.home-header__avatar--fallback {
  display: grid;
  place-items: center;
  background: $color-navy;
  color: $color-text-on-dark;
  font-weight: $font-bold;
}
</style>
