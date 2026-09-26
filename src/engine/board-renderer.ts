import { boardToWorld, correctCenter } from './geometry'
import type { Sprite } from './piece-sprite-cache'
import type { BoardLayout, Grid, Piece, Point } from './types'

export interface RenderState {
  viewW: number
  viewH: number
  layout: BoardLayout
  grid: Grid
  image: HTMLImageElement
  ghost: boolean
  /** Z-order: last is drawn on top. */
  order: Piece[]
  /** Indexed by piece id. */
  sprites: Sprite[]
  paths: Path2D[]
  angleOf(piece: Piece): number
  hint: { piece: Piece; alpha: number } | null
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
  const { layout } = s
  ctx.clearRect(0, 0, s.viewW, s.viewH)

  if (s.ghost) {
    ctx.globalAlpha = 0.5
    ctx.drawImage(s.image, layout.x, layout.y, layout.width, layout.height)
    ctx.globalAlpha = 1
  } else {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.06)'
    ctx.fillRect(layout.x, layout.y, layout.width, layout.height)
  }

  for (const piece of s.order) {
    const sprite = s.sprites[piece.id]
    const c = boardToWorld(piece, layout)
    ctx.save()
    ctx.translate(c.x, c.y)
    ctx.rotate(s.angleOf(piece))
    ctx.drawImage(sprite.canvas, -sprite.width / 2, -sprite.height / 2, sprite.width, sprite.height)
    ctx.restore()
  }

  if (s.hint) {
    const { piece, alpha } = s.hint
    const path = s.paths[piece.id]
    ctx.strokeStyle = `rgba(255, 190, 0, ${alpha})`
    ctx.lineWidth = 4
    strokeOutline(ctx, path, boardToWorld(correctCenter(piece, s.grid), layout), 0, true)
    strokeOutline(ctx, path, boardToWorld(piece, layout), s.angleOf(piece), false)
  }
}
