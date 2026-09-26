import type { GameConfig } from '../data/game-config'

export type Screen =
  | { name: 'home' }
  | { name: 'level-select' }
  | { name: 'free-play' }
  | { name: 'game'; config: GameConfig; returnTo: 'level-select' | 'free-play' }
  | { name: 'stats' }
  | { name: 'settings' }

let current = $state.raw<Screen>({ name: 'home' })

export const screen = {
  get current(): Screen {
    return current
  },

  go(next: Screen): void {
    current = next
  },
}
