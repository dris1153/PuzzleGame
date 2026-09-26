<script lang="ts">
  import { onDestroy } from 'svelte'
  import ImagePicker from '../components/image-picker.svelte'
  import ScreenHeader from '../components/screen-header.svelte'
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

  const HUD_HEIGHT = 64
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
  const limits = $derived(maxGridFor(viewW, viewH - HUD_HEIGHT, aspect))
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

<ScreenHeader title={t('free.title')} onBack={() => screen.go({ name: 'home' })} />
<main class="setup">
  <ImagePicker
    selected={choice.image}
    uploadedUrl={freePlay.uploaded?.url ?? null}
    error={error ? t(error) : ''}
    onSelect={(image) => freePlay.choose({ image })}
    {onFile}
    busy={decoding}
  />
  <label>
    {t('free.rows')}: {rows}
    <input type="range" min={MIN_GRID} max={limits.maxRows} value={rows} oninput={(e) => freePlay.choose({ rows: +e.currentTarget.value })} />
  </label>
  <label>
    {t('free.cols')}: {cols}
    <input type="range" min={MIN_GRID} max={limits.maxCols} value={cols} oninput={(e) => freePlay.choose({ cols: +e.currentTarget.value })} />
  </label>
  <label>
    <input type="checkbox" checked={rotation} onchange={(e) => freePlay.choose({ rotation: e.currentTarget.checked })} />
    {t('free.rotation')}
  </label>
  {#if best !== undefined}<p>{t('free.best', { time: formatTime(best) })}</p>{/if}
  <button type="button" onclick={start} disabled={decoding}>{t('free.start')}</button>
</main>

<style>
  .setup {
    display: grid;
    gap: 1rem;
    max-width: 40rem;
    padding: 0 1rem 1rem;
  }

  label {
    display: grid;
    gap: 0.25rem;
  }

  label:has(> input[type='checkbox']) {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
</style>
