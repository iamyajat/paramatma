# Paramatma

A quiet, readable home for Hindu scriptures — 108 names (ashtottara), aartis,
bhajans, stotras, and sahasranamas — in Devanagari with pronunciation and
meaning. Built with Next.js and MongoDB.

## Setup

1. Copy `.env.example` to `.env.local` and fill in:
   - `MONGODB_URI` — a MongoDB Atlas connection string (include the database name)
   - `ADMIN_PASSWORD` — the password for `/admin`
   - `SESSION_SECRET` — a random 32+ character string (`openssl rand -base64 32`)
   - `NEXT_PUBLIC_SITE_URL` — `http://localhost:3000` for local dev

2. Install dependencies and seed a few sample works:

   ```bash
   npm install
   npm run seed
   ```

3. Run the dev server:

   ```bash
   npm run dev
   ```

   Visit [http://localhost:3000](http://localhost:3000), and
   [http://localhost:3000/admin](http://localhost:3000/admin) to manage content.

## Adding real content

Content is entered through `/admin` — create a deity, then a work under it,
pasting the text into the bulk-entry format shown in each editor (instructions
appear above the content field for each content type). Saving parses the text
into individual verse/name documents and publishes immediately when status is
set to "Published".

## Notes

- **Data model**: each verse/name is its own MongoDB document (not nested in
  an array), so it can later be individually vector-embedded for semantic
  search — see `atlas/README.md`.
- **OG images**: auto-generated per work at `/[type]/[slug]/opengraph-image`.
  They render English text only — the underlying renderer (satori) doesn't
  shape Devanagari conjuncts correctly, so scripture text itself is kept off
  the share image. The actual site pages are unaffected, since real browsers
  shape Devanagari correctly.
- **Fonts**: `src/assets/fonts/` holds static (non-variable) TTF files used
  only for satori-rendered images (OG images, favicons), under the SIL Open
  Font License — Eczar for OG images, plus a Tiro Devanagari Sanskrit TTF
  (extracted from the same cached file `next/font/google` already serves the
  real site, so the ॐ mark matches pixel-for-pixel) for the app icon.
- **PWA**: the site is installable (manifest + icons + service worker) and
  keeps previously visited pages readable offline. `src/lib/brand-icon.tsx`
  is the one design used everywhere — ivory background, gold ॐ, matching
  `om-mark.tsx` exactly — rendered live via `next/og` for `src/app/icon.tsx`
  and `apple-icon.tsx`; `npm run generate-icons` renders the sizes Next can't
  generate itself (`favicon.ico`, and the PWA manifest's `public/icons/*.png`)
  and writes them to disk. Re-run that script after changing the design.
  `public/sw.js` is a small hand-written service worker (network-first for
  pages, cache-first for static assets, `/admin` always bypassed) — no build
  plugin, so it isn't tied to webpack vs. Turbopack. It only registers in a
  production build (`ServiceWorkerRegistration` checks `NODE_ENV`) and
  actively unregisters itself under `next dev` — dev-mode bundle URLs aren't
  content-hashed, so a cache-first SW left over from a previous `next start`
  will otherwise keep serving stale JS chunks through later `next dev` runs.
