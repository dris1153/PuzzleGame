import { describe, expect, it } from 'vitest'
import { GameSession } from './game-session'

function setup(totalPieces = 9) {
  const clock = { t: 1000 }
  const session = new GameSession(totalPieces, { now: () => clock.t })
  return { clock, session }
}

describe('GameSession', () => {
  it('does not run the clock before start', () => {
    const { clock, session } = setup()
    clock.t += 5000
    expect(session.elapsedMs()).toBe(0)
    session.recordMove()
    session.recordPlaced()
    expect(session).toMatchObject({ status: 'ready', moves: 0, placed: 0 })
  })

  it('excludes paused time', () => {
    const { clock, session } = setup()
    session.start()
    clock.t += 3000
    session.pause()
    clock.t += 60_000
    expect(session.elapsedMs()).toBe(3000)
    session.resume()
    clock.t += 2000
    expect(session.elapsedMs()).toBe(5000)
  })

  it('ignores moves while paused', () => {
    const { session } = setup()
    session.start()
    session.recordMove()
    session.pause()
    session.recordMove()
    session.recordPlaced()
    expect(session).toMatchObject({ moves: 1, placed: 0 })
  })

  it('starts only once', () => {
    const { clock, session } = setup()
    session.start()
    clock.t += 4000
    session.start()
    expect(session.elapsedMs()).toBe(4000)
  })

  it('completes with a frozen result and ignores later transitions', () => {
    const { clock, session } = setup(4)
    session.start()
    session.recordMove()
    session.recordMove()
    clock.t += 7000
    expect(session.complete()).toEqual({ timeMs: 7000, moves: 2, hints: 0, pieces: 4 })
    clock.t += 9000
    session.pause()
    session.resume()
    session.recordMove()
    expect(session.status).toBe('won')
    expect(session.elapsedMs()).toBe(7000)
    expect(session.moves).toBe(2)
    expect(session.complete()).toBeNull()
  })

  it('cannot complete a game that is not being played', () => {
    const { session } = setup()
    expect(session.complete()).toBeNull()
    session.start()
    session.pause()
    expect(session.complete()).toBeNull()
  })

  it('limits hints', () => {
    const { session } = setup()
    expect(session.recordHint()).toBe(false)
    session.start()
    expect([session.recordHint(), session.recordHint(), session.recordHint(), session.recordHint()]).toEqual([
      true,
      true,
      true,
      false,
    ])
    expect(session.hintsLeft).toBe(0)
  })

  it('accumulates time across multiple pause/resume cycles', () => {
    const { clock, session } = setup()
    session.start()
    clock.t += 1000
    session.pause()
    expect(session.elapsedMs()).toBe(1000)
    clock.t += 2000
    session.resume()
    clock.t += 500
    session.pause()
    expect(session.elapsedMs()).toBe(1500)
    clock.t += 5000
    session.resume()
    clock.t += 300
    expect(session.elapsedMs()).toBe(1800)
  })

  it('rejects recordHint when paused', () => {
    const { session } = setup()
    session.start()
    expect(session.recordHint()).toBe(true)
    session.pause()
    expect(session.recordHint()).toBe(false)
    expect(session.hintsUsed).toBe(1)
    session.resume()
    expect(session.recordHint()).toBe(true)
    expect(session.hintsUsed).toBe(2)
  })

  it('tracks pieces placed separately from total pieces', () => {
    const { session } = setup(9)
    session.start()
    session.recordPlaced()
    session.recordPlaced()
    session.recordPlaced()
    expect(session.placed).toBe(3)
    const result = session.complete()
    expect(result?.pieces).toBe(9)
    expect(session.placed).toBe(3)
  })
})
