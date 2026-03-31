# C-Class: Visual Texture Enhancement Design

## Overview

Enhance the site's visual texture through frosted glass, gradient glow, subtle noise, and depth-of-field effects. Maintain the "elegant restraint" aesthetic — effects should be felt subliminally, not noticed explicitly.

## C1: Frosted Glass Enhancement

### Archive Filter Tabs

In `Archive.tsx`, the mode toggle tabs (Timeline/Atlas) and sub-filter pills already have `bg-white dark:bg-white/5` and `backdrop-blur`. Upgrade:

**Mode toggle (lines ~145-168):**
```tsx
// Current:
className={`... bg-white dark:bg-white/5 ...`}

// Change to:
className={`... bg-white/80 dark:bg-white/10 backdrop-blur-xl ...`}
```

**Sub-filter pills (lines ~172-199):**
```tsx
// Current has no backdrop-blur
// Add to each pill:
className={`... bg-white/60 dark:bg-white/5 backdrop-blur-md ...`}
```

### About Photo Area

In `About.tsx`, the image container (around line 100-116) can add a frosted glass overlay to blend the image with the background:

**Add frosted overlay div** inside the image container (before the closing `</div>` of `overflow-hidden`):
```tsx
<div className="absolute inset-0 bg-gradient-to-t from-apple-bg/30 dark:from-black/30 to-transparent backdrop-blur-[2px] pointer-events-none" />
```

This creates a subtle glass-like rim where the image meets the gradient fade.

---

## C2: Hover Glow Enhancement

### BentoGrid Card Glow

In `GridImage` (`BentoGrid.tsx`), when the card is hovered, add a soft radial glow emanating from behind the image. This complements the 3D tilt effect.

**Add to the image container div** (around line 98-105):
```tsx
{/* Subtle glow behind image on hover */}
<div
  className={`absolute inset-0 rounded-sm md:rounded-xl pointer-events-none transition-opacity duration-500 ${
    isHovering ? 'opacity-100' : 'opacity-0'
  }`}
  style={{
    background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.15) 0%, transparent 70%)',
    boxShadow: 'inset 0 0 60px rgba(255,255,255,0.05)',
  }}
/>
```

### ArchiveImage Glow

Apply the same glow effect to `ArchiveImage` in `Archive.tsx`:
```tsx
<div
  className={`absolute inset-0 rounded-xl pointer-events-none transition-opacity duration-500 ${
    isHovering ? 'opacity-100' : 'opacity-0'
  }`}
  style={{
    background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.12) 0%, transparent 70%)',
    boxShadow: 'inset 0 0 40px rgba(255,255,255,0.03)',
  }}
/>
```

---

## C3: Noise Texture

### Dark Mode Section Backgrounds

Add a subtle noise texture to dark backgrounds to prevent flatness. Implemented via CSS `filter` and a noise SVG data URI.

**Add to `styles/noise-texture.css`** (create new file):
```css
/* Subtle noise overlay for dark mode sections */
.noise-texture::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
  opacity: 0.03;
  pointer-events: none;
  mix-blend-mode: overlay;
}

/* Light mode: subtle grain */
.noise-texture-light::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
  opacity: 0.02;
  pointer-events: none;
  mix-blend-mode: multiply;
}
```

**Apply to sections:**
- In `App.tsx`, the BentoGrid sections wrapping divs: `className="relative z-10 noise-texture"`
- Footer: `className="noise-texture"`

**Import in App.tsx:**
```typescript
import './styles/noise-texture.css';
```

---

## C4: Modal Depth Enhancement

### Background Blur on Modal Open

When PhotoDetailModal opens, the entire page behind it should have increased blur to create depth separation. Currently the modal has `z-[5000]` and background blur, but the rest of the page can be pushed further into "depth".

**In `PhotoDetailModal.tsx`**, when `isVisible` is true, add a class to the body or a backdrop overlay that increases global blur:

Already implemented: The modal's background blur (80px) and dark overlay provide this. The enhancement is to **increase the modal background blur slightly** and **add a subtle scale-down** to the background page content:

**In modal root div** (line ~142), when visible, add `scale-[0.99]` to the background blur div to create subtle depth:
```tsx
<div
  className={`absolute inset-0 z-0 pointer-events-none select-none overflow-hidden transition-all duration-1000 ease-out blur-[80px] opacity-40 dark:opacity-30 transform ${isVisible ? 'scale-110' : 'scale-150'}`}
  ...
/>
```

This is already at `scale-110` when visible. Instead, add to the **body content overlay** when modal is open — apply `transform scale` to a page wrapper. But this would require App.tsx changes.

**Simpler enhancement**: Increase the blur from `80px` to `100px` and reduce opacity slightly:
```tsx
blur-[100px]
```

This is a minimal change that deepens the blur without other structural changes.

---

## Acceptance Criteria

- [ ] Archive tabs have `backdrop-blur-xl` and semi-transparent backgrounds
- [ ] Archive pills have `backdrop-blur-md`
- [ ] About photo has subtle frosted rim overlay
- [ ] BentoGrid cards show soft radial glow on hover
- [ ] ArchiveImages show soft radial glow on hover
- [ ] Dark mode sections have subtle noise texture overlay
- [ ] Modal background blur increased to 100px
- [ ] Dev server runs without errors
- [ ] Production build succeeds
