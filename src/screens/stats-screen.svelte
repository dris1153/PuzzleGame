<script lang="ts">
  import PageShell from '../components/page-shell.svelte'
  import ScreenHeader from '../components/screen-header.svelte'
  import { LEVELS } from '../data/levels'
  import { t } from '../i18n/i18n.svelte'
  import { formatTime } from '../lib/format-time'
  import { progress } from '../stores/progress-store.svelte'
  import { screen } from '../stores/screen-store.svelte'

  const COLORS = ['sunny', 'mint', 'coral', 'sky', 'grape']

  const stats = $derived(progress.current.stats)
  const records = $derived(LEVELS.map((l) => progress.current.levels[l.id]).filter((r) => r !== undefined))
  const rate = $derived(stats.gamesStarted ? Math.min(100, Math.round((stats.gamesCompleted / stats.gamesStarted) * 100)) : 0)

  const rows = $derived([
    [t('stats.gamesStarted'), String(stats.gamesStarted)],
    [t('stats.gamesCompleted'), String(stats.gamesCompleted)],
    [t('stats.completionRate'), `${rate}%`],
    [t('stats.totalTime'), formatTime(stats.totalPlayMs)],
    [t('stats.piecesPlaced'), String(stats.piecesPlaced)],
    [t('stats.levelsCompleted'), `${records.length}/${LEVELS.length}`],
    [t('stats.stars'), `${records.reduce((sum, r) => sum + r.stars, 0)}/${LEVELS.length * 3}`],
  ])
</script>

<PageShell>
  <ScreenHeader title={t('stats.title')} onBack={() => screen.go({ name: 'home' })} />
  <main>
    <dl class="stats">
      {#each rows as [label, value], i (label)}
        <div class="tile" style:--fill="var(--{COLORS[i % COLORS.length]})">
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      {/each}
    </dl>
  </main>
</PageShell>

<style>
  .stats {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(13rem, 100%), 1fr));
    gap: var(--space-4);
  }

  .tile {
    display: grid;
    gap: var(--space-1);
    padding: var(--space-4);
    background: var(--fill);
    border: var(--border);
    border-radius: var(--radius-md);
    box-shadow: var(--lift);
  }

  .tile:nth-child(odd) {
    rotate: -0.6deg;
  }

  .tile:nth-child(even) {
    rotate: 0.6deg;
  }

  dt {
    font-size: 0.95rem;
  }

  dd {
    font-family: var(--font-display);
    font-size: 2.2rem;
    font-weight: 800;
    line-height: 1.1;
    font-variant-numeric: tabular-nums;
  }
</style>
