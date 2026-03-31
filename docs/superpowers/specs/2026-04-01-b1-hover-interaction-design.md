# B1: Hover Interaction Enhancement Design

## Overview

Optimize the existing 3D Tilt hover effect on photo cards in BentoGrid, adding optical zoom overlay. Creates a more refined, elegant hover experience that reveals more image detail without disrupting layout.

## Design Language

**Style**: Elegant restraint — micro-interactions only, no bounce.
**Tilt range**: ±3° (halved from current ±8°)
**Optical zoom**: 1.03x center crop, revealing more detail
**Transition**: 400ms `cubic-bezier(0.16, 1, 0.3, 1)` (ease-out-expo)

## Implementation

### GridImage Component (BentoGrid)

In `components/BentoGrid.tsx`, the `GridImage` component already has 3D tilt. Modify:

1. **Reduce tilt intensity** from `±8°` to `±3°`:
   ```typescript
   // Current (line ~75):
   const x = (e.clientX - rect.left) / rect.width - 0.5;
   const y = (e.clientY - rect.top) / rect.height - 0.5;
   setTilt({ x: y * -8, y: x * 8 });  // ±8°

   // Change to:
   setTilt({ x: y * -3, y: x * 3 });   // ±3°
   ```

2. **Add optical zoom**: When hovering, the image inside scales to `1.03` from center, creating an "expand to see more" effect. This runs independently of the 3D tilt.

   In the image container's hover state (CSS or inline style), add:
   ```typescript
   // Inside the transform style when isHovering:
   transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${isHovering ? 1.03 : 1})`
   ```

3. **Adjust transition timing**: Current hover transition is `all 0.7s cubic-bezier(0.16, 1, 0.3, 1)`. This is correct for the new behavior.

### ArchiveImage Component (Archive)

Same tilt optimization applies to `ArchiveImage` in `components/Archive.tsx` — reduce tilt from `±8°` to `±3°`. Archive images do not need optical zoom (they are smaller squares).

## Acceptance Criteria

- [ ] BentoGrid cards tilt ±3° (not ±8°) on hover
- [ ] Image zooms to 1.03x center on hover
- [ ] Smooth transition 400ms on both effects
- [ ] Mouse leave: tilt resets to 0, scale returns to 1
- [ ] Archive images tilt at reduced ±3°
- [ ] No layout shift during hover
- [ ] Dev server runs without errors
- [ ] Production build succeeds
