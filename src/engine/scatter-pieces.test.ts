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

  it('uses larger margin when rotation=true to account for rotated piece bounds', () => {
    // Create layout where pieceH > pieceW so rotation increases margin
    const tallLayout = computeBoardLayout(viewW, viewH, 800, 2000, { rows: 2, cols: 2 })
    const pieces = createPieces({ rows: 2, cols: 2 })

    // Place piece far off-screen
    pieces[0].u = -10
    pieces[0].v = -10

    // Clamp with rotation=false: uses pieceW/2 + tab
    const nonRotMargin = tallLayout.pieceW / 2 + tallLayout.tab
    clampPiecesToView([pieces[0]], tallLayout, viewW, viewH, false)
    const nonRotPos = boardToWorld(pieces[0], tallLayout)
    expect(nonRotPos.x).toBeGreaterThanOrEqual(nonRotMargin - 1e-9)

    // Reset and clamp with rotation=true: uses max(W,H)/2 + tab (larger when H > W)
    pieces[0].u = -10
    pieces[0].v = -10
    const rotMargin = Math.max(tallLayout.pieceW, tallLayout.pieceH) / 2 + tallLayout.tab
    clampPiecesToView([pieces[0]], tallLayout, viewW, viewH, true)
    const rotPos = boardToWorld(pieces[0], tallLayout)
    expect(rotPos.x).toBeGreaterThanOrEqual(rotMargin - 1e-9)
    // Since pieceH > pieceW, rotMargin should be larger
    expect(rotMargin).toBeGreaterThan(nonRotMargin)
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

describe('scatterPieces with rotation', () => {
  it('turns pieces by random quarter turns and keeps them on screen whichever way they stand', () => {
    // Wide pieces (3:1) so a quarter turn really changes the footprint.
    const wide = computeBoardLayout(viewW, viewH, 3000, 1000, { rows: 3, cols: 3 })
    const m = Math.max(wide.pieceW, wide.pieceH) / 2 + wide.tab
    for (const value of [0, 0.3, 0.6, 0.999999]) {
      const pieces = createPieces({ rows: 3, cols: 3 })
      scatterPieces(pieces, wide, viewW, viewH, () => value, true)
      for (const p of pieces) {
        expect(p.rotation).toBe(Math.floor(value * 4))
        const c = boardToWorld(p, wide)
        expect(Math.min(c.x, c.y, viewW - c.x, viewH - c.y)).toBeGreaterThanOrEqual(m - 1e-9)
      }
    }
  })
})
