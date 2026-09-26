import { describe, expect, it } from 'vitest'
import { computeBoardLayout } from './board-layout'
import { boardToWorld } from './geometry'
import { tracePiecePath, type PathSink } from './piece-path-builder'
import { createPieces } from './piece-generator'
import type { BoardLayout, Piece, Point } from './types'

/** World-space points of every tab: its start point plus both beziers' control and end points. */
function tabPoints(piece: Piece, layout: BoardLayout): Point[] {
  const c = boardToWorld(piece, layout)
  const points: Point[] = []
  let last: Point = { x: 0, y: 0 }
  let inTab = false
  const add = (x: number, y: number) => points.push({ x: c.x + x, y: c.y + y })
  const sink: PathSink = {
    moveTo(x, y) {
      last = { x, y }
    },
    lineTo(x, y) {
      last = { x, y }
      inTab = false
    },
    closePath() {},
    bezierCurveTo(...xy: number[]) {
      if (!inTab) add(last.x, last.y)
      inTab = true
      for (let i = 0; i < xy.length; i += 2) add(xy[i], xy[i + 1])
    },
  }
  tracePiecePath(sink, piece.edges, layout)
  return points
}

// The seam is walked in opposite directions by the two pieces, so compare as point sets.
function expectSameCurve(a: Point[], b: Point[]) {
  expect(a).toHaveLength(7)
  expect(b).toHaveLength(7)
  for (const p of a) {
    expect(b.some((q) => Math.abs(p.x - q.x) < 1e-9 && Math.abs(p.y - q.y) < 1e-9)).toBe(true)
  }
}

describe('tracePiecePath', () => {
  it.each([
    { side: 'top', axis: 'y', outward: -1 },
    { side: 'right', axis: 'x', outward: 1 },
    { side: 'bottom', axis: 'y', outward: 1 },
    { side: 'left', axis: 'x', outward: -1 },
  ] as const)('puts a positive $side edge outside the piece and a negative one inside', ({ side, axis, outward }) => {
    const layout: BoardLayout = { x: 0, y: 0, width: 100, height: 100, pieceW: 100, pieceH: 100, tab: 20 }
    const flat = { top: null, right: null, bottom: null, left: null }
    // Apex of the tab measured along the outward normal, relative to the edge line at 50.
    const apex = (value: number) => {
      const piece: Piece = { id: 0, row: 0, col: 0, u: 0, v: 0, rotation: 0, placed: false, edges: { ...flat, [side]: value } }
      return Math.max(...tabPoints(piece, layout).map((p) => p[axis] * outward)) - 50
    }
    expect(apex(0.5)).toBeCloseTo(20)
    expect(apex(-0.5)).toBeCloseTo(0)
  })

  it('draws the same tab on both sides of a vertical seam', () => {
    const grid = { rows: 1, cols: 2 }
    const layout = computeBoardLayout(1000, 800, 1200, 500, grid)
    const [a, b] = createPieces(grid)
    expectSameCurve(tabPoints(a, layout), tabPoints(b, layout))
  })

  it('draws the same tab on both sides of a horizontal seam', () => {
    const grid = { rows: 2, cols: 1 }
    const layout = computeBoardLayout(1000, 800, 500, 1200, grid)
    const [a, b] = createPieces(grid)
    expectSameCurve(tabPoints(a, layout), tabPoints(b, layout))
  })

  it('draws nothing but straight lines for a single-piece puzzle', () => {
    const grid = { rows: 1, cols: 1 }
    const layout = computeBoardLayout(1000, 800, 500, 500, grid)
    expect(tabPoints(createPieces(grid)[0], layout)).toHaveLength(0)
  })

  it.each([
    { rows: 5, cols: 5 },
    { rows: 3, cols: 7 },
  ])('interlocks every seam of a $rows x $cols grid', (grid) => {
    const layout = computeBoardLayout(1400, 900, 1400, 600, grid)
    const pieces = createPieces(grid)
    const at = (row: number, col: number) => pieces[row * grid.cols + col]
    const seams = 2 * grid.rows * grid.cols - grid.rows - grid.cols
    let matched = 0
    for (const piece of pieces) {
      const points = tabPoints(piece, layout)
      const neighbors = [
        piece.row > 0 && at(piece.row - 1, piece.col),
        piece.row < grid.rows - 1 && at(piece.row + 1, piece.col),
        piece.col > 0 && at(piece.row, piece.col - 1),
        piece.col < grid.cols - 1 && at(piece.row, piece.col + 1),
      ].filter((n): n is Piece => !!n)
      for (let i = 0; i < points.length; i += 7) {
        const tab = points.slice(i, i + 7)
        const fits = neighbors.some((n) => {
          const other = tabPoints(n, layout)
          return tab.every((p) => other.some((q) => Math.abs(p.x - q.x) < 1e-9 && Math.abs(p.y - q.y) < 1e-9))
        })
        expect(fits).toBe(true)
        matched++
      }
    }
    // Each seam is seen once from each side.
    expect(matched).toBe(seams * 2)
  })
})
