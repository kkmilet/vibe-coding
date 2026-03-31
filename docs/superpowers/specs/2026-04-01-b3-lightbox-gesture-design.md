# B3: Lightbox Gesture Enhancement Design

## Overview

Add touch gesture support (swipe to navigate) and double-tap/double-click zoom to the PhotoDetailModal. Industry-standard interactions for mobile-first photography portfolios.

## Design Language

**Touch swipe threshold**: 50px horizontal movement to trigger navigation
**Double-tap delay**: 300ms window to detect second tap
**Zoom levels**: 1x (fit) → 2x (detail)
**Swipe direction**: Left = next photo, Right = prev photo

## Implementation

### 1. Touch Swipe Navigation

In `PhotoDetailModal.tsx`, add touch event handlers:

```typescript
// State for tracking swipe
const [touchStart, setTouchStart] = useState<number | null>(null);
const [touchEnd, setTouchEnd] = useState<number | null>(null);

// Min swipe distance to trigger navigation
const MIN_SWIPE_DISTANCE = 50;

const handleTouchStart = (e: React.TouchEvent) => {
  setTouchEnd(null);
  setTouchStart(e.targetTouches[0].clientX);
};

const handleTouchMove = (e: React.TouchEvent) => {
  setTouchEnd(e.targetTouches[0].clientX);
};

const handleTouchEnd = () => {
  if (!touchStart || !touchEnd) return;
  const distance = touchStart - touchEnd;
  const isLeftSwipe = distance > MIN_SWIPE_DISTANCE;
  const isRightSwipe = distance < -MIN_SWIPE_DISTANCE;

  if (isLeftSwipe && hasNext) onNext();
  if (isRightSwipe && hasPrev) onPrev();

  setTouchStart(null);
  setTouchEnd(null);
};
```

Apply to modal's outer container:
```tsx
<div
  onTouchStart={handleTouchStart}
  onTouchMove={handleTouchMove}
  onTouchEnd={handleTouchEnd}
  ...
>
```

### 2. Double-Tap/Double-Click Zoom

```typescript
const [zoomLevel, setZoomLevel] = useState(1); // 1 = fit, 2 = zoomed
const lastTapRef = useRef<number>(0);

const handleDoubleClick = (e: React.MouseEvent | React.TouchEvent) => {
  const now = Date.now();
  if (now - lastTapRef.current < 300) {
    // Double tap
    setZoomLevel(z => z === 1 ? 2 : 1);
    lastTapRef.current = 0;
  } else {
    lastTapRef.current = now;
  }
};

// Apply zoom transform to image:
const imageStyle = zoomLevel === 2
  ? { transform: 'scale(2)', cursor: 'zoom-out' }
  : { transform: 'scale(1)', cursor: 'zoom-in' };
```

### 3. Zoom Pan (when zoomed)

When zoomed to 2x, allow dragging to pan around the image:

```typescript
const [pan, setPan] = useState({ x: 0, y: 0 });
const [isDragging, setIsDragging] = useState(false);

// Only active when zoomLevel === 2
const handleMouseMove = (e: React.MouseEvent) => {
  if (!isDragging || zoomLevel !== 2) return;
  setPan({ x: e.movementX, y: e.movementY });
};
```

### 4. Zoom Indicator

Show a subtle "2x" or "1x" badge when zoom state changes.

## Acceptance Criteria

- [ ] Swipe left/right navigates between photos on touch devices
- [ ] Double-click/tap toggles between 1x and 2x zoom
- [ ] When zoomed, image can be panned by dragging
- [ ] Keyboard navigation (←/→) still works
- [ ] Click outside image closes modal
- [ ] Escape key closes modal
- [ ] Dev server runs without errors
- [ ] Production build succeeds
