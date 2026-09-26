import { readJson, writeJson } from './storage'

/** Reactive value mirrored to localStorage and kept in sync across tabs. */
export function createPersistedState<T>(key: string, guard: (value: unknown) => value is T, fallback: () => T) {
  const load = (current: T) => readJson(key, guard, current)
  let state = $state.raw<T>(load(fallback()))

  if (typeof window !== 'undefined') {
    window.addEventListener('storage', (e) => {
      // `key === null` means another tab cleared storage.
      if (e.key === key || e.key === null) state = load(fallback())
    })
  }

  return {
    get current(): T {
      return state
    },
    /** Re-reads storage first: another tab may have saved since this one loaded. */
    update(mutate: (value: T) => T): void {
      state = mutate(load(state))
      writeJson(key, state)
    },
  }
}
