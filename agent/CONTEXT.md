# evie makes — Project Context

This document is for AI agents and future contributors. Read it before making changes.

---

## What this is

A personal portfolio and creative hub for Evangeline Sturges, a maker/creative. The domain is "evie makes."

The site has two distinct layers:
1. **The portfolio shell** — landing page, about, project index, contact. Mostly static, content-driven.
2. **Web projects** — individual interactive/animated projects that live inside the site as their own pages. These can be heavily animated or interactive — think canvas experiments, generative art, interactive data, rich UI demos.

---

## Current state

A single "coming soon" / business card page at `src/pages/index.astro`. It shows:
- The brand name "evie makes"
- "Watch this space"
- Links to LinkedIn and Instagram

It is intentionally minimal — a placeholder while the full site is built.

---

## Tech stack

| Tool | Why |
|---|---|
| **Astro** | Static-first, fast deploys, excellent for content sites. Handles routing and page shell. |
| **React** (`@astrojs/react`) | Needed for interactive components and the React library ecosystem. Only hydrated where explicitly needed — not on every page. |
| **MDX** (`@astrojs/mdx`) | Markdown + embedded React components. Will be used for project write-ups and case studies where prose and live demos coexist. |
| **TypeScript** | Configured. Use it for React components. |
| **Yarn** | Package manager. Use `yarn add` not `npm install`. |

**Do not** switch to Next.js or Vite. The Astro + React + MDX combination was chosen deliberately for this use case. The decision was made because: Astro handles static content well; React is only loaded where needed (islands); MDX is a first-class feature for project case studies.

---

## Architecture patterns to follow

### Astro pages vs React components
- `.astro` files for pages and static layouts — no interactivity needed
- `.tsx` / `.jsx` files for any component that needs state, event handlers, or uses a React library
- In `.astro` files, add `client:load` (or `client:visible`) to a React component only if it genuinely needs to run in the browser

### Content structure (to be built)
Use **Astro Content Collections** for project entries. Each project should have frontmatter like:
```
title, description, date, tags, thumbnail, type (portfolio | web-project)
```

### MDX pages
Project case studies / write-ups live in `src/content/projects/` as `.mdx` files. They can import and embed React components inline.

### Web projects
Heavy interactive pieces live under `src/pages/projects/[slug].astro` or as dedicated pages. They can use canvas, WebGL, Three.js, Framer Motion, GSAP — whatever the project needs. They are isolated from the rest of the site's bundle.

---

## Design system

**Fonts** (loaded via Google Fonts in the current landing page):
- `Unbounded` weight 700/900 — headings, brand name, buttons
- `Caveat` weight 700 — handwritten accent text

**Colours:**
```
--yellow:  #FFE141   background
--coral:   #FF3358   primary accent
--teal:    #00C9B1   secondary accent
--lav:     #C4B5FD   tertiary accent
--ink:     #1A1A1A   text, borders
--white:   #FFFFFF   card backgrounds
```

**Visual style:** Bright, bubbly but blocky. Think risograph/screen-print — bold solid colour blocks, chunky black borders with offset flat shadows (not drop shadows), rounded but geometric shapes. Avoid gradients. Avoid soft shadows. Avoid grey backgrounds.

**Component patterns:**
- Cards: white bg, `4px solid var(--ink)` border, `border-radius: 28px`, `8px 8px 0 var(--ink)` box-shadow
- Buttons: pill shape (`border-radius: 100px`), `3px solid var(--ink)` border, `4px 4px 0 var(--ink)` shadow, hover lifts with spring easing

---

## Running the project

```bash
yarn install        # first time
yarn dev            # dev server at localhost:4321
yarn build          # production build to dist/
yarn preview        # preview the build
```

---

## File structure

```
src/
  pages/
    index.astro         # coming soon / business card (current)
  layouts/
    Layout.astro        # base HTML shell (mostly unused — index.astro is self-contained)
  components/           # shared React and Astro components (to be populated)
  content/              # Astro content collections (to be created)
    projects/           # .mdx project write-ups
agent/
  CONTEXT.md            # this file
public/
  favicon.svg           # branded: yellow bg, coral "e", teal star
```
