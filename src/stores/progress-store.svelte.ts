import type { GameConfig } from '../data/game-config'
import type { SessionResult } from '../engine/game-session'
import type { Stars } from '../engine/scoring'
import { readJson, writeJson } from '../lib/storage'
import { applyGameEnd, applyGameStart, applyWin } from './progress-reducer'
import { defaultProgress, isProgressV1, type ProgressV1 } from './progress-schema'

const KEY = 'jigsaw.progress'

const load = (fallback: ProgressV1) => readJson(KEY, isProgressV1, fallback)

let state = $state.raw<ProgressV1>(load(defaultProgress()))

// Re-read before every write: another tab may have saved since this one loaded.
function update(mutate: (s: ProgressV1) => ProgressV1) {
  state = mutate(load(state))
  writeJson(KEY, state)
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === KEY) state = load(state)
  })
}

export const progress = {
  get current(): ProgressV1 {
    return state
  },

  /** Returns true when this run set a new best time. */
  recordWin(config: GameConfig, result: SessionResult, stars: Stars): boolean {
    let isNewBest = false
    update((s) => {
      const r = applyWin(s, config, result, stars)
      isNewBest = r.isNewBest
      return r.state
    })
    return isNewBest
  },

  recordGameStart(): void {
    update(applyGameStart)
  },

  recordGameEnd(playedMs: number, piecesPlaced: number, completed: boolean): void {
    update((s) => applyGameEnd(s, { playedMs, piecesPlaced, completed }))
  },
}
