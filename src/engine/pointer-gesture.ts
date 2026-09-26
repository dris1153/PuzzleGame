/** A release closer than this to the press point is not a drag (no move is counted). */
export const DRAG_THRESHOLD_PX = 5
export const TAP_MAX_DURATION_MS = 300

export function classifyRelease(distancePx: number, durationMs: number): 'tap' | 'drag' {
  return distancePx <= DRAG_THRESHOLD_PX && durationMs < TAP_MAX_DURATION_MS ? 'tap' : 'drag'
}
