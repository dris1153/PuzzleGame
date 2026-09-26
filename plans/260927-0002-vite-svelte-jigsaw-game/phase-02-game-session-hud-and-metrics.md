---
phase: 2
title: "Game session, HUD and metrics"
status: completed
priority: P1
effort: "5h"
dependencies: [1]
---

# Phase 2: Game session, HUD and metrics

## Context Links
- Phase 1 engine API: `src/engine/puzzle-game.ts`
- Brainstorm rules (stars, stats): `plans/reports/brainstorm-260926-2355-vite-svelte-jigsaw-game-redesign.md`

## Overview
Add a pure game-session state machine (timer, moves, hints, placed), star scoring, versioned localStorage progress, and the in-game HUD, pause overlay and win modal. Deliverable: one hardcoded game config fully playable with metrics that persist across reload.

## Key Insights
- Session stays OUT of the engine: engine = board mechanics + callbacks; session = metrics. Keeps both testable and small.
- Timer starts on first piece pickup, not on load (fair start, avoids idle time while page loads).
- Inject the clock (`now: () => number`) and storage backend so tests run in Node without fakes of browser globals.
- Stats flush on game end (win/restart/quit) and on `pagehide`, not on every snap.

## Requirements
- Functional: HUD shows `m:ss`, moves, `placed/total`, pause button. Pause freezes timer, blocks input, covers board; auto-pause on `visibilitychange` hidden. Win modal shows stars (1–3), time, moves, "new best" badge, replay. Restart regenerates the puzzle and resets session.
- Non-functional: all localStorage access in try/catch; corrupted or foreign data falls back to defaults without crashing.

## Architecture

```
game-screen.svelte
 ├─ createPuzzleGame(... onPickup, onMove, onPiecePlaced, onComplete)
 ├─ session = createGameSession({ totalPieces, now })
 ├─ progress (runes store) ── progress-reducer (pure) ── storage (safe JSON)
 └─ game-hud · pause-overlay · win-modal
```

```ts
// src/data/game-config.ts
interface GameConfig {
  mode: 'campaign' | 'free'; levelId?: string;
  imageSrc: string; rows: number; cols: number; rotation: boolean; parSec: number;
}
// free play: parSec = pieces * (rotation ? 12 : 8)

// src/engine/game-session.ts
type SessionStatus = 'ready' | 'playing' | 'paused' | 'won';
createGameSession({ totalPieces, now }) => {
  status; moves; hintsUsed; placed; elapsedMs();
  start(); pause(); resume(); recordMove(); recordPlaced(); recordHint(); complete(): SessionResult;
}
interface SessionResult { timeMs: number; moves: number; hints: number; pieces: number }

// src/engine/scoring.ts
computeStars({ timeMs, moves, hints, pieces, parSec }): 1 | 2 | 3
// 3: timeMs <= par*1000 && moves <= ceil(pieces*1.5) && hints === 0
// 2: timeMs <= 2*par*1000
// 1: otherwise

// src/stores/progress-schema.ts
interface ProgressV1 {
  version: 1;
  levels: Record<string, { bestMs: number; stars: 1 | 2 | 3 }>;
  freePlayBest: Record<string, number>;          // key `${rows}x${cols}-${rotation ? 'r' : 'n'}`
  stats: { gamesStarted: number; gamesCompleted: number; totalPlayMs: number; piecesPlaced: number };
}
```
- `progress-reducer.ts` (pure): `applyWin(state, config, result, stars)` → `{ state, isNewBest }` (bestMs = min, stars = max); `applyGameEnd(state, playedMs, piecesPlaced, completed)` for stats.
- `progress-store.svelte.ts`: `$state` loaded via `readJson('jigsaw.progress', isProgressV1, defaultProgress)`; every mutation writes back.
- Engine additions: `onPickup`, `pause()`, `resume()` (input ignored while paused), `restart()` (new edges + scatter).
- `pause()` must also end an in-progress drag (pointer-controller exposes `cancel()`; `enabled()` is only checked on pointerdown).

## Related Code Files
- Create: `src/data/game-config.ts`, `src/engine/game-session.ts`, `src/engine/scoring.ts`
- Create: `src/lib/storage.ts`, `src/lib/format-time.ts`
- Create: `src/stores/progress-schema.ts`, `src/stores/progress-reducer.ts`, `src/stores/progress-store.svelte.ts`
- Create: `src/screens/game-screen.svelte`, `src/components/game-hud.svelte`, `src/components/pause-overlay.svelte`, `src/components/win-modal.svelte`
- Create tests: `src/engine/game-session.test.ts`, `src/engine/scoring.test.ts`, `src/stores/progress-reducer.test.ts`, `src/lib/storage.test.ts`, `src/lib/format-time.test.ts`
- Modify: `src/engine/puzzle-game.ts`, `src/engine/pointer-controller.ts` (pickup callback, paused guard), `src/App.svelte` (render `game-screen` with a hardcoded config)

## Implementation Steps
1. `game-config.ts` type + `freePlayParSec(rows, cols, rotation)`.
2. `game-session.ts` with injected clock; illegal transitions are no-ops (pause when not playing, record after won).
3. `scoring.ts` + boundary tests.
4. `storage.ts`: `readJson(key, guard, fallback, backend = globalThis.localStorage)`, `writeJson(key, value, backend)`; both swallow exceptions (quota, disabled storage, bad JSON).
5. Progress schema + type guard + reducer + tests; store wrapper in `.svelte.ts` with `$state`.
6. Engine: add `onPickup`, `pause/resume/restart`; pointer-controller ignores input while paused.
7. `format-time.ts` (`m:ss`, hours when ≥ 60 min) + test.
8. `game-hud.svelte`: reads session every 250 ms while `playing` (interval cleared on pause/win/destroy).
9. `pause-overlay.svelte`: opaque cover over canvas + Resume / Restart.
10. `win-modal.svelte`: stars, time, moves, best badge, Replay. (Next/Menu buttons added in phase 3.)
11. `game-screen.svelte`: load image, create engine + session, wire callbacks, `visibilitychange` auto-pause, stats flush on restart/destroy/`pagehide`, clean up everything on destroy.
12. `pnpm test`, `pnpm check`, `pnpm build`; manual: finish a game, reload, confirm best time/stars persisted.

## Todo List
- [x] Game config + session + scoring (with tests)
- [x] Storage + progress schema/reducer/store (with tests)
- [x] Engine pause/resume/restart/onPickup
- [x] HUD, pause overlay, win modal, game screen
- [x] Manual persistence check

## Success Criteria
- [x] Tests: paused time excluded from `elapsedMs`; timer starts on first pickup; transitions after `won` ignored; star thresholds at exact boundaries; best time only improves; stars only increase; bad JSON / throwing storage → defaults
- [x] Switching browser tab auto-pauses; board hidden while paused; no input while paused
- [x] Best time + stars + stats survive reload

## Risk Assessment
- Stats lost if tab killed without `pagehide` → acceptable, stats are non-critical.
- Svelte 5 runes outside components require `.svelte.ts` extension → name store files accordingly.

## Security Considerations
- Treat localStorage as untrusted: type-guard before use, never `eval`/`innerHTML` stored values.

## Implementation Notes (as built)
- `GameSession` is a small class (injected clock, `maxHints`); engine exposes `setPaused(bool)`; restart = destroy + recreate the engine in `game-screen.svelte`.
- `GameConfig` is a discriminated union (`campaign` requires `levelId`).
- Progress store re-reads storage before each write and listens to `storage` events (multi-tab safe).
- Stats flush as deltas, so repeated flushes (hide, pagehide, bfcache restore, win, restart, unmount) never double-count or drop time.
- A drag interrupted by pause counts as a move (not snapped); `destroy()` cancels any drag.
- Dialogs move focus to their primary button; Escape resumes; HUD interval only restarts when status changes.
- `App.svelte` wraps `GameScreen` in `{#key config}`: the screen reads its config once.
- Verified: 78 unit tests, check/build clean, headless Chrome run (HUD, pause, auto-pause, win 3★, persistence).

## Next Steps
- Phase 3 replaces the hardcoded config with screens, level data and i18n.
