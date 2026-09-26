import { boardToWorld, worldToBoard } from './geometry'
import { scatterZones, type Rect } from './scatter-zones'
import type { BoardLayout, Piece, Rng, Rotation } from './types'

/** Distance from a piece center to its farthest edge; rotatable pieces may stand either way. */
function margins(layout: BoardLayout, rotation: boolean) {
  if (rotation) {
    const m = Math.max(layout.pieceW, layout.pieceH) / 2 + layout.tab
    return { mx: m, my: m }
  }
  return { mx: layout.pieceW / 2 + layout.tab, my: layout.pieceH / 2 + layout.tab }
}

/** Zone chosen with probability proportional to its area, so pieces spread evenly. */
function pickZone(zones: Rect[], rng: Rng): Rect {
  const total = zones.reduce((sum, z) => sum + z.w * z.h, 0)
  let r = rng() * total
  for (const z of zones) {
    r -= z.w * z.h
    if (r < 0) return z
  }
  return zones[zones.length - 1]
}

/**
 * Random positions (and quarter turns when `rotation`) for unplaced pieces, fully inside the viewport.
 * Pieces go around the board when there is room; otherwise anywhere, overlapping the board.
 */
export function scatterPieces(
  pieces: Piece[],
  layout: BoardLayout,
  viewW: number,
  viewH: number,
  rng: Rng = Math.random,
  rotation = false,
  /** False keeps each piece's current quarter turn (re-scatter after an orientation change). */
  turnPieces = rotation,
): void {
  const { mx, my } = margins(layout, rotation)
  const zones = scatterZones(layout, viewW, viewH, { mx, my })
  const everywhere: Rect = { x: 0, y: 0, w: viewW, h: viewH }
  for (const piece of pieces) {
    if (piece.placed) continue
    if (turnPieces) piece.rotation = Math.floor(rng() * 4) as Rotation
    const zone = zones.length ? pickZone(zones, rng) : everywhere
    const x = zone.x + mx + rng() * Math.max(0, zone.w - 2 * mx)
    const y = zone.y + my + rng() * Math.max(0, zone.h - 2 * my)
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
