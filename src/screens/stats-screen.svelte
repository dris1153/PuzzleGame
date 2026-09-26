<script lang="ts">
  import ScreenHeader from '../components/screen-header.svelte'
  import { LEVELS } from '../data/levels'
  import { t } from '../i18n/i18n.svelte'
  import { formatTime } from '../lib/format-time'
  import { progress } from '../stores/progress-store.svelte'
  import { screen } from '../stores/screen-store.svelte'

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

<ScreenHeader title={t('stats.title')} onBack={() => screen.go({ name: 'home' })} />
<main>
  <dl class="stats">
    {#each rows as [label, value] (label)}
      <div><dt>{label}</dt><dd>{value}</dd></div>
    {/each}
  </dl>
</main>

<style>
  .stats {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(12rem, 1fr));
    gap: 1rem;
    padding: 0 1rem 1rem;
  }

  dd {
    font-size: 1.5rem;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
  }
</style>
