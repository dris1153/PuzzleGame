---
phase: 1
title: "Scaffold and engine port"
status: completed
priority: P1
effort: "6h"
dependencies: []
---

# Phase 1: Scaffold and engine port

## Context Links
- Brainstorm: `plans/reports/brainstorm-260926-2355-vite-svelte-jigsaw-game-redesign.md`
- Legacy source (to port, then delete): `script.js`, `style.css`, `index.html`, `img.jpg`

## Overview
Vite + Svelte 5 + TS project with pnpm, framework-free engine in `src/engine/`, all 8 scout bugs fixed, Vitest on pure engine logic. Deliverable: the same 3x3 puzzle as today, working with mouse and touch, surviving resize.

## Key Insights
- Legacy edge sign semantics are inconsistent per side (positive = outward on top/bottom, inward on left/right). Port with ONE rule: `+1` = tab (outward), `-1` = blank (inward); magnitude `0.3..0.7` = tab position along the edge, measured from top (left/right edges) or from left (top/bottom edges). Neighbor complement is then plain negation.
- Legacy tab math: `sz = min(pieceW, pieceH)`, `neck = 0.1*sz`, `tab = 0.2*sz`, two cubic beziers per tab. Reuse exactly for identical look.
- Color-pick helper canvas is the root of bugs 2, 4, 6. Replace with `Path2D` + `ctx.isPointInPath` on untransformed local coords.
- `new Image()` is not guaranteed loaded at `body onload` → must `await` load before layout.
- Node test env has no `Path2D`/canvas → keep math (edges, layout, geometry, scatter) in pure modules; canvas modules stay thin.

## Requirements
- Functional: drag pieces (mouse + touch), snap within threshold, placed pieces locked and drawn underneath, ghost image 50% on board, 3x3 grid, resize keeps every piece's relative position and progress.
- Non-functional: files < 200 LOC, kebab-case names, strict TS, DPR-crisp canvas, redraw only when dirty.

## Architecture

```
App.svelte ─ loadImage() ─> createPuzzleGame({ canvas, image, rows, cols, callbacks })
                                  │
          ┌───────────────────────┼─────────────────────────┐
  board-layout (pure)     pointer-controller          board-renderer
  piece-edge-generator    ├─ hit-test (Path2D)        └─ piece-sprite-cache
  scatter-pieces (pure)   └─ geometry (pure)             └─ piece-path-builder
```

Data model (`src/engine/types.ts`):
```ts
type Edge = number | null;              // null = border; sign: +1 tab, -1 blank; |v| = position 0.3..0.7
interface PieceEdges { top: Edge; right: Edge; bottom: Edge; left: Edge }
interface Piece {
  id: number; row: number; col: number; edges: PieceEdges;
  u: number; v: number;                 // center in board units (0..1 = inside board; may exceed)
  rotation: 0 | 1 | 2 | 3;              // quarter turns; always 0 until phase 4
  placed: boolean;
}
interface BoardLayout { x: number; y: number; width: number; height: number; pieceW: number; pieceH: number; tab: number }
```
- `world = { x: board.x + u*board.width, y: board.y + v*board.height }`; correct center = `((col+.5)/cols, (row+.5)/rows)`.
- `pieces` array order = z-order (last drawn on top). Pickup moves to end; snap moves to start.
- `Path2D` built once per piece in local coords centered at (0,0); rebuilt on layout change.
- Hit-test: iterate top-down, skip `placed`, `local = toLocal(point, center, rotation)` (pure inverse rotate), then `ctx.isPointInPath(path, local.x, local.y)` with identity transform (use a 1x1 offscreen ctx).
- Render: `invalidate()` sets dirty + schedules one rAF; renderer clears, draws ghost image, then each piece sprite via `translate(center) → rotate(q*90°) → drawImage(sprite)`.
- Sprite cache: per piece an `OffscreenCanvas` (fallback `document.createElement('canvas')`) sized `(pieceW+2*tab)*dpr` × `(pieceH+2*tab)*dpr`; clip path → drawImage source rect expanded by `tab` in image units → stroke.
- Canvas sizing: `ResizeObserver` on the canvas parent; `canvas.width = cssW*dpr`, `ctx.setTransform(dpr,0,0,dpr,0,0)`; recompute layout, rebuild paths/sprites, invalidate. Pieces keep `u,v`.
- Input: Pointer Events on canvas, `touch-action: none`, only `e.isPrimary`, `setPointerCapture` on pickup, coords via `getBoundingClientRect()`.

Engine facade API (`puzzle-game.ts`):
```ts
interface PuzzleGameOptions {
  canvas: HTMLCanvasElement; image: HTMLImageElement; rows: number; cols: number;
  rng?: () => number;                                     // default Math.random, injectable for tests
  onPiecePlaced?(placed: number, total: number): void;
  onMove?(): void;                                        // drop after drag > 5px
  onComplete?(): void;
}
createPuzzleGame(opts): { destroy(): void }               // phase 2+ extends the returned API
```

## Related Code Files
- Create: `package.json`, `vite.config.ts`, `svelte.config.js`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`, `.gitignore`
- Create: `src/main.ts`, `src/App.svelte`, `src/app.css`, `src/lib/load-image.ts`
- Create: `src/engine/types.ts`, `piece-edge-generator.ts`, `board-layout.ts`, `geometry.ts`, `scatter-pieces.ts`, `piece-path-builder.ts`, `piece-sprite-cache.ts`, `board-renderer.ts`, `hit-test.ts`, `pointer-controller.ts`, `puzzle-game.ts`
- Create tests: `src/engine/piece-edge-generator.test.ts`, `board-layout.test.ts`, `geometry.test.ts`, `scatter-pieces.test.ts`
- Move: `img.jpg` → `public/levels/level-01.jpg`
- Modify: `index.html` (Vite entry, `<div id="app">`, viewport meta)
- Delete: `script.js`, `style.css`

## Implementation Steps
1. Create branch `feat/vite-svelte-jigsaw`.
2. Scaffold in scratch dir: `pnpm create vite@latest jigsaw-tmp --template svelte-ts`; move config/src files into repo root; delete demo (`Counter.svelte`, `assets/`, `public/vite.svg`). Set `"packageManager": "pnpm@11.5.1"`. `pnpm install`.
3. `pnpm add -D vitest`; add scripts `test: "vitest run"`; in `vite.config.ts` add `/// <reference types="vitest/config" />` and `test: { include: ['src/**/*.test.ts'], environment: 'node' }`.
4. `load-image.ts`: `loadImage(src): Promise<HTMLImageElement>` using `img.decode()`; reject on error (fixes bug 1).
5. `piece-edge-generator.ts`: `generateEdges(rows, cols, rng)` → `PieceEdges[]` row-major. Border edges `null`; `right`/`bottom` random sign × `(rng()*0.4+0.3)`; `left = -prev.right`, `top = -above.bottom`.
6. `board-layout.ts`: `computeBoardLayout(viewW, viewH, imgW, imgH, rows, cols, scale=0.8)`; throw on zero-size image/viewport; `tab = 0.2*min(pieceW,pieceH)`.
7. `geometry.ts`: `boardToWorld`, `worldToBoard`, `toLocal(point, center, rotation)`, `distance`, `isNearTarget(piece, layout)` (pixel distance to correct center < `pieceW/3`).
8. `scatter-pieces.ts`: `scatterPieces(pieces, layout, viewW, viewH, rng)` → sets `u,v` so each piece (incl. tab margin) is fully inside the viewport. (Phase 5 upgrades to prefer off-board areas.)
9. `piece-path-builder.ts`: `buildPiecePath(edges, layout)` → `Path2D` centered at origin; port the 4 bezier segments with the unified sign rule.
10. `piece-sprite-cache.ts`: `buildSprites(pieces, paths, image, layout, grid, dpr)`; source rect expansion `tab * imgPieceW / pieceW`.
11. `board-renderer.ts`: `render(ctx, state)` — clear, ghost image at `globalAlpha 0.5`, sprites in z-order.
12. `hit-test.ts`: `pickPiece(pieces, paths, point, layout)` top-down, skip placed.
13. `pointer-controller.ts`: attach/detach listeners; drag state (piece, grab offset in board units, start point); on up: count move if moved > 5px, `isNearTarget` → snap (`u,v` = correct, `placed = true`, move to array start), fire callbacks; `onComplete` when all placed.
14. `puzzle-game.ts`: wire layout, edges, scatter, paths, sprites, renderer, controller, ResizeObserver, dirty-flag rAF; `destroy()` disconnects observer + listeners.
15. `App.svelte`: load `/levels/level-01.jpg`, mount engine on a full-viewport canvas, show loading + error state; destroy on unmount. `app.css`: reset, `html,body{height:100%}`, `overscroll-behavior:none`, canvas `display:block; touch-action:none`, global cursor rule for buttons.
16. Write the 4 test files; run `pnpm test`, `pnpm check`, `pnpm build`.
17. Delete `script.js`, `style.css`; manual check desktop + DevTools touch emulation + window resize mid-game.

## Todo List
- [x] Branch + scaffold + pnpm + vitest wired
- [x] `load-image`, `types`, `piece-edge-generator`, `board-layout`, `geometry`, `scatter-pieces`
- [x] `piece-path-builder`, `piece-sprite-cache`, `board-renderer`, `hit-test`
- [x] `pointer-controller`, `puzzle-game`, `App.svelte`, `app.css`
- [x] Unit tests green
- [x] Legacy files removed, image moved
- [x] Manual check: mouse, touch emulation, resize, HiDPI

## Success Criteria
- [x] `pnpm test`, `pnpm check`, `pnpm build` pass
- [x] Tests cover: edge complement + borders + magnitude range; layout centering/fit + zero-size guard; `toLocal` round-trip for all 4 rotations; board↔world round-trip; `isNearTarget` boundary; scatter keeps pieces in viewport
- [x] Scout bugs gone: no NaN layout before image load; no color-pick canvas; resize keeps progress; single init; `snap` uses the piece itself; clicking a piece border selects it; placed pieces not selectable; no page scroll/zoom or synthetic mouse events while dragging on touch
- [x] Visual parity with legacy (same tab shape), crisp on DPR 2

## Risk Assessment
- `OffscreenCanvas` missing on old Safari → fallback to detached `<canvas>`.
- Many sprites × DPR memory at 10x10 (phase 3): ~100 small canvases, acceptable; revisit only if profiling shows issues.
- Scaffold into non-empty dir prompts/overwrites → scaffold in scratch dir then move.

## Security Considerations
- No user input yet beyond pointer; no network; image served from `public/`.

## Implementation Notes (as built)
- Edges + piece creation live in `src/engine/piece-generator.ts` (`generateEdges`, `createPieces`); API names `buildSprite`, `renderBoard`.
- Sprites use a detached `<canvas>` everywhere (no OffscreenCanvas branch needed); sprite size derived from the rounded backing size for 1:1 DPR drawing.
- Path tracing goes through a `PathSink` interface → seam interlock and sign convention are unit-tested without a canvas.
- Relayout is coalesced into rAF and skipped when size + DPR are unchanged; `destroy()` sets a flag so callbacks can safely tear down the game.
- Pointer: left button only, `pointercancel`/`lostpointercapture` end the drag using the last known point, context menu blocked on canvas.
- Verified: 36 unit tests, `pnpm check`, `pnpm build`, headless Chrome solve (mouse + touch, DPR 2, mid-game resize), no console errors.

## Next Steps
- Phase 2 extends `createPuzzleGame` with session hooks (pause, restart) and adds HUD.
