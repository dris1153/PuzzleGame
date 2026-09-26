export type SessionStatus = 'ready' | 'playing' | 'paused' | 'won'

export interface SessionResult {
  timeMs: number
  moves: number
  hints: number
  pieces: number
}

/** Metrics for one game. Illegal transitions are no-ops; the timer starts on `start()`, not on creation. */
export class GameSession {
  status: SessionStatus = 'ready'
  moves = 0
  placed = 0
  hintsUsed = 0
  readonly totalPieces: number
  readonly maxHints: number
  private readonly now: () => number
  private accumulatedMs = 0
  private resumedAt = 0

  constructor(totalPieces: number, opts: { maxHints?: number; now?: () => number } = {}) {
    this.totalPieces = totalPieces
    this.maxHints = opts.maxHints ?? 3
    this.now = opts.now ?? (() => performance.now())
  }

  elapsedMs(): number {
    return this.accumulatedMs + (this.status === 'playing' ? this.now() - this.resumedAt : 0)
  }

  get hintsLeft(): number {
    return this.maxHints - this.hintsUsed
  }

  start(): void {
    if (this.status !== 'ready') return
    this.status = 'playing'
    this.resumedAt = this.now()
  }

  pause(): void {
    if (this.status !== 'playing') return
    this.accumulatedMs = this.elapsedMs()
    this.status = 'paused'
  }

  resume(): void {
    if (this.status !== 'paused') return
    this.status = 'playing'
    this.resumedAt = this.now()
  }

  recordMove(): void {
    if (this.status === 'playing') this.moves++
  }

  recordPlaced(): void {
    if (this.status === 'playing') this.placed++
  }

  /** Returns false when no hint is available. */
  recordHint(): boolean {
    if (this.status !== 'playing' || this.hintsLeft <= 0) return false
    this.hintsUsed++
    return true
  }

  /** Stops the clock; `null` unless the game is being played. */
  complete(): SessionResult | null {
    if (this.status !== 'playing') return null
    this.accumulatedMs = this.elapsedMs()
    this.status = 'won'
    return { timeMs: this.accumulatedMs, moves: this.moves, hints: this.hintsUsed, pieces: this.totalPieces }
  }
}
