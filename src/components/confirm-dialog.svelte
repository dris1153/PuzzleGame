<script lang="ts">
  import { t } from '../i18n/i18n.svelte'
  import AppButton from './ui/app-button.svelte'
  import AppModal from './ui/app-modal.svelte'

  interface Props {
    message: string
    confirmLabel: string
    onConfirm: () => void
    onCancel: () => void
  }

  let { message, confirmLabel, onConfirm, onCancel }: Props = $props()
</script>

<AppModal labelledBy="confirm-message" role="alertdialog" onEscape={onCancel}>
  <p id="confirm-message">{message}</p>
  <div class="actions">
    <!-- Destructive action: the safe choice gets focus. -->
    <AppButton data-autofocus onclick={onCancel}>{t('common.cancel')}</AppButton>
    <AppButton color="coral" onclick={onConfirm}>{confirmLabel}</AppButton>
  </div>
</AppModal>

<style>
  p {
    font-size: 1.1rem;
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: var(--space-3);
  }
</style>
