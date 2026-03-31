# Scroll & Entry Animation Design

## Overview

Add refined scroll-triggered fade+translateY entry animations to all page sections, maintaining the site's "elegant restraint" aesthetic. Elements drift gently into view as the user scrolls, creating a curated, gallery-like experience.

## Design Language

**Style**: Elegant restraint — fade + translateY, no bounce, no scale.
**Duration**: 400–500ms per element.
**Easing**: `cubic-bezier(0.25, 0.46, 0.45, 0.94)` (ease-out, natural deceleration).
**Stagger**: 50–80ms between sibling elements (recommended 60ms).
**Threshold**: Elements begin animating when 10% visible in viewport.

## Animation Spec

### Behavior

- **Trigger**: `IntersectionObserver` on each animated element, threshold `0.1`.
- **Enter**: When element enters viewport from below → add `.is-visible` class → CSS transition fires: `opacity 0→1`, `transform translateY(24px)→translateY(0)`.
- **Exit**: When element scrolls out of viewport (向上滚动), `.is-visible` is removed → reverse animation (fade out + drift down).
- **Stagger**: Applied via CSS `--stagger-delay` custom property set inline on each child element.

### Sections & Animation Scope

| Section | Elements to Animate | Notes |
|---------|-------------------|-------|
| Hero | Hero text block, CTA button | Subtle entrance on load, not scroll-triggered |
| BentoGrid (portfolio) | Individual photo cards | Stagger 60ms per card |
| BentoGrid (series) | Individual photo cards | Stagger 60ms per card |
| Archive | Section title, toggle tabs, photo grid | Grid items stagger 40ms |
| About | Philosophy heading, paragraphs | Staggered text block |
| Footer | Copyright, links | Simple fade |

**Excluded**: `NavBar`, `PhotoDetailModal` — these have independent interaction patterns.

### CSS Custom Properties

```css
:root {
  --anim-duration: 450ms;
  --anim-ease: cubic-bezier(0.25, 0.46, 0.45, 0.94);
  --anim-translate: 24px;
  --stagger-interval: 60ms;
}
```

### Animation Classes

```css
.anim-fade-up {
  opacity: 0;
  transform: translateY(var(--anim-translate));
  transition:
    opacity var(--anim-duration) var(--anim-ease),
    transform var(--anim-duration) var(--anim-ease);
}

.anim-fade-up.is-visible {
  opacity: 1;
  transform: translateY(0);
}
```

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  .anim-fade-up {
    opacity: 1;
    transform: none;
    transition: none;
  }
}
```

## Implementation

### 1. Create Animation Utility Module

File: `components/animations/useScrollReveal.ts` (custom hook)

- Accepts `threshold`, `staggerIndex`, `rootMargin` as options
- Returns `ref` to attach to container element
- Internally uses a single `IntersectionObserver` instance per section
- Sets `data-stagger-index` on children, CSS uses `calc(var(--stagger-interval) * var(--stagger-index))`

### 2. Create CSS Module

File: `styles/scroll-animations.css`

- Contains `.anim-fade-up` class and all `.is-visible` transitions
- Exported once, imported in `App.tsx` or `index.html`

### 3. Apply to Components

- `App.tsx`: Wrap each section's children in a reveal container with the hook
- `BentoGrid.tsx`: Apply stagger indices to photo cards
- `Archive.tsx`: Apply to section title, tabs, photo items
- `About.tsx`: Apply staggered text reveal to paragraphs
- `Footer.tsx`: Simple fade on container

### 4. Hero Special Case

Hero entrance animation fires on `DOMContentLoaded` (not scroll-triggered), with elements staggered 100ms apart, to establish the site's tone before any scrolling begins.

## Acceptance Criteria

- [ ] All section elements animate on scroll into view
- [ ] Stagger creates a ripple effect within each section
- [ ] Elements fade out when scrolling back up past them
- [ ] `prefers-reduced-motion` users see no animation (instant visibility)
- [ ] No layout shift during animation
- [ ] Dev server runs without errors
- [ ] Production build succeeds
