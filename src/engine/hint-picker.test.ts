import { expect, it } from 'vitest'
import { pickHintPiece } from './hint-picker'
import { createPieces } from './piece-generator'

it('picks among unplaced pieces only, driven by the rng', () => {
  const pieces = createPieces({ rows: 2, cols: 2 })
  pieces[0].placed = true
  pieces[2].placed = true
  expect(pickHintPiece(pieces, () => 0)?.id).toBe(1)
  expect(pickHintPiece(pieces, () => 0.999)?.id).toBe(3)
})

it('returns null when every piece is placed', () => {
  const pieces = createPieces({ rows: 2, cols: 2 })
  for (const p of pieces) p.placed = true
  expect(pickHintPiece(pieces)).toBeNull()
})

it('returns the only unplaced piece regardless of rng value', () => {
  const pieces = createPieces({ rows: 2, cols: 2 })
  pieces[0].placed = true
  pieces[1].placed = true
  pieces[3].placed = true
  // Only piece[2] is unplaced
  expect(pickHintPiece(pieces, () => 0)).toEqual(pieces[2])
  expect(pickHintPiece(pieces, () => 0.5)).toEqual(pieces[2])
  expect(pickHintPiece(pieces, () => 0.999)).toEqual(pieces[2])
})
