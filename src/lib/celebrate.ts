import { prefersReducedMotion } from './motion'

const COLORS = ['#ffc93c', '#ff8a6b', '#6ee7b7', '#b69cff', '#7dd3fc']

/** Confetti bursts for a win; loaded on demand so it stays out of the main bundle. */
export async function celebrate(): Promise<void> {
  if (prefersReducedMotion()) return
  try {
    const { default: confetti } = await import('canvas-confetti')
    confetti({ particleCount: 90, spread: 75, origin: { y: 0.65 }, colors: COLORS, disableForReducedMotion: true })
    setTimeout(() => confetti({ particleCount: 50, angle: 60, spread: 60, origin: { x: 0, y: 0.7 }, colors: COLORS }), 220)
    setTimeout(() => confetti({ particleCount: 50, angle: 120, spread: 60, origin: { x: 1, y: 0.7 }, colors: COLORS }), 380)
  } catch {
    // Decoration only.
  }
}
