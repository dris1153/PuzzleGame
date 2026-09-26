<script lang="ts">
  import { onMount } from 'svelte'
  import GameHud from '../components/game-hud.svelte'
  import PauseOverlay from '../components/pause-overlay.svelte'
  import WinModal from '../components/win-modal.svelte'
  import type { GameConfig } from '../data/game-config'
  import { t } from '../i18n/i18n.svelte'
  import { loadImage } from '../lib/load-image'
  import { GameController } from './game-controller.svelte'

  interface Props {
    /** Read once; remount the screen (`{#key}`) to play a different config. */
    config: GameConfig
    onExit: () => void
    onNext?: () => void
  }

  let { config, onExit, onNext }: Props = $props()

  // svelte-ignore state_referenced_locally
  const controller = new GameController(config)
  const status = $derived(controller.hud.status)
  let canvas: HTMLCanvasElement
  let loadState = $state<'loading' | 'ready' | 'error'>('loading')

  function onVisibilityChange() {
    if (document.hidden) controller.onHidden()
  }

  $effect(() => {
    if (status !== 'playing') return
    const id = setInterval(controller.sync, 250)
    return () => clearInterval(id)
  })

  onMount(() => {
    let cancelled = false
    loadImage(config.imageSrc)
      .then((image) => {
        if (cancelled) return
        loadState = 'ready'
        controller.start(canvas, image)
      })
      .catch((err) => {
        console.error(err)
        if (!cancelled) loadState = 'error'
      })
    return () => {
      cancelled = true
      controller.destroy()
    }
  })
</script>

<svelte:document onvisibilitychange={onVisibilityChange} />
<svelte:window onpagehide={controller.flushStats} />

<section class="game">
  <GameHud
    elapsedMs={controller.hud.elapsedMs}
    moves={controller.hud.moves}
    placed={controller.hud.placed}
    total={controller.total}
    hintsLeft={controller.hud.hintsLeft}
    canHint={status === 'ready' || status === 'playing'}
    ghost={controller.ghost}
    canPause={status === 'playing'}
    onHint={controller.hint}
    onToggleGhost={controller.toggleGhost}
    onPause={controller.pause}
    onMenu={status === 'playing' ? controller.pause : onExit}
  />
  <div class="board">
    <canvas bind:this={canvas}></canvas>
    {#if loadState !== 'ready'}
      <p class="status">{loadState === 'loading' ? t('common.loading') : t('common.imageError')}</p>
    {/if}
    {#if status === 'paused'}
      <PauseOverlay onResume={controller.resume} onRestart={controller.restart} onQuit={onExit} />
    {/if}
    {#if controller.win}
      <WinModal {...controller.win} onReplay={controller.restart} {onNext} onMenu={onExit} />
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
