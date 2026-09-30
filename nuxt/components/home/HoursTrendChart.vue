<script setup lang="ts">
import type { ChartPoint, FlightHoursSummary } from '~/types/api'

const props = defineProps<{ summary: FlightHoursSummary }>()

const HEIGHT = 220
const PAD = { top: 24, right: 12, bottom: 34, left: 40 }
const TOOLTIP_WIDTH = 164

const container = ref<HTMLElement | null>(null)
const width = ref(340)
let observer: ResizeObserver | undefined

onMounted(() => {
  observer = new ResizeObserver(([entry]) => {
    if (entry) width.value = Math.round(entry.contentRect.width)
  })
  if (container.value) observer.observe(container.value)
})
onBeforeUnmount(() => observer?.disconnect())

const points = computed(() => props.summary.points)
const todayIndex = computed(() => points.value.findIndex((p) => p.isToday))
const plotWidth = computed(() => width.value - PAD.left - PAD.right)
const plotHeight = HEIGHT - PAD.top - PAD.bottom
const step = computed(() => plotWidth.value / Math.max(points.value.length - 1, 1))

// Axis goes to yMax, or higher if a value is above it.
const tickStep = computed(() => niceStep(props.summary.yMax / 5))
const axisMax = computed(() => {
  const highest = Math.max(...points.value.map((p) => p.value))
  return highest > props.summary.yMax
    ? Math.ceil(highest / tickStep.value) * tickStep.value
    : props.summary.yMax
})
const ticks = computed(() => {
  const values: number[] = []
  for (let v = 0; v <= axisMax.value; v += tickStep.value) values.push(v)
  return values
})

const x = (index: number) => PAD.left + index * step.value
const y = (value: number) => PAD.top + plotHeight * (1 - value / axisMax.value)
const baseline = PAD.top + plotHeight

const coords = computed(() => points.value.map((p, i) => ({ x: x(i), y: y(p.value) })))
const splitAt = computed(() => (todayIndex.value === -1 ? coords.value.length - 1 : todayIndex.value))
const pastLine = computed(() => linePath(coords.value.slice(0, splitAt.value + 1)))
const futureLine = computed(() => linePath(coords.value.slice(splitAt.value)))
const pastArea = computed(() => {
  const past = coords.value.slice(0, splitAt.value + 1)
  if (past.length === 0) return ''
  return `${linePath(past)} L${past[past.length - 1]!.x},${baseline} L${past[0]!.x},${baseline} Z`
})

const today = computed(() => (todayIndex.value === -1 ? null : points.value[todayIndex.value]!))
const rangeCaption = computed(() => {
  const first = points.value[0]
  const last = points.value[points.value.length - 1]
  return first && last ? `${formatShortDate(first.date)} – ${formatDate(last.date)}` : ''
})

// Hover and keyboard read-out.
const activeIndex = ref<number | null>(null)
const active = computed(() => (activeIndex.value === null ? null : points.value[activeIndex.value]!))
const tooltipLeft = computed(() => {
  if (activeIndex.value === null) return 0
  // Beside the crosshair so the point stays visible.
  const pointX = x(activeIndex.value)
  const left = pointX < width.value / 2 ? pointX + 12 : pointX - 12 - TOOLTIP_WIDTH
  return Math.min(Math.max(left, 0), width.value - TOOLTIP_WIDTH)
})

function onPointerMove(event: PointerEvent) {
  const bounds = (event.currentTarget as SVGElement).getBoundingClientRect()
  const index = Math.round((event.clientX - bounds.left - PAD.left) / step.value)
  activeIndex.value = Math.min(Math.max(index, 0), points.value.length - 1)
}

function onKeydown(event: KeyboardEvent) {
  const last = points.value.length - 1
  const current = activeIndex.value ?? Math.max(todayIndex.value, 0)
  const next = { ArrowLeft: current - 1, ArrowRight: current + 1, Home: 0, End: last }[event.key]
  if (next === undefined) return
  event.preventDefault()
  activeIndex.value = Math.min(Math.max(next, 0), last)
}

function noteFor(point: ChartPoint): string | null {
  if (point.overLimit) return `Over the ${formatNumber(props.summary.limit)} hrs limit`
  if (point.isFuture) return 'If no more hours are flown'
  if (point.partialWindow) return 'Window starts before the records'
  return null
}
</script>

<template>
  <div class="chart">
    <div
      ref="container"
      class="chart__frame"
      tabindex="0"
      :aria-label="`Rolling ${summary.windowDays}-day hours, ${rangeCaption}. Use the arrow keys to read each day.`"
      @focus="activeIndex = Math.max(todayIndex, 0)"
      @blur="activeIndex = null"
      @keydown="onKeydown"
    >
      <svg
        :width="width"
        :height="HEIGHT"
        :viewBox="`0 0 ${width} ${HEIGHT}`"
        aria-hidden="true"
        @pointermove="onPointerMove"
        @pointerleave="activeIndex = null"
      >
        <rect
          v-if="today"
          class="chart__today-band"
          :x="x(todayIndex) - step / 2"
          :y="PAD.top"
          :width="step"
          :height="plotHeight"
        />

        <g v-for="tick in ticks" :key="tick">
          <line class="chart__grid" :x1="PAD.left" :x2="width - PAD.right" :y1="y(tick)" :y2="y(tick)" />
          <text class="chart__tick" :x="PAD.left - 8" :y="y(tick)" text-anchor="end" dominant-baseline="middle">
            {{ formatNumber(tick) }}
          </text>
        </g>

        <line class="chart__limit" :x1="PAD.left" :x2="width - PAD.right" :y1="y(summary.limit)" :y2="y(summary.limit)" />
        <text class="chart__limit-label" :x="width - PAD.right" :y="y(summary.limit) - 6" text-anchor="end">
          Limit {{ formatNumber(summary.limit) }}
        </text>

        <path class="chart__area" :d="pastArea" />
        <path class="chart__line" :d="pastLine" />
        <path class="chart__line chart__line--future" :d="futureLine" />

        <line v-if="active" class="chart__crosshair" :x1="x(activeIndex!)" :x2="x(activeIndex!)" :y1="PAD.top" :y2="baseline" />

        <template v-for="(point, i) in points" :key="point.date">
          <circle v-if="point.overLimit" class="chart__dot chart__dot--over" :cx="x(i)" :cy="y(point.value)" r="4" />
        </template>
        <circle v-if="today" class="chart__dot chart__dot--today" :cx="x(todayIndex)" :cy="y(today.value)" r="5" />
        <circle v-if="active && !active.isToday" class="chart__dot chart__dot--active" :cx="x(activeIndex!)" :cy="y(active.value)" r="4" />

        <text v-if="today" class="chart__value" :x="x(todayIndex)" :y="Math.max(y(today.value) - 12, 12)" text-anchor="middle">
          {{ formatHours(today.value) }}
        </text>

        <g v-for="(point, i) in points" :key="`label-${point.date}`">
          <rect v-if="point.isToday" class="chart__today-pill" :x="x(i) - 12" :y="baseline + 8" width="24" height="18" rx="9" />
          <text
            class="chart__day"
            :class="{ 'chart__day--today': point.isToday }"
            :x="x(i)"
            :y="baseline + 17"
            text-anchor="middle"
            dominant-baseline="middle"
          >
            {{ Number(point.date.slice(8)) }}
          </text>
        </g>
      </svg>

      <div v-if="active" class="chart__tooltip" :style="{ left: `${tooltipLeft}px`, width: `${TOOLTIP_WIDTH}px` }" aria-live="polite">
        <strong>{{ formatHours(active.value) }} hrs</strong>
        <span>{{ formatWeekdayDate(active.date) }}{{ active.isToday ? ' · Today' : '' }}</span>
        <span>{{ summary.windowDays }}-day total</span>
        <span v-if="noteFor(active)" class="chart__tooltip-note">{{ noteFor(active) }}</span>
      </div>
    </div>

    <div class="chart__footer">
      <ul class="chart__keys">
        <li><span class="chart__key" aria-hidden="true" />Flown</li>
        <li><span class="chart__key chart__key--future" aria-hidden="true" />After today</li>
        <li><span class="chart__key chart__key--limit" aria-hidden="true" />Limit</li>
      </ul>
      <span class="chart__caption">{{ rangeCaption }}</span>
    </div>

    <details class="chart__table">
      <summary>Show values</summary>
      <table>
        <thead>
          <tr>
            <th scope="col">Date</th>
            <th scope="col">{{ summary.windowDays }}-day total</th>
            <th scope="col">Note</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="point in points" :key="point.date" :class="{ 'chart__row--today': point.isToday }">
            <td>{{ formatWeekdayDate(point.date) }}{{ point.isToday ? ' (today)' : '' }}</td>
            <td>{{ formatHours(point.value) }}</td>
            <td>{{ noteFor(point) ?? '' }}</td>
          </tr>
        </tbody>
      </table>
    </details>
  </div>
</template>

<style lang="scss" scoped>
.chart__frame {
  position: relative;
  border-radius: $radius-md;

  svg {
    display: block;
    overflow: visible;
    touch-action: pan-y;
  }
}

.chart__today-band {
  fill: rgba(14, 33, 56, 0.05);
}

.chart__grid {
  stroke: $color-border;
  stroke-width: 1;
}

.chart__tick,
.chart__day,
.chart__limit-label {
  @include tabular-nums;
  fill: $color-text-muted;
  font-size: 11px;
}

.chart__limit {
  stroke: $color-danger;
  stroke-width: 1.5;
}

.chart__limit-label {
  font-weight: $font-semibold;
}

.chart__area {
  fill: $color-chart;
  fill-opacity: 0.1;
}

.chart__line {
  fill: none;
  stroke: $color-chart;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;

  &--future {
    stroke-dasharray: 4 5;
    stroke-opacity: 0.8;
  }
}

.chart__crosshair {
  stroke: $color-border-strong;
  stroke-width: 1;
}

.chart__dot {
  stroke: $color-surface;
  stroke-width: 2;

  &--today {
    fill: $color-chart;
  }

  &--over {
    fill: $color-danger;
  }

  &--active {
    fill: $color-navy;
  }
}

.chart__value {
  fill: $color-text;
  font-size: 12px;
  font-weight: $font-bold;
  paint-order: stroke;
  stroke: $color-surface;
  stroke-width: 4px;
  stroke-linejoin: round;
}

.chart__today-pill {
  fill: $color-navy;
}

.chart__day--today {
  fill: $color-text-on-dark;
  font-weight: $font-bold;
}

.chart__tooltip {
  position: absolute;
  top: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: $space-2 $space-3;
  border-radius: $radius-sm;
  background: $color-navy;
  color: $color-text-on-dark;
  font-size: $text-xs;
  pointer-events: none;

  strong {
    font-size: $text-md;
  }
}

.chart__tooltip-note {
  color: $color-warning;
}

.chart__footer {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: $space-2;
  margin-top: $space-2;
  color: $color-text-muted;
  font-size: $text-xs;
}

.chart__keys {
  display: flex;
  gap: $space-3;
  margin: 0;
  padding: 0;
  list-style: none;

  li {
    display: flex;
    align-items: center;
    gap: 6px;
  }
}

.chart__key {
  width: 14px;
  height: 0;
  border-top: 2px solid $color-chart;

  &--future {
    border-top-style: dashed;
  }

  &--limit {
    border-top-color: $color-danger;
  }
}

.chart__table {
  margin-top: $space-3;
  font-size: $text-sm;

  summary {
    color: $color-navy;
    font-weight: $font-semibold;
    cursor: pointer;
  }

  table {
    @include tabular-nums;
    width: 100%;
    margin-top: $space-2;
    border-collapse: collapse;
  }

  th,
  td {
    padding: $space-1 $space-2;
    border-bottom: 1px solid $color-border;
    text-align: left;
  }

  th {
    color: $color-text-muted;
    font-size: $text-xs;
    font-weight: $font-semibold;
  }
}

.chart__row--today td {
  font-weight: $font-bold;
}
</style>
