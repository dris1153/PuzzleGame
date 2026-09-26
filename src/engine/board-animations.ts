import type { Piece } from './types'

export const ROTATE_MS = 150
export const HINT_MS = 2000
const QUARTER = Math.PI / 2

export interface Animations {
  /** Pieces mid-rotation: angle they started from (radians) and start time. */
  rotating: Map<number, { from: number; start: number }>
  /** `pausedLeftMs` is set while the game is paused: the hint's clock stops so it is not used up unseen. */
  hint: { pieceId: number; until: number; pausedLeftMs?: number } | null
}

export function createAnimations(): Animations {
  return { rotating: new Map(), hint: null }
}

const easeOut = (t: number) => 1 - (1 - t) ** 3

/** Current drawing angle; tweens a quarter turn forward from `from`. Drops the tween once finished. */
export function rotationAngle(piece: Piece, anims: Animations, now: number): number {
  const tween = anims.rotating.get(piece.id)
  if (!tween) return piece.rotation * QUARTER
  const t = (now - tween.start) / ROTATE_MS
  if (t >= 1) {
    anims.rotating.delete(piece.id)
    return piece.rotation * QUARTER
  }
  return tween.from + QUARTER * easeOut(Math.max(0, t))
}

/** Pulsing outline opacity for the hinted piece, or null when no hint is showing. Clears an expired hint. */
export function hintAlpha(anims: Animations, now: number): number | null {
  if (!anims.hint) return null
  if (anims.hint.pausedLeftMs === undefined && now >= anims.hint.until) {
    anims.hint = null
    return null
  }
  return 0.55 + 0.45 * Math.sin(now / 120)
}

export function setHintPaused(anims: Animations, paused: boolean, now: number): void {
  const hint = anims.hint
  if (!hint) return
  if (paused) hint.pausedLeftMs = Math.max(0, hint.until - now)
  else if (hint.pausedLeftMs !== undefined) {
    hint.until = now + hint.pausedLeftMs
    hint.pausedLeftMs = undefined
  }
}

/** A paused hint does not need frames: the board is covered and its clock is stopped. */
export function isAnimating(anims: Animations): boolean {
  return anims.rotating.size > 0 || (anims.hint !== null && anims.hint.pausedLeftMs === undefined)
}
