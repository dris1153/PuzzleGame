import type { BoardLayout, Piece } from './types'

export interface Sprite {
  canvas: HTMLCanvasElement
  /** CSS-pixel size; the backing canvas is scaled by DPR. */
  width: number
  height: number
}

const STROKE_MARGIN = 2

/** Pre-renders a piece (image clipped to its outline + stroke), centered in its canvas. */
export function buildSprite(
  piece: Piece,
  path: Path2D,
  image: HTMLImageElement,
  layout: BoardLayout,
  dpr: number,
): Sprite {
  const pad = layout.tab + STROKE_MARGIN
  const canvas = document.createElement('canvas')
  canvas.width = Math.ceil((layout.pieceW + pad * 2) * dpr)
  canvas.height = Math.ceil((layout.pieceH + pad * 2) * dpr)
  // Use the rounded size so the sprite is drawn back 1:1 with device pixels.
  const width = canvas.width / dpr
  const height = canvas.height / dpr
  const ctx = canvas.getContext('2d')!
  ctx.scale(dpr, dpr)
  ctx.translate(width / 2, height / 2)

  // Piece center in board pixels; source rect is clamped to the image to avoid out-of-bounds drawImage.
  const cx = (piece.col + 0.5) * layout.pieceW
  const cy = (piece.row + 0.5) * layout.pieceH
  const left = Math.max(0, cx - width / 2)
  const top = Math.max(0, cy - height / 2)
  const right = Math.min(layout.width, cx + width / 2)
  const bottom = Math.min(layout.height, cy + height / 2)
  const kx = image.naturalWidth / layout.width
  const ky = image.naturalHeight / layout.height

  ctx.save()
  ctx.clip(path)
  ctx.drawImage(
    image,
    left * kx,
    top * ky,
    (right - left) * kx,
    (bottom - top) * ky,
    left - cx,
    top - cy,
    right - left,
    bottom - top,
  )
  ctx.restore()

  ctx.lineWidth = 1
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.55)'
  ctx.stroke(path)
  return { canvas, width, height }
}
