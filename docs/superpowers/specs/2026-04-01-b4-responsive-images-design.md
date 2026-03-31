# B4: Responsive Images Design

## Overview

Add `srcset` and `sizes` attributes to all photo images, loading the optimal resolution based on viewport and device pixel ratio. Reduces bandwidth on mobile, delivers sharper images on high-DPI displays.

## Current State

All images request 800px width regardless of device. On a 390px mobile screen, 800px is 2x the needed resolution (wasted bandwidth). On a 2560px desktop, 800px may appear blurry.

## Implementation

### Strategy

Generate `srcset` with 3 sizes: 400w, 800w, 1600w.

```typescript
// In getOptimizedUrl (BentoGrid.tsx):
const generateSrcSet = (url: string, originalWidth: number, originalHeight: number) => {
  if (!url.includes("picsum.photos")) return url;

  const sizes = [400, 800, 1600];
  return sizes
    .map(w => {
      const h = Math.round(w * (originalHeight / originalWidth));
      const resizedUrl = url.replace(/\/\d+\/\d+$/, `/${w}/${h}`);
      return `${resizedUrl} ${w}w`;
    })
    .join(', ');
};
```

### Sizes Attribute

```typescript
const sizes = "(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw";
```

### Updated Image Render

```tsx
<img
  src={optimizedUrl}
  srcSet={generateSrcSet(photo.url, photo.width, photo.height)}
  sizes={sizes}
  alt={photo.title}
  onLoad={() => setIsLoaded(true)}
  className={`... ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
/>
```

### Archive Images

`ArchiveImage` uses 400x400 square URLs. Generate srcset with 200w, 400w, 600w.

### Hero Image

Hero uses 1600x900 for full resolution. Generate srcset with 800w, 1600w, 2400w.

### About Section Photo

Uses 800x1000. Generate srcset with 400w, 800w, 1200w.

## Browser Behavior

The browser automatically selects the best image from srcset based on:
- Device pixel ratio (2x on Retina displays → picks higher resolution)
- Viewport width (sizes attribute tells browser which size to pick at each breakpoint)

## Acceptance Criteria

- [ ] All photo images have srcset with 400w, 800w, 1600w (or appropriate sizes)
- [ ] All photo images have sizes attribute
- [ ] Browser loads appropriate resolution per device
- [ ] Archive images use smaller srcset (200w, 400w, 600w)
- [ ] Hero and About images use appropriate srcset
- [ ] Dev server runs without errors
- [ ] Production build succeeds
