import { expect, it } from 'vitest'
import { formatTime } from './format-time'

it.each([
  [0, '0:00'],
  [999, '0:00'],
  [61_500, '1:01'],
  [3_599_999, '59:59'],
  [3_600_000, '1:00:00'],
  [3_725_000, '1:02:05'],
  [-50, '0:00'],
])('formatTime(%i) = %s', (ms, text) => {
  expect(formatTime(ms)).toBe(text)
})
