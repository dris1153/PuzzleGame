<script lang="ts">
  import { onMount } from 'svelte'
  import { t } from '../i18n/i18n.svelte'

  interface Props {
    onResume: () => void
    onRestart: () => void
    onQuit: () => void
  }

  let { onResume, onRestart, onQuit }: Props = $props()
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
  <h2 id="pause-title">{t('pause.title')}</h2>
  <div class="actions">
    <button type="button" bind:this={resumeButton} onclick={onResume}>{t('pause.resume')}</button>
    <button type="button" onclick={onRestart}>{t('pause.restart')}</button>
    <button type="button" onclick={onQuit}>{t('pause.quit')}</button>
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
