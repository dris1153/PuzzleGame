import { describe, expect, it } from 'vitest'
import { readJson, writeJson, type StorageBackend } from './storage'

const isNumberList = (v: unknown): v is number[] => Array.isArray(v) && v.every((n) => typeof n === 'number')

function memoryBackend(initial: Record<string, string> = {}): StorageBackend & { data: Record<string, string> } {
  const data = { ...initial }
  return {
    data,
    getItem: (k) => data[k] ?? null,
    setItem: (k, v) => {
      data[k] = v
    },
  }
}

const throwing: StorageBackend = {
  getItem: () => {
    throw new Error('SecurityError')
  },
  setItem: () => {
    throw new Error('QuotaExceededError')
  },
}

describe('readJson', () => {
  it('returns stored valid data', () => {
    expect(readJson('k', isNumberList, [], memoryBackend({ k: '[1,2]' }))).toEqual([1, 2])
  })

  it('falls back on missing, corrupt or invalid data', () => {
    expect(readJson('k', isNumberList, [9], memoryBackend())).toEqual([9])
    expect(readJson('k', isNumberList, [9], memoryBackend({ k: '{not json' }))).toEqual([9])
    expect(readJson('k', isNumberList, [9], memoryBackend({ k: '["a"]' }))).toEqual([9])
  })

  it('falls back when storage throws', () => {
    expect(readJson('k', isNumberList, [9], throwing)).toEqual([9])
  })
})

describe('writeJson', () => {
  it('stores JSON and swallows storage errors', () => {
    const backend = memoryBackend()
    writeJson('k', { a: 1 }, backend)
    expect(backend.data.k).toBe('{"a":1}')
    expect(() => writeJson('k', 1, throwing)).not.toThrow()
  })
})

describe('readJson edge cases', () => {
  it('handles empty string values', () => {
    expect(readJson('k', isNumberList, [9], memoryBackend({ k: '' }))).toEqual([9])
  })

  it('handles null values correctly', () => {
    expect(readJson('k', isNumberList, [9], memoryBackend({ k: 'null' }))).toEqual([9])
  })

  it('handles boolean values that fail guard', () => {
    const isBool = (v: unknown): v is boolean => typeof v === 'boolean'
    expect(readJson('k', isBool, true, memoryBackend({ k: '1' }))).toBe(true)
    expect(readJson('k', isBool, false, memoryBackend({ k: '"true"' }))).toBe(false)
  })
})
