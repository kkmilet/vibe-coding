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

