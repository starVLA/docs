# StarVLA Docs

This repo builds and deploys the documentation site for `starVLA/docs` using Astro + Starlight.

## Quick Start (for non-frontend contributors)

### 1) Install Node.js (includes npm)

If you don’t have Node.js installed, follow this guide (recommended):  
https://axi404.top/blog/common-commands#%E5%AE%89%E8%A3%85-nodejs

After installing, verify:

```bash
node -v
npm -v
```

Recommended: use **Node.js 20 LTS** (or newer).

### 2) Install pnpm

Option A (recommended): via Corepack (bundled with Node.js):

```bash
corepack enable
corepack prepare pnpm@9 --activate
pnpm -v
```

Option B: via npm:

```bash
npm i -g pnpm@9
pnpm -v
```

### 3) Install dependencies

```bash
pnpm install
```

### 4) Start the local dev server (open a browser window)

In one terminal window, run:

```bash
pnpm dev
```

Then open `http://localhost:4321/` in your browser.

### 5) Build before merging (recommended)

```bash
pnpm build
```

## Where to edit docs

- English docs: `src/content/docs/`
- Chinese docs: `src/content/docs/zh-cn/` (mirror the English path)
- Images/media: `src/assets/`
- Static files (favicons, etc.): `public/`
- Site config: `astro.config.mjs`

Routes map to file paths. For example:

- `src/content/docs/getting-started/quick-start.mdx` → `/getting-started/quick-start/`
- `src/content/docs/zh-cn/getting-started/quick-start.mdx` → `/zh-cn/getting-started/quick-start/`

## Deployment (GitHub Pages)

GitHub Actions builds the site and deploys `dist/` to GitHub Pages on pushes to `main`.
