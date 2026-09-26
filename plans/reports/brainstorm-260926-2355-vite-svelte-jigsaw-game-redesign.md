# Brainstorm: PuzzleGame → Vite + Svelte jigsaw game

Date: 2026-09-26 · Status: approved

## Problem
Current game = 1 `script.js` (430 LOC, vanilla canvas), fixed 3x3, no win condition, no metrics, no screens. Goal: real jigsaw game on Vite with restyled UI, metrics, levels.

## Requirements (confirmed with user)
- Stack: Vite + Svelte 5 + TypeScript, pnpm
- Mechanic: snap to board (no piece-to-piece grouping)
- Modes: Campaign (linear levels, unlock) + Free Play (gallery or upload, pick grid)
- Persistence: localStorage only, no backend
- Metrics: timer + best time, moves, 1–3 stars, global stats screen
- Gameplay: hint, ghost image toggle, piece rotation, pause + sound
- Style: playful / cartoon (bright colors, big radii, bouncy anim, confetti)
- Images: free Unsplash/Pexels, self-hosted WebP in `public/`
- i18n: English + Vietnamese, switchable
- Devices: desktop + mobile (responsive, touch)
- Rotation: auto-on for later campaign levels + Free Play toggle

## Scout findings to fix during port
1. Image may not be loaded when sizing → `NaN` layout (no `onload`)
2. Unique-color check dead (array never pushed) + `const` reassignment → would throw
3. Resize re-generates + reshuffles pieces (progress lost); init runs twice
4. Helper `fillRect` typo `height * tabHeight` (should be `+`)
5. `snap()` uses global `SELECTED_PIECE` instead of `this`
6. Clicking piece border misses (stroke + antialias on color-pick canvas)
7. Correct piece still assignable to `SELECTED_PIECE`
8. Touch without `preventDefault` → synthetic mouse events, scroll/zoom
Also: no win check, no DPR handling, dead `getPressPiece`, commented webcam code.

## Evaluated approaches
| Concern | Chosen | Rejected | Why |
|---|---|---|---|
| Rendering | Canvas 2D + per-piece sprite cache (OffscreenCanvas) | PixiJS; DOM/SVG pieces | Canvas 2D enough for ≤100 pieces; Pixi ~400KB; SVG drag perf poor |
| Hit-test | `Path2D` + `isPointInPath`, top-down | Color-pick helper canvas | Removes color collision + edge bugs; rotation-safe |
| Input | Pointer Events + `setPointerCapture` | Separate mouse/touch | One path, no synthetic mouse events |
| Screens | Single `screen` store | Router lib | ~6 screens, no URLs needed |
| i18n | Custom store (~30 LOC) + `en.ts`/`vi.ts` | svelte-i18n | No dep, no plural needs |
| Confetti | `canvas-confetti` | Hand-rolled | ~6KB, not worth writing |
| Audio | CC0 SFX (Kenney) via WebAudio | Howler | 3–4 sounds |
| Render loop | Dirty-flag on-demand | Constant rAF | Battery on mobile |
| Resize | Board-relative piece coords + DPR scaling | Regenerate | Keeps progress, crisp on HiDPI |

## Final design

### Structure
```
src/
  engine/            pure TS, no Svelte imports
    piece-edge-generator.ts
    piece-path-builder.ts
    piece-sprite-cache.ts
    board-renderer.ts
    pointer-controller.ts
    game-session.ts        ready → playing ⇄ paused → won
    scoring.ts
  stores/            settings, progress (localStorage, versioned), i18n
  screens/           Home, LevelSelect, FreePlaySetup, Game(+HUD/Pause/Win), Stats, Settings
  data/levels.ts     {id, image, rows, cols, rotation, par}
  locales/en.ts, vi.ts
  audio/sfx-player.ts
public/levels/*.webp, public/sfx/*
```
Files < 200 LOC each.

### Rules
- Campaign ~15 levels, 3x3 → 8x8; rotation from level 9; clear to unlock next
- Free Play: gallery/upload (downscale ≤2048px), grid 3x3–10x10 (capped by screen size on mobile), rotation toggle; best time keyed by grid + rotation
- Move = drop after >5px drag; tap (no drag) = rotate 90°
- Snap only at 0° and within distance threshold
- Hint: 3/game, flash piece + target slot 2s
- Ghost toggle: no score effect
- Pause: stop timer, cover board
- Stars: 3★ time ≤ par AND moves ≤ pieces×1.5 AND 0 hints; 2★ time ≤ 2×par; 1★ complete. Thresholds tunable in `levels.ts`
- Stats: games played, total time, pieces placed, completion rate

### Phases
1. Scaffold (`pnpm create vite`, svelte-ts), port engine to TS, fix scout bugs, Vitest for engine → 3x3 parity
2. Session + HUD: timer, moves, pause, win modal, stars, progress store
3. Screens + i18n + level images
4. Hint, ghost toggle, rotation, sound
5. Playful styling, mobile responsive, confetti/animations

## Risks
- 8x8+ on portrait mobile: tiny overlapping pieces → cap grid by screen; zoom/pan deferred
- localStorage blocked/cleared → try/catch, game still playable without saving
- Large uploads → downscale before slicing
- Image licensing → credit sources in Settings/About
- Not in scope: resume in-progress game after reload, online leaderboard, piece grouping

## Success criteria
- `pnpm build` passes, `pnpm test` (engine) passes
- All 8 scout bugs gone; resize keeps progress
- Campaign unlock + stars + best time persist across reload
- Playable with touch on phone (no scroll/zoom while dragging)
- EN/VI switch covers every visible string

## Next
`/ck:plan` from this report.
