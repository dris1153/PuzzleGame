import { defaultParSec, type GameConfig } from './game-config'

export interface LevelDef {
  id: string
  rows: number
  cols: number
  rotation: boolean
  /** Overrides the default par when playtesting shows the level is harder or easier. */
  parSec?: number
  credit: { author: string; url: string }
}

/** Images are 1500×1000 WebP from Unsplash (via picsum.photos), free under the Unsplash License. */
const DEFS: [rows: number, cols: number, rotation: boolean, author: string, photo: string][] = [
  [3, 3, false, 'Matthew Wiebe', 'U5rMrSI7Pn4'],
  [3, 4, false, 'Margaret Barley', 'Qo51KwK1dKg'],
  [4, 4, false, 'Ales Krivec', 'hLxqYJspAkE'],
  [4, 5, false, 'Thomas Lefebvre', 'aRXPJnXQ9lU'],
  [5, 5, false, 'Linh Nguyen', 'agkblvPff5U'],
  [5, 6, false, 'Andrew Coelho', 'VB-w_3dnyvI'],
  [6, 6, false, 'Martyn Seddon', '7iB4OZDlRok'],
  [6, 7, false, 'POR7O', 'mS1pAG_bi5Y'],
  [4, 4, true, 'Jay Ruzesky', 'h13Y8vyIXNU'],
  [5, 5, true, 'Christian Joudrey', 'mWRR1xj95hg'],
  [6, 6, true, 'Rachel Davis', 'tn2rBnvIl9I'],
  [6, 7, true, 'Levi Saunders', 'NUMlxTPsznM'],
  [7, 7, true, 'Alexey Topolyanskiy', '-oWyJoSqBRM'],
  [7, 8, true, 'Bonnie Meisels', 'Y5uyOoct2pg'],
  [8, 8, true, 'veeterzy', 'OJJIaFZOeX4'],
]

export const LEVELS: LevelDef[] = DEFS.map(([rows, cols, rotation, author, photo], i) => ({
  id: `level-${String(i + 1).padStart(2, '0')}`,
  rows,
  cols,
  rotation,
  credit: { author, url: `https://unsplash.com/photos/${photo}` },
}))

export const levelImage = (level: LevelDef) => `${import.meta.env.BASE_URL}levels/${level.id}.webp`
export const levelThumb = (level: LevelDef) => `${import.meta.env.BASE_URL}levels/thumbs/${level.id}.webp`

export function levelConfig(level: LevelDef): GameConfig {
  return {
    mode: 'campaign',
    levelId: level.id,
    imageSrc: levelImage(level),
    rows: level.rows,
    cols: level.cols,
    rotation: level.rotation,
    parSec: level.parSec ?? defaultParSec(level.rows, level.cols, level.rotation),
  }
}

export function nextLevel(id: string): LevelDef | undefined {
  const i = LEVELS.findIndex((l) => l.id === id)
  return i >= 0 ? LEVELS[i + 1] : undefined
}

/** The first level is always open; every other level opens once the previous one is completed. */
export function isLevelUnlocked(index: number, completed: Record<string, unknown>): boolean {
  return index === 0 || (index < LEVELS.length && Object.hasOwn(completed, LEVELS[index - 1].id))
}
