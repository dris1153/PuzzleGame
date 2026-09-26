import { describe, expect, it } from 'vitest'
import { computeBoardLayout } from './board-layout'
import { boardToWorld } from './geometry'
import { createPieces } from './piece-generator'
import { clampPiecesToView, scatterPieces } from './scatter-pieces'
import type { BoardLayout, Piece } from './types'

const grid = { rows: 4, cols: 4 }
const viewW = 900
const viewH = 600
const layout = computeBoardLayout(viewW, viewH, 1200, 800, grid)

function expectInsideView(pieces: Piece[], l: BoardLayout) {
  const mx = l.pieceW / 2 + l.tab
  const my = l.pieceH / 2 + l.tab
  for (const p of pieces) {
    const c = boardToWorld(p, l)
    expect(c.x).toBeGreaterThanOrEqual(mx - 1e-9)
    expect(c.x).toBeLessThanOrEqual(viewW - mx + 1e-9)
    expect(c.y).toBeGreaterThanOrEqual(my - 1e-9)
    expect(c.y).toBeLessThanOrEqual(viewH - my + 1e-9)
  }
}

describe('scatterPieces', () => {
  it('keeps every piece fully inside the viewport', () => {
    for (let run = 0; run < 20; run++) {
      const pieces = createPieces(grid)
      scatterPieces(pieces, layout, viewW, viewH)
      expectInsideView(pieces, layout)
    }
  })

  it('covers the extremes of the rng range', () => {
    for (const value of [0, 0.999999]) {
      const pieces = createPieces(grid)
      scatterPieces(pieces, layout, viewW, viewH, () => value)
      expectInsideView(pieces, layout)
    }
  })

  it('leaves placed pieces alone', () => {
    const pieces = createPieces(grid)
    pieces[0].placed = true
    scatterPieces(pieces, layout, viewW, viewH, () => 0)
    expect(pieces[0]).toMatchObject({ u: 0.125, v: 0.125 })
  })
})

describe('clampPiecesToView', () => {
  it('pulls off-screen pieces back inside', () => {
    const pieces = createPieces(grid)
    pieces[0].u = -5
    pieces[1].v = 9
    clampPiecesToView(pieces, layout, viewW, viewH)
    expectInsideView(pieces, layout)
  })
})

describe('scatterPieces with small viewport', () => {
  it('scatters pieces with tight margins between viewport bounds', () => {
    const tightGrid = { rows: 3, cols: 3 }
    const tightLayout = computeBoardLayout(400, 400, 350, 350, tightGrid)
    const pieces = createPieces(tightGrid)
    for (let run = 0; run < 10; run++) {
      scatterPieces(pieces, tightLayout, 400, 400)
      expectInsideView(pieces, tightLayout)
    }
  })
})
