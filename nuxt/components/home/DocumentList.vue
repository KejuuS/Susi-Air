<script setup lang="ts">
import type { DocumentStatus, PilotDocument } from '~/types/api'

const documentsStore = useDocumentsStore()

const badges: Record<DocumentStatus, { tone: 'success' | 'warning' | 'danger'; label: string }> = {
  safe: { tone: 'success', label: 'Valid' },
  soon: { tone: 'warning', label: 'Expires soon' },
  expired: { tone: 'danger', label: 'Expired' },
}

function remainingText({ daysRemaining }: PilotDocument): string {
  const days = (n: number) => `${n} ${n === 1 ? 'day' : 'days'}`
  if (daysRemaining > 0) return `${days(daysRemaining)} left`
  if (daysRemaining === 0) return 'Expires today'
  return `Expired ${days(-daysRemaining)} ago`
}

function retry() {
  devLog('ui', 'Try again clicked: documents')
  documentsStore.load()
}
</script>

<template>
  <section aria-labelledby="documents-title">
    <div class="section-heading">
      <h2 id="documents-title" class="section-title">My Documents</h2>
    </div>

    <BaseAsyncSection
      :status="documentsStore.status"
      :error-message="documentsStore.errorMessage"
      :is-empty="documentsStore.documents?.length === 0"
      empty-message="No documents on file."
      @retry="retry"
    >
      <template #loading>
        <div class="skeleton documents__placeholder" />
      </template>

      <ul class="documents">
        <li v-for="document in documentsStore.documents" :key="document.id" class="documents__item">
          <div class="documents__text">
            <p class="documents__label">{{ document.label }}</p>
            <p class="documents__meta">
              {{ formatDate(document.expiryDate) }} · {{ remainingText(document) }}
            </p>
          </div>
          <BaseStatusBadge v-bind="badges[document.status]" />
        </li>
      </ul>
    </BaseAsyncSection>
  </section>
</template>

<style lang="scss" scoped>
.documents {
  @include card;
  margin: 0;
  padding: 0 $space-4;
  list-style: none;
}

.documents__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: $space-3;
  padding: $space-4 0;

  & + & {
    border-top: 1px solid $color-border;
  }
}

.documents__text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.documents__label {
  font-size: $text-sm;
  font-weight: $font-semibold;
}

.documents__meta {
  color: $color-text-muted;
  font-size: $text-xs;
}

.documents__placeholder {
  height: 320px;
  border-radius: $radius-lg;
}
</style>
