import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPieces } from './piece-generator'
import { attachPointerController, type DragHandlers } from './pointer-controller'

type Listener = (e: unknown) => void

/** Just enough of a canvas for the controller: listeners, a rect at the origin and pointer capture. */
function fakeCanvas() {
  const listeners = new Map<string, Listener>()
  const captured = new Set<number>()
  const canvas = {
    addEventListener: (type: string, fn: Listener) => listeners.set(type, fn),
    removeEventListener: (type: string) => listeners.delete(type),
    getBoundingClientRect: () => ({ left: 0, top: 0 }),
    setPointerCapture: (id: number) => captured.add(id),
    hasPointerCapture: (id: number) => captured.has(id),
    releasePointerCapture: (id: number) => captured.delete(id),
  }
  const fire = (type: string, init: { x?: number; y?: number; t?: number; id?: number; button?: number; primary?: boolean } = {}) =>
    listeners.get(type)?.({
      type,
      pointerId: init.id ?? 1,
      clientX: init.x ?? 0,
      clientY: init.y ?? 0,
      timeStamp: init.t ?? 0,
      isPrimary: init.primary ?? true,
      pointerType: 'mouse',
      button: init.button ?? 0,
      preventDefault() {},
    })
  return { canvas: canvas as unknown as HTMLCanvasElement, fire, listeners }
}

describe('attachPointerController', () => {
  const piece = createPieces({ rows: 1, cols: 1 })[0]
  let h: { [K in keyof DragHandlers]: ReturnType<typeof vi.fn> }
  let c: ReturnType<typeof fakeCanvas>
  let controller: ReturnType<typeof attachPointerController>

  beforeEach(() => {
    h = {
      enabled: vi.fn(() => true),
      pick: vi.fn(() => piece),
      toBoard: vi.fn(({ x, y }) => ({ u: x / 100, v: y / 100 })),
      grab: vi.fn(),
      move: vi.fn(),
      drop: vi.fn(),
      tap: vi.fn(),
    }
    c = fakeCanvas()
    controller = attachPointerController(c.canvas, h as unknown as DragHandlers)
  })

  it('treats a quick press and release as a tap, not a drop', () => {
    c.fire('pointerdown', { t: 0 })
    c.fire('pointerup', { t: 120 })
    expect(h.tap).toHaveBeenCalledWith(piece)
    expect(h.drop).not.toHaveBeenCalled()
  })

  it('drops with the dragged distance after a drag, and a slow press as a zero drop', () => {
    c.fire('pointerdown', { x: 10, y: 10, t: 0 })
    c.fire('pointermove', { x: 40, y: 50, t: 50 })
    c.fire('pointerup', { x: 40, y: 50, t: 100 })
    expect(h.drop).toHaveBeenLastCalledWith(piece, 50)
    c.fire('pointerdown', { t: 1000 })
    c.fire('pointerup', { t: 1400 })
    expect(h.drop).toHaveBeenLastCalledWith(piece, 0)
    expect(h.tap).not.toHaveBeenCalled()
  })

  it('never taps on cancel, and uses the last known position (cancel events carry no coordinates)', () => {
    c.fire('pointerdown', { x: 100, y: 100 })
    c.fire('pointermove', { x: 130, y: 140 })
    c.fire('pointercancel', { x: 0, y: 0, t: 10 })
    expect(h.drop).toHaveBeenCalledWith(piece, 50)
    expect(h.tap).not.toHaveBeenCalled()
  })

  it('ends a drag exactly once when lost capture follows pointerup', () => {
    c.fire('pointerdown')
    c.fire('pointerup', { t: 500 })
    c.fire('lostpointercapture', { t: 501 })
    expect(h.drop).toHaveBeenCalledTimes(1)
  })

  it('cancel() ends the drag silently, returns the distance and ignores the later pointerup', () => {
    c.fire('pointerdown', { x: 0, y: 0 })
    c.fire('pointermove', { x: 30, y: 40 })
    expect(controller.cancel()).toBe(50)
    c.fire('pointerup', { x: 30, y: 40, t: 50 })
    expect(h.drop).not.toHaveBeenCalled()
    expect(h.tap).not.toHaveBeenCalled()
    expect(controller.cancel()).toBe(0)
  })

  it('ignores secondary buttons, non-primary pointers and disabled input', () => {
    c.fire('pointerdown', { button: 2 })
    c.fire('pointerdown', { primary: false, id: 2 })
    h.enabled.mockReturnValue(false)
    c.fire('pointerdown')
    expect(h.grab).not.toHaveBeenCalled()
  })

  it('removes every listener on detach', () => {
    controller.detach()
    expect(c.listeners.size).toBe(0)
  })
})
