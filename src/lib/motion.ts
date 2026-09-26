/** Svelte transitions run through the Web Animations API, which the CSS reduced-motion rule does not reach. */
export function prefersReducedMotion(): boolean {
  return typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches
}

export const motionMs = (ms: number) => (prefersReducedMotion() ? 0 : ms)
