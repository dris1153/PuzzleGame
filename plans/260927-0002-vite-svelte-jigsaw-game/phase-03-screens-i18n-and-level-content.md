---
phase: 3
title: "Screens, i18n and level content"
status: completed
priority: P2
effort: "7h"
dependencies: [2]
---

# Phase 3: Screens, i18n and level content

## Context Links
- Phase 2: `src/data/game-config.ts`, `src/stores/progress-store.svelte.ts`, `src/screens/game-screen.svelte`
- Brainstorm: `plans/reports/brainstorm-260926-2355-vite-svelte-jigsaw-game-redesign.md`

## Overview
Add navigation (Home, Level Select, Free Play setup, Game, Stats, Settings), EN/VI i18n from the first line of UI text, 15 campaign levels with self-hosted WebP images, and image upload for Free Play. Deliverable: full game loop Home → play → win → next level, all text bilingual.

## Key Insights
- i18n before building screens: retrofitting strings later means touching every component twice.
- `vi.ts` typed `satisfies Record<MessageKey, string>` → a missing Vietnamese key fails `pnpm check`.
- Level Select must not download 15 full images → generate ~400px thumbnails.
- Legacy `img.jpg` has unknown license → replace with sourced images; drop it from `public/`.
- Uploaded images stay in memory only (object URL), never persisted.

## Requirements
- Functional:
  - Home: Campaign, Free Play, Stats, Settings.
  - Level Select: 15 cards, locked until previous level completed; completed cards show stars + best time.
  - Free Play: pick any campaign image or upload one; rows/cols 3–10 capped by screen; rotation + ghost toggles (defaults from settings); Start.
  - Stats: games started/completed, completion rate, total play time, pieces placed, levels completed x/15, stars x/45.
  - Settings: language EN/VI, sound on/off, ghost default, rotation default (Free Play), reset progress (confirm), image credits.
  - Game: back button; win modal gets Next level (campaign, if any) and Menu; pause overlay gets Quit.
- Non-functional: locale defaults from `navigator.language` (`vi*` → vi, else en); `<html lang>` follows locale; uploads ≤ 20 MB, `image/*` only, downscaled to max side 2048 px.

## Architecture

```
App.svelte ── switch(screen.current.name)
  home · level-select · free-play-setup · game(config) · stats · settings
stores: screen-store · settings-store · progress-store (phase 2)
i18n:   t(key, params) ← settings.locale ← locales/en.ts | vi.ts
```

```ts
// src/stores/screen-store.svelte.ts
type Screen =
  | { name: 'home' } | { name: 'level-select' } | { name: 'free-play' }
  | { name: 'game'; config: GameConfig; returnTo: 'level-select' | 'free-play' }
  | { name: 'stats' } | { name: 'settings' };
export const screen = { current: $state<Screen>({ name: 'home' }), go(s: Screen) {...} };

// src/stores/settings-store.svelte.ts  (persisted key 'jigsaw.settings', guarded like progress)
interface SettingsV1 { version: 1; locale: 'en' | 'vi'; sound: boolean; ghostDefault: boolean; rotationDefault: boolean }

// src/i18n/i18n.svelte.ts
export function t(key: MessageKey, params?: Record<string, string | number>): string // "{name}" interpolation

// src/data/levels.ts
interface LevelDef { id: string; image: string; thumb: string; rows: number; cols: number; rotation: boolean; parSec?: number; credit: { author: string; url: string } }
```

Campaign progression (landscape 3:2 images; rotation from level 9):
`3x3, 3x4, 4x4, 4x5, 5x5, 5x6, 6x6, 6x7, 4x4r, 5x5r, 6x6r, 6x7r, 7x7r, 7x8r, 8x8r`.
`parSec` default = pieces × (rotation ? 12 : 8); override per level if playtesting says so.

Pure helpers (tested):
- `isLevelUnlocked(index, levels, progress)` — index 0 always; else previous level has a record.
- `maxGridFor(viewW, viewH, minPiecePx = 44)` → `{ maxRows, maxCols }` clamped to 3..10.
- `validateImageFile({ type, size })` → `'ok' | 'not-image' | 'too-large'`.
- `interpolate(template, params)`.

## Related Code Files
- Create: `src/stores/screen-store.svelte.ts`, `src/stores/settings-store.svelte.ts`, `src/stores/settings-schema.ts`
- Create: `src/i18n/i18n.svelte.ts`, `src/i18n/interpolate.ts`, `src/i18n/locales/en.ts`, `src/i18n/locales/vi.ts`
- Create: `src/data/levels.ts`, `src/data/level-unlock.ts`, `src/engine/grid-limits.ts`
- Create: `src/lib/prepare-uploaded-image.ts` (validate + downscale → object URL)
- Create: `src/screens/home-screen.svelte`, `level-select-screen.svelte`, `free-play-setup-screen.svelte`, `stats-screen.svelte`, `settings-screen.svelte`
- Create: `src/components/level-card.svelte`, `src/components/image-picker.svelte`, `src/components/confirm-dialog.svelte`
- Create assets: `public/levels/level-01.webp` … `level-15.webp` (~1600 px long side, q≈80), `public/levels/thumbs/level-01.webp` … (~400 px)
- Create tests: `src/i18n/interpolate.test.ts`, `src/i18n/locales.test.ts` (same key set, no empty strings), `src/data/level-unlock.test.ts`, `src/engine/grid-limits.test.ts`, `src/lib/validate-image-file.test.ts`
- Modify: `src/App.svelte` (screen switch), `src/screens/game-screen.svelte`, `src/components/win-modal.svelte`, `src/components/pause-overlay.svelte`, `src/components/game-hud.svelte` (use `t()`)
- Delete: `public/levels/level-01.jpg` (legacy image)

## Implementation Steps
1. `interpolate.ts` + `en.ts` (`as const`) + `vi.ts` (`satisfies`) + `i18n.svelte.ts`; convert every existing string from phase 2 components to `t()`.
2. Settings schema/guard/store (reuse `storage.ts`); set `document.documentElement.lang` reactively.
3. Screen store; `App.svelte` renders the active screen; game screen receives `config` + `returnTo`.
4. Source 15 landscape photos (bright, no people/brands/logos) from Unsplash/Pexels; download at ~1600 px; convert to WebP + 400 px thumbs (ImageMagick `magick` if present, else `pnpm dlx sharp-cli`). Record author + URL in `levels.ts`.
5. `levels.ts`, `level-unlock.ts`, `grid-limits.ts` + tests.
6. Home, Level Select (`level-card`: thumb `loading="lazy"`, lock, stars, best time).
7. Free Play setup: `image-picker` (gallery thumbs + `<input type="file" accept="image/*">`), rows/cols `<input type="range">` bounded by `maxGridFor`, toggles, Start → `GameConfig` with `freePlayParSec`.
8. `prepare-uploaded-image.ts`: validate → `createImageBitmap` → downscale on canvas if > 2048 → `toBlob('image/jpeg', 0.9)` → object URL; revoke on game screen destroy; show translated error on failure.
9. Stats screen (derive rates/totals from progress store) and Settings screen (reset uses `confirm-dialog`, credits list from `levels.ts`).
10. Win modal: Next level + Menu; pause overlay: Quit → `returnTo`.
11. `pnpm test`, `pnpm check`, `pnpm build`; manual: full campaign flow levels 1→2, lock state, reload persistence, VI/EN switch on every screen, upload a large phone photo.

## Todo List
- [x] i18n core + locales + convert existing strings
- [x] Settings + screen stores, App screen switch
- [x] 15 level images + thumbs + credits
- [x] Level data, unlock, grid limits (tested)
- [x] Home, Level Select, Free Play setup, Stats, Settings screens
- [x] Upload pipeline with validation/downscale
- [x] Win/pause navigation
- [x] Manual flow check EN + VI

## Success Criteria
- [x] `pnpm check` fails if any VI key is missing (verified by temporarily deleting one)
- [x] No hardcoded user-facing string outside `locales/`
- [x] Level N+1 locked until N completed; state survives reload
- [x] 12 MP phone photo upload plays smoothly (downscaled); non-image file shows error
- [x] Level Select transfers thumbs only (check Network tab)
- [x] Total level assets ≤ ~4 MB

## Risk Assessment
- 8x8 campaign on 360 px wide phone → ~40 px pieces; acceptable but tight. If playtest is bad, cap campaign grids with `maxGridFor` too.
- No browser history integration: Android back button leaves the app. Add `history.pushState` sync only if users complain.
- Photo licensing: Unsplash/Pexels licenses allow free use; keep credits visible in Settings.

## Security Considerations
- Upload: check MIME + size before decoding; decode via `createImageBitmap` (no HTML injection path); object URLs revoked after use; nothing uploaded leaves the device.
- Render all text via Svelte bindings (escaped); no `{@html}`.

## Implementation Notes (as built)
- Images: 15 Unsplash photos fetched via picsum.photos as 1500×1000 WebP + 360×240 thumbs (3.0 MB total); legacy `img.jpg` removed (unknown license). Credits verified against the picsum catalog.
- Unlock logic lives in `levels.ts` (`isLevelUnlocked`); interpolate tests live in `locales.test.ts`.
- `createPersistedState` (`lib/persisted-state.svelte.ts`) backs both progress and settings: re-read before write + `storage` event sync.
- Game wiring moved to `screens/game-controller.svelte.ts`; the screen remounts via `{#key}` per navigation.
- HUD Menu pauses a running game instead of quitting (Quit lives in the pause overlay).
- Free Play: rotation follows the Settings default until toggled; wanted rows/cols are kept and clamped per screen; upload decode is race-guarded and Start is disabled while decoding; uploads are re-encoded to JPEG on white with EXIF orientation applied; one object URL kept at a time.
- A11y: screen titles take focus on navigation; confirm dialog is named and returns focus; decorative glyphs hidden.
- Known gap for phase 5: on a 360 px portrait phone campaign pieces get small (8×8 ≈ 36×24 px) because the 3:2 board is width-bound.
- Verified: 102 unit tests, check/build clean, headless Chrome flow (campaign unlock + next level, upload errors/large photo, stats, EN→VI persisted).

## Next Steps
- Phase 4 adds hint, ghost toggle, rotation and sound on top of the game screen.
