# Hero Animation Enhancement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enhance Hero section with Apple-esque blur-in text reveal, mouse parallax, shine sweep button, and optimized timing.

**Architecture:** Modify Hero.tsx to replace typewriter with blur-in animation, add mouse-tracking parallax layers, implement button shine sweep on hover, and optimize the animation timing sequence.

**Tech Stack:** React 19, TypeScript, Tailwind CSS (CDN), Custom CSS keyframes (already defined)

---

## File Changes

- **Modify:** `components/Hero.tsx` - Main implementation
- **No changes needed:** `index.html` (animations already defined)

---

## Task 1: Replace Typewriter with Blur-In Animation

**Files:**
- Modify: `components/Hero.tsx:8-75` (TypewriterEffect component)
- Modify: `components/Hero.tsx:155-188` (title, subtitle, description rendering)

- [ ] **Step 1: Read current Hero.tsx to confirm TypewriterEffect usage**

Confirm the lines where TypewriterEffect is used for title, subtitle, and description.

- [ ] **Step 2: Replace title rendering**

Change from:
```tsx
<h1 className="text-6xl md:text-8xl lg:text-9xl font-bold tracking-tighter text-white drop-shadow-2xl leading-[0.9] md:leading-[0.9]">
   <TypewriterEffect
     text={t.hero.title}
     startDelay={500}
     speed={100}
     hideCursorOnComplete={true}
   />
</h1>
```

To:
```tsx
<h1 className="text-6xl md:text-8xl lg:text-9xl font-bold tracking-tighter text-white drop-shadow-2xl leading-[0.9] md:leading-[0.9] animate-blur-in opacity-0"
     style={{ animationDelay: '300ms', animationFillMode: 'forwards' }}>
  {t.hero.title}
</h1>
```

- [ ] **Step 3: Replace subtitle rendering**

Change from:
```tsx
<span className="block text-4xl md:text-6xl lg:text-7xl font-light text-white/90">
  <TypewriterEffect
    text={t.hero.subtitle}
    startDelay={1200}
    speed={80}
    cursorClassName="bg-white/50"
    hideCursorOnComplete={true}
  />
</span>
```

To:
```tsx
<span className="block text-4xl md:text-6xl lg:text-7xl font-light text-white/90 animate-blur-in opacity-0"
     style={{ animationDelay: '800ms', animationFillMode: 'forwards' }}>
  {t.hero.subtitle}
</span>
```

- [ ] **Step 4: Replace description rendering**

Change from:
```tsx
<p className="text-xl md:text-2xl text-white/90 font-light leading-relaxed tracking-wide drop-shadow-md">
   <TypewriterEffect
      text={t.hero.desc}
      startDelay={2200}
      speed={30}
      hideCursorOnComplete={true}
      cursorClassName="h-[0.8em] bg-white/50"
   />
</p>
```

To:
```tsx
<p className="text-xl md:text-2xl text-white/90 font-light leading-relaxed tracking-wide drop-shadow-md animate-blur-in opacity-0"
    style={{ animationDelay: '1300ms', animationFillMode: 'forwards' }}>
  {t.hero.desc}
</p>
```

- [ ] **Step 5: Remove TypewriterEffect component (optional cleanup)**

The TypewriterEffect component can remain in the file (might be used elsewhere) but is no longer required for Hero. Leave it for now.

- [ ] **Step 6: Commit**

```bash
cd "/e/edge/vibe coding"
git add components/Hero.tsx
git commit -m "feat(hero): replace typewriter with blur-in text reveal"
```

---

## Task 2: Add Mouse Parallax to Content Layer

**Files:**
- Modify: `components/Hero.tsx:77-116` (add mouse tracking state and effect)
- Modify: `components/Hero.tsx:152-188` (apply parallax transforms)

- [ ] **Step 1: Add mouse tracking state and ref**

Add after line 80 (`const [highResLoaded, setHighResLoaded] = useState(false);`):

```tsx
const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
```

Add ref for content layer after parallaxRef:
```tsx
const contentRef = useRef<HTMLDivElement>(null);
```

- [ ] **Step 2: Add mouse move effect**

Add after the parallax useEffect (after line 116):

```tsx
useEffect(() => {
  const handleMouseMove = (e: MouseEvent) => {
    if (!contentRef.current) return;
    const rect = contentRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const x = (e.clientX - centerX) / rect.width;
    const y = (e.clientY - centerY) / rect.height;
    setMousePos({ x, y });
  };

  window.addEventListener('mousemove', handleMouseMove);
  return () => window.removeEventListener('mousemove', handleMouseMove);
}, []);
```

- [ ] **Step 3: Apply parallax transform to content layer**

Wrap content in a div with ref and transform. Change line 152-153 from:
```tsx
{/* Content Layer */}
<div className="relative z-30 text-center px-6 max-w-5xl mx-auto mt-0 mix-blend-normal flex flex-col items-center">
```

To:
```tsx
{/* Content Layer */}
<div ref={contentRef} className="relative z-30 text-center px-6 max-w-5xl mx-auto mt-0 mix-blend-normal flex flex-col items-center transition-transform duration-200 ease-out"
     style={{ transform: `translate(${mousePos.x * 10}px, ${mousePos.y * 6}px)` }}>
```

- [ ] **Step 4: Verify HMR updates correctly**

Check Vite server output for any errors.

- [ ] **Step 5: Commit**

```bash
cd "/e/edge/vibe coding"
git add components/Hero.tsx
git commit -m "feat(hero): add mouse parallax to content layer"
```

---

## Task 3: Add Shine Sweep to Button Hover

**Files:**
- Modify: `components/Hero.tsx:190-201` (button JSX)

- [ ] **Step 1: Read current button implementation**

Confirm the current button JSX structure.

- [ ] **Step 2: Add shine sweep overlay to button**

Change from:
```tsx
<button
  onClick={() => document.getElementById('portfolio')?.scrollIntoView({ behavior: 'smooth' })}
  className="group relative px-10 py-4 border border-white/60 text-white rounded-full font-medium overflow-hidden transition-all duration-500 ease-fluid hover:scale-105 hover:border-white hover:bg-white/10 backdrop-blur-sm"
>
  {/* Subtle glow effect on hover */}
  <span className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500">
    <span className="absolute inset-0 bg-white/10 animate-ping [animation-duration:2s]" />
  </span>
  <span className="relative z-10 tracking-wide">{t.hero.button}</span>
</button>
```

To:
```tsx
<button
  onClick={() => document.getElementById('portfolio')?.scrollIntoView({ behavior: 'smooth' })}
  className="group relative px-10 py-4 border border-white/60 text-white rounded-full font-medium overflow-hidden transition-all duration-500 ease-fluid hover:scale-105 hover:border-white hover:bg-white/10 backdrop-blur-sm"
>
  {/* Shine sweep effect on hover */}
  <span className="absolute inset-0 translate-x-[-100%] rotate-12 group-hover:animate-shineSweep opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
  {/* Subtle glow effect on hover */}
  <span className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500">
    <span className="absolute inset-0 bg-white/10 animate-ping [animation-duration:2s]" />
  </span>
  <span className="relative z-10 tracking-wide">{t.hero.button}</span>
</button>
```

- [ ] **Step 3: Add shineSweep animation to tailwind config in index.html**

Check if shineSweep is already defined (it is per the exploration report, in index.html lines 74-77). No change needed.

- [ ] **Step 4: Verify HMR and visual effect**

Confirm button hover shows shine sweep effect.

- [ ] **Step 5: Commit**

```bash
cd "/e/edge/vibe coding"
git add components/Hero.tsx
git commit -m "feat(hero): add shine sweep effect to button hover"
```

---

## Task 4: Optimize Animation Timing Sequence

**Files:**
- Modify: `components/Hero.tsx:188-211` (button and scroll indicator)

- [ ] **Step 1: Update button animation delay**

Change button container style from:
```tsx
style={{ animationDelay: '3000ms', opacity: 0, animationFillMode: 'forwards' }}
```

To:
```tsx
style={{ animationDelay: '1800ms', opacity: 0, animationFillMode: 'forwards' }}
```

- [ ] **Step 2: Update scroll indicator animation delay**

Change scroll indicator style from:
```tsx
style={{ animationDelay: '3500ms', opacity: 0, animationFillMode: 'forwards' }}
```

To:
```tsx
style={{ animationDelay: '2400ms', opacity: 0, animationFillMode: 'forwards' }}
```

- [ ] **Step 3: Add breathing animation to SCROLL text**

Change SCROLL text from:
```tsx
<span className="text-[11px] uppercase tracking-[0.3em] font-medium">Scroll</span>
```

To:
```tsx
<span className="text-[11px] uppercase tracking-[0.3em] font-medium animate-pulse">Scroll</span>
```

- [ ] **Step 4: Commit**

```bash
cd "/e/edge/vibe coding"
git add components/Hero.tsx
git commit -m "feat(hero): optimize animation timing and add scroll breathing"
```

---

## Task 5: Final Verification

**Files:**
- Verify: All modified files

- [ ] **Step 1: Run dev server and verify no errors**

Check Vite HMR output for any errors.

- [ ] **Step 2: Test all animations in browser**

- [ ] **Step 3: Verify timing sequence visually**

---

## Spec Coverage Checklist

| Spec Requirement | Task |
|-----------------|------|
| Blur-in text reveal (replaces typewriter) | Task 1 |
| Mouse parallax (3-layer depth) | Task 2 |
| Shine sweep on button hover | Task 3 |
| Breathing SCROLL indicator | Task 4 |
| Optimized timing sequence | Task 4 |
| No layout shifts | Task 1-4 verification |
| 60fps performance | Task 2 (RAF not used, CSS only) |

---

## Plan Complete

Saved to: `docs/superpowers/plans/2026-03-29-hero-animation-plan.md`

**Two execution options:**

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?
