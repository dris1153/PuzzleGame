import { expect, it } from 'vitest'
import { boardFit, computeBoardLayout } from './board-layout'
import { boardToWorld } from './geometry'
import { createPieces } from './piece-generator'
import { scatterPieces } from './scatter-pieces'
import { scatterZones } from './scatter-zones'

function spread(viewW: number, viewH: number, rows: number, cols: number, rng: () => number) {
  const grid = { rows, cols }
  const layout = computeBoardLayout(viewW, viewH, 1500, 1000, grid, boardFit(viewW, viewH))
  const pieces = createPieces(grid)
  scatterPieces(pieces, layout, viewW, viewH, rng)
  const mx = layout.pieceW / 2 + layout.tab
  const my = layout.pieceH / 2 + layout.tab
  const boxes = pieces.map((p) => {
    const c = boardToWorld(p, layout)
    return { left: c.x - mx, right: c.x + mx, top: c.y - my, bottom: c.y + my }
  })
  return { layout, boxes }
}

it('keeps pieces off the board and on screen when there is room around it (portrait phone)', () => {
  let seed = 7
  const rng = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646
  const { layout, boxes } = spread(360, 620, 6, 6, rng)
  for (const b of boxes) {
    expect(b.top).toBeGreaterThanOrEqual(layout.y + layout.height)
    expect(b.bottom).toBeLessThanOrEqual(620 + 1e-9)
    expect(b.left).toBeGreaterThanOrEqual(-1e-9)
    expect(b.right).toBeLessThanOrEqual(360 + 1e-9)
  }
})

it('uses both sides of a landscape board', () => {
  const left = spread(1000, 700, 8, 8, () => 0).boxes[0]
  const right = spread(1000, 700, 8, 8, () => 0.999999).boxes[0]
  const layout = computeBoardLayout(1000, 700, 1500, 1000, { rows: 8, cols: 8 }, boardFit(1000, 700))
  expect(left.right).toBeLessThanOrEqual(layout.x)
  expect(right.left).toBeGreaterThanOrEqual(layout.x + layout.width)
})

it('has no zones when pieces are too big to fit beside the board', () => {
  const layout = computeBoardLayout(1000, 700, 1500, 1000, { rows: 2, cols: 2 }, boardFit(1000, 700))
  expect(scatterZones(layout, 1000, 700, { mx: layout.pieceW / 2 + layout.tab, my: layout.pieceH / 2 + layout.tab })).toEqual([])
})

it('distributes pieces across multiple zones by area-weighted selection', () => {
  const grid = { rows: 4, cols: 4 }
  const layout = computeBoardLayout(1000, 800, 1500, 1000, grid, boardFit(1000, 800))
  const pieces = createPieces(grid)
  let seed = 42
  const seededRng = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646
  scatterPieces(pieces, layout, 1000, 800, seededRng)
  const zones = scatterZones(layout, 1000, 800, { mx: layout.pieceW / 2 + layout.tab, my: layout.pieceH / 2 + layout.tab })
  expect(zones.length).toBeGreaterThan(1)
  const pieceCounts = zones.map(() => 0)
  const mx = layout.pieceW / 2 + layout.tab
  const my = layout.pieceH / 2 + layout.tab
  for (const p of pieces) {
    const c = boardToWorld(p, layout)
    for (let i = 0; i < zones.length; i++) {
      const z = zones[i]
      if (c.x >= z.x + mx && c.x <= z.x + z.w - mx && c.y >= z.y + my && c.y <= z.y + z.h - my) {
        pieceCounts[i]++
      }
    }
  }
  const nonZeroCounts = pieceCounts.filter((c) => c > 0).length
  expect(nonZeroCounts).toBeGreaterThan(1)
})
