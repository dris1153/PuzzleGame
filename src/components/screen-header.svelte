<script lang="ts">
  import { onMount } from 'svelte'
  import { t } from '../i18n/i18n.svelte'
  import AppButton from './ui/app-button.svelte'

  let { title, onBack }: { title: string; onBack: () => void } = $props()
  let heading: HTMLHeadingElement

  // The button that navigated here is gone; move focus to the new screen's title.
  onMount(() => heading.focus())
</script>

<header class="screen-header">
  <AppButton icon="back" iconOnly aria-label={t('common.back')} title={t('common.back')} onclick={onBack} />
  <h1 tabindex="-1" bind:this={heading}>{title}</h1>
</header>

<style>
  .screen-header {
    display: flex;
    align-items: center;
    gap: var(--space-4);
    padding: var(--space-4) 0;
  }

  h1 {
    font-size: clamp(1.8rem, 6vw, 2.6rem);
  }

  h1:focus {
    outline: none;
  }
</style>
