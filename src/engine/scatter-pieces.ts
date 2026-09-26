import { boardToWorld, worldToBoard } from './geometry'
import type { BoardLayout, Piece, Rng } from './types'

function margins(layout: BoardLayout) {
  return { mx: layout.pieceW / 2 + layout.tab, my: layout.pieceH / 2 + layout.tab }
}

/** Random positions for unplaced pieces, each fully inside the viewport. */
export function scatterPieces(
  pieces: Piece[],
  layout: BoardLayout,
  viewW: number,
  viewH: number,
  rng: Rng = Math.random,
): void {
  const { mx, my } = margins(layout)
  for (const piece of pieces) {
    if (piece.placed) continue
    const x = mx + rng() * Math.max(0, viewW - 2 * mx)
    const y = my + rng() * Math.max(0, viewH - 2 * my)
    Object.assign(piece, worldToBoard({ x, y }, layout))
  }
}

/** Pulls unplaced pieces back on screen after the viewport shrinks or changes aspect. */
export function clampPiecesToView(pieces: Piece[], layout: BoardLayout, viewW: number, viewH: number): void {
  const { mx, my } = margins(layout)
  for (const piece of pieces) {
    if (piece.placed) continue
    const c = boardToWorld(piece, layout)
    const x = Math.min(Math.max(c.x, mx), Math.max(mx, viewW - mx))
    const y = Math.min(Math.max(c.y, my), Math.max(my, viewH - my))
    Object.assign(piece, worldToBoard({ x, y }, layout))
  }
}
