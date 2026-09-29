<p align="center">
  <img src="public/logo.svg" alt="Portfolio logo" width="140">
</p>

<h1 align="center">Portfolio</h1>

<p align="center">
   <strong>Developer portfolio with a monochrome, terminal-inspired UI.</strong><br>
   <em>Built with Next.js 16 and Tailwind CSS 4.</em>
</p>

<p align="center">
  <a href="https://nextjs.org"><img alt="Next.js 16.3.0" src="https://shieldcn.dev/badge/Next.js-16.3.0-171717.svg?variant=secondary&amp;logo=nextdotjs"></a>
  <a href="https://bun.sh"><img alt="Bun 1.3.14" src="https://shieldcn.dev/badge/Bun-1.3.14-fbf0df.svg?variant=secondary&amp;logo=bun&amp;logoColor=171717"></a>
  <a href="https://tailwindcss.com"><img alt="Tailwind CSS 4.3.3" src="https://shieldcn.dev/badge/Tailwind_CSS-4.3.3-06b6d4.svg?variant=secondary&amp;logo=tailwindcss"></a>
  <a href="https://www.typescriptlang.org"><img alt="TypeScript 5.9.3" src="https://shieldcn.dev/badge/TypeScript-5.9.3-3178c6.svg?variant=secondary&amp;logo=typescript"></a>
</p>

## Features

- Single-page scroll layout with anchor navigation
- Terminal-inspired UI with prompt details
- Blinking cursor and scroll-triggered fade-in animations
- Selected projects with a browsable archive
- Markdown blog, RSS feed, sitemap, and structured metadata
- Skills grouped by field and frequency of use
- Responsive, keyboard-accessible interface
- Self-hosted JetBrains Nerd Font

## Tech stack

- Framework: Next.js 16
- UI: React 19, Tailwind CSS 4
- Icons: Lucide React
- Font: JetBrains Nerd Font (self-hosted via `next/font/local`)
- Language: TypeScript
- Package manager: Bun

## Getting started

### Prerequisites

- Bun 1.3.14+
- Node 22.11.0 (see `.nvmrc`)
- An optional `GITHUB_TOKEN` in the environment. The Projects section uses the
  GitHub GraphQL API when a token is present and falls back to the public REST
  API without one. A classic token with `public_repo` scope is enough. The
  Pages workflow passes the Actions token automatically.

### Installation

```bash
bun install
```

### Development

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Project structure

```
app/            # Next.js App Router pages, layout, fonts and global styles
components/     # Reusable UI components (Nav, Caret, Reveal, icons)
sections/       # Page sections (Hero, About, Projects, Skills, Contact)
lib/            # Data loading (GitHub projects and contributions, markdown posts) and site constants
public/         # Logo SVGs and self-hosted font files
```

## Quality checks

```bash
bun test
bun run lint
bun run build
```

## Deployment

The site is a static export (`output: "export"` in `next.config.ts`) published
to GitHub Pages by `.github/workflows/pages.yml`. The workflow runs the tests,
lint, and `next build`, then uploads `out/`. It triggers on every push to
`main` and once a day, since the projects, contribution calendar, and footer
year are fetched at build time.

The workflow builds for `https://kacigaya.github.io`. `next.config.ts`
derives `basePath` from `SITE_URL`, which local builds can set for another
location. Without that override, local builds use the same URL as Pages.

Pages sends no custom response headers, so the content security policy is a
`<meta>` tag in `app/layout.tsx`.

To check the export locally, build it and serve `out/` with any static file
server that maps `/path` to `path.html` and unknown paths to `404.html`.
