# Puzzle Game

A playful jigsaw puzzle game for desktop and mobile, built with Vite, Svelte 5 and TypeScript.

- **Campaign**: 15 levels from 3×3 to 8×8. Levels 9–15 have rotated pieces. Clearing a level unlocks the next one.
- **Free Play**: pick any level image or upload your own photo, then choose a grid from 3×3 to 10×10 (limited by screen size). Uploaded photos stay on your device.
- **Scoring**: timer, move count, 1–3 stars from par time, moves and hints, best times, and a stats screen.
- **Gameplay**: drag and snap pieces, tap to rotate, 3 hints per game, ghost image toggle, pause (automatic when the tab is hidden), synthesized sound effects.
- **Languages**: English and Tiếng Việt.
- **Saving**: progress and settings are kept in `localStorage` and stay in sync across tabs.

## Development

Requires Node 22+ and pnpm.

```bash
pnpm install
pnpm dev       # start the dev server
pnpm test      # unit tests (Vitest)
pnpm check     # type check (svelte-check + tsc)
pnpm build     # production build in dist/
```

## Project layout

```
src/
  engine/    canvas puzzle engine in plain TypeScript (no Svelte): layout, pieces, input, rendering, session, scoring
  screens/   Svelte screens and the game controller that connects the engine to progress and stats
  components/  HUD, dialogs, cards, and ui/ primitives (button, modal, toggle, stars, icons)
  stores/    persisted progress and settings, navigation, free play choices
  i18n/      t() and the en / vi dictionaries
  data/      level definitions and game config
  audio/     WebAudio sound effects
public/levels/  level images (1500×1000 WebP) and thumbnails
```

## Credits

Level photos come from [Unsplash](https://unsplash.com) (via picsum.photos) under the Unsplash License. Each photographer is credited in `src/data/levels.ts` and on the in-game Settings screen. Fonts are Baloo 2 and Nunito (SIL Open Font License), self-hosted with Fontsource.
