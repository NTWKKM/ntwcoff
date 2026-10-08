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
                                 ├── Navbar & Theme Switcher
                                 ├── HeroBanner & Live Search
                                 ├── FilterBar (Category & Tags)
                                 ├── PaperCard Grid
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

## 3. Data Flow & Synchronization

- **Source of Truth**: Google Drive folder.
- **Git Versioned Storage**: `raw_papers/` captures all paper updates in Git commits tagged with `[skip ci]`.
- **Hosting**: GitHub Pages serving pre-rendered static artifacts.
