# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Traefik Mastery** is a learning resource for mastering Traefik reverse proxy and networking fundamentals. It has two parts that are built and served together as one site:

1. **`app/`** — a standalone, dependency-free vanilla-JS "front door" (four static HTML files: `index.html`, `simulator.html`, `animations.html`, `config.html`) with interactive visualizations of Traefik concepts. No build step; edit and reload.
2. **`docs/`** — 77 Docusaurus v3 markdown files (the actual course content), organized into 8 learning categories, navigated via `sidebars.js`.

The `app/` pages are served at `/` and the docs are served at `/docs/*` (see "Two-Site Architecture" below) — this split is the most important thing to understand before changing any server, build, or config file in this repo.

## Two-Site Architecture

`docusaurus.config.js` sets `baseUrl: '/docs/'`, so Docusaurus alone only knows how to serve `/docs`. It has no awareness of `app/`. Two custom scripts stitch the two together:

- **`scripts/dev-server.js`** (runs on `npm start`) — a small Node HTTP server that listens on port 3000, serves `app/*.html` directly from disk, and reverse-proxies (including WebSocket, for hot-reload) everything under `/docs` to a `docusaurus start` process it spawns internally on port 3001. This is why `npm start` does *not* invoke `docusaurus start` directly — going through plain `docusaurus start` will get you the docs but not the `app/` pages at `/`.
- **`scripts/merge-static.js`** (runs as part of `npm run build`) — after `docusaurus build` produces `/build`, this script wipes `/dist`, copies `/build` → `dist/docs`, and copies `app/` → `dist/` (root). The final servable artifact is `/dist`, not `/build`.

Keep this in mind when editing `docusaurus.config.js` or the npm scripts — changes to one side (e.g. renaming `dist/`, changing the docs `baseUrl`, or changing the proxy port) generally require a matching change on the other side.

## Common Commands

| Command | Purpose |
|---------|---------|
| `npm start` | Start the combined dev server (`scripts/dev-server.js`) at `http://localhost:3000` — serves `app/` at `/` and proxies Docusaurus (hot-reload) at `/docs` |
| `npm run start:docs` | Start plain `docusaurus start` (docs only, no `app/`, no proxy) |
| `npm run build` | `docusaurus build` then `scripts/merge-static.js` — produces the combined site in `/dist` with local paths (`baseUrl: /docs/`) |
| `npm run build:gh-pages` | Same as `npm run build`, but with `DEPLOY_TARGET=gh-pages` so Docusaurus builds with `baseUrl: /traefik/docs/` and `merge-static.js` rewrites the app's `/docs/intro` links to `/traefik/docs/intro` to match the GitHub Pages project-site path |
| `npm run build:docs` | `docusaurus build` only, output in `/build` |
| `npm run serve` | Serve the combined production build: `serve dist -l 3000` (requires `npm run build` first) |
| `npm run serve:docs` | `docusaurus serve` (docs-only build, from `/build`) |
| `npm run clear` | Clear the Docusaurus build cache — use when doc changes aren't reflected |
| `npm run write-heading-ids` | Generate heading IDs for new/changed markdown files |

There is no lint or test suite configured in `package.json`.

## Deployment

The site is deployed to GitHub Pages via `.github/workflows/deploy-pages.yml`: on every push to `main`, it runs `npm run build:gh-pages` and publishes `/dist` with `actions/deploy-pages`. There is no other deployment path (no Docker/Dockerfile) — `/dist` is the only servable artifact this project produces.

## Content Organization

**Docs sidebar** (`sidebars.js`, single sidebar id `tutorialSidebar`):
- `intro` — landing page
- **Networking Fundamentals** (expanded) — HTTP, DNS, TCP/IP, reverse proxies, container networking
- **Traefik Core** (expanded) — entrypoints, routers, services, middlewares, providers, TLS, Kubernetes
- **Hands-on Labs** (expanded) — nested subcategories (e.g. Lab 1: Basic Routing has its own `README`/`architecture`/`exercises`/`troubleshooting` set); other labs are flatter, each a single `README`
- **Internals** (collapsed) — Docker event watching, routing table generation, middleware chains, TLS handshake, WebSocket handling, etc.
- **Debugging & Troubleshooting** (collapsed) — access/debug logs, Prometheus metrics, tracing, 404/502/TLS/DNS debugging
- **Production Architecture** (collapsed) — HA, blue-green, canary, zero-downtime, Kubernetes production patterns
- **Reference** (collapsed) — cheatsheets (Docker commands, Traefik CLI, curl debugging, troubleshooting checklist)
- **Diagrams & Assets** (collapsed) — conceptual diagrams (reverse-proxy flow, TLS handshake, Docker networking, Traefik routing)

When adding a new doc page, add its path (without `.md`) to the matching category array in `sidebars.js`, or the page won't appear in navigation even though it builds.

`docs/index.md` is a full table-of-contents page for the whole course (separate from `docs/intro.md`, the sidebar's actual landing page) — update it too when adding/removing/renaming doc files so the two don't drift apart.

## Key Config Files

- **`docusaurus.config.js`** — title/tagline/favicon, `baseUrl: '/docs/'`, `routeBasePath: '/'` (docs live at the root *of the docs plugin*, which itself is mounted at `/docs/`), navbar/footer links, Prism syntax theme (GitHub light / Dracula dark, extra languages: bash/yaml/toml/docker). The navbar has a manually-added "← App Home" link back to `/` — the app's front door.
- **`sidebars.js`** — the doc navigation tree described above.
- **`src/css/custom.css`** — primary color `#24a5a5` (matches the `app/` front door's teal brand color), dark mode overrides via `[data-theme='dark']`.
- **`src/pages/`** — currently empty; reserved for custom Docusaurus React pages if added later (distinct from the static `app/` pages).

## Editing Content

Standard Docusaurus markdown: code fences with language hints, admonitions (`:::note`, `:::info`, `:::warning`, `:::danger`), tables, frontmatter. New pages need a `sidebars.js` entry (see above) to be reachable from navigation.

To edit the `app/` front-door pages, just edit the HTML files directly — they're static, dependency-free, and reload immediately under `npm start`.

If hot-reload for docs doesn't pick up a change: `npm run clear && npm start`.
