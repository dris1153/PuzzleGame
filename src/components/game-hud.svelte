<script lang="ts">
  import { t } from '../i18n/i18n.svelte'
  import { formatTime } from '../lib/format-time'

  interface Props {
    elapsedMs: number
    moves: number
    placed: number
    total: number
    canPause: boolean
    onPause: () => void
    onMenu: () => void
  }

  let { elapsedMs, moves, placed, total, canPause, onPause, onMenu }: Props = $props()
</script>

<header class="hud">
  <button type="button" onclick={onMenu}>{t('hud.menu')}</button>
  <dl class="metrics">
    <div><dt>{t('hud.time')}</dt><dd>{formatTime(elapsedMs)}</dd></div>
    <div><dt>{t('hud.moves')}</dt><dd>{moves}</dd></div>
    <div><dt>{t('hud.pieces')}</dt><dd>{placed}/{total}</dd></div>
  </dl>
  <button type="button" onclick={onPause} disabled={!canPause}>{t('hud.pause')}</button>
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
