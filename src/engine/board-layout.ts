import type { BoardLayout, Grid } from './types'

/** Fits the image into the viewport at `scale`, centered. */
export function computeBoardLayout(
  viewW: number,
  viewH: number,
  imageW: number,
  imageH: number,
  grid: Grid,
  scale = 0.8,
): BoardLayout {
  if (viewW <= 0 || viewH <= 0 || imageW <= 0 || imageH <= 0) {
    throw new Error('Board layout needs a non-empty viewport and image')
  }
  const fit = scale * Math.min(viewW / imageW, viewH / imageH)
  const width = imageW * fit
  const height = imageH * fit
  const pieceW = width / grid.cols
  const pieceH = height / grid.rows
  return {
    x: (viewW - width) / 2,
    y: (viewH - height) / 2,
    width,
    height,
    pieceW,
    pieceH,
    tab: 0.2 * Math.min(pieceW, pieceH),
  }
}
