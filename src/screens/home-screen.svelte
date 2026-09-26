<script lang="ts">
  import { t } from '../i18n/i18n.svelte'
  import { screen } from '../stores/screen-store.svelte'
</script>

<main class="home">
  <h1>{t('app.title')}</h1>
  <p>{t('app.tagline')}</p>
  <nav>
    <button type="button" onclick={() => screen.go({ name: 'level-select' })}>{t('home.campaign')}</button>
    <button type="button" onclick={() => screen.go({ name: 'free-play' })}>{t('home.freePlay')}</button>
    <button type="button" onclick={() => screen.go({ name: 'stats' })}>{t('home.stats')}</button>
    <button type="button" onclick={() => screen.go({ name: 'settings' })}>{t('home.settings')}</button>
  </nav>
</main>

<style>
  .home {
    min-height: 100%;
    display: grid;
    place-content: center;
    gap: 1rem;
    padding: 1rem;
    text-align: center;
  }

  nav {
    display: grid;
    gap: 0.75rem;
  }
</style>
