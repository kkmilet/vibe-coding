# Hero Animation Enhancement Design

## Overview

Enhance the Hero section of the Lumina photography portfolio with Apple-esque animations that maintain the "Invisible" aesthetic theme while adding refined interactivity.

## Design Principle

**B Direction (Refined Responsiveness)**: Calm, immersive atmosphere combined with richly detailed micro-interactions. Every user action is elegantly processed.

---

## 1. Text Reveal Animation

### Current State
- Typewriter effect with blue blinking cursor
- Characters appear one by one

### Optimized State
- Replace typewriter with `blur-in` animation
- Text emerges from blur like light through mist

### Implementation
```
Animation: blur-in
Duration: 1200ms
Timing: ease-out
```

### Timing
| Element | Delay |
|---------|-------|
| Main title ("Capture") | 300ms |
| Subtitle ("Invisible.") | 800ms |
| Description | 1300ms |

### Why
Removes the "unfinished input" cursor, maintains "Invisible" theme through ethereal reveal.

---

## 2. Mouse Parallax (3-Layer Depth)

### Current State
- Only scroll-based parallax on background image (0.4x speed)

### Optimized State
- Add mouse-move parallax to content layers
- Creates sense of depth when user moves cursor

### Implementation
```
Layer 1 (Background): Already has scroll parallax
Layer 2 (Content text): 0.2x mouse movement
Layer 3 (Button): 0.5x mouse movement
```

### Behavior
- Uses `mousemove` event on Hero section
- Calculate mouse offset from center
- Apply subtle `translateX/Y` transforms
- Smooth with CSS transitions (200ms)

---

## 3. Button Shine Sweep

### Current State
- Hover: white glow + ping animation

### Optimized State
- Add shine sweep effect on hover
- Light "flash" passes across button surface

### Implementation
```
Keyframe: shineSweep (already defined)
Duration: 0.6s
Timing: ease-out
Trigger: On hover, run once
```

### Why
Matches "Invisible" mysterious theme; creates moment of illumination.

---

## 4. Scroll Indicator Enhancement

### Current State
- SCROLL text (opacity 60%) + animated vertical line
- Static positioning

### Optimized State
- Add breathing animation to SCROLL text (opacity 0.6 ↔ 1.0)
- Animation: 3s infinite ease-in-out

### Timing
| Element | Delay |
|---------|-------|
| Button | 1800ms |
| Scroll indicator | 2400ms |

---

## 5. Overall Animation Timing Refactor

### Before
| Element | Delay |
|---------|-------|
| Main title | 500ms |
| Subtitle | 1200ms |
| Description | 2200ms |
| Button | 3000ms |
| Scroll | 3500ms |

### After
| Element | Delay |
|---------|-------|
| Main title | 300ms |
| Subtitle | 800ms |
| Description | 1300ms |
| Button | 1800ms |
| Scroll | 2400ms |

**Rationale**: Tighter, more Apple-like节奏. Fluid but not sluggish.

---

## Components to Modify

1. **Hero.tsx**
   - Remove TypewriterEffect for blur-in
   - Add mouse parallax to content layer
   - Add shine sweep to button
   - Optimize timing sequence

2. **index.html**
   - No changes needed (animations already defined)

---

## Animation Keyframes Available (Already Defined)

| Name | Behavior |
|------|----------|
| `blur-in` | blur(20px), opacity:0 → blur(0), opacity:1 |
| `shineSweep` | translateX(-100%) → translateX(200%) with 25deg rotation |

---

## Acceptance Criteria

1. Text reveals with blur-in effect, no typewriter cursor
2. Moving mouse creates subtle depth parallax in content
3. Button hover triggers shine sweep effect
4. SCROLL indicator has breathing opacity animation
5. All animations feel "Apple-esque": smooth, refined, not flashy
6. Maintains "Invisible" theme - ethereal, mysterious, premium
7. No layout shifts or overlapping elements
8. Performance: 60fps maintained

---

## File Changes

- `components/Hero.tsx` - Main implementation
- `docs/superpowers/specs/2026-03-29-hero-animation-design.md` - This document
