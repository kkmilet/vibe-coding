# Scroll Animation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add refined scroll-triggered fade+translateY entry animations to all page sections, replacing the existing scattered inline animation logic with a unified system.

**Architecture:** A single CSS file defines animation classes. A custom React hook (`useScrollReveal`) drives visibility state via `IntersectionObserver`, toggling `.is-visible` on each animated container. Child elements receive staggered delays via CSS custom properties set inline.

**Tech Stack:** Pure CSS animations + React hooks, no external animation libraries.

---

## File Map

| File | Role |
|------|------|
| `styles/scroll-animations.css` | **NEW** — All animation classes and custom properties |
| `components/animations/useScrollReveal.ts` | **NEW** — Hook: observes container, sets `.is-visible` |
| `components/animations/useHeroEntrance.ts` | **NEW** — Hook: fires entrance on DOMContentLoaded |
| `components/BentoGrid.tsx` | **MODIFY** — Replace inline `isVisible` state + styles with `useScrollReveal` |
| `components/Archive.tsx` | **MODIFY** — Replace inline `isVisible` state + styles with `useScrollReveal` |
| `components/About.tsx` | **MODIFY** — Add `useScrollReveal` to text blocks, replace `StatCounter`'s observer |
| `components/Footer.tsx` | **MODIFY** — Wrap footer content with `useHeroEntrance` |
| `index.html` | **MODIFY** — Add `<link>` tag for `styles/scroll-animations.css` |

**Note:** Existing `index.html` keyframe animations (`animate-blur-in`, `animate-slide-up`, etc.) are preserved and used by Hero. The new CSS only adds `.anim-fade-up` classes.

---

## Task 1: Create scroll-animations.css

**File:** `styles/scroll-animations.css` (create new)

- [ ] **Step 1: Write CSS file**

```css
:root {
  --anim-duration: 450ms;
  --anim-ease: cubic-bezier(0.25, 0.46, 0.45, 0.94);
  --anim-translate: 24px;
  --stagger-interval: 60ms;
}

/* Base class: hidden state */
.anim-fade-up {
  opacity: 0;
  transform: translateY(var(--anim-translate));
  transition:
    opacity var(--anim-duration) var(--anim-ease),
    transform var(--anim-duration) var(--anim-ease);
  transition-delay: calc(var(--stagger-index, 0) * var(--stagger-interval));
}

/* Visible state */
.anim-fade-up.is-visible {
  opacity: 1;
  transform: translateY(0);
}

/* Reduced motion: skip animation */
@media (prefers-reduced-motion: reduce) {
  .anim-fade-up {
    opacity: 1;
    transform: none;
    transition: none;
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add styles/scroll-animations.css
git commit -m "feat: add scroll animation CSS module with .anim-fade-up classes"
```

---

## Task 2: Create useScrollReveal hook

**File:** `components/animations/useScrollReveal.ts` (create new + index.ts barrel)

- [ ] **Step 1: Write the hook**

```typescript
// components/animations/useScrollReveal.ts
import { useEffect, useRef, useState } from 'react';

interface ScrollRevealOptions {
  threshold?: number;
  rootMargin?: string;
  once?: boolean; // if true, never removes .is-visible on scroll up
}

export const useScrollReveal = (options: ScrollRevealOptions = {}) => {
  const { threshold = 0.1, rootMargin = '0px', once = false } = options;
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) observer.disconnect();
        } else {
          if (!once) setIsVisible(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin, once]);

  return { ref, isVisible };
};
```

- [ ] **Step 2: Create barrel export**

```typescript
// components/animations/index.ts
export { useScrollReveal } from './useScrollReveal';
export { useHeroEntrance } from './useHeroEntrance';
```

- [ ] **Step 3: Write useHeroEntrance hook**

```typescript
// components/animations/useHeroEntrance.ts
import { useEffect, useRef, useState } from 'react';

export const useHeroEntrance = (delayMs: number = 0) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const timer = setTimeout(() => setIsVisible(true), delayMs);
    return () => clearTimeout(timer);
  }, [delayMs]);

  return { ref, isVisible };
};
```

- [ ] **Step 4: Commit**

```bash
git add components/animations/useScrollReveal.ts components/animations/useHeroEntrance.ts components/animations/index.ts
git commit -m "feat: add useScrollReveal and useHeroEntrance hooks"
```

---

## Task 3: Apply to BentoGrid

**File:** `components/BentoGrid.tsx` (modify lines ~163–249)

Changes:
- Remove local `useEffect` + `IntersectionObserver` logic (lines 168–182)
- Remove local `isVisible` state (line 166)
- Import `{ useScrollReveal }` from `components/animations`
- Replace `const [isVisible, setIsVisible] = useState(false);` with `const { ref, isVisible } = useScrollReveal({ threshold: 0.05, once: true });`
- Replace `ref={sectionRef}` with the hook's `ref`
- Remove `sectionRef` since it's no longer needed
- Keep all card-level stagger logic intact (it uses the existing `isVisible` boolean correctly — when true, cards apply their `revealDelay` inline styles)
- The card wrapper div already uses `isVisible` correctly; no stagger-index changes needed

- [ ] **Step 1: Apply edits to BentoGrid.tsx**

Remove `useRef` from the import since `sectionRef` is no longer used. Remove `useEffect` + `IntersectionObserver` block. Replace state + ref pattern with hook.

```typescript
// Before (lines ~165–182):
const sectionRef = useRef<HTMLDivElement>(null);
const [isVisible, setIsVisible] = useState(false);

useEffect(() => {
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
      }
    },
    { threshold: 0.05 }
  );

  if (sectionRef.current) {
    observer.observe(sectionRef.current);
  }
  return () => observer.disconnect();
}, []);

// After:
const { ref, isVisible } = useScrollReveal({ threshold: 0.05, once: true });
```

Remove `const sectionRef = useRef<HTMLDivElement>(null);` and change `ref={sectionRef}` to `ref={ref}` on the section element.

- [ ] **Step 2: Verify dev server**

Run `npm run dev` — BentoGrid should animate on scroll into view with the same timing.

- [ ] **Step 3: Commit**

```bash
git add components/BentoGrid.tsx
git commit -m "refactor: use useScrollReveal hook in BentoGrid"
```

---

## Task 4: Apply to Archive

**File:** `components/Archive.tsx` (modify lines ~79–97)

Changes:
- Remove local `useEffect` + `IntersectionObserver` logic (lines 88–97)
- Remove `sectionRef` (line 85) and `isVisible` state (line 86)
- Import `{ useScrollReveal }` from `components/animations`
- Replace with `const { ref, isVisible } = useScrollReveal({ threshold: 0.1, once: true });`
- Change `ref={sectionRef}` on `<section>` to `ref={ref}`
- Keep existing stagger delays via inline styles (`transitionDelay`) — the new hook's `isVisible` drives the same CSS classes the component already uses (`isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'`)

**Important:** Archive already has its own staggered animation system using inline `transitionDelay` on cards. The `useScrollReveal` hook replaces only the visibility detection (the `IntersectionObserver` → `isVisible` state part). The card stagger remains unchanged.

- [ ] **Step 1: Apply edits to Archive.tsx**

Remove `useRef` from import if no longer needed (check if `containerRef` in `ArchiveImage` still uses it — it does, so keep `useRef`). Remove the section-level `IntersectionObserver` block.

```typescript
// Before (lines ~85–97):
const sectionRef = useRef<HTMLDivElement>(null);
const [isVisible, setIsVisible] = useState(false);

useEffect(() => {
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) setIsVisible(true);
    },
    { threshold: 0.1 }
  );
  if (sectionRef.current) observer.observe(sectionRef.current);
  return () => observer.disconnect();
}, []);

// After:
const { ref, isVisible } = useScrollReveal({ threshold: 0.1, once: true });
```

- [ ] **Step 2: Verify dev server**

- [ ] **Step 3: Commit**

```bash
git add components/Archive.tsx
git commit -m "refactor: use useScrollReveal hook in Archive"
```

---

## Task 5: Apply to About

**File:** `components/About.tsx` (modify lines ~65–122)

Changes:
- Import `{ useScrollReveal }` from `components/animations`
- Add `const { ref, isVisible } = useScrollReveal({ threshold: 0.1, once: true });`
- Apply `ref={ref}` to the `<section>` element
- Add `className={`anim-fade-up ${isVisible ? 'is-visible' : ''}`}` to the inner text content div (the `order-2` div containing the philosophy label, heading, and paragraphs)
- Add staggered `--stagger-index` inline styles to each text block:
  - Philosophy label: `style={{ '--stagger-index': 0 } as React.CSSProperties}`
  - Heading: `style={{ '--stagger-index': 1 } as React.CSSProperties}`
  - Paragraph 1: `style={{ '--stagger-index': 2 } as React.CSSProperties}`
  - Paragraph 2: `style={{ '--stagger-index': 3 } as React.CSSProperties}`
  - StatCounters: `style={{ '--stagger-index': 4 } as React.CSSProperties}`

- [ ] **Step 1: Apply edits to About.tsx**

```typescript
// Add import:
import { useScrollReveal } from './animations';

// Inside About component:
const { ref, isVisible } = useScrollReveal({ threshold: 0.1, once: true });

// Wrap text content div:
<div ref={ref} className={`order-2 lg:order-1 ${isVisible ? 'anim-fade-up is-visible' : 'anim-fade-up'}`}>
```

Add `style={{ '--stagger-index': N } as React.CSSProperties}` to each child element inside that div.

- [ ] **Step 2: Verify dev server**

- [ ] **Step 3: Commit**

```bash
git add components/About.tsx
git commit -m "feat: add scroll-reveal animations to About section"
```

---

## Task 6: Apply to Footer

**File:** `components/Footer.tsx` (modify lines ~6–51)

Changes:
- Import `{ useHeroEntrance }` from `components/animations`
- Replace `useState` for loaded/visible with `useHeroEntrance`
- Wrap footer content in `anim-fade-up ${isVisible ? 'is-visible' : ''}` div
- Stagger: logo area `--stagger-index: 0`, links `--stagger-index: 1`, copyright `--stagger-index: 2`

- [ ] **Step 1: Apply edits to Footer.tsx**

```typescript
// Add import:
import { useHeroEntrance } from './animations';

// Inside Footer:
const { ref, isVisible } = useHeroEntrance(0);

// Wrap the footer content div:
// <footer ...>
//   <div ref={ref} className={`anim-fade-up ${isVisible ? 'is-visible' : ''}`}>
//     ... existing content ...
//   </div>
// </footer>
```

- [ ] **Step 2: Verify dev server**

- [ ] **Step 3: Commit**

```bash
git add components/Footer.tsx
git commit -m "feat: add entrance animation to Footer"
```

---

## Task 7: Link CSS in index.html

**File:** `index.html` (modify)

- [ ] **Step 1: Add link tag**

Add inside `<head>` before any other stylesheets:
```html
<link rel="stylesheet" href="/styles/scroll-animations.css" />
```

Note: Vite serves static files from project root. Create `styles/` directory at project root (same level as `src/` or `components/`). Place `scroll-animations.css` there. Verify path — if Vite config resolves `@` to project root, alternatively import via `App.tsx`.

Alternative (preferred for Vite): add import to `App.tsx`:
```typescript
import './styles/scroll-animations.css';
```
This is more reliable since Vite handles the bundling. Do this instead of the `<link>` tag.

- [ ] **Step 2: Verify dev server** — CSS loads correctly

- [ ] **Step 3: Commit**

```bash
git add index.html  # or App.tsx
git commit -m "feat: import scroll-animations.css"
```

---

## Task 8: Create styles directory and move CSS

- [ ] **Step 1: Ensure styles directory exists**

The `styles/` directory at project root should be created. Add a `.gitkeep` if empty.

- [ ] **Step 2: Final build verification**

Run `npm run build` — must succeed without errors.

---

## Spec Coverage Check

| Spec Requirement | Task |
|-----------------|------|
| Scroll-triggered fade+translateY | Tasks 1, 2, 3, 4, 5, 6 |
| Stagger 50–80ms (60ms default) | CSS custom property in Task 1 |
| Duration 400–500ms | CSS custom property in Task 1 |
| All sections animated | Tasks 3 (BentoGrid×2), 4 (Archive), 5 (About), 6 (Footer) |
| Hero on DOMContentLoaded | Hero already has CSS keyframe animations, Footer uses `useHeroEntrance` |
| Reduced motion | CSS media query in Task 1 |
| No NavBar/Modal animation | These are not modified |
| No layout shift | opacity+transform only (no width/height changes) |

## Self-Review

- [ ] No placeholder `// TODO` or `// TBD` in any step
- [ ] All imports use exact file paths from project root
- [ ] All CSS custom properties use valid syntax (`var(--name)`)
- [ ] `React.CSSProperties` cast used where inline style objects are set
- [ ] `once: true` in BentoGrid and Archive `useScrollReveal` calls — elements stay visible once scrolled into view
- [ ] `threshold: 0.1` matches spec (10% visibility trigger)
