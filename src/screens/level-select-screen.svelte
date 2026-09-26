<script lang="ts">
  import LevelCard from '../components/level-card.svelte'
  import PageShell from '../components/page-shell.svelte'
  import ScreenHeader from '../components/screen-header.svelte'
  import { isLevelUnlocked, levelConfig, LEVELS } from '../data/levels'
  import { t } from '../i18n/i18n.svelte'
  import { progress } from '../stores/progress-store.svelte'
  import { screen } from '../stores/screen-store.svelte'

  const records = $derived(progress.current.levels)
</script>

<PageShell>
  <ScreenHeader title={t('levels.title')} onBack={() => screen.go({ name: 'home' })} />
  <main class="grid">
    {#each LEVELS as level, i (level.id)}
      <LevelCard
        {level}
        number={i + 1}
        unlocked={isLevelUnlocked(i, records)}
        record={records[level.id]}
        onPlay={() => screen.go({ name: 'game', config: levelConfig(level), returnTo: 'level-select' })}
      />
    {/each}
  </main>
</PageShell>

<style>
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(11rem, 44%), 1fr));
    gap: var(--space-6) var(--space-4);
    padding-top: var(--space-2);
  }
</style>
