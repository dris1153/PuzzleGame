import { boardToWorld, toLocal } from './geometry'
import type { BoardLayout, Piece, Point } from './types'

/**
 * Topmost unplaced piece under `point`. `probe` must keep an identity transform,
 * because paths are tested in piece-local coordinates.
 */
export function pickPiece(
  order: Piece[],
  paths: Path2D[],
  point: Point,
  layout: BoardLayout,
  probe: CanvasRenderingContext2D,
): Piece | null {
  const reach = Math.max(layout.pieceW, layout.pieceH) / 2 + layout.tab
  for (let i = order.length - 1; i >= 0; i--) {
    const piece = order[i]
    if (piece.placed) continue
    const local = toLocal(point, boardToWorld(piece, layout), piece.rotation)
    if (Math.abs(local.x) > reach || Math.abs(local.y) > reach) continue
    if (probe.isPointInPath(paths[piece.id], local.x, local.y)) return piece
  }
  return null
}
