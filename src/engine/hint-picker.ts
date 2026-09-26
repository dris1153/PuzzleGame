import type { Piece, Rng } from './types'

export function pickHintPiece(pieces: Piece[], rng: Rng = Math.random): Piece | null {
  const open = pieces.filter((p) => !p.placed)
  return open.length ? open[Math.floor(rng() * open.length)] : null
}
