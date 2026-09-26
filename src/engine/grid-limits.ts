export const MIN_GRID = 3
export const MAX_GRID = 10

/**
 * Largest grid whose pieces stay at least `minPiecePx` (a comfortable touch target)
 * on a board fitted like `computeBoardLayout` does. Never below MIN_GRID.
 */
export function maxGridFor(
  viewW: number,
  viewH: number,
  imageAspect: number,
  minPiecePx = 44,
  scale = 0.8,
): { maxRows: number; maxCols: number } {
  const fit = scale * Math.min(viewW / imageAspect, viewH)
  const boardW = fit * imageAspect
  const boardH = fit
  const clamp = (n: number) => Math.min(MAX_GRID, Math.max(MIN_GRID, Math.floor(n)))
  return { maxRows: clamp(boardH / minPiecePx), maxCols: clamp(boardW / minPiecePx) }
}
