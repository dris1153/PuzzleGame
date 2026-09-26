<script lang="ts">
  import { levelThumb, type LevelDef } from '../data/levels'
  import { t } from '../i18n/i18n.svelte'
  import { formatTime } from '../lib/format-time'
  import type { LevelRecord } from '../stores/progress-schema'
  import AppIcon from './ui/app-icon.svelte'
  import StarRating from './ui/star-rating.svelte'

  interface Props {
    level: LevelDef
    number: number
    unlocked: boolean
    record?: LevelRecord
    onPlay: () => void
  }

  let { level, number, unlocked, record, onPlay }: Props = $props()
  const tilt = $derived(number % 2 ? -1 : 1)
</script>

<button type="button" class="card" style:--tilt="{tilt}deg" disabled={!unlocked} onclick={onPlay}>
  <span class="thumb">
    <img src={levelThumb(level)} alt="" width="360" height="240" loading="lazy" />
    <span class="number" aria-hidden="true">{number}</span>
    {#if !unlocked}<span class="lock"><AppIcon name="lock" size={32} /></span>{/if}
  </span>
  <span class="title">{t('levels.level', { n: number })}</span>
  <span class="chips">
    <span class="chip">{t('levels.grid', { rows: level.rows, cols: level.cols })}</span>
    {#if level.rotation}<span class="chip rotate">{t('levels.rotation')}</span>{/if}
  </span>
  {#if !unlocked}
    <span class="meta">{t('levels.locked')}</span>
  {:else if record}
    <span class="meta">
      <StarRating stars={record.stars} />
      {t('levels.best', { time: formatTime(record.bestMs) })}
    </span>
  {:else}
    <span class="meta"><StarRating stars={0} /></span>
  {/if}
</button>

<style>
  .card {
    display: grid;
    gap: var(--space-2);
    align-content: start;
    padding: var(--space-3);
    text-align: left;
    background: var(--paper);
    border: var(--border);
    border-radius: var(--radius-md);
    box-shadow: var(--lift);
    transition:
      transform var(--dur) var(--ease-bounce),
      box-shadow var(--dur) var(--ease-out);
  }

  .card:not(:disabled):hover {
    transform: translateY(-4px) rotate(var(--tilt));
    box-shadow: 0 9px 0 var(--ink);
  }

  .card:not(:disabled):active {
    transform: translateY(3px);
    box-shadow: var(--lift-pressed);
  }

  .card:disabled {
    background: #f1ece2;
    box-shadow: var(--lift-pressed);
  }

  .thumb {
    position: relative;
    display: block;
  }

  img {
    display: block;
    width: 100%;
    height: auto;
    aspect-ratio: 3 / 2;
    object-fit: cover;
    border: 2px solid var(--ink);
    border-radius: var(--radius-sm);
  }

  .card:disabled img {
    filter: grayscale(1) opacity(0.45);
  }

  .number {
    position: absolute;
    top: -10px;
    left: -10px;
    display: grid;
    place-items: center;
    width: 36px;
    height: 36px;
    font-family: var(--font-display);
    font-size: 1.2rem;
    font-weight: 800;
    background: var(--sunny);
    border: var(--border);
    border-radius: 50%;
  }

  .lock {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
  }

  .title {
    font-family: var(--font-display);
    font-size: 1.2rem;
    font-weight: 800;
  }

  .chips {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-1);
  }

  .chip {
    padding: 0 var(--space-2);
    font-size: 0.8rem;
    background: var(--sky);
    border: 2px solid var(--ink);
    border-radius: var(--radius-pill);
  }

  .chip.rotate {
    background: var(--grape);
  }

  .meta {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-2);
    font-size: 0.85rem;
    color: var(--ink-soft);
  }
</style>
