import { expect, it } from 'vitest'
import { boardFit, computeBoardLayout } from './board-layout'
import { MAX_GRID, maxGridFor } from './grid-limits'

it('caps a wide desktop board at 10 × 10', () => {
  expect(maxGridFor(1600, 900, 1.5)).toEqual({ maxRows: 10, maxCols: 10 })
})

it('limits a landscape image on a portrait phone by piece size', () => {
  // Portrait board 338.4 × 225.6 → 225.6 / 44 = 5.1 rows, 338.4 / 44 = 7.7 cols.
  expect(maxGridFor(360, 700, 1.5)).toEqual({ maxRows: 5, maxCols: 7 })
})

it('never goes below 3 × 3, even for an empty viewport', () => {
  expect(maxGridFor(120, 120, 1)).toEqual({ maxRows: 3, maxCols: 3 })
  expect(maxGridFor(-22, 0, 1.5)).toEqual({ maxRows: 3, maxCols: 3 })
})

it.each([
  [360, 700, 1.5],
  [700, 360, 1.5],
  [1024, 768, 4 / 3],
  [800, 600, 0.75],
])('matches the real board: pieces ≥ 44 px at the limit, < 44 px one step beyond (%i×%i, aspect %f)', (w, h, aspect) => {
  const { maxRows, maxCols } = maxGridFor(w, h, aspect)
  const piece = (rows: number, cols: number) => computeBoardLayout(w, h, aspect * 1000, 1000, { rows, cols }, boardFit(w, h))
  const atLimit = piece(maxRows, maxCols)
  expect(atLimit.pieceW).toBeGreaterThanOrEqual(44)
  expect(atLimit.pieceH).toBeGreaterThanOrEqual(44)
  if (maxCols < MAX_GRID) expect(piece(maxRows, maxCols + 1).pieceW).toBeLessThan(44)
  if (maxRows < MAX_GRID) expect(piece(maxRows + 1, maxCols).pieceH).toBeLessThan(44)
})
