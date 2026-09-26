/// <reference types="node" />
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { isLevelUnlocked, levelConfig, levelImage, LEVELS, levelThumb, nextLevel } from './levels'

describe('levels', () => {
  it('has 15 levels with rotation from level 9 and growing grids', () => {
    expect(LEVELS).toHaveLength(15)
    expect(LEVELS.map((l) => l.rotation).indexOf(true)).toBe(8)
    expect(LEVELS[0]).toMatchObject({ id: 'level-01', rows: 3, cols: 3 })
    expect(LEVELS[14]).toMatchObject({ id: 'level-15', rows: 8, cols: 8, rotation: true })
  })

  it('ships every image and thumbnail it references, with credits', () => {
    const publicFile = (url: string) => fileURLToPath(new URL(`../../public${url}`, import.meta.url))
    for (const level of LEVELS) {
      expect(existsSync(publicFile(levelImage(level))), level.id).toBe(true)
      expect(existsSync(publicFile(levelThumb(level))), level.id).toBe(true)
      expect(level.credit.url).toMatch(/^https:\/\/unsplash\.com\/photos\/[\w-]+$/)
    }
  })

  it('builds a campaign config with default par', () => {
    expect(levelConfig(LEVELS[8])).toEqual({
      mode: 'campaign',
      levelId: 'level-09',
      imageSrc: '/levels/level-09.webp',
      rows: 4,
      cols: 4,
      rotation: true,
      parSec: 192,
    })
  })

  it('finds the next level, none after the last', () => {
    expect(nextLevel('level-01')?.id).toBe('level-02')
    expect(nextLevel('level-15')).toBeUndefined()
    expect(nextLevel('nope')).toBeUndefined()
  })
})

describe('isLevelUnlocked', () => {
  it('opens level 1 always and each next level after the previous is completed', () => {
    expect(isLevelUnlocked(0, {})).toBe(true)
    expect(isLevelUnlocked(1, {})).toBe(false)
    expect(isLevelUnlocked(1, { 'level-01': {} })).toBe(true)
    expect(isLevelUnlocked(2, { 'level-01': {} })).toBe(false)
  })

  it('ignores inherited keys and out-of-range indexes', () => {
    expect(isLevelUnlocked(1, Object.create({ 'level-01': {} }))).toBe(false)
    expect(isLevelUnlocked(15, { 'level-15': {} })).toBe(false)
  })
})
