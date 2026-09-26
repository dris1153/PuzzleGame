import { describe, expect, it } from 'vitest'
import { createAnimations, HINT_MS, hintAlpha, isAnimating, POP_MS, popScale, ROTATE_MS, rotationAngle, setHintPaused } from './board-animations'
import { createPieces } from './piece-generator'

const QUARTER = Math.PI / 2

describe('rotationAngle', () => {
  it('tweens a quarter turn forward, then settles and stops animating', () => {
    const anims = createAnimations()
    const piece = createPieces({ rows: 1, cols: 1 })[0]
    // Tapped at t=1000 while at 3 quarter turns → now 0; must animate 270° → 360°, not back to 0°.
    piece.rotation = 0
    anims.rotating.set(piece.id, { from: 3 * QUARTER, start: 1000 })
    expect(rotationAngle(piece, anims, 1000)).toBeCloseTo(3 * QUARTER)
    const mid = rotationAngle(piece, anims, 1000 + ROTATE_MS / 2)
    expect(mid).toBeGreaterThan(3 * QUARTER)
    expect(mid).toBeLessThan(4 * QUARTER)
    expect(isAnimating(anims)).toBe(true)
    expect(rotationAngle(piece, anims, 1000 + ROTATE_MS)).toBe(0)
    expect(isAnimating(anims)).toBe(false)
  })

  it('uses the resting angle when not rotating', () => {
    const piece = { ...createPieces({ rows: 1, cols: 1 })[0], rotation: 2 as const }
    expect(rotationAngle(piece, createAnimations(), 0)).toBe(Math.PI)
  })
})

describe('rotationAngle with multiple pieces', () => {
  it('independently tracks rotation angle for each piece in the map', () => {
    const anims = createAnimations()
    const piece1 = createPieces({ rows: 1, cols: 2 })[0]
    const piece2 = createPieces({ rows: 1, cols: 2 })[1]
    const start = 1000

    piece1.rotation = 0
    piece2.rotation = 0
    anims.rotating.set(piece1.id, { from: 0, start })
    anims.rotating.set(piece2.id, { from: QUARTER, start: start + ROTATE_MS / 4 })

    // At t=1000, piece1 is mid-tween, piece2 hasn't started yet
    expect(rotationAngle(piece1, anims, start + ROTATE_MS / 2)).toBeGreaterThan(0)
    expect(rotationAngle(piece1, anims, start + ROTATE_MS / 2)).toBeLessThan(QUARTER)
    expect(rotationAngle(piece2, anims, start + ROTATE_MS / 4)).toBeCloseTo(QUARTER) // hasn't moved yet (t=0)

    // Both complete after their respective durations
    expect(rotationAngle(piece1, anims, start + ROTATE_MS)).toBe(0)
    expect(rotationAngle(piece2, anims, start + ROTATE_MS / 4 + ROTATE_MS)).toBe(0)
    expect(isAnimating(anims)).toBe(false)
  })
})

describe('hintAlpha', () => {
  it('pulses within 0.1..1 until the hint expires', () => {
    const anims = createAnimations()
    anims.hint = { pieceId: 0, until: 500 + HINT_MS }
    for (let t = 500; t < 500 + HINT_MS; t += 97) {
      const a = hintAlpha(anims, t)!
      expect(a).toBeGreaterThanOrEqual(0.1)
      expect(a).toBeLessThanOrEqual(1)
    }
    expect(hintAlpha(anims, 500 + HINT_MS)).toBeNull()
    expect(isAnimating(anims)).toBe(false)
  })
})

describe('setHintPaused', () => {
  it('stops the hint clock while paused and resumes with the time that was left', () => {
    const anims = createAnimations()
    anims.hint = { pieceId: 0, until: 2000 }
    setHintPaused(anims, true, 1500) // 500 ms left
    expect(isAnimating(anims)).toBe(false)
    expect(hintAlpha(anims, 60_000)).not.toBeNull() // a redraw during a long pause keeps it
    setHintPaused(anims, false, 60_000)
    expect(hintAlpha(anims, 60_499)).not.toBeNull()
    expect(hintAlpha(anims, 60_500)).toBeNull()
  })
})

describe('popScale', () => {
  it('swells and settles back to 1, then stops animating', () => {
    const anims = createAnimations()
    const piece = createPieces({ rows: 1, cols: 1 })[0]
    anims.popping.set(piece.id, 0)
    expect(popScale(piece, anims, POP_MS / 2)).toBeCloseTo(1.12)
    expect(isAnimating(anims)).toBe(true)
    expect(popScale(piece, anims, POP_MS)).toBe(1)
    expect(isAnimating(anims)).toBe(false)
  })
})
