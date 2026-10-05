<p align="center">
  <img src="public/logo.svg" alt="Portfolio logo" width="140">
</p>

<h1 align="center">Portfolio</h1>

<p align="center">
   <strong>Developer portfolio with a monochrome, terminal-inspired UI.</strong><br>
   <em>Built with Next.js 16 and Tailwind CSS 4.</em>
</p>

<p align="center">
  <a href="https://nextjs.org"><img alt="Next.js 16.3.3" src="https://shieldcn.dev/badge/Next.js-16.3.3-171717.svg?variant=secondary&amp;logo=nextdotjs"></a>
  <a href="https://bun.sh"><img alt="Bun 1.3.14" src="https://shieldcn.dev/badge/Bun-1.3.14-fbf0df.svg?variant=secondary&amp;logo=bun&amp;logoColor=171717"></a>
  <a href="https://tailwindcss.com"><img alt="Tailwind CSS 4.3.3" src="https://shieldcn.dev/badge/Tailwind_CSS-4.3.3-06b6d4.svg?variant=secondary&amp;logo=tailwindcss"></a>
  <a href="https://www.typescriptlang.org"><img alt="TypeScript 5.9.3" src="https://shieldcn.dev/badge/TypeScript-5.9.3-3178c6.svg?variant=secondary&amp;logo=typescript"></a>
</p>

## Features

- Single-page scroll layout with anchor navigation and an active-section indicator
- Terminal-inspired UI with prompt details and a blinking cursor
- Experience timeline and a downloadable CV
- Selected projects pulled live from GitHub, with language, stars, and last-push
  date, plus a browsable archive
- Markdown blog with a featured set on the home page, RSS feed, sitemap, and
  per-post Open Graph images
- Person and BlogPosting structured data, and an RFC 9116 `security.txt`
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
app/            # Next.js App Router pages, layout, fonts, routes (feed, robots, sitemap, security.txt) and global styles
components/     # Reusable UI components (Nav, Caret, Deferred, icons)
sections/       # Page sections (Hero, About, Experience, Projects, Skills, Certifications, Contact)
lib/            # Data loading (GitHub projects and contributions, markdown posts) and site constants
content/posts/  # Markdown blog posts with frontmatter
public/         # Logo, Open Graph image, CV, and self-hosted font files
assets/         # Fonts bundled into the per-post Open Graph images (not published)
scripts/        # Post-build helper that gives the Open Graph images a .png extension
cv/             # CV source (Markdown), stylesheet, and Inter font files
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
lint, and `next build`, renames the per-post Open Graph files to `.png`
(`scripts/postbuild-og.mjs`), then uploads `out/`. It triggers on every push to
`main` and once a day, since the projects, contribution calendar, and footer
year are fetched at build time. Pull requests run the same checks without
deploying, via `.github/workflows/ci.yml`.

The workflow builds for `https://kacigaya.github.io`. `next.config.ts`
derives `basePath` from `SITE_URL`, which local builds can set for another
location. Without that override, local builds use the same URL as Pages.

Pages sends no custom response headers, so the content security policy is a
`<meta>` tag in `app/layout.tsx`.

To check the export locally, run `bun run build`, then `node
scripts/postbuild-og.mjs`, and serve `out/` with any static file server that
maps `/path` to `path.html` and unknown paths to `404.html`.

The CV lives in `cv/cv.md`. After editing it, run `bun run cv` to render
`public/CV_Gaya_KACI.pdf`. The script uses Bun's built-in Markdown renderer,
styles the page with `cv/cv.css`, and prints it with headless Chromium. Set
`CHROME` to the Chromium binary when it is not on `PATH` as `chromium` or
`google-chrome`.
