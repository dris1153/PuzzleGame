import type { GameConfig } from '../data/game-config'
import type { SessionResult } from '../engine/game-session'
import type { Stars } from '../engine/scoring'
import { createPersistedState } from '../lib/persisted-state.svelte'
import { applyGameEnd, applyGameStart, applyWin } from './progress-reducer'
import { defaultProgress, isProgressV1, type ProgressV1 } from './progress-schema'

const store = createPersistedState('jigsaw.progress', isProgressV1, defaultProgress)

export const progress = {
  get current(): ProgressV1 {
    return store.current
  },

  /** Returns true when this run set a new best time. */
  recordWin(config: GameConfig, result: SessionResult, stars: Stars): boolean {
    let isNewBest = false
    store.update((s) => {
      const r = applyWin(s, config, result, stars)
      isNewBest = r.isNewBest
      return r.state
    })
    return isNewBest
  },

  recordGameStart(): void {
    store.update(applyGameStart)
  },

  recordGameEnd(playedMs: number, piecesPlaced: number, completed: boolean): void {
    store.update((s) => applyGameEnd(s, { playedMs, piecesPlaced, completed }))
  },

  reset(): void {
    store.update(defaultProgress)
  },
}
