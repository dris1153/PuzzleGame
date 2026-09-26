<script lang="ts">
  import { t } from '../i18n/i18n.svelte'
  import { formatTime } from '../lib/format-time'
  import AppButton from './ui/app-button.svelte'

  interface Props {
    elapsedMs: number
    moves: number
    placed: number
    total: number
    hintsLeft: number
    canHint: boolean
    ghost: boolean
    canPause: boolean
    onHint: () => void
    onToggleGhost: () => void
    onPause: () => void
    onMenu: () => void
  }

  let { elapsedMs, moves, placed, total, hintsLeft, canHint, ghost, canPause, onHint, onToggleGhost, onPause, onMenu }: Props =
    $props()

  const hintLabel = $derived(t('hud.hint', { count: hintsLeft }))
</script>

<header class="hud">
  <AppButton icon="menu" iconOnly aria-label={t('hud.menu')} title={t('hud.menu')} onclick={onMenu} />

  <dl class="metrics">
    <div class="time"><dt>{t('hud.time')}</dt><dd>{formatTime(elapsedMs)}</dd></div>
    <div><dt>{t('hud.moves')}</dt><dd>{moves}</dd></div>
    <div><dt>{t('hud.pieces')}</dt><dd>{placed}/{total}</dd></div>
  </dl>

  <div class="actions">
    <span class="badge-wrap">
      <AppButton
        icon="hint"
        iconOnly
        color="sunny"
        aria-label={hintLabel}
        title={hintLabel}
        disabled={!canHint || hintsLeft <= 0}
        onclick={onHint}
      />
      <span class="badge" aria-hidden="true">{hintsLeft}</span>
    </span>
    <AppButton icon="ghost" iconOnly aria-label={t('hud.ghost')} title={t('hud.ghost')} aria-pressed={ghost} onclick={onToggleGhost} />
    <AppButton icon="pause" iconOnly color="sky" aria-label={t('hud.pause')} title={t('hud.pause')} disabled={!canPause} onclick={onPause} />
  </div>
</header>

<style>
  .hud {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-2);
    padding: calc(var(--space-2) + env(safe-area-inset-top)) max(var(--space-3), env(safe-area-inset-right)) var(--space-2)
      max(var(--space-3), env(safe-area-inset-left));
  }

  .metrics {
    flex: none;
    display: flex;
    align-items: center;
    gap: var(--space-4);
    padding: var(--space-1) var(--space-4);
    background: var(--paper);
    border: var(--border);
    border-radius: var(--radius-pill);
    box-shadow: var(--lift-pressed);
  }

  .metrics div {
    display: grid;
    justify-items: center;
  }

  dt {
    white-space: nowrap;
    font-size: 0.7rem;
    color: var(--ink-soft);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  dd {
    font-family: var(--font-display);
    font-size: 1.15rem;
    font-weight: 800;
    line-height: 1.1;
    font-variant-numeric: tabular-nums;
  }

  .time dd {
    font-size: 1.4rem;
  }

  .actions {
    display: flex;
    gap: var(--space-2);
  }

  .badge-wrap {
    position: relative;
  }

  .badge {
    position: absolute;
    top: -6px;
    right: -6px;
    min-width: 20px;
    height: 20px;
    padding: 0 4px;
    font-size: 0.75rem;
    font-weight: 800;
    line-height: 16px;
    text-align: center;
    color: var(--paper);
    background: var(--ink);
    border: 2px solid var(--paper);
    border-radius: var(--radius-pill);
    pointer-events: none;
  }

  /* Phones: keep the numbers, drop the small labels (Vietnamese labels are long). */
  @media (max-width: 520px) {
    dt {
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
      clip-path: inset(50%);
    }
  }

  /* Narrow phones: buttons on the first row, metrics get the full second row. */
  @media (max-width: 460px) {
    .hud {
      flex-wrap: wrap;
      row-gap: var(--space-2);
    }

    .metrics {
      order: 1;
      flex: 1 0 100%;
      justify-content: space-around;
    }
  }
</style>
