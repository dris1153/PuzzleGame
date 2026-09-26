import type { BoardLayout, Edge, PieceEdges, Point } from './types'

/** Subset of Path2D used here, so the tracing is testable without a canvas. */
export interface PathSink {
  moveTo(x: number, y: number): void
  lineTo(x: number, y: number): void
  bezierCurveTo(c1x: number, c1y: number, c2x: number, c2y: number, x: number, y: number): void
  closePath(): void
}

interface TabDims {
  neck: number
  tabW: number
  tabH: number
}

/**
 * Traces one edge from `start` along unit `dir` with outward unit `normal`.
 * `fromEnd`: bottom/left edges are walked backwards but positioned from top/left, so neighbors line up.
 */
function traceEdge(
  sink: PathSink,
  start: Point,
  dir: Point,
  normal: Point,
  length: number,
  edge: Edge,
  fromEnd: boolean,
  { neck, tabW, tabH }: TabDims,
): void {
  if (edge !== null) {
    const sign = Math.sign(edge)
    const center = (fromEnd ? 1 - Math.abs(edge) : Math.abs(edge)) * length
    const at = (along: number, out: number): [number, number] => [
      start.x + dir.x * (center + along) + normal.x * out * sign,
      start.y + dir.y * (center + along) + normal.y * out * sign,
    ]
    sink.lineTo(...at(-neck, 0))
    sink.bezierCurveTo(...at(-neck, tabH * 0.2), ...at(-tabW, tabH), ...at(0, tabH))
    sink.bezierCurveTo(...at(tabW, tabH), ...at(neck, tabH * 0.2), ...at(neck, 0))
  }
  sink.lineTo(start.x + dir.x * length, start.y + dir.y * length)
}

/** Piece outline centered on (0, 0), clockwise from the top-left corner. */
export function tracePiecePath(sink: PathSink, edges: PieceEdges, layout: BoardLayout): void {
  const w = layout.pieceW
  const h = layout.pieceH
  const size = Math.min(w, h)
  const dims: TabDims = { neck: 0.1 * size, tabW: 0.2 * size, tabH: layout.tab }
  const left = -w / 2
  const top = -h / 2

  sink.moveTo(left, top)
  traceEdge(sink, { x: left, y: top }, { x: 1, y: 0 }, { x: 0, y: -1 }, w, edges.top, false, dims)
  traceEdge(sink, { x: left + w, y: top }, { x: 0, y: 1 }, { x: 1, y: 0 }, h, edges.right, false, dims)
  traceEdge(sink, { x: left + w, y: top + h }, { x: -1, y: 0 }, { x: 0, y: 1 }, w, edges.bottom, true, dims)
  traceEdge(sink, { x: left, y: top + h }, { x: 0, y: -1 }, { x: -1, y: 0 }, h, edges.left, true, dims)
  sink.closePath()
}

export function buildPiecePath(edges: PieceEdges, layout: BoardLayout): Path2D {
  const path = new Path2D()
  tracePiecePath(path, edges, layout)
  return path
}
