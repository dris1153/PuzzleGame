<script lang="ts">
  import { onMount } from 'svelte'
  import type { Stars } from '../engine/scoring'
  import { formatTime } from '../lib/format-time'

  interface Props {
    timeMs: number
    moves: number
    stars: Stars
    isNewBest: boolean
    onReplay: () => void
  }

  let { timeMs, moves, stars, isNewBest, onReplay }: Props = $props()
  let replayButton: HTMLButtonElement

  onMount(() => replayButton.focus())
</script>

<div class="backdrop">
  <div class="modal" role="dialog" aria-modal="true" aria-labelledby="win-title">
    <h2 id="win-title">Puzzle complete!</h2>
    <p class="stars" role="img" aria-label="{stars} of 3 stars">
      {'★'.repeat(stars)}{'☆'.repeat(3 - stars)}
    </p>
    <p>Time {formatTime(timeMs)} · Moves {moves}</p>
    {#if isNewBest}<p class="best">New best time!</p>{/if}
    <button type="button" bind:this={replayButton} onclick={onReplay}>Play again</button>
  </div>
</div>

<style>
  .backdrop {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    background: rgb(0 0 0 / 0.35);
  }

  .modal {
    display: grid;
    gap: 0.75rem;
    padding: 1.5rem 2rem;
    text-align: center;
    background: #fff;
    border-radius: 1rem;
  }

  .stars {
    font-size: 2rem;
    color: #f5a623;
  }

  .best {
    font-weight: 700;
  }
</style>
