<script lang="ts">
  import { t } from '../i18n/i18n.svelte'
  import AppButton from './ui/app-button.svelte'
  import AppIcon from './ui/app-icon.svelte'
  import AppModal from './ui/app-modal.svelte'

  interface Props {
    onResume: () => void
    onRestart: () => void
    onQuit: () => void
  }

  let { onResume, onRestart, onQuit }: Props = $props()
</script>

<!-- Opaque on purpose: the board must not be studied while the clock is stopped. -->
<AppModal labelledBy="pause-title" opaque onEscape={onResume}>
  <span class="icon"><AppIcon name="pause" size={36} /></span>
  <h2 id="pause-title">{t('pause.title')}</h2>
  <div class="actions">
    <AppButton color="sunny" size="lg" icon="play" data-autofocus onclick={onResume}>{t('pause.resume')}</AppButton>
    <AppButton icon="restart" onclick={onRestart}>{t('pause.restart')}</AppButton>
    <AppButton icon="home" onclick={onQuit}>{t('pause.quit')}</AppButton>
  </div>
</AppModal>

<style>
  .icon {
    display: grid;
    place-items: center;
    width: 72px;
    height: 72px;
    background: var(--sky);
    border: var(--border);
    border-radius: 50%;
  }

  h2 {
    font-size: 2.2rem;
  }

  .actions {
    display: grid;
    gap: var(--space-3);
    width: 100%;
  }
</style>
