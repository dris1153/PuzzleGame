import type { Stars } from '../engine/scoring'

export interface LevelRecord {
  bestMs: number
  stars: Stars
}

export interface PlayStats {
  gamesStarted: number
  gamesCompleted: number
  totalPlayMs: number
  piecesPlaced: number
}

export interface ProgressV1 {
  version: 1
  levels: Record<string, LevelRecord>
  /** Keyed by `freePlayKey()`. */
  freePlayBest: Record<string, number>
  stats: PlayStats
}

export function defaultProgress(): ProgressV1 {
  return {
    version: 1,
    levels: {},
    freePlayBest: {},
    stats: { gamesStarted: 0, gamesCompleted: 0, totalPlayMs: 0, piecesPlaced: 0 },
  }
}

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v)
const isCount = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v) && v >= 0

function isLevelRecord(v: unknown): v is LevelRecord {
  return isRecord(v) && isCount(v.bestMs) && (v.stars === 1 || v.stars === 2 || v.stars === 3)
}

/** Stored data is untrusted (other versions, manual edits): validate every field before use. */
export function isProgressV1(v: unknown): v is ProgressV1 {
  if (!isRecord(v) || v.version !== 1) return false
  const { levels, freePlayBest, stats } = v
  return (
    isRecord(levels) &&
    Object.values(levels).every(isLevelRecord) &&
    isRecord(freePlayBest) &&
    Object.values(freePlayBest).every(isCount) &&
    isRecord(stats) &&
    isCount(stats.gamesStarted) &&
    isCount(stats.gamesCompleted) &&
    isCount(stats.totalPlayMs) &&
    isCount(stats.piecesPlaced)
  )
}
