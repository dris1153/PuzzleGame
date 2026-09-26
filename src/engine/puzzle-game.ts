import { createAnimations, HINT_MS, hintAlpha, isAnimating, popScale, rotationAngle, setHintPaused } from './board-animations'
import { boardFit, computeBoardLayout, type BoardFit } from './board-layout'
import { buildBackdrop, renderBoard } from './board-renderer'
import { canSnap, correctCenter, worldToBoard } from './geometry'
import { pickHintPiece } from './hint-picker'
import { pickPiece } from './hit-test'
import { buildPiecePath } from './piece-path-builder'
import { createPieces } from './piece-generator'
import { buildSprite, type Sprite } from './piece-sprite-cache'
import { attachPointerController } from './pointer-controller'
import { DRAG_THRESHOLD_PX } from './pointer-gesture'
import { clampPiecesToView, scatterPieces } from './scatter-pieces'
import type { PuzzleGame, PuzzleGameOptions } from './puzzle-game-api'
import type { BoardLayout, Grid, Piece, Rotation } from './types'

export type { PuzzleGame, PuzzleGameOptions } from './puzzle-game-api'

export function createPuzzleGame(opts: PuzzleGameOptions): PuzzleGame {
  const { canvas, image, rng = Math.random, rotation = false } = opts
  const grid: Grid = { rows: opts.rows, cols: opts.cols }
  const ctx = canvas.getContext('2d')!
  const probe = document.createElement('canvas').getContext('2d')!
  const anims = createAnimations()

  const pieces = createPieces(grid, rng)
  const order: Piece[] = [...pieces]
  let layout: BoardLayout | null = null
  let placement: BoardFit['placement'] | null = null
  let backdrop: HTMLCanvasElement | null = null
  let paths: Path2D[] = []
  let sprites: Sprite[] = []
  let viewW = 0
  let viewH = 0
  let dpr = 0
  let placedCount = 0
  let frame = 0
  let needsLayout = true
  let ghost = opts.ghost ?? true
  let paused = false
  let destroyed = false
  let lifted: Piece | null = null

  const invalidate = () => {
    if (!frame && !destroyed) frame = requestAnimationFrame(draw)
  }

  function draw() {
    frame = 0
    if (needsLayout) relayout()
    if (!layout || !backdrop) return
    const now = performance.now()
    const alpha = hintAlpha(anims, now)
    const hinted = anims.hint && pieces[anims.hint.pieceId]
    renderBoard(ctx, {
      dpr, viewW, viewH, layout, grid, backdrop, order, sprites, paths, lifted,
      angleOf: (p) => rotationAngle(p, anims, now),
      scaleOf: (p) => popScale(p, anims, now),
      hint: alpha !== null && hinted ? { piece: hinted, alpha } : null,
    })
    if (isAnimating(anims)) invalidate()
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

    const fit = boardFit(viewW, viewH)
    const next = computeBoardLayout(viewW, viewH, image.naturalWidth, image.naturalHeight, grid, fit)
    layout = next
    backdrop = buildBackdrop(next, image, ghost, viewW, viewH, dpr)
    paths = pieces.map((p) => buildPiecePath(p.edges, next))
    sprites = pieces.map((p) => buildSprite(p, paths[p.id], image, next, dpr))
    // Turning the phone moves the board (top ↔ center): loose pieces are re-spread around it, keeping their turns.
    if (firstLayout || fit.placement !== placement) scatterPieces(pieces, next, viewW, viewH, rng, rotation, firstLayout && rotation)
    else clampPiecesToView(pieces, next, viewW, viewH, rotation)
    placement = fit.placement
  }

  const moveToIndex = (piece: Piece, index: 0 | -1) => {
    order.splice(order.indexOf(piece), 1)
    if (index === 0) order.unshift(piece)
    else order.push(piece)
  }

  /** Snaps if possible, then reports. Callbacks go last: a consumer may destroy the game from inside them. */
  function release(piece: Piece, movedPx: number) {
    lifted = null
    const snapped = layout !== null && canSnap(piece, layout, grid)
    if (snapped) {
      Object.assign(piece, correctCenter(piece, grid), { placed: true })
      moveToIndex(piece, 0)
      if (!opts.reducedMotion) anims.popping.set(piece.id, performance.now())
      placedCount++
    }
    invalidate()
    if (movedPx > DRAG_THRESHOLD_PX) opts.onMove?.(snapped)
    if (!snapped) return
    opts.onPiecePlaced?.(placedCount, pieces.length)
    if (placedCount === pieces.length) opts.onComplete?.()
  }

  function rotate(piece: Piece) {
    if (!opts.reducedMotion) anims.rotating.set(piece.id, { from: (piece.rotation * Math.PI) / 2, start: performance.now() })
    piece.rotation = ((piece.rotation + 1) % 4) as Rotation
    release(piece, 0)
    if (!destroyed) opts.onRotate?.()
  }

  const controller = attachPointerController(canvas, {
    enabled: () => layout !== null && !paused,
    pick: (point) => (layout ? pickPiece(order, paths, point, layout, probe) : null),
    toBoard: (point) => worldToBoard(point, layout!),
    grab: (piece) => {
      lifted = piece
      moveToIndex(piece, -1)
      invalidate()
      opts.onPickup?.()
    },
    move: (piece, to) => {
      piece.u = to.u
      piece.v = to.v
      invalidate()
    },
    drop: release,
    tap: (piece) => (rotation ? rotate(piece) : release(piece, 0)),
  })

  const observer = new ResizeObserver(() => {
    needsLayout = true
    invalidate()
  })
  observer.observe(canvas)

  return {
    setPaused(value) {
      if (value === paused) return
      paused = value
      setHintPaused(anims, paused, performance.now())
      invalidate()
      // A drag interrupted by pause still counts, or pausing mid-drag would dodge the move counter.
      if (paused && controller.cancel() > DRAG_THRESHOLD_PX) opts.onMove?.(false)
      if (paused) lifted = null
    },
    setGhostVisible(visible) {
      ghost = visible
      if (layout) backdrop = buildBackdrop(layout, image, ghost, viewW, viewH, dpr)
      invalidate()
    },
    showHint() {
      if (anims.hint) return false // one at a time: a double click must not spend two hints
      const piece = pickHintPiece(pieces, rng)
      if (!piece) return false
      moveToIndex(piece, -1)
      anims.hint = { pieceId: piece.id, until: performance.now() + HINT_MS }
      invalidate()
      return true
    },
    destroy() {
      destroyed = true
      observer.disconnect()
      controller.cancel()
      controller.detach()
      cancelAnimationFrame(frame)
      frame = 0
    },
  }
}
