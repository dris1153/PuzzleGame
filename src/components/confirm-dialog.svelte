<script lang="ts">
  import { onMount } from 'svelte'
  import { t } from '../i18n/i18n.svelte'

  interface Props {
    message: string
    confirmLabel: string
    onConfirm: () => void
    onCancel: () => void
  }

  let { message, confirmLabel, onConfirm, onCancel }: Props = $props()
  let cancelButton: HTMLButtonElement

  // Destructive action: focus the safe choice, and hand focus back to the opener on close.
  onMount(() => {
    const opener = document.activeElement
    cancelButton.focus()
    return () => {
      if (opener instanceof HTMLElement) opener.focus()
    }
  })

  function onKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') onCancel()
  }
</script>

<svelte:window onkeydown={onKeydown} />

<div class="backdrop">
  <div class="dialog" role="alertdialog" aria-modal="true" aria-label={confirmLabel} aria-describedby="confirm-message">
    <p id="confirm-message">{message}</p>
    <div class="actions">
      <button type="button" bind:this={cancelButton} onclick={onCancel}>{t('common.cancel')}</button>
      <button type="button" onclick={onConfirm}>{confirmLabel}</button>
    </div>
  </div>
</div>

<style>
  .backdrop {
    position: fixed;
    inset: 0;
    display: grid;
    place-items: center;
    padding: 1rem;
    background: rgb(0 0 0 / 0.35);
  }

  .dialog {
    display: grid;
    gap: 1rem;
    max-width: 24rem;
    padding: 1.5rem;
    background: #fff;
    border-radius: 1rem;
  }

  .actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
  }
</style>
