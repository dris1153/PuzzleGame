import { describe, expect, it } from 'vitest'
import { createPieces, generateEdges } from './piece-generator'

describe('generateEdges', () => {
  const grid = { rows: 4, cols: 5 }
  const edges = generateEdges(grid)
  const at = (row: number, col: number) => edges[row * grid.cols + col]

  it('leaves only the outer border flat', () => {
    for (let row = 0; row < grid.rows; row++) {
      for (let col = 0; col < grid.cols; col++) {
        const e = at(row, col)
        expect(e.top === null).toBe(row === 0)
        expect(e.bottom === null).toBe(row === grid.rows - 1)
        expect(e.left === null).toBe(col === 0)
        expect(e.right === null).toBe(col === grid.cols - 1)
      }
    }
  })

  it('makes shared edges complementary', () => {
    for (let row = 0; row < grid.rows; row++) {
      for (let col = 0; col < grid.cols; col++) {
        if (col > 0) expect(at(row, col).left).toBe(-at(row, col - 1).right!)
        if (row > 0) expect(at(row, col).top).toBe(-at(row - 1, col).bottom!)
      }
    }
  })

  it('keeps tab positions within 0.3..0.7', () => {
    for (const e of edges) {
      for (const value of [e.top, e.right, e.bottom, e.left]) {
        if (value === null) continue
        expect(Math.abs(value)).toBeGreaterThanOrEqual(0.3)
        expect(Math.abs(value)).toBeLessThanOrEqual(0.7)
      }
    }
  })
})

describe('createPieces', () => {
  it('creates row-major pieces at their correct centers', () => {
    const pieces = createPieces({ rows: 2, cols: 3 })
    expect(pieces).toHaveLength(6)
    expect(pieces[4]).toMatchObject({ id: 4, row: 1, col: 1, u: 0.5, v: 0.75, rotation: 0, placed: false })
  })

  it('works with non-square grids (3x7)', () => {
    const pieces = createPieces({ rows: 3, cols: 7 })
    expect(pieces).toHaveLength(21)
    // Check a few pieces for correctness
    expect(pieces[0]).toMatchObject({ id: 0, row: 0, col: 0, u: 1 / 14, v: 1 / 6 })
    expect(pieces[7]).toMatchObject({ id: 7, row: 1, col: 0, u: 1 / 14, v: 0.5 })
    expect(pieces[20]).toMatchObject({ id: 20, row: 2, col: 6, u: 13 / 14, v: 5 / 6 })
  })

  it('works with non-square grids (8x2)', () => {
    const pieces = createPieces({ rows: 8, cols: 2 })
    expect(pieces).toHaveLength(16)
    expect(pieces[0]).toMatchObject({ id: 0, row: 0, col: 0, u: 0.25, v: 1 / 16 })
    expect(pieces[15]).toMatchObject({ id: 15, row: 7, col: 1, u: 0.75, v: 15 / 16 })
  })

  it('generates complementary edges for non-square grids', () => {
    const grid = { rows: 3, cols: 7 }
    const edges = generateEdges(grid)
    const at = (row: number, col: number) => edges[row * grid.cols + col]
    // Spot check complements
    for (let row = 0; row < grid.rows; row++) {
      for (let col = 1; col < grid.cols; col++) {
        expect(at(row, col).left).toBe(-at(row, col - 1).right!)
      }
    }
    for (let row = 1; row < grid.rows; row++) {
      for (let col = 0; col < grid.cols; col++) {
        expect(at(row, col).top).toBe(-at(row - 1, col).bottom!)
      }
    }
  })
})
