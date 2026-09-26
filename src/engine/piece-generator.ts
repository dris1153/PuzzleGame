import { correctCenter } from './geometry'
import type { Grid, Piece, PieceEdges, Rng } from './types'

function randomEdge(rng: Rng): number {
  const sign = rng() < 0.5 ? -1 : 1
  return sign * (rng() * 0.4 + 0.3)
}

/** Row-major edges; shared edges are complementary so neighbors interlock. */
export function generateEdges(grid: Grid, rng: Rng = Math.random): PieceEdges[] {
  const edges: PieceEdges[] = []
  for (let row = 0; row < grid.rows; row++) {
    for (let col = 0; col < grid.cols; col++) {
      const i = row * grid.cols + col
      edges.push({
        top: row === 0 ? null : -edges[i - grid.cols].bottom!,
        right: col === grid.cols - 1 ? null : randomEdge(rng),
        bottom: row === grid.rows - 1 ? null : randomEdge(rng),
        left: col === 0 ? null : -edges[i - 1].right!,
      })
    }
  }
  return edges
}

/** Pieces start at their correct spot; scatter them afterwards. */
export function createPieces(grid: Grid, rng: Rng = Math.random): Piece[] {
  return generateEdges(grid, rng).map((edges, id) => {
    const row = Math.floor(id / grid.cols)
    const col = id % grid.cols
    const { u, v } = correctCenter({ row, col }, grid)
    return { id, row, col, edges, u, v, rotation: 0, placed: false }
  })
}
