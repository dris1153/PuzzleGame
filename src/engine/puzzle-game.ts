import { computeBoardLayout } from './board-layout'
import { renderBoard } from './board-renderer'
import { correctCenter, isNearTarget, worldToBoard } from './geometry'
import { pickPiece } from './hit-test'
import { buildPiecePath } from './piece-path-builder'
import { createPieces } from './piece-generator'
import { buildSprite, type Sprite } from './piece-sprite-cache'
import { attachPointerController } from './pointer-controller'
import { clampPiecesToView, scatterPieces } from './scatter-pieces'
import type { BoardLayout, Grid, Piece, Rng } from './types'

const MOVE_THRESHOLD_PX = 5

export interface PuzzleGameOptions {
  canvas: HTMLCanvasElement
  image: HTMLImageElement
  rows: number
  cols: number
  rng?: Rng
  onPiecePlaced?(placed: number, total: number): void
  /** A drop after dragging more than a few pixels. */
  onMove?(): void
  onComplete?(): void
}

export interface PuzzleGame {
  destroy(): void
}

export function createPuzzleGame(opts: PuzzleGameOptions): PuzzleGame {
  const { canvas, image, rng = Math.random } = opts
  const grid: Grid = { rows: opts.rows, cols: opts.cols }
  const ctx = canvas.getContext('2d')!
  const probe = document.createElement('canvas').getContext('2d')!

  const pieces = createPieces(grid, rng)
  const order: Piece[] = [...pieces]
  let layout: BoardLayout | null = null
  let paths: Path2D[] = []
  let sprites: Sprite[] = []
  let viewW = 0
  let viewH = 0
  let dpr = 0
  let placedCount = 0
  let frame = 0
  let needsLayout = true
  let destroyed = false

  const invalidate = () => {
    if (!frame && !destroyed) frame = requestAnimationFrame(draw)
  }

  function draw() {
    frame = 0
    if (needsLayout) relayout()
    if (layout) renderBoard(ctx, { viewW, viewH, layout, image, order, sprites })
  }

  // Runs inside rAF, so a live window resize rebuilds sprites at most once per frame.
  // ponytail: DPR changes without a size change (dragging across monitors) are not detected.
  function relayout() {
    needsLayout = false
    const rect = canvas.getBoundingClientRect()
    const nextDpr = window.devicePixelRatio || 1
    if (!rect.width || !rect.height) return
    if (layout && rect.width === viewW && rect.height === viewH && nextDpr === dpr) return
    const firstLayout = layout === null
    viewW = rect.width
    viewH = rect.height
    dpr = nextDpr
    canvas.width = Math.round(viewW * dpr)
    canvas.height = Math.round(viewH * dpr)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    const next = computeBoardLayout(viewW, viewH, image.naturalWidth, image.naturalHeight, grid)
    layout = next
    paths = pieces.map((p) => buildPiecePath(p.edges, next))
    sprites = pieces.map((p) => buildSprite(p, paths[p.id], image, next, dpr))
    if (firstLayout) scatterPieces(pieces, next, viewW, viewH, rng)
    else clampPiecesToView(pieces, next, viewW, viewH)
  }

  const moveToIndex = (piece: Piece, index: 0 | -1) => {
    order.splice(order.indexOf(piece), 1)
    if (index === 0) order.unshift(piece)
    else order.push(piece)
  }

  function place(piece: Piece) {
    Object.assign(piece, correctCenter(piece, grid), { placed: true })
    moveToIndex(piece, 0)
    placedCount++
  }

  const detach = attachPointerController(canvas, {
    enabled: () => layout !== null,
    pick: (point) => (layout ? pickPiece(order, paths, point, layout, probe) : null),
    toBoard: (point) => worldToBoard(point, layout!),
    grab: (piece) => {
      moveToIndex(piece, -1)
      invalidate()
    },
    move: (piece, to) => {
      piece.u = to.u
      piece.v = to.v
      invalidate()
    },
    drop: (piece, movedPx) => {
      const snapped = layout !== null && isNearTarget(piece, layout, grid)
      if (snapped) place(piece)
      invalidate()
      // Callbacks last: a consumer may destroy or restart the game from inside them.
      if (movedPx > MOVE_THRESHOLD_PX) opts.onMove?.()
      if (!snapped) return
      opts.onPiecePlaced?.(placedCount, pieces.length)
      if (placedCount === pieces.length) opts.onComplete?.()
    },
  })

  const observer = new ResizeObserver(() => {
    needsLayout = true
    invalidate()
  })
  observer.observe(canvas)

  return {
    destroy() {
      destroyed = true
      observer.disconnect()
      detach()
      cancelAnimationFrame(frame)
      frame = 0
    },
  }
}
