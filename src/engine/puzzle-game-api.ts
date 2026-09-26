import type { Rng } from './types'

export interface PuzzleGameOptions {
  canvas: HTMLCanvasElement
  image: HTMLImageElement
  rows: number
  cols: number
  /** Pieces start turned by random quarter turns; a tap turns a piece 90°. */
  rotation?: boolean
  ghost?: boolean
  /** Skips the snap pop and rotation tween. */
  reducedMotion?: boolean
  rng?: Rng
  onPickup?(): void
  /** A drop after dragging more than a few pixels. */
  onMove?(snapped: boolean): void
  onRotate?(): void
  onPiecePlaced?(placed: number, total: number): void
  onComplete?(): void
}

export interface PuzzleGame {
  /** Paused games ignore input; a drag in progress stays where it is (counted as a move, never snapped). */
  setPaused(paused: boolean): void
  setGhostVisible(visible: boolean): void
  /** Highlights a random unplaced piece and its slot; false when none is left. */
  showHint(): boolean
  destroy(): void
}
