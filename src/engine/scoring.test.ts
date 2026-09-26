import { describe, expect, it } from 'vitest'
import { defaultParSec } from '../data/game-config'
import { computeStars } from './scoring'

// 9 pieces, par 72 s → 3★ needs ≤ 72 000 ms, ≤ 14 moves, 0 hints; 2★ needs ≤ 144 000 ms.
const base = { timeMs: 72_000, moves: 14, hints: 0, pieces: 9, parSec: 72 }

describe('computeStars', () => {
  it('gives 3 stars exactly at the limits', () => {
    expect(computeStars(base)).toBe(3)
  })

  it('drops to 2 stars when any 3-star condition fails', () => {
    expect(computeStars({ ...base, timeMs: 72_001 })).toBe(2)
    expect(computeStars({ ...base, moves: 15 })).toBe(2)
    expect(computeStars({ ...base, hints: 1 })).toBe(2)
  })

  it('gives 2 stars up to twice the par time, then 1', () => {
    expect(computeStars({ ...base, timeMs: 144_000, hints: 3 })).toBe(2)
    expect(computeStars({ ...base, timeMs: 144_001 })).toBe(1)
  })
})

describe('defaultParSec', () => {
  it('calculates par time without rotation', () => {
    expect(defaultParSec(3, 3, false)).toBe(72)
    expect(defaultParSec(4, 5, false)).toBe(160)
    expect(defaultParSec(1, 1, false)).toBe(8)
  })

  it('calculates par time with rotation', () => {
    expect(defaultParSec(3, 3, true)).toBe(108)
    expect(defaultParSec(4, 5, true)).toBe(240)
    expect(defaultParSec(2, 4, true)).toBe(96)
  })
})
