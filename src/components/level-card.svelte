<script lang="ts">
  import { levelThumb, type LevelDef } from '../data/levels'
  import { t } from '../i18n/i18n.svelte'
  import { formatTime } from '../lib/format-time'
  import type { LevelRecord } from '../stores/progress-schema'

  interface Props {
    level: LevelDef
    number: number
    unlocked: boolean
    record?: LevelRecord
    onPlay: () => void
  }

  let { level, number, unlocked, record, onPlay }: Props = $props()
</script>

<button type="button" class="card" disabled={!unlocked} onclick={onPlay}>
  <img src={levelThumb(level)} alt="" width="360" height="240" loading="lazy" />
  <span class="title">{t('levels.level', { n: number })}</span>
  <span class="meta">
    {t('levels.grid', { rows: level.rows, cols: level.cols })}
    {#if level.rotation}· {t('levels.rotation')}{/if}
  </span>
  {#if !unlocked}
    <span class="meta"><span aria-hidden="true">🔒</span> {t('levels.locked')}</span>
  {:else if record}
    <span class="meta">
      <span role="img" aria-label={t('win.stars', { count: record.stars })}>
        {'★'.repeat(record.stars)}{'☆'.repeat(3 - record.stars)}
      </span>
      · {t('levels.best', { time: formatTime(record.bestMs) })}
    </span>
  {/if}
</button>

<style>
  .card {
    display: grid;
    gap: 0.25rem;
    padding: 0.5rem;
    text-align: left;
    font: inherit;
  }

  .card:disabled img {
    filter: grayscale(1) opacity(0.5);
  }

  img {
    width: 100%;
    height: auto;
    border-radius: 0.5rem;
  }

  .title {
    font-weight: 700;
  }

  .meta {
    font-size: 0.85rem;
  }
</style>
