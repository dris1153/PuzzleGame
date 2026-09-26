<script lang="ts">
  import { onMount, type Snippet } from 'svelte'
  import { scale } from 'svelte/transition'
  import { motionMs } from '../../lib/motion'

  interface Props {
    labelledBy: string
    role?: 'dialog' | 'alertdialog'
    /** Opaque backdrop: hides what is behind (the paused board). */
    opaque?: boolean
    onEscape?: () => void
    children: Snippet
  }

  let { labelledBy, role = 'dialog', opaque = false, onEscape, children }: Props = $props()
  let card: HTMLDivElement

  // Focus the first action (marked data-autofocus, else the first button) and hand focus back on close.
  onMount(() => {
    const opener = document.activeElement
    const first = card.querySelector<HTMLElement>('[data-autofocus]') ?? card.querySelector<HTMLElement>('button')
    first?.focus()
    return () => {
      if (opener instanceof HTMLElement && opener.isConnected) opener.focus()
    }
  })

  // Keep Tab inside the dialog: aria-modal alone does not stop focus reaching the page behind.
  function onKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && onEscape) return onEscape()
    if (e.key !== 'Tab') return
    const items = [...card.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], input:not(:disabled)')]
    if (!items.length) return
    const [first, last] = [items[0], items[items.length - 1]]
    if (!card.contains(document.activeElement)) {
      e.preventDefault()
      ;(e.shiftKey ? last : first).focus()
    } else if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }
</script>

<svelte:window onkeydown={onKeydown} />

<div class="backdrop" class:opaque>
  <div
    class="card"
    {role}
    aria-modal="true"
    aria-labelledby={labelledBy}
    bind:this={card}
    in:scale={{ start: 0.85, duration: motionMs(260), opacity: 0 }}
  >
    {@render children()}
  </div>
</div>

<style>
  /* Flex + margin:auto centers the card yet lets it scroll from the top when taller than the screen. */
  .backdrop {
    position: fixed;
    inset: 0;
    z-index: 10;
    display: flex;
    overflow-y: auto;
    overscroll-behavior: contain;
    padding: max(var(--space-4), env(safe-area-inset-top)) var(--space-4) max(var(--space-4), env(safe-area-inset-bottom));
    background: rgb(43 33 64 / 0.45);
  }

  .opaque {
    background-color: var(--felt);
    background-image: radial-gradient(rgb(43 33 64 / 0.08) 1.5px, transparent 1.5px);
    background-size: 22px 22px;
  }

  .card {
    margin: auto;
    display: grid;
    justify-items: center;
    gap: var(--space-4);
    width: min(26rem, 100%);
    padding: var(--space-6);
    text-align: center;
    background: var(--paper);
    border: var(--border);
    border-radius: var(--radius-lg);
    box-shadow: 0 8px 0 var(--ink), var(--soft-shadow);
  }

  /* Phones in landscape: tighter card so the actions stay on screen. */
  @media (max-height: 480px) {
    .card {
      width: min(40rem, 100%);
      gap: var(--space-2);
      padding: var(--space-4);
    }

    .card :global(.actions) {
      grid-auto-flow: column;
      grid-auto-columns: 1fr;
    }
  }
</style>
