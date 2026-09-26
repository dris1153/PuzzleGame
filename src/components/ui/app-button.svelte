<script lang="ts">
  import type { Snippet } from 'svelte'
  import type { HTMLButtonAttributes } from 'svelte/elements'
  import { playSfx } from '../../audio/sfx-player'
  import AppIcon, { type IconName } from './app-icon.svelte'

  interface Props extends Omit<HTMLButtonAttributes, 'class'> {
    color?: 'sunny' | 'mint' | 'coral' | 'grape' | 'sky' | 'paper'
    size?: 'md' | 'lg'
    icon?: IconName
    /** Icon-only button; `aria-label` is then required. */
    iconOnly?: boolean
    children?: Snippet
  }

  let {
    color = 'paper',
    size = 'md',
    icon,
    iconOnly = false,
    children,
    onclick,
    ...rest
  }: Props = $props()
</script>

<button
  type="button"
  class="btn {color} {size}"
  class:icon-only={iconOnly}
  {...rest}
  onclick={(e) => {
    playSfx('click')
    onclick?.(e)
  }}
>
  {#if icon}<AppIcon name={icon} size={size === 'lg' ? 28 : 22} />{/if}
  {#if children && !iconOnly}<span>{@render children()}</span>{/if}
</button>

<style>
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-2);
    min-height: 44px;
    padding: var(--space-2) var(--space-4);
    font-family: var(--font-display);
    font-size: 1.05rem;
    font-weight: 800;
    color: var(--ink);
    background: var(--fill);
    border: var(--border);
    border-radius: var(--radius-pill);
    box-shadow: var(--lift);
    transition:
      transform var(--dur-fast) var(--ease-out),
      box-shadow var(--dur-fast) var(--ease-out);
    -webkit-tap-highlight-color: transparent;
  }

  .btn:not(:disabled):hover {
    transform: translateY(-2px) rotate(-1deg);
    box-shadow: 0 7px 0 var(--ink);
  }

  .btn:not(:disabled):active {
    transform: translateY(3px);
    box-shadow: var(--lift-pressed);
  }

  .btn:disabled {
    opacity: 0.45;
    box-shadow: none;
  }

  .lg {
    min-height: 60px;
    padding: var(--space-3) var(--space-6);
    font-size: 1.35rem;
    border-radius: var(--radius-md);
  }

  .icon-only {
    width: 44px;
    padding: 0;
  }

  .sunny { --fill: var(--sunny); }
  .mint { --fill: var(--mint); }
  .coral { --fill: var(--coral); }
  .grape { --fill: var(--grape); }
  .sky { --fill: var(--sky); }
  .paper { --fill: var(--paper); }

  /* Toggled on: filled and pushed in, so the state does not rely on color alone. */
  .btn[aria-pressed='true'],
  .btn[aria-pressed='true']:not(:disabled):hover {
    --fill: var(--mint);
    transform: translateY(3px);
    box-shadow: var(--lift-pressed);
  }
</style>
