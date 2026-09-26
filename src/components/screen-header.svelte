<script lang="ts">
  import { onMount } from 'svelte'
  import { t } from '../i18n/i18n.svelte'

  let { title, onBack }: { title: string; onBack: () => void } = $props()
  let heading: HTMLHeadingElement

  // The button that navigated here is gone; move focus to the new screen's title.
  onMount(() => heading.focus())
</script>

<header class="screen-header">
  <button type="button" onclick={onBack}><span aria-hidden="true">←</span> {t('common.back')}</button>
  <h1 tabindex="-1" bind:this={heading}>{title}</h1>
</header>

<style>
  .screen-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
  }

  h1 {
    font-size: 1.5rem;
  }

  h1:focus {
    outline: none;
  }
</style>
