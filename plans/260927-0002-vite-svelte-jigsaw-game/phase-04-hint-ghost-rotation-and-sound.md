---
phase: 4
title: "Hint, ghost, rotation and sound"
status: pending
priority: P2
effort: "6h"
dependencies: [3]
---

# Phase 4: Hint, ghost, rotation and sound

## Context Links
- Engine: `src/engine/puzzle-game.ts`, `pointer-controller.ts`, `board-renderer.ts`, `hit-test.ts`, `geometry.ts`, `scatter-pieces.ts`
- Session: `src/engine/game-session.ts`; settings: `src/stores/settings-store.svelte.ts`

## Overview
Gameplay extras: ghost image toggle, 3 hints per game, quarter-turn piece rotation (campaign levels 9+ and Free Play toggle), and sound effects. Deliverable: all four features playable and reflected in scoring (hints).

## Key Insights
- Rotation is already supported by the data model (`rotation: 0..3`), hit-test (`toLocal`) and renderer (rotate before `drawImage`) from phase 1 — this phase adds input, scatter and snap rules.
- Tap vs drag must be decided on release, not press: `distance < 5 px && duration < 300 ms` → tap.
- Rotating does not count as a move (otherwise rotation levels could never reach the 3★ move budget).
- Browsers block audio until a user gesture → create/resume `AudioContext` lazily inside the first pointerdown.
- Safari lacks reliable Ogg support → ship SFX as `.mp3`.

## Requirements
- Functional:
  - Ghost: HUD toggle, initial value from `settings.ghostDefault`; no score effect.
  - Hint: HUD button with remaining count (3). Picks a random unplaced piece, pulses its outline and its target slot outline for 2 s. Counts toward `hintsUsed`; disabled at 0, while paused, or after win.
  - Rotation: when `config.rotation`, scatter assigns random quarter turns; tapping an unplaced piece rotates +90° with a 150 ms animation; snap only if `rotation === 0` and near target.
  - Sound: pickup, drop, snap, rotate, win, UI click; obeys `settings.sound`; failure to load is silent.
- Non-functional: animation frames run only while an animation (hint pulse, rotation tween) is active; otherwise dirty-flag rendering as before.

## Architecture
```ts
// engine additions (puzzle-game.ts API)
setGhostVisible(visible: boolean): void
showHint(): boolean                      // false when no unplaced piece
onRotate?(): void                        // new callback

// pure helpers
classifyRelease({ dx, dy, durationMs }): 'tap' | 'drag'            // pointer-gesture.ts
pickHintPiece(pieces, rng): Piece | null                          // hint-picker.ts
canSnap(piece, layout): boolean = piece.rotation === 0 && isNearTarget(piece, layout)  // geometry.ts
scatterPieces(..., { rotation: boolean })                         // random 0..3 + margin uses max(w,h)
```
- Animation state lives in the engine: `animations: { hint?: { pieceId, until }, rotate?: { pieceId, from, to, start } }`; renderer interpolates angle and pulse alpha; loop keeps requesting frames while any animation is active.
- Session: `maxHints = 3`; `recordHint()` returns `false` when exhausted.
- `src/audio/sfx-player.ts`: `unlock()` (called from engine `onPickup`/first UI click), `play(name)`; buffers decoded once via `fetch` + `decodeAudioData`; checks `settings.sound` at play time.

## Related Code Files
- Create: `src/engine/pointer-gesture.ts`, `src/engine/hint-picker.ts`, `src/audio/sfx-player.ts`
- Create assets: `public/sfx/pickup.mp3`, `drop.mp3`, `snap.mp3`, `rotate.mp3`, `win.mp3`, `click.mp3` (Kenney CC0, converted with ffmpeg)
- Create tests: `src/engine/pointer-gesture.test.ts`, `src/engine/hint-picker.test.ts`; extend `geometry.test.ts` (canSnap), `scatter-pieces.test.ts` (rotation + margin), `game-session.test.ts` (hint limit)
- Modify: `src/engine/puzzle-game.ts`, `pointer-controller.ts`, `board-renderer.ts`, `scatter-pieces.ts`, `geometry.ts`, `game-session.ts`, `types.ts`
- Modify: `src/components/game-hud.svelte` (ghost + hint buttons), `src/screens/game-screen.svelte` (wire sfx + hint), `src/i18n/locales/en.ts`, `vi.ts`
- Modify: Settings credits list (add Kenney credit)

## Implementation Steps
1. `pointer-gesture.ts` + tests; pointer-controller records press time/point and calls `classifyRelease`; tap on unplaced piece → start rotate animation, set `rotation = (r+1) % 4`, fire `onRotate`; drag path unchanged but snap uses `canSnap`.
2. `scatter-pieces.ts`: optional random rotation; bound margin uses `max(pieceW, pieceH)/2 + tab` when rotation enabled — in both `scatterPieces` and `clampPiecesToView` (shared `margins()`).
3. Renderer: animated angle for rotating piece; hint pulse = stroke piece path (at piece) + target outline (path at correct center) with alpha `0.5 + 0.5*sin(t)`.
4. `hint-picker.ts` + `showHint()` + session `recordHint()` limit; HUD hint button with remaining count.
5. Ghost toggle: `setGhostVisible`; HUD button; init from settings.
6. Download Kenney "Interface Sounds" / "UI Audio" (CC0), pick 6 clips, convert to mp3 (`ffmpeg -i x.ogg -q:a 5 x.mp3`), keep each < 30 KB.
7. `sfx-player.ts`; wire to engine callbacks and HUD/menu buttons.
8. i18n keys for new HUD labels/tooltips (EN + VI).
9. `pnpm test`, `pnpm check`, `pnpm build`; manual: rotation level (L9) complete with taps, hint exhausts at 3, stars drop to ≤ 2 after a hint, sound on/off, iOS Safari audio after first tap.

## Todo List
- [ ] Tap-vs-drag + rotation input + canSnap
- [ ] Rotation-aware scatter
- [ ] Renderer animations (rotate tween, hint pulse)
- [ ] Hint picker + session limit + HUD button
- [ ] Ghost toggle
- [ ] SFX assets + player + wiring
- [ ] i18n keys
- [ ] Manual checks

## Success Criteria
- [ ] Tests: tap/drag boundary values; hint never picks placed piece, `null` when all placed; `canSnap` false for rotation ≠ 0 even at exact target; hint limit enforced; rotated pieces stay inside viewport after scatter
- [ ] Rotated piece hit-test accurate on the rotated shape (tabs included)
- [ ] Idle game after animations finish → no rAF running (verify in Performance panel)
- [ ] Sound respects toggle immediately; no console errors when audio blocked

## Risk Assessment
- Accidental rotate when user intended a tiny drag → thresholds are constants in `pointer-gesture.ts`; tune in playtest.
- Non-square pieces rotated 90° visually overlap neighbors more → acceptable; they cannot snap until upright.
- Audio decode failure on some browsers → catch and stay silent.

## Security Considerations
- Static assets only; no new input surfaces.

## Next Steps
- Phase 5 styles everything, adds confetti and mobile-first layout.
