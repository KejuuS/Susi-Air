/** Rounds to 1 decimal. Use it only when building a response, not while adding up. */
export function round1(value: number): number {
  return Math.round(value * 10) / 10;
}
