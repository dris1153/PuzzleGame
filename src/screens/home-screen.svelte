<script lang="ts">
  import PageShell from '../components/page-shell.svelte'
  import AppButton from '../components/ui/app-button.svelte'
  import { LEVELS } from '../data/levels'
  import { t } from '../i18n/i18n.svelte'
  import { progress } from '../stores/progress-store.svelte'
  import { screen } from '../stores/screen-store.svelte'

  const earned = $derived(Object.values(progress.current.levels).reduce((sum, r) => sum + r.stars, 0))

  const PIECE = 'M8 14h14a6 6 0 1 1 12 0h14v14a6 6 0 1 0 0 12v14H34a6 6 0 1 0-12 0H8V40a6 6 0 1 1 0-12z'
</script>

<PageShell width="narrow">
  <main class="home">
    <svg class="logo" viewBox="0 0 150 90" aria-hidden="true">
      <path d={PIECE} transform="translate(2 18) rotate(-12 28 34)" fill="#6ee7b7" />
      <path d={PIECE} transform="translate(46 4)" fill="#ffc93c" />
      <path d={PIECE} transform="translate(92 20) rotate(10 28 34)" fill="#ff8a6b" />
    </svg>
    <h1>{t('app.title')}</h1>
    <p class="tagline">{t('app.tagline')}</p>
    <p class="progress">★ {earned}/{LEVELS.length * 3}</p>

    <nav class="menu">
      <AppButton color="sunny" size="lg" icon="play" onclick={() => screen.go({ name: 'level-select' })}>
        {t('home.campaign')}
      </AppButton>
      <AppButton color="mint" size="lg" icon="ghost" onclick={() => screen.go({ name: 'free-play' })}>
        {t('home.freePlay')}
      </AppButton>
      <div class="row">
        <AppButton color="sky" onclick={() => screen.go({ name: 'stats' })}>{t('home.stats')}</AppButton>
        <AppButton color="grape" onclick={() => screen.go({ name: 'settings' })}>{t('home.settings')}</AppButton>
      </div>
    </nav>
  </main>
</PageShell>

<style>
  .home {
    flex: 1;
    display: grid;
    align-content: center;
    justify-items: center;
    gap: var(--space-3);
    padding: var(--space-6) 0;
    text-align: center;
  }

  .logo {
    width: min(14rem, 60vw);
    overflow: visible;
  }

  .logo path {
    stroke: var(--ink);
    stroke-width: 4;
    stroke-linejoin: round;
    animation: bob 3s ease-in-out infinite;
  }

  .logo path:nth-child(2) {
    animation-delay: -1s;
  }

  .logo path:nth-child(3) {
    animation-delay: -2s;
  }

  @keyframes bob {
    50% {
      translate: 0 -6px;
    }
  }

  h1 {
    font-size: clamp(2.8rem, 12vw, 4.5rem);
    letter-spacing: -0.01em;
  }

  .tagline {
    max-width: 22rem;
    font-size: 1.1rem;
    color: var(--ink-soft);
  }

  .progress {
    padding: var(--space-1) var(--space-4);
    font-family: var(--font-display);
    font-weight: 800;
    background: var(--paper);
    border: var(--border);
    border-radius: var(--radius-pill);
  }

  .menu {
    display: grid;
    gap: var(--space-4);
    width: min(22rem, 100%);
    margin-top: var(--space-4);
  }

  .row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-4);
  }
</style>
