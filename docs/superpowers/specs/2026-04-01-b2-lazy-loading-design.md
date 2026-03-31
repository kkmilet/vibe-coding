# B2: Lazy Loading Enhancement Design

## Overview

Optimize the existing blur placeholder → high-res image transition in BentoGrid and Archive to be smoother and more refined.

## Current State

- Thumbnail: 150x150 blur(5) placeholder
- Pre-load trigger: `rootMargin: '600px'` (IntersectionObserver)
- Transition: `opacity 0→1, blur-sm→blur-0` over `1s`

## Optimization: Smoother Blur Transition

The current transition works but the blur-to-sharp transition can feel abrupt. Two changes:

### 1. Blur Transition Enhancement

In `GridImage.tsx` (BentoGrid), the image transition uses `duration-[1s]`. Increase perceived smoothness by adding a subtle blur-out on the thumbnail:

```typescript
// Current className for thumbnail:
className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${isLoaded ? 'opacity-0' : 'opacity-100 blur-md'}`

// When isLoaded becomes true:
// Thumbnail fades out + blur increases during exit
// The actual transition is already 700ms which is good
```

The key optimization: ensure the placeholder doesn't disappear until the full image is fully loaded. The current `onLoad={() => setIsLoaded(true)}` handles this correctly.

### 2. Staggered Image Reveal

Add a brief fade-in delay (100ms) after the high-res image loads, before making it visible. This prevents the "snap" effect when blur clears:

```typescript
// In GridImage:
const [showHighRes, setShowHighRes] = useState(false);

useEffect(() => {
  if (isLoaded) {
    const timer = setTimeout(() => setShowHighRes(true), 100);
    return () => clearTimeout(timer);
  } else {
    setShowHighRes(false);
  }
}, [isLoaded]);

// In render:
<img className={`... ${showHighRes ? 'opacity-100' : 'opacity-0'}`} ... />
```

### ArchiveImage: Same Treatment

Apply identical `showHighRes` pattern to `ArchiveImage` component.

## Acceptance Criteria

- [ ] High-res image fade-in has 100ms delayed start after load
- [ ] Transition duration ~700ms feels smooth
- [ ] No "snap" from blur to sharp
- [ ] Archive images use same pattern
- [ ] Dev server runs without errors
- [ ] Production build succeeds
