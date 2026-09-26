import type { BoardLayout, BoardPoint, Grid, Piece, Point, Rotation } from './types'

export function correctCenter(cell: { row: number; col: number }, grid: Grid): BoardPoint {
  return { u: (cell.col + 0.5) / grid.cols, v: (cell.row + 0.5) / grid.rows }
}

export function boardToWorld(p: BoardPoint, layout: BoardLayout): Point {
  return { x: layout.x + p.u * layout.width, y: layout.y + p.v * layout.height }
}

export function worldToBoard(p: Point, layout: BoardLayout): BoardPoint {
  return { u: (p.x - layout.x) / layout.width, v: (p.y - layout.y) / layout.height }
}

export function distance(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

/** Inverse of canvas `translate(center) + rotate(rotation * 90°)`. */
export function toLocal(point: Point, center: Point, rotation: Rotation): Point {
  const dx = point.x - center.x
  const dy = point.y - center.y
  switch (rotation) {
    case 0:
      return { x: dx, y: dy }
    case 1:
      return { x: dy, y: -dx }
    case 2:
      return { x: -dx, y: -dy }
    case 3:
      return { x: -dy, y: dx }
  }
}

export function isNearTarget(piece: Piece, layout: BoardLayout, grid: Grid): boolean {
  const target = boardToWorld(correctCenter(piece, grid), layout)
  return distance(boardToWorld(piece, layout), target) < layout.pieceW / 3
}
