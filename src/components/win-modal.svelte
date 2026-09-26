<script lang="ts">
  import { onMount } from 'svelte'
  import type { Stars } from '../engine/scoring'
  import { t } from '../i18n/i18n.svelte'
  import { celebrate } from '../lib/celebrate'
  import { formatTime } from '../lib/format-time'
  import AppButton from './ui/app-button.svelte'
  import AppModal from './ui/app-modal.svelte'
  import StarRating from './ui/star-rating.svelte'

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

  onMount(() => void celebrate())
</script>

<AppModal labelledBy="win-title">
  <StarRating {stars} size="lg" animate />
  <h2 id="win-title">{t('win.title')}</h2>
  <p class="summary">{t('win.summary', { time: formatTime(timeMs), moves })}</p>
  {#if isNewBest}<p class="best">{t('win.newBest')}</p>{/if}
  <div class="actions">
    {#if onNext}
      <AppButton color="sunny" size="lg" icon="next" onclick={onNext}>{t('win.next')}</AppButton>
    {/if}
    <AppButton color={onNext ? 'paper' : 'sunny'} size={onNext ? 'md' : 'lg'} icon="restart" onclick={onReplay}>
      {t('win.replay')}
    </AppButton>
    <AppButton icon="home" onclick={onMenu}>{t('win.menu')}</AppButton>
  </div>
</AppModal>

<style>
  h2 {
    font-size: 2.2rem;
  }

  .summary {
    font-size: 1.1rem;
    font-variant-numeric: tabular-nums;
  }

  .best {
    padding: var(--space-1) var(--space-4);
    font-family: var(--font-display);
    font-weight: 800;
    background: var(--mint);
    border: var(--border);
    border-radius: var(--radius-pill);
    transform: rotate(-3deg);
  }

  .actions {
    display: grid;
    gap: var(--space-3);
    width: 100%;
  }
</style>
