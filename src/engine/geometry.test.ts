import { describe, expect, it } from 'vitest'
import { boardToWorld, isNearTarget, toLocal, worldToBoard } from './geometry'
import { createPieces } from './piece-generator'
import type { BoardLayout, Rotation } from './types'

const layout: BoardLayout = { x: 50, y: 30, width: 600, height: 300, pieceW: 200, pieceH: 100, tab: 20 }

describe('board <-> world', () => {
  it('round-trips', () => {
    const world = boardToWorld({ u: 0.25, v: -0.4 }, layout)
    expect(world).toEqual({ x: 200, y: -90 })
    expect(worldToBoard(world, layout)).toEqual({ u: 0.25, v: -0.4 })
  })
})

describe('toLocal', () => {
  it.each([0, 1, 2, 3] as Rotation[])('inverts canvas rotation by %i quarter turns', (rotation) => {
    const center = { x: 100, y: 200 }
    const local = { x: 7, y: -3 }
    const angle = (rotation * Math.PI) / 2
    const world = {
      x: center.x + local.x * Math.cos(angle) - local.y * Math.sin(angle),
      y: center.y + local.x * Math.sin(angle) + local.y * Math.cos(angle),
    }
    const back = toLocal(world, center, rotation)
    expect(back.x).toBeCloseTo(local.x)
    expect(back.y).toBeCloseTo(local.y)
  })
})

describe('isNearTarget', () => {
  const grid = { rows: 3, cols: 3 }
  // Snap radius = pieceW / 3 = 200 / 3 px = 1/9 board width.
  const radiusU = 1 / 9

  it('is true at the correct spot and just inside the radius', () => {
    const piece = createPieces(grid)[0]
    expect(isNearTarget(piece, layout, grid)).toBe(true)
    piece.u += radiusU * 0.99
    expect(isNearTarget(piece, layout, grid)).toBe(true)
  })

  it('is false just outside the radius', () => {
    const piece = createPieces(grid)[0]
    piece.u += radiusU * 1.01
    expect(isNearTarget(piece, layout, grid)).toBe(false)
  })

  it('works with non-square piece dimensions', () => {
    const nonSquareLayout: BoardLayout = { x: 0, y: 0, width: 600, height: 300, pieceW: 200, pieceH: 100, tab: 20 }
    const grid3x3 = { rows: 3, cols: 3 }
    const piece = createPieces(grid3x3)[4] // center piece
    expect(isNearTarget(piece, nonSquareLayout, grid3x3)).toBe(true)
    // Move outside radius
    piece.u += nonSquareLayout.pieceW / 3 / nonSquareLayout.width * 1.1
    expect(isNearTarget(piece, nonSquareLayout, grid3x3)).toBe(false)
  })
})

describe('toLocal with fractional centers', () => {
  it('handles non-integer world coordinates', () => {
    const center = { x: 123.456, y: 789.012 }
    const local = { x: 5.5, y: -7.3 }
    // For rotation 0, world point is simply center + local offset
    const world = { x: center.x + local.x, y: center.y + local.y }
    const back = toLocal(world, center, 0)
    expect(back.x).toBeCloseTo(local.x, 10)
    expect(back.y).toBeCloseTo(local.y, 10)
  })
})
