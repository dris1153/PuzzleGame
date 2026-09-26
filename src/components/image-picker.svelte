<script lang="ts">
  import { levelThumb, LEVELS } from '../data/levels'
  import { t } from '../i18n/i18n.svelte'

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
    {busy ? t('common.loading') : t('free.upload')}
  </label>
  {#if error}<p role="alert">{error}</p>{/if}
</fieldset>

<style>
  .options {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(6rem, 1fr));
    gap: 0.5rem;
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
    aspect-ratio: 3 / 2;
    object-fit: cover;
    border: 3px solid transparent;
    border-radius: 0.5rem;
  }

  .option input:checked + img {
    border-color: #f5a623;
  }

  .option input:focus-visible + img {
    outline: 2px solid #2d2a32;
  }

  .upload {
    display: inline-block;
    margin-top: 0.75rem;
    padding: 0.4rem 0.8rem;
    border: 1px solid currentColor;
    border-radius: 0.5rem;
    cursor: pointer;
  }

  .upload:focus-within {
    outline: 2px solid #2d2a32;
    outline-offset: 2px;
  }

  .upload[aria-busy='true'] {
    cursor: progress;
  }
</style>
