# ARCHITECTURE.md — Structural Diary

## 1. System Topology & Seams

```
[Google Drive Folder]
        │
        │ (Daily 12:17 ICT / 05:17 UTC via Service Account)
        ▼
[scripts/sync_drive.py] ──▶ saves to ──▶ [raw_papers/*.md]
                                               │
                                               ▼
                                    [scripts/prep_content.py]
                                               │
                      ┌────────────────────────┴────────────────────────┐
                      ▼                                                 ▼
             [src/data/papers.json]                          [src/data/taxonomy.json]
                      │                                                 │
                      └────────────────────────┬────────────────────────┘
                                               │
                                               ▼
                                 [Vite + React Research Portal]
                                 ├── Navbar (Schoolyard Notebook Brand & Pill Buttons)
                                 ├── HeroBanner (Lowercase gelica Display, Marker Highlight & Stickers)
                                 ├── FilterBar (Segmented Category Tabs & Curated Keywords)
                                 ├── PaperCard Grid (12px Cards, 20px Pill Buttons & Deferred Render)
                                 ├── PaperReader (Optimal 65-75ch Measure, Sticky TOC & Progress Bar)
                                 └── Footer Brand Band (56px Rounded Marker Orange Stripe)
                                               │
                                               ▼ (npm run build)
                                          [dist/ Static]
                                               │
                                               ▼ (actions/deploy-pages)
                                    [GitHub Pages Deployment]
```

## 2. Module Responsibilities

1. **`scripts/sync_drive.py`**:
   - Boundary interface to Google Drive v3 API.
   - Converts Google Docs to text / plain markdown.
   - Non-blocking: Handles missing credentials gracefully without breaking subsequent pipeline stages.

2. **`scripts/prep_content.py`**:
   - Parses Markdown AST & tables.
   - Applies deterministic taxonomy keyword matching to assign domain tags.
   - Compiles search index, metadata summary, and reading time.

3. **`src/components/KatexRenderer.tsx`**:
   - Renders inline math `$math$` and display math `$$math$$` using KaTeX without hydration issues.
   - Converts standard markdown headings, tables, blockquotes, and lists into accessible HTML.
   - Supports configurable reading font sizes (`sm` 15px, `md` 17px, `lg` 19px) with generous line-height 1.8.

4. **`src/components/PaperReader.tsx`**:
   - Focus reading experience with capped 65ch–75ch measure, sticky Table of Contents (TOC) sidebar, and native Marker Orange scroll progress indicator.
   - Built on native HTML `<dialog closedby="any">` with `.showModal()`, `::backdrop` blur, and graceful Safari click-boundary light-dismiss fallback.
   - Decoupled scrollspy powered by `IntersectionObserver` avoiding main-thread layout thrashing.
   - Code-split via `React.lazy` to keep the critical initial bundle feather-light.

5. **`src/components/PaperCard.tsx`**:
   - Superr 12px tactile card surfaces on Cream Paper / Dew Drop with top-3 tag curation, 20px pill buttons, and below-the-fold `content-visibility: auto` performance optimization.
   - Speculative `PaperReader` prefetch on card hover / focus for zero-perceived-latency modal open.

6. **`src/App.tsx` & Build Architecture**:
   - Vite Rollup chunk optimization isolating `papers-data`, `lucide-icons`, and lazy `PaperReader` chunks.
   - Zero-FOUC theme initialization with inline head script and `color-scheme: light dark` root property.
   - Accessible navigation landmarks (`<main id="main-content">`, skip-to-content link, accessible search form, live regions).

## 3. Data Flow & Decoupled CI/CD Pipelines

- **Source of Truth**: Google Drive folder.
- **Git Versioned Storage**: `raw_papers/` and `src/data/` capture paper updates in Git commits.
- **Decoupled Workflows**:
   1. **`.github/workflows/sync.yml` (`Sync Content from Google Drive`)**:
      - Dedicated Google Drive sync & content pipeline. Runs daily at 12:17 ICT (05:17 UTC, avoiding top-of-hour GitHub Actions congestion) or on manual trigger.
      - Enforces single concurrency (`group: sync-gdrive`) and resilient `git pull --rebase` pushes.
      - Runs idempotent content preparation in `scripts/prep_content.py` that preserves `taxonomy.lastUpdated` when content is unchanged, preventing redundant daily commits and zero-change deployments.
   2. **`.github/workflows/deploy.yml` (`Deploy Web Application to GitHub Pages`)**:
      - Dedicated Vite build and GitHub Pages deployment.
      - Triggers immediately on `push: branches: [main]`, manual `workflow_dispatch`, and reactively upon completion of `Sync Content from Google Drive` via `workflow_run`.
      - Deploys static build in `dist/` using `actions/upload-pages-artifact@v3` and `actions/deploy-pages@v4`.
- **Hosting**: GitHub Pages serving pre-rendered static artifacts at `https://ntwkkm.github.io/ntwcoff/`.
