<script lang="ts">
  import type { Snippet } from 'svelte'

  interface Props {
    checked: boolean
    onchange: (checked: boolean) => void
    children: Snippet
  }

  let { checked, onchange, children }: Props = $props()
</script>

<label class="toggle">
  <input type="checkbox" role="switch" {checked} onchange={(e) => onchange(e.currentTarget.checked)} />
  <span class="track" aria-hidden="true"><span class="thumb"></span></span>
  <span class="label">{@render children()}</span>
</label>

<style>
  .toggle {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    min-height: 44px;
  }

  input {
    position: absolute;
    opacity: 0;
    width: 1px;
    height: 1px;
  }

  .track {
    flex: none;
    position: relative;
    width: 56px;
    height: 32px;
    background: var(--paper);
    border: var(--border);
    border-radius: var(--radius-pill);
    transition: background var(--dur) var(--ease-out);
  }

  .thumb {
    position: absolute;
    top: 3px;
    left: 3px;
    width: 20px;
    height: 20px;
    background: var(--ink);
    border-radius: 50%;
    transition: transform var(--dur) var(--ease-bounce);
  }

  input:checked + .track {
    background: var(--mint);
  }

  input:checked + .track .thumb {
    transform: translateX(24px);
  }

  input:focus-visible + .track {
    outline: 3px solid var(--focus);
    outline-offset: 3px;
  }
</style>
