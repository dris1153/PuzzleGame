import { boardToWorld, correctCenter } from './geometry'
import type { Sprite } from './piece-sprite-cache'
import type { BoardLayout, Grid, Piece, Point } from './types'

const INK = '#2b2140'
const FRAME_PAD = 6

export interface RenderState {
  /** Shadow sizes ignore the canvas transform, so they are scaled by DPR explicitly. */
  dpr: number
  viewW: number
  viewH: number
  layout: BoardLayout
  grid: Grid
  /** Board frame and ghost image, pre-rendered by `buildBackdrop`. */
  backdrop: HTMLCanvasElement
  /** Z-order: last is drawn on top. */
  order: Piece[]
  /** Indexed by piece id. */
  sprites: Sprite[]
  paths: Path2D[]
  /** The piece being dragged: drawn raised. */
  lifted: Piece | null
  angleOf(piece: Piece): number
  scaleOf(piece: Piece): number
  hint: { piece: Piece; alpha: number } | null
}

/**
 * The static part of the board (framed card with its soft shadow, optional ghost image), rendered once per
 * layout or ghost toggle instead of every frame: a large blurred shadow is costly on high-DPR mobiles.
 */
export function buildBackdrop(layout: BoardLayout, image: HTMLImageElement, ghost: boolean, viewW: number, viewH: number, dpr: number) {
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(viewW * dpr)
  canvas.height = Math.round(viewH * dpr)
  const ctx = canvas.getContext('2d')!
  ctx.scale(dpr, dpr)
  const { x, y, width, height } = layout
  ctx.save()
  ctx.beginPath()
  ctx.roundRect(x - FRAME_PAD, y - FRAME_PAD, width + FRAME_PAD * 2, height + FRAME_PAD * 2, 14)
  ctx.fillStyle = '#fff'
  ctx.shadowColor = 'rgba(43, 33, 64, 0.18)'
  ctx.shadowBlur = 24 * dpr
  ctx.shadowOffsetY = 8 * dpr
  ctx.fill()
  ctx.shadowColor = 'transparent'
  ctx.lineWidth = 3
  ctx.strokeStyle = INK
  ctx.stroke()
  ctx.restore()
  if (ghost) {
    ctx.globalAlpha = 0.4
    ctx.drawImage(image, x, y, width, height)
  }
  return canvas
}

function drawPiece(ctx: CanvasRenderingContext2D, s: RenderState, piece: Piece, pop: number) {
  const sprite = s.sprites[piece.id]
  const c = boardToWorld(piece, s.layout)
  const lifted = piece === s.lifted
  const scale = pop * (lifted ? 1.06 : 1)
  ctx.save()
  ctx.translate(c.x, c.y)
  ctx.rotate(s.angleOf(piece))
  ctx.scale(scale, scale)
  if (lifted) {
    // Only the dragged piece gets a live shadow; resting ones have theirs baked into the sprite.
    ctx.shadowColor = 'rgba(43, 33, 64, 0.35)'
    ctx.shadowBlur = 18 * s.dpr
    ctx.shadowOffsetY = 10 * s.dpr
  }
  ctx.drawImage(sprite.canvas, -sprite.width / 2, -sprite.height / 2, sprite.width, sprite.height)
  ctx.restore()
}

function strokeOutline(ctx: CanvasRenderingContext2D, path: Path2D, at: Point, angle: number, dashed: boolean) {
  ctx.save()
  ctx.translate(at.x, at.y)
  ctx.rotate(angle)
  ctx.setLineDash(dashed ? [8, 6] : [])
  ctx.stroke(path)
  ctx.restore()
}

export function renderBoard(ctx: CanvasRenderingContext2D, s: RenderState): void {
  ctx.clearRect(0, 0, s.viewW, s.viewH)
  ctx.drawImage(s.backdrop, 0, 0, s.viewW, s.viewH)
  // A popping piece is drawn last so its neighbors do not cover the swell.
  const popping: [Piece, number][] = []
  for (const piece of s.order) {
    const pop = s.scaleOf(piece)
    if (pop === 1) drawPiece(ctx, s, piece, 1)
    else popping.push([piece, pop])
  }
  for (const [piece, pop] of popping) drawPiece(ctx, s, piece, pop)

  if (s.hint) {
    const { piece, alpha } = s.hint
    const path = s.paths[piece.id]
    ctx.strokeStyle = `rgba(255, 180, 0, ${alpha})`
    ctx.lineWidth = 4
    strokeOutline(ctx, path, boardToWorld(correctCenter(piece, s.grid), s.layout), 0, true)
    strokeOutline(ctx, path, boardToWorld(piece, s.layout), s.angleOf(piece), false)
  }
}
