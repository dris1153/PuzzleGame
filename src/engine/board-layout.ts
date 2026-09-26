import type { BoardLayout, Grid } from './types'

export interface BoardFit {
  /** Max share of the viewport the board may take on each axis. */
  scaleW: number
  scaleH: number
  placement: 'center' | 'top'
}

const TOP_GAP = 12

/** Portrait: a wide board at the top, pieces below. Landscape: a smaller centered board, pieces on the sides. */
export function boardFit(viewW: number, viewH: number): BoardFit {
  return viewH > viewW
    ? { scaleW: 0.94, scaleH: 0.6, placement: 'top' }
    : { scaleW: 0.56, scaleH: 0.8, placement: 'center' }
}

export function computeBoardLayout(
  viewW: number,
  viewH: number,
  imageW: number,
  imageH: number,
  grid: Grid,
  fit: BoardFit = { scaleW: 0.8, scaleH: 0.8, placement: 'center' },
): BoardLayout {
  if (viewW <= 0 || viewH <= 0 || imageW <= 0 || imageH <= 0) {
    throw new Error('Board layout needs a non-empty viewport and image')
  }
  const k = Math.min((fit.scaleW * viewW) / imageW, (fit.scaleH * viewH) / imageH)
  const width = imageW * k
  const height = imageH * k
  const pieceW = width / grid.cols
  const pieceH = height / grid.rows
  const centeredY = (viewH - height) / 2
  return {
    x: (viewW - width) / 2,
    y: fit.placement === 'top' ? Math.min(TOP_GAP, centeredY) : centeredY,
    width,
    height,
    pieceW,
    pieceH,
    tab: 0.2 * Math.min(pieceW, pieceH),
  }
}
