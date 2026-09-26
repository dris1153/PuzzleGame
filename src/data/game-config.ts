interface BaseGameConfig {
  imageSrc: string
  rows: number
  cols: number
  rotation: boolean
  /** Target time for 3 stars. */
  parSec: number
}

export type GameConfig =
  | (BaseGameConfig & { mode: 'campaign'; levelId: string })
  | (BaseGameConfig & { mode: 'free' })

export function defaultParSec(rows: number, cols: number, rotation: boolean): number {
  return rows * cols * (rotation ? 12 : 8)
}

/** Free Play best times are tracked per grid size and rotation, not per image. */
export function freePlayKey(c: Pick<BaseGameConfig, 'rows' | 'cols' | 'rotation'>): string {
  return `${c.rows}x${c.cols}-${c.rotation ? 'r' : 'n'}`
}
