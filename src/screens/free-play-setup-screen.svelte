<script lang="ts">
  import { onDestroy } from 'svelte'
  import ImagePicker from '../components/image-picker.svelte'
  import PageShell from '../components/page-shell.svelte'
  import ScreenHeader from '../components/screen-header.svelte'
  import AppButton from '../components/ui/app-button.svelte'
  import ToggleSwitch from '../components/ui/toggle-switch.svelte'
  import { defaultParSec, freePlayKey } from '../data/game-config'
  import { levelImage, LEVELS } from '../data/levels'
  import { maxGridFor, MIN_GRID } from '../engine/grid-limits'
  import { t } from '../i18n/i18n.svelte'
  import type { MessageKey } from '../i18n/locales/en'
  import { formatTime } from '../lib/format-time'
  import { prepareUploadedImage, validateImageFile } from '../lib/prepare-uploaded-image'
  import { freePlay } from '../stores/free-play-store.svelte'
  import { progress } from '../stores/progress-store.svelte'
  import { screen } from '../stores/screen-store.svelte'

  // Space the game screen takes around the board canvas (HUD above, frame and margins around).
  // Narrow phones get a two-row HUD.
  const chrome = (w: number) => ({ w: 22, h: w <= 460 ? 130 : 84 })
  const LEVEL_ASPECT = 1.5

  let viewW = $state(window.innerWidth)
  let viewH = $state(window.innerHeight)
  let error = $state<MessageKey | null>(null)
  let decoding = $state(false)
  // Only the latest pick counts; an older, slower decode must not overwrite it.
  let uploadToken = 0

  const choice = $derived(freePlay.choice)
  const rotation = $derived(freePlay.rotation)
  const aspect = $derived(choice.image === 'upload' && freePlay.uploaded ? freePlay.uploaded.aspect : LEVEL_ASPECT)
  const limits = $derived(maxGridFor(viewW - chrome(viewW).w, viewH - chrome(viewW).h, aspect))
  const rows = $derived(Math.min(choice.rows, limits.maxRows))
  const cols = $derived(Math.min(choice.cols, limits.maxCols))
  const best = $derived(progress.current.freePlayBest[freePlayKey({ rows, cols, rotation })])

  async function onFile(file: File) {
    const check = validateImageFile(file)
    if (check !== 'ok') {
      error = check === 'too-large' ? 'free.errorTooLarge' : 'free.errorNotImage'
      return
    }
    const token = ++uploadToken
    decoding = true
    try {
      const prepared = await prepareUploadedImage(file)
      if (token !== uploadToken) return URL.revokeObjectURL(prepared.url)
      freePlay.setUploaded(prepared)
      error = null
    } catch (err) {
      console.error(err)
      if (token === uploadToken) error = 'free.errorDecode'
    } finally {
      if (token === uploadToken) decoding = false
    }
  }

  onDestroy(() => uploadToken++)

  function start() {
    const level = LEVELS.find((l) => l.id === choice.image)
    const imageSrc = choice.image === 'upload' ? freePlay.uploaded?.url : level && levelImage(level)
    if (!imageSrc) return
    screen.go({
      name: 'game',
      config: { mode: 'free', imageSrc, rows, cols, rotation, parSec: defaultParSec(rows, cols, rotation) },
      returnTo: 'free-play',
    })
  }
</script>

<svelte:window bind:innerWidth={viewW} bind:innerHeight={viewH} />

<PageShell width="narrow">
  <ScreenHeader title={t('free.title')} onBack={() => screen.go({ name: 'home' })} />
  <main class="setup">
    <section class="panel">
      <ImagePicker
        selected={choice.image}
        uploadedUrl={freePlay.uploaded?.url ?? null}
        error={error ? t(error) : ''}
        onSelect={(image) => freePlay.choose({ image })}
        {onFile}
        busy={decoding}
      />
    </section>

    <section class="panel grid-options">
      <label>
        <span class="row"><span>{t('free.rows')}</span><output>{rows}</output></span>
        <input type="range" min={MIN_GRID} max={limits.maxRows} value={rows} oninput={(e) => freePlay.choose({ rows: +e.currentTarget.value })} />
      </label>
      <label>
        <span class="row"><span>{t('free.cols')}</span><output>{cols}</output></span>
        <input type="range" min={MIN_GRID} max={limits.maxCols} value={cols} oninput={(e) => freePlay.choose({ cols: +e.currentTarget.value })} />
      </label>
      <ToggleSwitch checked={rotation} onchange={(checked) => freePlay.choose({ rotation: checked })}>{t('free.rotation')}</ToggleSwitch>
    </section>

    {#if best !== undefined}<p class="best">★ {t('free.best', { time: formatTime(best) })}</p>{/if}
    <AppButton color="sunny" size="lg" icon="play" disabled={decoding} onclick={start}>{t('free.start')}</AppButton>
  </main>
</PageShell>

<style>
  .setup {
    display: grid;
    gap: var(--space-6);
  }

  .grid-options {
    display: grid;
    gap: var(--space-4);
  }

  label {
    display: grid;
    gap: var(--space-1);
  }

  .row {
    display: flex;
    justify-content: space-between;
    font-family: var(--font-display);
    font-size: 1.15rem;
    font-weight: 800;
  }

  output {
    min-width: 2.5rem;
    text-align: center;
    background: var(--sunny);
    border: 2px solid var(--ink);
    border-radius: var(--radius-pill);
  }

  .best {
    justify-self: center;
    font-family: var(--font-display);
    font-weight: 800;
  }
</style>
