/** `null` = flat border. Sign: +1 tab (outward), -1 blank (inward). Magnitude 0.3..0.7 = tab position along the edge. */
export type Edge = number | null

export interface PieceEdges {
  top: Edge
  right: Edge
  bottom: Edge
  left: Edge
}

/** Quarter turns clockwise. */
export type Rotation = 0 | 1 | 2 | 3

export interface Piece {
  id: number
  row: number
  col: number
  edges: PieceEdges
  /** Center in board units: 0..1 spans the board, values outside are off-board. */
  u: number
  v: number
  rotation: Rotation
  placed: boolean
}

export interface Point {
  x: number
  y: number
}

export interface BoardPoint {
  u: number
  v: number
}

export interface Grid {
  rows: number
  cols: number
}

/** Board rectangle and piece metrics in CSS pixels. */
export interface BoardLayout {
  x: number
  y: number
  width: number
  height: number
  pieceW: number
  pieceH: number
  tab: number
}

export type Rng = () => number
