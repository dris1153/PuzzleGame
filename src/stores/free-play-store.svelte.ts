import type { PreparedImage } from '../lib/prepare-uploaded-image'
import { settings } from './settings-store.svelte'

export interface FreePlayChoice {
  /** A campaign level id, or 'upload' for the player's own image. */
  image: string
  /** Wanted size; the setup screen clamps it to what fits the current screen. */
  rows: number
  cols: number
  /** `null` follows the rotation default from Settings. */
  rotation: boolean | null
}

// Module state so the setup survives a round trip to the game screen.
let choice = $state.raw<FreePlayChoice>({ image: 'level-01', rows: 4, cols: 4, rotation: null })
let uploaded = $state.raw<PreparedImage | null>(null)

export const freePlay = {
  get choice(): FreePlayChoice {
    return choice
  },

  get rotation(): boolean {
    return choice.rotation ?? settings.current.rotationDefault
  },

  get uploaded(): PreparedImage | null {
    return uploaded
  },

  choose(patch: Partial<FreePlayChoice>): void {
    choice = { ...choice, ...patch }
  },

  /** Keeps only one uploaded image in memory at a time. */
  setUploaded(image: PreparedImage): void {
    if (uploaded) URL.revokeObjectURL(uploaded.url)
    uploaded = image
    choice = { ...choice, image: 'upload' }
  },
}
