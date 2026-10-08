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
                                 ├── Navbar & Dual-Spark Wordmark
                                 ├── HeroBanner & Live Search
                                 ├── FilterBar (Pill Tabs & Tags)
                                 ├── PaperCard Grid (Dual-Spark Accents)
                                 └── PaperReader (Modal + KaTeX + TOC)
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
   - Converts standard markdown headings, tables, and lists into accessible HTML.

4. **`src/components/PaperReader.tsx`**:
   - Focus reading experience with sticky navigation, citation copy tool, and key findings highlights.

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

