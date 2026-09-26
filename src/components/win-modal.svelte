<script lang="ts">
  import { onMount } from 'svelte'
  import type { Stars } from '../engine/scoring'
  import { t } from '../i18n/i18n.svelte'
  import { formatTime } from '../lib/format-time'

  interface Props {
    timeMs: number
    moves: number
    stars: Stars
    isNewBest: boolean
    onReplay: () => void
    onMenu: () => void
    /** Omitted when there is no next level. */
    onNext?: () => void
  }

  let { timeMs, moves, stars, isNewBest, onReplay, onMenu, onNext }: Props = $props()
  let primaryButton = $state<HTMLButtonElement>()

  onMount(() => primaryButton?.focus())
</script>

<div class="backdrop">
  <div class="modal" role="dialog" aria-modal="true" aria-labelledby="win-title">
    <h2 id="win-title">{t('win.title')}</h2>
    <p class="stars" role="img" aria-label={t('win.stars', { count: stars })}>
      {'★'.repeat(stars)}{'☆'.repeat(3 - stars)}
    </p>
    <p>{t('win.summary', { time: formatTime(timeMs), moves })}</p>
    {#if isNewBest}<p class="best">{t('win.newBest')}</p>{/if}
    <div class="actions">
      {#if onNext}
        <button type="button" bind:this={primaryButton} onclick={onNext}>{t('win.next')}</button>
        <button type="button" onclick={onReplay}>{t('win.replay')}</button>
      {:else}
        <button type="button" bind:this={primaryButton} onclick={onReplay}>{t('win.replay')}</button>
      {/if}
      <button type="button" onclick={onMenu}>{t('win.menu')}</button>
    </div>
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

  .actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.5rem;
  }
</style>
