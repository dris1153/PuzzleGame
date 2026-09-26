<script lang="ts">
  import type { Snippet } from 'svelte'
  import { fly } from 'svelte/transition'
  import { motionMs } from '../lib/motion'

  let { width = 'wide', children }: { width?: 'wide' | 'narrow'; children: Snippet } = $props()
</script>

<!-- Common scrolling page frame for menu screens: safe areas, max width, entrance motion. -->
<div class="page {width}" in:fly={{ y: 16, duration: motionMs(260) }}>
  {@render children()}
</div>

<style>
  .page {
    display: flex;
    flex-direction: column;
    min-height: 100dvh;
    margin: 0 auto;
    padding: env(safe-area-inset-top) max(var(--space-4), env(safe-area-inset-right)) calc(var(--space-8) + env(safe-area-inset-bottom))
      max(var(--space-4), env(safe-area-inset-left));
  }

  .wide {
    max-width: 64rem;
  }

  .narrow {
    max-width: 40rem;
  }
</style>
