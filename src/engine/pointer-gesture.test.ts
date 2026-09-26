import { expect, it } from 'vitest'
import { classifyRelease, DRAG_THRESHOLD_PX, TAP_MAX_DURATION_MS } from './pointer-gesture'

it.each([
  [0, 0, 'tap'],
  [DRAG_THRESHOLD_PX, TAP_MAX_DURATION_MS - 1, 'tap'],
  [DRAG_THRESHOLD_PX + 0.1, 50, 'drag'],
  [0, TAP_MAX_DURATION_MS, 'drag'],
])('release after %f px / %i ms is a %s', (distance, duration, kind) => {
  expect(classifyRelease(distance, duration)).toBe(kind)
})
