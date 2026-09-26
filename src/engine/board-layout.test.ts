import { describe, expect, it } from 'vitest'
import { boardFit, computeBoardLayout } from './board-layout'

describe('computeBoardLayout', () => {
  it('fits the image at the given scale and centers it', () => {
    const layout = computeBoardLayout(1000, 800, 2000, 1000, { rows: 2, cols: 4 })
    expect(layout).toEqual({ x: 100, y: 200, width: 800, height: 400, pieceW: 200, pieceH: 200, tab: 40 })
  })

  it('is limited by the tighter viewport side', () => {
    const layout = computeBoardLayout(400, 1000, 1000, 1000, { rows: 3, cols: 3 }, { scaleW: 1, scaleH: 1, placement: 'center' })
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

describe('boardFit', () => {
  it('puts a wide board at the top in portrait, leaving the lower part for pieces', () => {
    const layout = computeBoardLayout(360, 620, 1500, 1000, { rows: 8, cols: 8 }, boardFit(360, 620))
    expect(layout.x).toBeCloseTo(10.8)
    expect(layout.y).toBe(12)
    expect(layout.width).toBeCloseTo(338.4)
    expect(620 - (layout.y + layout.height)).toBeGreaterThan(380)
  })

  it('caps a tall image in portrait at 60% of the height', () => {
    const layout = computeBoardLayout(400, 800, 900, 1600, { rows: 4, cols: 3 }, boardFit(400, 800))
    expect(layout.height).toBeCloseTo(480)
  })

  it('keeps a smaller centered board in landscape, leaving both sides free', () => {
    const layout = computeBoardLayout(1000, 700, 1500, 1000, { rows: 3, cols: 3 }, boardFit(1000, 700))
    expect(layout.width).toBeCloseTo(560)
    expect(layout.x).toBeCloseTo(220)
    expect(layout.y).toBeCloseTo((700 - layout.height) / 2)
  })

  it('treats square viewport as landscape and centers the board', () => {
    const fit = boardFit(600, 600)
    expect(fit.placement).toBe('center')
    const layout = computeBoardLayout(600, 600, 1500, 1000, { rows: 4, cols: 4 }, fit)
    const centeredY = (600 - layout.height) / 2
    expect(layout.y).toBeCloseTo(centeredY)
  })

  it('handles tall image (portrait aspect) in landscape viewport', () => {
    const layout = computeBoardLayout(1600, 800, 500, 1200, { rows: 3, cols: 3 }, boardFit(1600, 800))
    const k = Math.min((0.56 * 1600) / 500, (0.8 * 800) / 1200)
    expect(layout.width).toBeCloseTo(500 * k)
    expect(layout.height).toBeCloseTo(1200 * k)
    const centeredY = (800 - layout.height) / 2
    expect(layout.y).toBeCloseTo(centeredY)
  })
})
