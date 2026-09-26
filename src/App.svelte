<script lang="ts">
  import { onMount } from 'svelte'
  import { createPuzzleGame } from './engine/puzzle-game'
  import { loadImage } from './lib/load-image'

  let canvas: HTMLCanvasElement
  let status = $state<'loading' | 'ready' | 'error'>('loading')

  onMount(() => {
    let destroy: (() => void) | undefined
    let cancelled = false
    loadImage(`${import.meta.env.BASE_URL}levels/level-01.jpg`)
      .then((image) => {
        if (cancelled) return
        destroy = createPuzzleGame({ canvas, image, rows: 3, cols: 3 }).destroy
        status = 'ready'
      })
      .catch((err) => {
        console.error(err)
        if (!cancelled) status = 'error'
      })
    return () => {
      cancelled = true
      destroy?.()
    }
  })
</script>

<main class="stage">
  <canvas bind:this={canvas}></canvas>
  {#if status === 'loading'}
    <p class="status">Loading…</p>
  {:else if status === 'error'}
    <p class="status">Could not load the puzzle image.</p>
  {/if}
</main>

<style>
  .stage {
    position: fixed;
    inset: 0;
    user-select: none;
    -webkit-user-select: none;
    -webkit-touch-callout: none;
    -webkit-tap-highlight-color: transparent;
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
