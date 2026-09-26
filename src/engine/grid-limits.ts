import { boardFit, computeBoardLayout } from './board-layout'

export const MIN_GRID = 3
export const MAX_GRID = 10

/**
 * Largest grid whose pieces stay at least `minPiecePx` (a comfortable touch target)
 * on the board the game would lay out for this viewport. Never below MIN_GRID.
 */
export function maxGridFor(
  viewW: number,
  viewH: number,
  imageAspect: number,
  minPiecePx = 44,
): { maxRows: number; maxCols: number } {
  // A collapsed window (or a transient zero-size resize) must not throw from a reactive derivation.
  if (viewW <= 0 || viewH <= 0) return { maxRows: MIN_GRID, maxCols: MIN_GRID }
  const board = computeBoardLayout(viewW, viewH, imageAspect * 1000, 1000, { rows: 1, cols: 1 }, boardFit(viewW, viewH))
  const clamp = (n: number) => Math.min(MAX_GRID, Math.max(MIN_GRID, Math.floor(n)))
  return { maxRows: clamp(board.height / minPiecePx), maxCols: clamp(board.width / minPiecePx) }
}
