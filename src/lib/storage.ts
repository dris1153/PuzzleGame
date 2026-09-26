export type StorageBackend = Pick<Storage, 'getItem' | 'setItem'>

function defaultBackend(): StorageBackend | undefined {
  try {
    return globalThis.localStorage
  } catch {
    // Accessing localStorage throws when site data is blocked.
    return undefined
  }
}

/** Parsed value if present and valid, otherwise `fallback`. Never throws. */
export function readJson<T>(
  key: string,
  guard: (value: unknown) => value is T,
  fallback: T,
  backend = defaultBackend(),
): T {
  try {
    const raw = backend?.getItem(key)
    if (raw == null) return fallback
    const parsed: unknown = JSON.parse(raw)
    return guard(parsed) ? parsed : fallback
  } catch {
    return fallback
  }
}

/** Best effort: quota errors or disabled storage mean the value simply isn't saved. */
export function writeJson(key: string, value: unknown, backend = defaultBackend()): void {
  try {
    backend?.setItem(key, JSON.stringify(value))
  } catch {
    // Not saved; the game keeps working from memory.
  }
}
