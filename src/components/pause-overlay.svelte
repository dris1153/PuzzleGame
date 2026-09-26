<script lang="ts">
  import { onMount } from 'svelte'

  interface Props {
    onResume: () => void
    onRestart: () => void
  }

  let { onResume, onRestart }: Props = $props()
  let resumeButton: HTMLButtonElement

  // The Pause button that opened this is now disabled, so focus would otherwise fall to <body>.
  onMount(() => resumeButton.focus())

  function onKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') onResume()
  }
</script>

<svelte:window onkeydown={onKeydown} />

<!-- Opaque on purpose: the board must not be studied while the clock is stopped. -->
<div class="overlay" role="dialog" aria-modal="true" aria-labelledby="pause-title">
  <h2 id="pause-title">Paused</h2>
  <div class="actions">
    <button type="button" bind:this={resumeButton} onclick={onResume}>Resume</button>
    <button type="button" onclick={onRestart}>Restart</button>
  </div>
</div>

<style>
  .overlay {
    position: absolute;
    inset: 0;
    display: grid;
    place-content: center;
    gap: 1rem;
    text-align: center;
    background: #f4efe6;
  }

  .actions {
    display: flex;
    gap: 0.75rem;
  }
</style>
