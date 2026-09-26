<script lang="ts" module>
  // 24×24 stroke icons, drawn for this app.
  const PATHS = {
    menu: 'M4 7h16M4 12h16M4 17h16',
    pause: 'M9 5v14M15 5v14',
    play: 'M8 5l11 7-11 7z',
    back: 'M15 5l-7 7 7 7',
    hint: 'M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z',
    ghost: 'M4 5h16v14H4zM4 16l5-5 4 4 2-2 5 5M15.5 9.5h.01',
    restart: 'M4 12a8 8 0 1 0 2.4-5.7M4 4v5h5',
    home: 'M4 11l8-7 8 7v9h-5v-6H9v6H4z',
    lock: 'M6 11h12v10H6zM8.5 11V8a3.5 3.5 0 0 1 7 0v3',
    next: 'M9 5l7 7-7 7',
    upload: 'M12 16V4M7 9l5-5 5 5M5 20h14',
  } as const

  export type IconName = keyof typeof PATHS
</script>

<script lang="ts">
  let { name, size = 24 }: { name: IconName; size?: number } = $props()
</script>

<svg
  width={size}
  height={size}
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2.5"
  stroke-linecap="round"
  stroke-linejoin="round"
  aria-hidden="true"
>
  <path d={PATHS[name]} />
</svg>

<style>
  svg {
    flex: none;
    display: block;
  }
</style>
