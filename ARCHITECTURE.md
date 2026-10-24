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
                                 ├── Navbar (Minimal Editorial Brand & Theme Toggle)
                                 ├── HeroBanner (Lowercase Fraunces Display & Marker Highlight)
                                 ├── FilterBar (Search, Year Select, Disciplines & Keywords Drawer)
                                 ├── PaperCard Grid (10px Hairline Cards & Deferred Render)
                                 ├── PaperReader (Native <dialog>, 64-70ch Measure, Sticky TOC)
                                 └── Footer (Minimal Archival Footer)
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
   - Exports Google Docs to plain text / markdown and caches `modifiedTime` in `raw_papers/.sync_manifest.json`.
   - Non-blocking: Handles missing credentials gracefully without breaking subsequent pipeline stages.

2. **`scripts/prep_content.py`**:
   - Parses Markdown tables, bullet metadata, and Google Docs header formats, prioritizing authoritative `ชื่อบทความวิจัย` titles with fallback to filename slugs.
   - Repairs Google Docs plain-text export artifacts (such as dangling `:**` markers and stripped math asterisks).
   - Deduplicates papers by normalized title, automatically retaining the latest and most comprehensive monograph version.
   - Normalizes categories into 4 canonical scientific coffee domains, extracts `publishedYear`, and assigns domain tags.

3. **`src/components/KatexRenderer.tsx`**:
   - Exports `parsePaperMarkdown(content)` which compiles both accessible HTML and Table of Contents (`TocItem[]`) in a single pass.
   - Isolates `$math$` and `$$math$$` blocks before inline Markdown formatting so scientific notation (`L*a*b*`, `B3LYP/6-311G**`) and LaTeX (`%`, superscripts) never collide.
   - Renders nested bullet/numbered lists, semantic tables, blockquotes, and tabular monospace parameter badges (`.param-badge`).

4. **`src/components/PaperReader.tsx`**:
   - Built on native HTML `<dialog closedby="any">` with `.showModal()`, `::backdrop` blur, and click-boundary light-dismiss fallback.
   - Provides adjustable reading ergonomics (`A-`/`A`/`A+` font sizes, `focus` 64ch / `standard` 70ch column width), clickable DOI/PMID/PMCID reference links, and one-click citation copying.
   - Uses `IntersectionObserver` for TOC scrollspy and direct DOM `scaleX` transforms on the scroll progress bar to avoid React re-renders during scroll.

5. **`src/components/PaperCard.tsx`**:
   - Minimal 10px hairline cards on Cream Paper with unboxed metadata kickers (category, publication year, reading time), Fraunces display titles, and `content-visibility: auto` for below-the-fold cards.

6. **`src/App.tsx` & Build Architecture**:
   - Consumes pre-sorted `papers.json` and `taxonomy.json` for instant client-side filtering across search query, discipline, publication year, and keyword tag.
   - Zero-FOUC theme initialization via inline head script in `index.html` and `color-scheme: light dark`.

## 3. Data Flow & Decoupled CI/CD Pipelines

- **Source of Truth**: Google Drive folder.
- **Git Versioned Storage**: `raw_papers/` and `src/data/` capture paper updates in Git commits.
- **Decoupled Workflows**:
   1. **`.github/workflows/sync.yml` (`Sync Content from Google Drive`)**:
      - Runs daily at 12:17 ICT (05:17 UTC) or on manual trigger.
      - Enforces single concurrency (`group: sync-gdrive`) and idempotent content preparation (`scripts/prep_content.py`), preserving `taxonomy.lastUpdated` when content is unchanged.
   2. **`.github/workflows/deploy.yml` (`Deploy Web Application to GitHub Pages`)**:
      - Triggers on `push: branches: [main]`, `workflow_dispatch`, and upon completion of `Sync Content from Google Drive` via `workflow_run`.
      - Deploys static build in `dist/` using `actions/upload-pages-artifact@v3` and `actions/deploy-pages@v4`.
