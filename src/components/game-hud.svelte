<script lang="ts">
  import { formatTime } from '../lib/format-time'

  interface Props {
    elapsedMs: number
    moves: number
    placed: number
    total: number
    canPause: boolean
    onPause: () => void
  }

  let { elapsedMs, moves, placed, total, canPause, onPause }: Props = $props()
</script>

<header class="hud">
  <dl class="metrics">
    <div><dt>Time</dt><dd>{formatTime(elapsedMs)}</dd></div>
    <div><dt>Moves</dt><dd>{moves}</dd></div>
    <div><dt>Pieces</dt><dd>{placed}/{total}</dd></div>
  </dl>
  <button type="button" onclick={onPause} disabled={!canPause}>Pause</button>
</header>

<style>
  .hud {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.5rem 1rem;
  }

  .metrics {
    display: flex;
    gap: 1.5rem;
  }

  dt {
    font-size: 0.75rem;
    opacity: 0.7;
  }

  dd {
    font-size: 1.25rem;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
  }
</style>
