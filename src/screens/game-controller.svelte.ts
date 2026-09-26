import { playSfx } from '../audio/sfx-player'
import type { GameConfig } from '../data/game-config'
import { GameSession, type SessionResult, type SessionStatus } from '../engine/game-session'
import { createPuzzleGame, type PuzzleGame } from '../engine/puzzle-game'
import { computeStars, type Stars } from '../engine/scoring'
import { progress } from '../stores/progress-store.svelte'
import { settings } from '../stores/settings-store.svelte'

export type WinInfo = SessionResult & { stars: Stars; isNewBest: boolean }

/** Wires one game screen: engine input → session metrics → persisted progress and stats. */
export class GameController {
  hud = $state.raw({ status: 'ready' as SessionStatus, moves: 0, placed: 0, elapsedMs: 0, hintsLeft: 0 })
  win = $state.raw<WinInfo | null>(null)
  ghost = $state(settings.current.ghostDefault)

  private readonly config: GameConfig
  private canvas: HTMLCanvasElement | null = null
  private image: HTMLImageElement | null = null
  private game: PuzzleGame | null = null
  private session = new GameSession(0)
  // What this game already added to the global stats; flushes only send the difference.
  private flushed = { ms: 0, placed: 0, completed: false }

  constructor(config: GameConfig) {
    this.config = config
  }

  get total(): number {
    return this.config.rows * this.config.cols
  }

  start(canvas: HTMLCanvasElement, image: HTMLImageElement): void {
    this.canvas = canvas
    this.image = image
    this.restart()
  }

  sync = (): void => {
    const s = this.session
    this.hud = { status: s.status, moves: s.moves, placed: s.placed, elapsedMs: s.elapsedMs(), hintsLeft: s.hintsLeft }
  }

  restart = (): void => {
    if (!this.canvas || !this.image) return
    this.flushStats()
    this.game?.destroy()
    this.session = new GameSession(this.total)
    this.flushed = { ms: 0, placed: 0, completed: false }
    this.win = null
    this.game = createPuzzleGame({
      canvas: this.canvas,
      image: this.image,
      rows: this.config.rows,
      cols: this.config.cols,
      rotation: this.config.rotation,
      ghost: this.ghost,
      onPickup: () => {
        playSfx('pickup')
        this.beginIfReady()
      },
      onMove: (snapped) => {
        if (!snapped) playSfx('drop')
        this.session.recordMove()
        this.sync()
      },
      onRotate: () => playSfx('rotate'),
      onPiecePlaced: () => {
        playSfx('snap')
        this.session.recordPlaced()
        this.sync()
      },
      onComplete: () => this.finish(),
    })
    this.sync()
  }

  /** Hints are allowed before the first pickup, so asking for one starts the clock too. */
  hint = (): void => {
    if (!this.game) return
    this.beginIfReady()
    if (this.session.status !== 'playing' || this.session.hintsLeft <= 0 || !this.game?.showHint()) return
    this.session.recordHint()
    playSfx('hint')
    this.sync()
  }

  toggleGhost = (): void => {
    this.ghost = !this.ghost
    this.game?.setGhostVisible(this.ghost)
  }

  private beginIfReady(): void {
    if (this.session.status !== 'ready') return
    this.session.start()
    progress.recordGameStart()
    this.sync()
  }

  pause = (): void => {
    this.game?.setPaused(true) // before session.pause(): an interrupted drag is still recorded as a move
    this.session.pause()
    this.sync()
  }

  resume = (): void => {
    this.session.resume()
    this.game?.setPaused(false)
    this.sync()
  }

  /** Mobile browsers often skip pagehide when switching apps, so flush on hide too. */
  onHidden = (): void => {
    if (this.session.status === 'playing') this.pause()
    this.flushStats()
  }

  /** Safe to call any time; a page restored from bfcache keeps counting. */
  flushStats = (): void => {
    const s = this.session
    if (s.status === 'ready') return
    const ms = s.elapsedMs()
    const completed = s.status === 'won' && !this.flushed.completed
    if (ms === this.flushed.ms && s.placed === this.flushed.placed && !completed) return
    progress.recordGameEnd(ms - this.flushed.ms, s.placed - this.flushed.placed, completed)
    this.flushed = { ms, placed: s.placed, completed: this.flushed.completed || completed }
  }

  destroy(): void {
    this.flushStats()
    this.game?.destroy()
    this.game = null
  }

  private finish(): void {
    const result = this.session.complete()
    if (!result) return
    const stars = computeStars({ ...result, parSec: this.config.parSec })
    const isNewBest = progress.recordWin(this.config, result, stars)
    this.flushStats()
    playSfx('win')
    this.win = { ...result, stars, isNewBest }
    this.sync()
  }
}
