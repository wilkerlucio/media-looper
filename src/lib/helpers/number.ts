export function inRange(n: number, min: number, max: number) {
  return Math.max(Math.min(n, max), min)
}
