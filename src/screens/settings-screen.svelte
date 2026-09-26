<script lang="ts">
  import ConfirmDialog from '../components/confirm-dialog.svelte'
  import PageShell from '../components/page-shell.svelte'
  import ScreenHeader from '../components/screen-header.svelte'
  import AppButton from '../components/ui/app-button.svelte'
  import ToggleSwitch from '../components/ui/toggle-switch.svelte'
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

<PageShell width="narrow">
  <ScreenHeader title={t('settings.title')} onBack={() => screen.go({ name: 'home' })} />
  <main class="settings">
    <section class="panel">
      <h2 id="language-label">{t('settings.language')}</h2>
      <div class="segmented" role="group" aria-labelledby="language-label">
        {#each LOCALES as [code, name] (code)}
          <AppButton lang={code} aria-pressed={settings.current.locale === code} onclick={() => settings.set('locale', code)}>
            {name}
          </AppButton>
        {/each}
      </div>
    </section>

    <section class="panel toggles">
      <ToggleSwitch checked={settings.current.sound} onchange={(v) => settings.set('sound', v)}>{t('settings.sound')}</ToggleSwitch>
      <ToggleSwitch checked={settings.current.ghostDefault} onchange={(v) => settings.set('ghostDefault', v)}>
        {t('settings.ghost')}
      </ToggleSwitch>
      <ToggleSwitch checked={settings.current.rotationDefault} onchange={(v) => settings.set('rotationDefault', v)}>
        {t('settings.rotation')}
      </ToggleSwitch>
    </section>

    <section class="reset">
      <AppButton color="coral" icon="restart" onclick={() => (confirming = true)}>{t('settings.reset')}</AppButton>
      {#if resetDone}<p role="status">{t('settings.resetDone')}</p>{/if}
    </section>

    <section class="panel credits">
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
</PageShell>

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
    gap: var(--space-6);
  }

  h2 {
    margin-bottom: var(--space-3);
    font-size: 1.3rem;
  }

  .segmented {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-3);
  }

  .toggles {
    display: grid;
    gap: var(--space-2);
  }

  .reset {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-4);
  }

  .credits ul {
    display: grid;
    gap: var(--space-1);
    padding-left: 1.25rem;
    font-size: 0.95rem;
  }
</style>
