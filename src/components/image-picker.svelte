<script lang="ts">
  import { levelThumb, LEVELS } from '../data/levels'
  import { t } from '../i18n/i18n.svelte'
  import AppIcon from './ui/app-icon.svelte'

  interface Props {
    selected: string
    uploadedUrl: string | null
    error: string
    busy: boolean
    onSelect: (image: string) => void
    onFile: (file: File) => void
  }

  let { selected, uploadedUrl, error, busy, onSelect, onFile }: Props = $props()

  function onChange(e: Event & { currentTarget: HTMLInputElement }) {
    const file = e.currentTarget.files?.[0]
    e.currentTarget.value = '' // allow picking the same file again
    if (file) onFile(file)
  }
</script>

<fieldset class="picker">
  <legend>{t('free.image')}</legend>
  <div class="options">
    {#each LEVELS as level, i (level.id)}
      <label class="option">
        <input type="radio" name="image" checked={selected === level.id} onchange={() => onSelect(level.id)} />
        <img src={levelThumb(level)} alt={t('levels.level', { n: i + 1 })} width="360" height="240" loading="lazy" />
      </label>
    {/each}
    {#if uploadedUrl}
      <label class="option">
        <input type="radio" name="image" checked={selected === 'upload'} onchange={() => onSelect('upload')} />
        <img src={uploadedUrl} alt={t('free.uploaded')} />
      </label>
    {/if}
  </div>
  <!-- Native file inputs show browser-language text, so the input is hidden behind a translated label. -->
  <label class="upload" aria-busy={busy}>
    <input class="visually-hidden" type="file" accept="image/*" disabled={busy} onchange={onChange} />
    <AppIcon name="upload" size={22} />
    {busy ? t('common.loading') : t('free.upload')}
  </label>
  {#if error}<p class="error" role="alert">{error}</p>{/if}
</fieldset>

<style>
  .picker {
    display: grid;
    gap: var(--space-3);
    border: none;
  }

  legend {
    margin-bottom: var(--space-3);
    font-family: var(--font-display);
    font-size: 1.3rem;
    font-weight: 800;
  }

  .options {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(6.5rem, 1fr));
    gap: var(--space-3);
  }

  .option {
    position: relative;
    cursor: pointer;
  }

  .option input {
    position: absolute;
    opacity: 0;
  }

  .option img {
    display: block;
    width: 100%;
    height: auto;
    aspect-ratio: 3 / 2;
    object-fit: cover;
    border: var(--border);
    border-radius: var(--radius-sm);
    transition: transform var(--dur) var(--ease-bounce);
  }

  .option:hover img {
    transform: translateY(-2px);
  }

  .option input:checked + img {
    outline: 4px solid var(--coral);
    outline-offset: 2px;
    transform: rotate(-2deg) scale(1.03);
  }

  .option input:focus-visible + img {
    outline: 3px solid var(--focus);
    outline-offset: 3px;
  }

  .upload {
    justify-self: start;
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    min-height: 44px;
    padding: var(--space-2) var(--space-4);
    font-family: var(--font-display);
    font-weight: 800;
    background: var(--mint);
    border: var(--border);
    border-radius: var(--radius-pill);
    box-shadow: var(--lift);
    cursor: pointer;
  }

  .upload:has(:focus-visible) {
    outline: 3px solid var(--focus);
    outline-offset: 3px;
  }

  .upload[aria-busy='true'] {
    cursor: progress;
    background: var(--paper);
  }

  .error {
    padding: var(--space-2) var(--space-3);
    background: #ffe1e8;
    border: 2px solid var(--danger);
    border-radius: var(--radius-sm);
  }
</style>
