<script lang="ts">
  import { t } from '../../i18n/i18n.svelte'

  interface Props {
    stars: number
    size?: 'sm' | 'lg'
    /** Pop the stars in one by one (win screen). */
    animate?: boolean
  }

  let { stars, size = 'sm', animate = false }: Props = $props()
</script>

<span class="stars {size}" class:animate role="img" aria-label={t('win.stars', { count: stars })}>
  {#each [0, 1, 2] as i (i)}
    <svg viewBox="0 0 24 24" aria-hidden="true" class:on={i < stars} style:animation-delay="{250 + i * 180}ms">
      <path d="M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2l-5.7 3.1 1.2-6.4-4.7-4.4 6.4-.8z" />
    </svg>
  {/each}
</span>

<style>
  .stars {
    display: inline-flex;
    gap: 2px;
  }

  svg {
    width: 1.1rem;
    height: 1.1rem;
    fill: var(--paper);
    stroke: var(--ink);
    stroke-width: 2;
    stroke-linejoin: round;
  }

  .lg svg {
    width: 3.2rem;
    height: 3.2rem;
    stroke-width: 1.6;
  }

  .lg svg:nth-child(2) {
    transform: translateY(-10px);
  }

  @media (max-height: 480px) {
    .lg svg {
      width: 2.2rem;
      height: 2.2rem;
    }
  }

  svg.on {
    fill: var(--star);
  }

  .animate svg.on {
    animation: pop 420ms var(--ease-bounce) both;
  }

  @keyframes pop {
    from {
      transform: scale(0) rotate(-30deg);
    }
  }
</style>
