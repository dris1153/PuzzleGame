export type Stars = 1 | 2 | 3

export interface ScoreInput {
  timeMs: number
  moves: number
  hints: number
  pieces: number
  parSec: number
}

export function computeStars({ timeMs, moves, hints, pieces, parSec }: ScoreInput): Stars {
  const parMs = parSec * 1000
  if (timeMs <= parMs && moves <= Math.ceil(pieces * 1.5) && hints === 0) return 3
  if (timeMs <= 2 * parMs) return 2
  return 1
}
