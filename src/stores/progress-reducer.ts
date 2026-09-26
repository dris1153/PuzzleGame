import { freePlayKey, type GameConfig } from '../data/game-config'
import type { SessionResult } from '../engine/game-session'
import type { Stars } from '../engine/scoring'
import type { ProgressV1 } from './progress-schema'

/** Best time only improves and stars only increase. First completion counts as a new best. */
export function applyWin(
  state: ProgressV1,
  config: GameConfig,
  result: SessionResult,
  stars: Stars,
): { state: ProgressV1; isNewBest: boolean } {
  if (config.mode === 'campaign') {
    const prev = state.levels[config.levelId]
    const isNewBest = !prev || result.timeMs < prev.bestMs
    const record = {
      bestMs: prev ? Math.min(prev.bestMs, result.timeMs) : result.timeMs,
      stars: prev ? (Math.max(prev.stars, stars) as Stars) : stars,
    }
    return { state: { ...state, levels: { ...state.levels, [config.levelId]: record } }, isNewBest }
  }
  const key = freePlayKey(config)
  const prev = state.freePlayBest[key]
  const isNewBest = prev === undefined || result.timeMs < prev
  const best = isNewBest ? result.timeMs : prev
  return { state: { ...state, freePlayBest: { ...state.freePlayBest, [key]: best } }, isNewBest }
}

export function applyGameStart(state: ProgressV1): ProgressV1 {
  return { ...state, stats: { ...state.stats, gamesStarted: state.stats.gamesStarted + 1 } }
}

export function applyGameEnd(
  state: ProgressV1,
  end: { playedMs: number; piecesPlaced: number; completed: boolean },
): ProgressV1 {
  const s = state.stats
  return {
    ...state,
    stats: {
      gamesStarted: s.gamesStarted,
      gamesCompleted: s.gamesCompleted + (end.completed ? 1 : 0),
      totalPlayMs: s.totalPlayMs + end.playedMs,
      piecesPlaced: s.piecesPlaced + end.piecesPlaced,
    },
  }
}
