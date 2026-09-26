import { describe, expect, it } from 'vitest'
import type { GameConfig } from '../data/game-config'
import { freePlayKey } from '../data/game-config'
import { applyGameEnd, applyGameStart, applyWin } from './progress-reducer'
import { defaultProgress, isProgressV1 } from './progress-schema'

const level: GameConfig = { mode: 'campaign', levelId: 'level-01', imageSrc: '', rows: 3, cols: 3, rotation: false, parSec: 72 }
const free: GameConfig = { mode: 'free', imageSrc: '', rows: 4, cols: 5, rotation: true, parSec: 240 }
const result = (timeMs: number) => ({ timeMs, moves: 10, hints: 0, pieces: 9 })

describe('applyWin', () => {
  it('records the first campaign clear as a new best', () => {
    const { state, isNewBest } = applyWin(defaultProgress(), level, result(50_000), 2)
    expect(isNewBest).toBe(true)
    expect(state.levels['level-01']).toEqual({ bestMs: 50_000, stars: 2 })
  })

  it('keeps the best time and the most stars independently', () => {
    let s = applyWin(defaultProgress(), level, result(50_000), 3).state
    const slower = applyWin(s, level, result(80_000), 1)
    expect(slower.isNewBest).toBe(false)
    expect(slower.state.levels['level-01']).toEqual({ bestMs: 50_000, stars: 3 })

    s = applyWin(defaultProgress(), level, result(90_000), 1).state
    const faster = applyWin(s, level, result(60_000), 2)
    expect(faster.isNewBest).toBe(true)
    expect(faster.state.levels['level-01']).toEqual({ bestMs: 60_000, stars: 2 })
  })

  it('tracks free play per grid and rotation', () => {
    const first = applyWin(defaultProgress(), free, result(100_000), 1)
    expect(first.state.freePlayBest).toEqual({ '4x5-r': 100_000 })
    const slower = applyWin(first.state, free, result(120_000), 1)
    expect(slower.isNewBest).toBe(false)
    expect(slower.state.freePlayBest['4x5-r']).toBe(100_000)
    const other = applyWin(first.state, { ...free, rotation: false }, result(120_000), 1)
    expect(other.isNewBest).toBe(true)
  })

  it('does not mutate the input state', () => {
    const initial = defaultProgress()
    applyWin(initial, level, result(1000), 3)
    expect(initial).toEqual(defaultProgress())
  })
})

describe('stats', () => {
  it('counts starts, completions, time and pieces', () => {
    let s = applyGameStart(defaultProgress())
    s = applyGameEnd(s, { playedMs: 30_000, piecesPlaced: 4, completed: false })
    s = applyGameStart(s)
    s = applyGameEnd(s, { playedMs: 60_000, piecesPlaced: 9, completed: true })
    expect(s.stats).toEqual({ gamesStarted: 2, gamesCompleted: 1, totalPlayMs: 90_000, piecesPlaced: 13 })
  })
})

describe('isProgressV1', () => {
  it('accepts valid data and rejects malformed data', () => {
    const valid = applyWin(defaultProgress(), level, result(1000), 3).state
    expect(isProgressV1(valid)).toBe(true)
    expect(isProgressV1(null)).toBe(false)
    expect(isProgressV1({ ...valid, version: 2 })).toBe(false)
    expect(isProgressV1({ ...valid, levels: { x: { bestMs: 1, stars: 4 } } })).toBe(false)
    expect(isProgressV1({ ...valid, freePlayBest: { k: -1 } })).toBe(false)
    expect(isProgressV1({ ...valid, stats: { ...valid.stats, totalPlayMs: 'lots' } })).toBe(false)
  })

  it('rejects NaN and Infinity in numeric fields', () => {
    const valid = applyWin(defaultProgress(), level, result(1000), 3).state
    expect(isProgressV1({ ...valid, freePlayBest: { k: NaN } })).toBe(false)
    expect(isProgressV1({ ...valid, freePlayBest: { k: Infinity } })).toBe(false)
    expect(isProgressV1({ ...valid, stats: { ...valid.stats, totalPlayMs: NaN } })).toBe(false)
    expect(isProgressV1({ ...valid, stats: { ...valid.stats, gamesStarted: Infinity } })).toBe(false)
  })

  it('rejects arrays where objects are expected', () => {
    const valid = applyWin(defaultProgress(), level, result(1000), 3).state
    expect(isProgressV1({ ...valid, levels: [] })).toBe(false)
    expect(isProgressV1({ ...valid, freePlayBest: [] })).toBe(false)
    expect(isProgressV1({ ...valid, stats: [] })).toBe(false)
  })

  it('rejects level records with invalid stars', () => {
    const valid = applyWin(defaultProgress(), level, result(1000), 3).state
    expect(isProgressV1({ ...valid, levels: { x: { bestMs: 1, stars: 0 } } })).toBe(false)
    expect(isProgressV1({ ...valid, levels: { x: { bestMs: 1, stars: 2.5 } } })).toBe(false)
  })

  it('accepts float times and stats (valid JSON numbers)', () => {
    const valid = applyWin(defaultProgress(), level, result(1000), 3).state
    expect(isProgressV1({ ...valid, freePlayBest: { k: 1000.5 } })).toBe(true)
    expect(isProgressV1({ ...valid, levels: { x: { bestMs: 1500.7, stars: 3 } } })).toBe(true)
    expect(isProgressV1({ ...valid, stats: { ...valid.stats, totalPlayMs: 123.45 } })).toBe(true)
  })
})

describe('freePlayKey', () => {
  it('formats keys correctly without rotation', () => {
    expect(freePlayKey({ rows: 3, cols: 3, rotation: false })).toBe('3x3-n')
    expect(freePlayKey({ rows: 4, cols: 5, rotation: false })).toBe('4x5-n')
  })

  it('formats keys correctly with rotation', () => {
    expect(freePlayKey({ rows: 3, cols: 3, rotation: true })).toBe('3x3-r')
    expect(freePlayKey({ rows: 2, cols: 8, rotation: true })).toBe('2x8-r')
  })

  it('distinguishes between rotation variants', () => {
    const withRot = freePlayKey({ rows: 4, cols: 4, rotation: true })
    const noRot = freePlayKey({ rows: 4, cols: 4, rotation: false })
    expect(withRot).not.toBe(noRot)
    expect(withRot).toBe('4x4-r')
    expect(noRot).toBe('4x4-n')
  })
})
