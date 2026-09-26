import { describe, expect, it } from 'vitest'
import { computeBoardLayout } from './board-layout'

describe('computeBoardLayout', () => {
  it('fits the image at the given scale and centers it', () => {
    const layout = computeBoardLayout(1000, 800, 2000, 1000, { rows: 2, cols: 4 })
    expect(layout).toEqual({ x: 100, y: 200, width: 800, height: 400, pieceW: 200, pieceH: 200, tab: 40 })
  })

  it('is limited by the tighter viewport side', () => {
    const layout = computeBoardLayout(400, 1000, 1000, 1000, { rows: 3, cols: 3 }, 1)
    expect(layout.width).toBe(400)
    expect(layout.height).toBe(400)
    expect(layout.y).toBe(300)
  })

  it('rejects an unloaded image or empty viewport', () => {
    expect(() => computeBoardLayout(800, 600, 0, 0, { rows: 3, cols: 3 })).toThrow()
    expect(() => computeBoardLayout(0, 600, 100, 100, { rows: 3, cols: 3 })).toThrow()
  })

  it('handles non-square grids (3x7 tall, narrow)', () => {
    const layout = computeBoardLayout(400, 800, 500, 700, { rows: 3, cols: 7 })
    // fit = 0.8 * min(400/500, 800/700) = 0.8 * min(0.8, 1.143) = 0.8 * 0.8 = 0.64
    expect(layout.width).toBeCloseTo(500 * 0.64, 5)
    expect(layout.height).toBeCloseTo(700 * 0.64, 5)
    expect(layout.pieceW).toBeCloseTo(layout.width / 7, 5)
    expect(layout.pieceH).toBeCloseTo(layout.height / 3, 5)
  })

  it('handles non-square grids (8x2 wide, short)', () => {
    const layout = computeBoardLayout(1600, 400, 800, 200, { rows: 8, cols: 2 })
    expect(layout.width).toBeCloseTo(800 * 0.8 * (400 / 200), 5)
    expect(layout.height).toBeCloseTo(200 * 0.8 * (400 / 200), 5)
    expect(layout.pieceW).toBeCloseTo(layout.width / 2, 5)
    expect(layout.pieceH).toBeCloseTo(layout.height / 8, 5)
  })

  it('computes tab size based on smaller piece dimension', () => {
    const layout1 = computeBoardLayout(400, 400, 500, 700, { rows: 3, cols: 7 })
    expect(layout1.tab).toBe(0.2 * Math.min(layout1.pieceW, layout1.pieceH))

    const layout2 = computeBoardLayout(1600, 400, 800, 200, { rows: 8, cols: 2 })
    expect(layout2.tab).toBe(0.2 * Math.min(layout2.pieceW, layout2.pieceH))
  })
})
