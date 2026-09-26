---
title: "Vite + Svelte jigsaw game rewrite"
description: "Port vanilla canvas jigsaw to Vite + Svelte 5 + TS with levels, metrics, i18n and playful UI."
status: completed
priority: P2
effort: 30h
branch: feat/vite-svelte-jigsaw
tags: [frontend, feature, refactor]
blockedBy: []
blocks: []
created: 2026-09-27
---

# Vite + Svelte jigsaw game rewrite

## Overview
Replace the single-file vanilla canvas puzzle (`script.js`, 430 LOC) with a Vite + Svelte 5 + TypeScript app.
Engine stays framework-free TS (unit-tested with Vitest); Svelte owns screens, HUD and persisted stores.
Source of decisions: [brainstorm report](../reports/brainstorm-260926-2355-vite-svelte-jigsaw-game-redesign.md).

## Phases

| Phase | Name | Status | Effort |
|-------|------|--------|--------|
| 1 | [Scaffold and engine port](./phase-01-scaffold-and-engine-port.md) | Completed | 6h |
| 2 | [Game session, HUD and metrics](./phase-02-game-session-hud-and-metrics.md) | Completed | 5h |
| 3 | [Screens, i18n and level content](./phase-03-screens-i18n-and-level-content.md) | Completed | 7h |
| 4 | [Hint, ghost, rotation and sound](./phase-04-hint-ghost-rotation-and-sound.md) | Completed | 6h |
| 5 | [Playful styling, responsive and polish](./phase-05-playful-styling-responsive-and-polish.md) | Completed | 6h |

Phases are sequential; each one ends with a playable build.

## Key decisions (locked)
- Snap to board only, no piece-to-piece grouping
- Canvas 2D + per-piece sprite cache; `Path2D` + `isPointInPath` hit-test; Pointer Events
- Piece positions stored board-relative (resize keeps progress); DPR-aware canvas
- localStorage only, versioned schema, all access wrapped in try/catch
- Screen switching via one store, no router; custom i18n store (EN/VI), no i18n lib
- Deps beyond Vite/Svelte/TS/Vitest: `canvas-confetti`, `@fontsource/*` only

## Dependencies
- Node 22, pnpm 11 (verified locally)
- 15 free-licensed level photos (Unsplash/Pexels) + CC0 SFX (Kenney), fetched in phase 3/4

## Global success criteria
- `pnpm build`, `pnpm check`, `pnpm test` pass after every phase
- Playable on desktop mouse and phone touch without page scroll/zoom while dragging
- Campaign unlocks, stars, best times and stats survive reload
- Every visible string switches between EN and VI
