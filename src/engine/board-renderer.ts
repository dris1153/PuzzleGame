import { boardToWorld } from './geometry'
import type { Sprite } from './piece-sprite-cache'
import type { BoardLayout, Piece } from './types'

export interface RenderState {
  viewW: number
  viewH: number
  layout: BoardLayout
  image: HTMLImageElement
  /** Z-order: last is drawn on top. */
  order: Piece[]
  /** Indexed by piece id. */
  sprites: Sprite[]
}

export function renderBoard(ctx: CanvasRenderingContext2D, s: RenderState): void {
  const { layout } = s
  ctx.clearRect(0, 0, s.viewW, s.viewH)

  ctx.globalAlpha = 0.5
  ctx.drawImage(s.image, layout.x, layout.y, layout.width, layout.height)
  ctx.globalAlpha = 1

  for (const piece of s.order) {
    const sprite = s.sprites[piece.id]
    const c = boardToWorld(piece, layout)
    ctx.save()
    ctx.translate(c.x, c.y)
    ctx.rotate((piece.rotation * Math.PI) / 2)
    ctx.drawImage(sprite.canvas, -sprite.width / 2, -sprite.height / 2, sprite.width, sprite.height)
    ctx.restore()
  }
}
