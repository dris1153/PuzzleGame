import { boardToWorld, worldToBoard } from './geometry'
import type { BoardLayout, Piece, Rng, Rotation } from './types'

/** Distance from a piece center to its farthest edge; rotatable pieces may stand either way. */
function margins(layout: BoardLayout, rotation: boolean) {
  if (rotation) {
    const m = Math.max(layout.pieceW, layout.pieceH) / 2 + layout.tab
    return { mx: m, my: m }
  }
  return { mx: layout.pieceW / 2 + layout.tab, my: layout.pieceH / 2 + layout.tab }
}

/** Random positions (and quarter turns when `rotation`) for unplaced pieces, each fully inside the viewport. */
export function scatterPieces(
  pieces: Piece[],
  layout: BoardLayout,
  viewW: number,
  viewH: number,
  rng: Rng = Math.random,
  rotation = false,
): void {
  const { mx, my } = margins(layout, rotation)
  for (const piece of pieces) {
    if (piece.placed) continue
    piece.rotation = rotation ? (Math.floor(rng() * 4) as Rotation) : 0
    const x = mx + rng() * Math.max(0, viewW - 2 * mx)
    const y = my + rng() * Math.max(0, viewH - 2 * my)
    Object.assign(piece, worldToBoard({ x, y }, layout))
  }
}

/** Pulls unplaced pieces back on screen after the viewport shrinks or changes aspect. */
export function clampPiecesToView(
  pieces: Piece[],
  layout: BoardLayout,
  viewW: number,
  viewH: number,
  rotation = false,
): void {
  const { mx, my } = margins(layout, rotation)
  for (const piece of pieces) {
    if (piece.placed) continue
    const c = boardToWorld(piece, layout)
    const x = Math.min(Math.max(c.x, mx), Math.max(mx, viewW - mx))
    const y = Math.min(Math.max(c.y, my), Math.max(my, viewH - my))
    Object.assign(piece, worldToBoard({ x, y }, layout))
  }
}
