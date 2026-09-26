import { distance } from './geometry'
import { classifyRelease } from './pointer-gesture'
import type { BoardPoint, Piece, Point } from './types'

export interface DragHandlers {
  enabled(): boolean
  pick(point: Point): Piece | null
  toBoard(point: Point): BoardPoint
  grab(piece: Piece): void
  move(piece: Piece, to: BoardPoint): void
  drop(piece: Piece, movedPx: number): void
  /** A quick press and release without dragging. */
  tap(piece: Piece): void
}

interface DragState {
  pointerId: number
  piece: Piece
  start: Point
  /** Latest known position; `pointercancel` carries no reliable coordinates. */
  last: Point
  offset: BoardPoint
  startTime: number
}

export interface PointerController {
  detach(): void
  /** Ends the current drag in place without a drop (no snap). Returns the distance dragged, 0 if idle. */
  cancel(): number
}

/** Wires Pointer Events on the canvas to drag handlers. */
export function attachPointerController(canvas: HTMLCanvasElement, h: DragHandlers): PointerController {
  let drag: DragState | null = null

  const toPoint = (e: PointerEvent): Point => {
    const rect = canvas.getBoundingClientRect()
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  const onDown = (e: PointerEvent) => {
    if (drag || !e.isPrimary || (e.pointerType === 'mouse' && e.button !== 0) || !h.enabled()) return
    const point = toPoint(e)
    const piece = h.pick(point)
    if (!piece) return
    e.preventDefault()
    canvas.setPointerCapture(e.pointerId)
    const b = h.toBoard(point)
    drag = {
      pointerId: e.pointerId,
      piece,
      start: point,
      last: point,
      offset: { u: piece.u - b.u, v: piece.v - b.v },
      startTime: e.timeStamp,
    }
    h.grab(piece)
  }

  const onMove = (e: PointerEvent) => {
    if (!drag || e.pointerId !== drag.pointerId) return
    drag.last = toPoint(e)
    const b = h.toBoard(drag.last)
    h.move(drag.piece, { u: b.u + drag.offset.u, v: b.v + drag.offset.v })
  }

  // Also handles pointercancel and lost capture, so a drag can never get stuck.
  const onEnd = (e: PointerEvent) => {
    if (!drag || e.pointerId !== drag.pointerId) return
    const { piece, start, last, startTime } = drag
    drag = null
    const moved = distance(start, last)
    if (e.type === 'pointerup' && classifyRelease(moved, e.timeStamp - startTime) === 'tap') h.tap(piece)
    else h.drop(piece, moved)
  }

  const onContextMenu = (e: Event) => e.preventDefault()

  const events = [
    ['pointerdown', onDown],
    ['pointermove', onMove],
    ['pointerup', onEnd],
    ['pointercancel', onEnd],
    ['lostpointercapture', onEnd],
    ['contextmenu', onContextMenu],
  ] as const
  for (const [type, fn] of events) canvas.addEventListener(type, fn as EventListener)
  return {
    detach() {
      for (const [type, fn] of events) canvas.removeEventListener(type, fn as EventListener)
    },
    cancel() {
      if (!drag) return 0
      const { pointerId, start, last } = drag
      drag = null
      if (canvas.hasPointerCapture(pointerId)) canvas.releasePointerCapture(pointerId)
      return distance(start, last)
    },
  }
}
