# Home Page Image Layout Engine

## Problem

The home page scatters images around a central card. Images must:
- Never overlap the card or each other
- Stay within the viewport (or extend below it for scroll when there are too many)
- Land in the same positions on every page load (deterministic, not random each visit)
- Recalculate cleanly when the window is resized

CSS percentage positions can't satisfy these constraints — they don't know where the card is. The solution is a client-side placement algorithm that runs after images are loaded.

---

## Approach: seeded collision detection

### Seeded PRNG

`Math.random()` can't be seeded. We use **mulberry32**, a fast 32-bit PRNG that takes a seed integer and returns a `() => number` function producing values in [0, 1). The seed is currently the constant `42`. To switch to daily variation, change it to a hash of `new Date().toDateString()`.

### Placement algorithm

Runs in JS after the page loads:

1. Reset any previously placed positions (needed on resize)
2. Wait for all images to decode (`img.decode()`) so `offsetWidth`/`offsetHeight` are real
3. Read the card's bounding rect — this is the forbidden zone
4. For each image block, try up to 300 random `(x, y)` positions using the seeded RNG
5. Reject any position that overlaps the card rect OR any already-placed image (both with a `MARGIN` gap)
6. If a valid position is found: set `left/top` inline styles and add class `.placed` (triggers CSS fade-in)
7. If all 300 attempts fail: the image stays hidden. **Future:** push it below the viewport into a scroll zone.

Constants (in script):
- `SEED = 42` — change to enable variation
- `MARGIN = 24` — px gap between images, and between images and card
- `EDGE_PAD = 20` — px gap from viewport edges

### Coordinate system

`.bg-shapes` is `position: fixed; inset: 0`, so child `.sf` elements use `position: absolute` in **viewport coordinates**. `getBoundingClientRect()` also returns viewport coordinates. They match — no offset correction needed.

### Resize

On `window.resize`, the layout function re-runs every animation frame (`requestAnimationFrame` throttle — at most once per 16ms). On resize, visibility is **not** reset — only `left`/`top` are updated. Because `.sf.placed` has `transition: left 0.3s ease, top 0.3s ease`, images slide smoothly to their new positions in real time. The transition is intentionally absent from `.sf` (unplaced state) so images don't animate in from (0, 0) on initial load.

---

## Page structure

- `.bg-shapes`: `position: fixed; inset: 0` — images live in viewport space, behind the card
- `.sf`: starts hidden (`opacity: 0; visibility: hidden`), gets class `.placed` after JS positions it → CSS fades it in
- Body still has `overflow: hidden` for now

**Future scroll behaviour:** when images don't fit in the viewport, change `.bg-shapes` to `position: absolute` on a tall wrapper, remove `overflow: hidden` from body, and push overflowing images into a zone below `window.innerHeight`. The card would become `position: sticky` or fixed so it stays visible while the user scrolls through images.

---

## Files

| File | Role |
|---|---|
| `src/pages/index.astro` | All layout logic lives in the `<script>` block here |
| `src/config.ts` | `homeBlocks` array — add entries here to add images |
| `public/images/home/` | Drop image files here |

## Adding an image

1. Drop the file into `public/images/home/`
2. Add an entry to `homeBlocks` in `src/config.ts`:
   ```ts
   { image: '/images/home/filename.png', alt: 'description', href: '/projects/slug' }
   ```
3. The layout engine picks it up automatically on next load.
