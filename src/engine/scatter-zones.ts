import type { BoardLayout } from './types'

export interface Rect {
  x: number
  y: number
  w: number
  h: number
}

const GAP = 8

/**
 * Free areas above, below, left and right of the board that can each hold a whole piece
 * (`margin` = piece center to farthest edge). Empty when the board leaves no such room.
 */
export function scatterZones(layout: BoardLayout, viewW: number, viewH: number, margin: { mx: number; my: number }): Rect[] {
  const right = layout.x + layout.width + GAP
  const bottom = layout.y + layout.height + GAP
  const candidates: Rect[] = [
    { x: 0, y: 0, w: viewW, h: layout.y - GAP },
    { x: 0, y: bottom, w: viewW, h: viewH - bottom },
    { x: 0, y: 0, w: layout.x - GAP, h: viewH },
    { x: right, y: 0, w: viewW - right, h: viewH },
  ]
  return candidates.filter((r) => r.w >= 2 * margin.mx && r.h >= 2 * margin.my)
}
