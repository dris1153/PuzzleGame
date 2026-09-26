<script lang="ts">
  import ConfirmDialog from '../components/confirm-dialog.svelte'
  import ScreenHeader from '../components/screen-header.svelte'
  import { LEVELS } from '../data/levels'
  import { t } from '../i18n/i18n.svelte'
  import { progress } from '../stores/progress-store.svelte'
  import { screen } from '../stores/screen-store.svelte'
  import type { Locale } from '../stores/settings-schema'
  import { settings } from '../stores/settings-store.svelte'

  const LOCALES: [Locale, string][] = [
    ['en', 'English'],
    ['vi', 'Tiếng Việt'],
  ]

  let confirming = $state(false)
  let resetDone = $state(false)

  function reset() {
    progress.reset()
    confirming = false
    resetDone = true
  }
</script>

<ScreenHeader title={t('settings.title')} onBack={() => screen.go({ name: 'home' })} />
<main class="settings">
  <fieldset>
    <legend>{t('settings.language')}</legend>
    {#each LOCALES as [code, name] (code)}
      <button
        type="button"
        lang={code}
        aria-pressed={settings.current.locale === code}
        onclick={() => settings.set('locale', code)}>{name}</button
      >
    {/each}
  </fieldset>

  <label>
    <input type="checkbox" checked={settings.current.sound} onchange={(e) => settings.set('sound', e.currentTarget.checked)} />
    {t('settings.sound')}
  </label>
  <label>
    <input type="checkbox" checked={settings.current.ghostDefault} onchange={(e) => settings.set('ghostDefault', e.currentTarget.checked)} />
    {t('settings.ghost')}
  </label>
  <label>
    <input
      type="checkbox"
      checked={settings.current.rotationDefault}
      onchange={(e) => settings.set('rotationDefault', e.currentTarget.checked)}
    />
    {t('settings.rotation')}
  </label>

  <div>
    <button type="button" onclick={() => (confirming = true)}>{t('settings.reset')}</button>
    {#if resetDone}<p role="status">{t('settings.resetDone')}</p>{/if}
  </div>

  <section>
    <h2>{t('settings.credits')}</h2>
    <ul>
      {#each LEVELS as level, i (level.id)}
        <li>
          <a href={level.credit.url} target="_blank" rel="noopener noreferrer">
            {t('settings.creditLine', { n: i + 1, author: level.credit.author })}
          </a>
        </li>
      {/each}
    </ul>
  </section>
</main>

{#if confirming}
  <ConfirmDialog
    message={t('settings.resetConfirm')}
    confirmLabel={t('settings.reset')}
    onConfirm={reset}
    onCancel={() => (confirming = false)}
  />
{/if}

<style>
  .settings {
    display: grid;
    gap: 1rem;
    max-width: 40rem;
    padding: 0 1rem 1rem;
  }

  label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  ul {
    padding-left: 1.25rem;
  }
</style>
