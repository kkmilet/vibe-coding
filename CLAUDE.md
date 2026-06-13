# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Lumina | Pro Vision** — A high-end photography portfolio website with an Apple-esque aesthetic.

## Tech Stack

- React 19 + TypeScript + Vite
- Tailwind CSS (CDN, configured inline in `index.html`)
- lucide-react for icons
- i18n: English and Chinese

**Important**: All runtime dependencies (React, lucide-react) are loaded via CDN import maps in `index.html`, not npm. `npm install` only installs dev/build dependencies.

## Commands

```bash
npm install      # Install dev/build dependencies only
npm run dev      # Start dev server at http://localhost:3000
npm run build    # Production build
npm run preview  # Preview production build
```

## Architecture

### Page Structure
- `App.tsx` renders a single-page layout: NavBar → Hero → BentoGrid(portfolio) → BentoGrid(series) → Archive → About → Footer
- `PhotoDetailModal` is mounted at root level to ensure proper z-index layering above NavBar

### State Management
- `context.tsx` (`AppProvider`) manages: language (`en`|`zh`), theme (`light`|`dark`), and i18n translations via `useApp()` hook

### Key Components
- `BentoGrid` — masonry-style photo grid with hover interactions, supports both portfolio and series sections
- `Archive` — toggles between Timeline and Atlas (location-based) views of all photos
- `PhotoDetailModal` — lightbox with photo details
- `Hero` — full-viewport landing image with scroll indicator

### Data
- `constants.ts` exports `PORTFOLIO_ITEMS` (9 sample photos from picsum.photos) and `TRANSLATIONS` (en/zh)
- `types.ts` defines `Photo`, `PhotoCategory` enum, and `Translations` shape

## CDN Dependencies & Imports

All runtime deps come from CDN via `<script type="importmap">` in `index.html`:

```html
"react": "https://aistudiocdn.com/react@^19.2.0",
"lucide-react": "https://aistudiocdn.com/lucide-react@^0.554.0"
```

Tailwind CSS is loaded via `<script src="https://cdn.tailwindcss.com">` with an inline `tailwind.config` script block in `index.html` that defines:

- Custom colors: `apple-bg`, `apple-card`, `apple-dark`, `apple-gray`, `apple-blue`
- Custom fonts: Inter (sans), Noto Serif SC (serif)
- Custom animations: `fade-in`, `slide-up`, `reveal-up`, `scale-in`, `blur-in`, `subtle-zoom` and more
- Smooth custom scrollbar, grain texture overlay, staggered animation delays

### When adding new components:
- Use Tailwind CDN classes directly — **no need to install Tailwind npm package**
- Use `lucide-react` icons via the CDN import map (already configured)
- Do NOT `npm install` runtime React libraries — add CDN import map entries instead

## Component Architecture

### App.tsx has two layers:
- **`App`** — wraps everything in `<AppProvider>`
- **`Content`** — inner component that consumes `useApp()` context; owns photo selection state, scroll progress, and keyboard navigation

### Photo selection flow:
1. User clicks photo in `BentoGrid` or `Archive` → `handlePhotoClick(photo)` sets `selectedPhoto`
2. `PhotoDetailModal` receives `photo`, navigation callbacks, and prev/next indicators
3. Adjacent photos are prefetched via `new Image()` when selection changes
4. Keyboard left/right arrows navigate between photos

### Scroll tracking:
- `Content` uses a rAF-throttled scroll listener to compute `scrollProgress` (0–100)
- Rendered as a fixed top gradient progress bar (`z-[9999]`)

### CSS architecture:
- `styles/scroll-animations.css` — Intersection Observer–based reveal animations (`.reveal`, `.reveal-child`)
- `styles/noise-texture.css` — grain overlay (`.noise-texture` wrapper)
- `components/animations/` — React animation wrapper components used by Hero and BentoGrid

## i18n Pattern

```tsx
const { t, language, setLanguage } = useApp();
// t.nav.portfolio, t.hero.title, t.grid.header, etc.
```

All translatable strings are in `TRANSLATIONS` object in `constants.ts`. When adding UI text, add keys to both `en` and `zh` sections of `TRANSLATIONS` and the `Translations` type in `types.ts`.

## Theme

Dark/light mode toggled via `toggleTheme()` from context. The `<html class="dark">` attribute is toggled, and Tailwind's `darkMode: 'class'` handles the rest. Default is dark mode.

## Vite Config

- Dev server: port `3000`, host `0.0.0.0`
- Path alias: `@` → project root (`E:\Trae\project`)
- Plugin: `@vitejs/plugin-react`

## Key Patterns to Follow

- **Single-page scroll**: no router — sections are `<section id="...">` with smooth scrolling via CSS `scroll-behavior: smooth`
- **z-index layers**: NavBar `z-999`, grain overlay `z-[9998]`, progress bar `z-[9999]`, PhotoDetailModal `z-[5000]`
- **Animation delays**: use `.delay-100` through `.delay-700` utility classes for staggered entrance effects
- **Photo data**: sample photos are from picsum.photos; `Photo` type includes EXIF fields (iso, aperture, focalLength, cameraModel, lens, etc.)
