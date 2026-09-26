---
phase: 5
title: "Playful styling, responsive and polish"
status: pending
priority: P2
effort: "6h"
dependencies: [4]
---

# Phase 5: Playful styling, responsive and polish

## Context Links
- All screens/components from phases 2–4; engine `board-layout.ts`, `scatter-pieces.ts`, `board-renderer.ts`, `piece-sprite-cache.ts`
- User rule: global `cursor: pointer` base rule for interactive elements

## Overview
Playful/cartoon visual identity, reusable UI primitives, board and piece polish (shadows, lift, snap pop), confetti win, mobile-first layout with smarter piece scatter, accessibility and performance pass, README. Deliverable: shippable game.

## Key Insights
- Fonts must cover Vietnamese diacritics: `Baloo 2` (headings) + `Nunito` (body) both ship a `vietnamese` subset; self-host via `@fontsource/*` (no CDN, works offline).
- Bake the resting drop shadow into piece sprites; use live `ctx.shadowBlur` only for the single dragged piece → shadows stay cheap at 100 pieces.
- Scatter quality decides mobile playability: portrait → board on top, pieces below; landscape → pieces left/right of board.
- `prefers-reduced-motion` must disable confetti and shorten/skip tweens.
- Measured after phase 3: 360×680 portrait gives a 288×192 board (8×8 → 36×24 px pieces). Portrait needs a larger board scale (≈0.95 width) with the scatter zone below; the HUD must compact/wrap for Vietnamese labels at 320–360 px.

## Requirements
- Functional:
  - Design tokens (colors, radii, shadows, spacing, motion) in one CSS file; bright palette, big radii, chunky offset button shadows, bouncy press.
  - UI primitives used by every screen: button (primary/secondary/icon), card, modal (focus moved in and restored, Esc closes, `aria-modal`), toggle switch, star rating (sequential bounce reveal).
  - Board: table-like background, rounded board frame, lifted piece scale 1.05 + larger shadow, snap pop (scale 1.1 → 1, ~180 ms).
  - Win: `canvas-confetti` bursts + stars reveal; screen transitions via `svelte/transition`.
  - Responsive: `100dvh`, safe-area insets, compact icon HUD on narrow screens, board scale per orientation, zone-based scatter.
- Non-functional: WCAG AA text contrast, visible `:focus-visible`, keyboard reachable menus, 60 fps drag of 10x10 on DevTools 4x CPU throttle, bundle JS (gzip) < 100 KB excluding fonts.

## Architecture
```
src/styles/tokens.css      :root vars (palette, radius, shadow, space, motion)
src/styles/base.css        reset, fonts, cursor rule, focus ring, reduced-motion
src/components/ui/         app-button · app-card · app-modal · toggle-switch · star-rating
engine
  board-layout.ts          scale by orientation (portrait ≈ 0.9 width / ≤ 55% height; landscape ≈ 0.65)
  scatter-zones.ts (pure)  free rectangles around the board ≥ one piece; fallback = whole viewport
  scatter-pieces.ts        distribute pieces across zones (overlap allowed)
  board-renderer.ts        frame, lift shadow, snap-pop animation
  piece-sprite-cache.ts    baked resting shadow
```
Cursor rule (from user's global rules):
```css
@layer base {
  button:not(:disabled), [role="button"]:not(:disabled),
  label:has(> input[type="checkbox"]), select:not(:disabled) { cursor: pointer; }
  button:disabled { cursor: not-allowed; }
}
```
Canvas cursor: `grab` over an unplaced piece, `grabbing` while dragging (set from pointer-controller hover hit-test, throttled to pointermove).

## Related Code Files
- Create: `src/styles/tokens.css`, `src/styles/base.css`
- Create: `src/components/ui/app-button.svelte`, `app-card.svelte`, `app-modal.svelte`, `toggle-switch.svelte`, `star-rating.svelte`
- Create: `src/engine/scatter-zones.ts`, test `src/engine/scatter-zones.test.ts`
- Create: `src/lib/celebrate.ts` (confetti wrapper honoring reduced motion)
- Modify: every screen + `game-hud`, `win-modal`, `pause-overlay`, `level-card`, `image-picker`, `confirm-dialog` to use primitives/tokens
- Modify: `src/engine/board-layout.ts`, `scatter-pieces.ts`, `board-renderer.ts`, `piece-sprite-cache.ts`, `pointer-controller.ts` (hover cursor)
- Modify: `src/app.css` (import styles), `index.html` (title, theme-color, favicon), `README.md`
- Deps: `pnpm add canvas-confetti @fontsource/baloo-2 @fontsource/nunito` and `pnpm add -D @types/canvas-confetti`

## Implementation Steps
1. Tokens + base styles + fonts (import only used weights and `latin`, `latin-ext`, `vietnamese` subsets).
2. UI primitives; refactor all screens/overlays onto them (click sfx inside `app-button`).
3. Engine visuals: baked sprite shadow, lifted piece, board frame, snap-pop animation (reuse phase 4 animation loop).
4. `scatter-zones.ts` + tests; switch scatter to zones; orientation-based board scale.
5. Responsive HUD (icons + numbers < 480 px, labels ≥ 480 px), safe-area padding, `100dvh`.
6. `celebrate.ts` with `canvas-confetti`; star-rating animation; `svelte/transition` on screen switch; reduced-motion handling.
7. Accessibility pass: labels/aria on icon buttons, focus management in modals, `aria-live` win message, contrast check.
8. Performance pass: 10x10 drag with 4x CPU throttle; `pnpm build` and check bundle size.
9. `index.html` title/theme-color/favicon; README (install, dev, test, build, credits).
10. Final `pnpm test`, `pnpm check`, `pnpm build`; manual on real phone (portrait + landscape) and desktop.

## Todo List
- [ ] Tokens, base styles, fonts, cursor rule
- [ ] UI primitives + screen refactor
- [ ] Piece/board visual polish + snap pop
- [ ] Zone scatter (tested) + orientation layout
- [ ] Responsive HUD + safe areas
- [ ] Confetti, star reveal, transitions, reduced motion
- [ ] Accessibility + performance passes
- [ ] README + index.html meta

## Success Criteria
- [ ] Tests: zones never intersect board; every scattered piece fully inside viewport; fallback when zones too small
- [ ] Vietnamese text renders in custom fonts (no fallback glyphs)
- [ ] Portrait phone: no piece starts on top of the board when a free zone exists
- [ ] Reduced motion: no confetti, no bounce
- [ ] Lighthouse accessibility ≥ 90; drag stays ~60 fps under throttle
- [ ] All three commands green

## Risk Assessment
- Scope creep in "polish" → only items listed here; extra ideas go to a follow-up list.
- Very small screens (< 340 px) may still crowd pieces → zones fall back to full viewport; acceptable.
- Font weight bloat → import 2 weights per family max.

## Security Considerations
- New deps are small and widely used; pin via lockfile; no runtime network calls.

## Next Steps
- Optional follow-ups (not planned): deploy target, resume in-progress game, history/back-button sync, zoom/pan for large grids, dark theme.
