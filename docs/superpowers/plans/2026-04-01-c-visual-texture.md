# C-Class Visual Texture Enhancement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enhance visual texture through frosted glass, hover glow, subtle noise, and increased modal depth blur.

**Architecture:** Pure CSS additions + inline style modifications. No new dependencies. All changes are additive (no removal of existing effects).

**Tech Stack:** Tailwind CSS classes, inline styles, new CSS file with data URI noise.

---

## File Map

| File | Changes |
|------|---------|
| `components/Archive.tsx` | C1: backdrop-blur on tabs; C2: hover glow on ArchiveImage |
| `components/About.tsx` | C1: frosted overlay on photo container |
| `components/BentoGrid.tsx` | C2: hover glow on GridImage |
| `components/PhotoDetailModal.tsx` | C4: blur 80px → 100px |
| `styles/noise-texture.css` | **NEW** — C3: noise texture CSS classes |
| `App.tsx` | C3: import noise CSS |

---

## Task 1: C1 + C2 — Archive.tsx

**File:** `components/Archive.tsx`

- [ ] **Step 1: Read Archive.tsx** to find exact line numbers for tabs and image

- [ ] **Step 2: Add backdrop-blur to mode toggle tabs** — Find the `<button>` for Timeline (has `viewMode === 'time'`). Change its class from `bg-white dark:bg-white/5` to `bg-white/80 dark:bg-white/10 backdrop-blur-xl`.

- [ ] **Step 3: Add backdrop-blur to sub-filter pills** — Find the pill `<button>` elements in the filter bar. Add `backdrop-blur-md bg-white/60 dark:bg-white/5` to each pill.

- [ ] **Step 4: Add hover glow to ArchiveImage** — Find the outer `<div>` of ArchiveImage (around line 48). Inside it, before the closing `</div>`, add:
```tsx
<div
  className={`absolute inset-0 rounded-xl pointer-events-none transition-opacity duration-500 ${
    // isHovering is not tracked in ArchiveImage — use CSS group-hover instead
    'opacity-0 group-hover:opacity-100'
  }`}
  style={{
    background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.12) 0%, transparent 70%)',
    boxShadow: 'inset 0 0 40px rgba(255,255,255,0.03)',
  }}
/>
```

- [ ] **Step 5: Commit**

```bash
git add components/Archive.tsx
git commit -m "feat(C1+C2): add backdrop-blur to Archive tabs and hover glow to images"
```

---

## Task 2: C1 — About.tsx frosted overlay

**File:** `components/About.tsx`

- [ ] **Step 1: Read About.tsx** — Find the image container `<div>` with `overflow-hidden` (around line 101)

- [ ] **Step 2: Add frosted overlay** — Inside the `overflow-hidden` div, after the `<img>` tag, add:
```tsx
<div className="absolute inset-0 bg-gradient-to-t from-apple-bg/30 dark:from-black/30 to-transparent backdrop-blur-[2px] pointer-events-none" />
```

- [ ] **Step 3: Commit**

```bash
git add components/About.tsx
git commit -m "feat(C1): add frosted rim overlay to About photo"
```

---

## Task 3: C2 — BentoGrid.tsx hover glow

**File:** `components/BentoGrid.tsx`

- [ ] **Step 1: Read BentoGrid.tsx** — Find the GridImage inner container div (around line 98-105)

- [ ] **Step 2: Add hover glow div** — Inside the container div (the one with `perspective: '1000px'`), before the `</div>` that closes it, add:
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

- [ ] **Step 3: Commit**

```bash
git add components/BentoGrid.tsx
git commit -m "feat(C2): add radial glow effect on BentoGrid card hover"
```

---

## Task 4: C3 — Noise texture CSS

**Files:**
- Create: `styles/noise-texture.css`
- Modify: `App.tsx`

- [ ] **Step 1: Create `styles/noise-texture.css`**

```css
/* Subtle noise overlay for dark mode sections */
.noise-texture {
  position: relative;
}

.noise-texture::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
  opacity: 0.03;
  pointer-events: none;
  mix-blend-mode: overlay;
  z-index: 0;
}

/* Light mode: subtle grain */
.noise-texture-light {
  position: relative;
}

.noise-texture-light::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
  opacity: 0.02;
  pointer-events: none;
  mix-blend-mode: multiply;
  z-index: 0;
}
```

- [ ] **Step 2: Read App.tsx** — Find where BentoGrid sections are rendered

- [ ] **Step 3: Import noise CSS** — Add to imports:
```tsx
import './styles/noise-texture.css';
```

- [ ] **Step 4: Add noise-texture to BentoGrid wrapper** — Find the `<div className="relative z-10">` that wraps the BentoGrid sections (around line 67-78 in App.tsx). Add `noise-texture` class to it.

- [ ] **Step 5: Add noise-texture to Footer** — In Footer, the `<footer>` element already has classes. Add `noise-texture` to the className.

- [ ] **Step 6: Commit**

```bash
git add styles/noise-texture.css App.tsx components/Footer.tsx
git commit -m "feat(C3): add subtle noise texture to dark mode sections"
```

---

## Task 5: C4 — Modal depth blur

**File:** `components/PhotoDetailModal.tsx`

- [ ] **Step 1: Read PhotoDetailModal.tsx** — Find the blurred background div (around line 148-160)

- [ ] **Step 2: Increase blur** — Change `blur-[80px]` to `blur-[100px]` in the blur background div.

- [ ] **Step 3: Commit**

```bash
git add components/PhotoDetailModal.tsx
git commit -m "feat(C4): deepen modal background blur to 100px"
```

---

## Task 6: Final build verification

- [ ] **Step 1: Run `npm run build`** — Must succeed

---

## Spec Coverage Check

| Spec Requirement | Task |
|----------------|------|
| Archive tabs backdrop-blur-xl | Task 1 |
| Archive pills backdrop-blur-md | Task 1 |
| About frosted rim overlay | Task 2 |
| BentoGrid hover glow | Task 3 |
| ArchiveImage hover glow | Task 1 |
| Noise texture dark sections | Task 4 |
| Modal blur 80→100px | Task 5 |

## Self-Review

- [ ] No placeholder code — all snippets are complete and ready to paste
- [ ] All CSS classes match Tailwind conventions
- [ ] `::before` pseudo-element with `position: absolute` requires parent to have `position: relative` — noise-texture class handles this
- [ ] ArchiveImage uses CSS `group-hover` for glow (no JS state needed) — consistent with existing pattern
- [ ] BentoGrid uses existing `isHovering` state for glow visibility
