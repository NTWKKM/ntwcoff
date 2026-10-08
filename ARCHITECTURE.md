# ARCHITECTURE.md — Structural Diary

## 1. System Topology & Seams

```
[Google Drive Folder]
        │
        │ (Daily 12:00 ICT / 05:00 UTC via Service Account)
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
   - Focus reading experience with capped 65ch–75ch measure, sticky Table of Contents (TOC) sidebar, native Marker Orange scroll progress indicator, and light-dismiss backdrop.

5. **`src/components/PaperCard.tsx`**:
   - Superr 12px tactile card surfaces on Cream Paper / Dew Drop with top-3 tag curation, 20px pill buttons, and below-the-fold `content-visibility: auto` performance optimization.

## 3. Data Flow & Decoupled CI/CD Pipelines

- **Source of Truth**: Google Drive folder.
- **Git Versioned Storage**: `raw_papers/` and `src/data/` capture paper updates in Git commits.
- **Decoupled Workflows**:
   1. **`.github/workflows/sync.yml` (`Sync Content from Google Drive`)**:
      - Dedicated Google Drive sync & content pipeline. Runs daily at 12:00 ICT (05:00 UTC) or on manual trigger. Commits updated papers and pushes to `main`.
   2. **`.github/workflows/deploy.yml` (`Deploy Web Application to GitHub Pages`)**:
      - Dedicated Vite build and GitHub Pages deployment.
      - Triggers immediately on `push: branches: [main]`, manual `workflow_dispatch`, and reactively upon completion of `Sync Content from Google Drive` via `workflow_run`.
      - Deploys static build in `dist/` using `actions/upload-pages-artifact@v3` and `actions/deploy-pages@v4`.
- **Hosting**: GitHub Pages serving pre-rendered static artifacts at `https://ntwkkm.github.io/ntwcoff/`.
