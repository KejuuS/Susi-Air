/** 9 -> 10, 240 -> 250: a clean step for axis ticks. */
export function niceStep(rough: number): number {
  const power = 10 ** Math.floor(Math.log10(rough))
  const fraction = rough / power
  if (fraction <= 1) return power
  if (fraction <= 2) return 2 * power
  if (fraction <= 2.5) return 2.5 * power
  if (fraction <= 5) return 5 * power
  return 10 * power
}

export function linePath(points: { x: number; y: number }[]): string {
  return points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
}
