<script lang="ts">
  import { onMount } from 'svelte'
  import GameHud from '../components/game-hud.svelte'
  import PauseOverlay from '../components/pause-overlay.svelte'
  import WinModal from '../components/win-modal.svelte'
  import type { GameConfig } from '../data/game-config'
  import { GameSession, type SessionResult, type SessionStatus } from '../engine/game-session'
  import { createPuzzleGame, type PuzzleGame } from '../engine/puzzle-game'
  import { computeStars, type Stars } from '../engine/scoring'
  import { loadImage } from '../lib/load-image'
  import { progress } from '../stores/progress-store.svelte'

  let { config }: { config: GameConfig } = $props()

  const total = $derived(config.rows * config.cols)
  let canvas: HTMLCanvasElement
  let image: HTMLImageElement | null = null
  let game: PuzzleGame | null = null
  let session = new GameSession(0)
  // What this game has already added to the global stats; flushes only send the difference.
  let flushed = { ms: 0, placed: 0, completed: false }

  let loadState = $state<'loading' | 'ready' | 'error'>('loading')
  let hud = $state.raw({ status: 'ready' as SessionStatus, moves: 0, placed: 0, elapsedMs: 0 })
  const status = $derived(hud.status)
  let win = $state.raw<(SessionResult & { stars: Stars; isNewBest: boolean }) | null>(null)

  function sync() {
    hud = { status: session.status, moves: session.moves, placed: session.placed, elapsedMs: session.elapsedMs() }
  }

  /** Safe to call any time (win, restart, hide, unmount, pagehide); a page restored from bfcache keeps counting. */
  function flushStats() {
    if (session.status === 'ready') return
    const ms = session.elapsedMs()
    const completed = session.status === 'won' && !flushed.completed
    if (ms === flushed.ms && session.placed === flushed.placed && !completed) return
    progress.recordGameEnd(ms - flushed.ms, session.placed - flushed.placed, completed)
    flushed = { ms, placed: session.placed, completed: flushed.completed || completed }
  }

  function startGame() {
    game?.destroy()
    session = new GameSession(total)
    flushed = { ms: 0, placed: 0, completed: false }
    win = null
    game = createPuzzleGame({
      canvas,
      image: image!,
      rows: config.rows,
      cols: config.cols,
      onPickup: () => {
        if (session.status !== 'ready') return
        session.start()
        progress.recordGameStart()
        sync()
      },
      onMove: () => {
        session.recordMove()
        sync()
      },
      onPiecePlaced: () => {
        session.recordPlaced()
        sync()
      },
      onComplete: finish,
    })
    sync()
  }

  function finish() {
    const result = session.complete()
    if (!result) return
    const stars = computeStars({ ...result, parSec: config.parSec })
    const isNewBest = progress.recordWin(config, result, stars)
    flushStats()
    win = { ...result, stars, isNewBest }
    sync()
  }

  function pause() {
    game?.setPaused(true) // before session.pause(): an interrupted drag is still recorded as a move
    session.pause()
    sync()
  }

  function resume() {
    session.resume()
    game?.setPaused(false)
    sync()
  }

  function restart() {
    flushStats()
    startGame()
  }

  // Mobile browsers often skip pagehide when switching apps, so flush on hide too.
  function onVisibilityChange() {
    if (!document.hidden) return
    if (session.status === 'playing') pause()
    flushStats()
  }

  $effect(() => {
    if (status !== 'playing') return
    const id = setInterval(sync, 250)
    return () => clearInterval(id)
  })

  onMount(() => {
    let cancelled = false
    loadImage(config.imageSrc)
      .then((img) => {
        if (cancelled) return
        image = img
        loadState = 'ready'
        startGame()
      })
      .catch((err) => {
        console.error(err)
        if (!cancelled) loadState = 'error'
      })
    return () => {
      cancelled = true
      flushStats()
      game?.destroy()
    }
  })
</script>

<svelte:document onvisibilitychange={onVisibilityChange} />
<svelte:window onpagehide={flushStats} />

<section class="game">
  <GameHud
    elapsedMs={hud.elapsedMs}
    moves={hud.moves}
    placed={hud.placed}
    {total}
    canPause={status === 'playing'}
    onPause={pause}
  />
  <div class="board">
    <canvas bind:this={canvas}></canvas>
    {#if loadState === 'loading'}
      <p class="status">Loading…</p>
    {:else if loadState === 'error'}
      <p class="status">Could not load the puzzle image.</p>
    {/if}
    {#if status === 'paused'}
      <PauseOverlay onResume={resume} onRestart={restart} />
    {/if}
    {#if win}
      <WinModal timeMs={win.timeMs} moves={win.moves} stars={win.stars} isNewBest={win.isNewBest} onReplay={restart} />
    {/if}
  </div>
</section>

<style>
  .game {
    position: fixed;
    inset: 0;
    display: flex;
    flex-direction: column;
    user-select: none;
    -webkit-user-select: none;
    -webkit-touch-callout: none;
    -webkit-tap-highlight-color: transparent;
  }

  .board {
    position: relative;
    flex: 1;
    min-height: 0;
  }

  canvas {
    display: block;
    width: 100%;
    height: 100%;
    touch-action: none;
  }

  .status {
    position: absolute;
    inset: 50% auto auto 50%;
    transform: translate(-50%, -50%);
  }
</style>
