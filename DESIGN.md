# DESIGN.md — Decision Diary & Architectural Records (ADRs)

## ADR-001: Vite + React SPA with Static Data Pre-compilation

- **Status**: Accepted
- **Context**: The user requires a modern web presentation for deep coffee research papers that automatically syncs from Google Drive, auto-tags topics, and renders smoothly on GitHub Pages.
- **Decision**: Pre-compile markdown papers into structured JSON (`src/data/papers.json`) via `scripts/prep_content.py` and build a static Vite + React SPA.
- **Rationale**:
  - Eliminates server-side rendering complexity and runtime database dependencies.
  - Client-side instant filtering and search across title, authors, excerpt, and full body text with zero latency.
  - Seamless zero-config deployment to GitHub Pages via `actions/deploy-pages@v4`.
- **Alternatives Considered**:
  - Full SSR (Next.js): Unnecessary compute overhead for static document archival.
  - Plain HTML generation: Lacks dynamic instant search and smooth interactive tag switching.

## ADR-002: Service Account Google Drive Integration with Graceful Local Fallback

- **Status**: Accepted
- **Context**: GitHub Actions runs headless without interactive Google OAuth login. The user will configure secrets after initial repository push.
- **Decision**: Use a Google Cloud Service Account JSON key. If secrets (`GDRIVE_SERVICE_ACCOUNT_KEY` and `GDRIVE_FOLDER_ID`) are absent, `scripts/sync_drive.py` logs clear guidance and exits with status 0, allowing the build pipeline to continue using existing papers in `raw_papers/`.
- **Rationale**: Prevents failed red builds on fresh checkouts and allows seamless local development.

## ADR-003: Daily Schedule at 12:00 ICT (Indochina Time)

- **Status**: Accepted
- **Context**: The user requested automatic sync every day at 12:00 PM Thai time.
- **Decision**: Set cron schedule in GitHub Actions to `0 5 * * *` (05:00 UTC = 12:00 ICT, UTC+7) with `workflow_dispatch` for manual on-demand triggers.

## ADR-004: ElevenLabs Bauhaus Studio Notebook Design System (Dual-Spark Accent Edition)

- **Status**: Accepted
- **Context**: The user specified redesigning the site to follow the ElevenLabs Core Style Reference (warm cream editorial with whispered headlines, Bauhaus studio notebook on eggshell paper), and subsequently updated the rule to infuse the signature ElevenLabs dual sparks (Violet Spark `#0447ff` and Ember Orange `#ff4704`) across all interactive touchpoints.
- **Decision**:
  - **Color Palette**: Eggshell canvas (`#fdfcfc`), Warm Taupe secondary surfaces (`#f5f3f1`), Stone hairline borders (`#ebe8e4`), and Ink (`#000000`).
  - **Dual Spark Accent System**: Violet Spark (`#0447ff`) and Ember Orange (`#ff4704`) are applied as dynamic gradient sparks across interactive elements: Brand wordmark indicator, sync pulse, Hero title accent, Active Category Tab Pills, Active Tags, top hover hairline on Feature Cards, Action CTA buttons, KaTeX highlight borders, and Return buttons.
  - **Typography**: Whisper-weight display headings at weight 300 with tight `-0.02em` tracking and `text-wrap: balance`. Neutral Inter at 400/500 with `+0.01em` tracking and `text-wrap: pretty`. Geist/JetBrains Mono for technical micro-metadata at 13px.
  - **Component Hierarchy**: Fully-pilled buttons and tags (all `9999px` radius), Feature cards at `20px` radius, large modal panels at `24px` radius. Hairline `1px` stone dividers replace heavy drop shadows.
- **Rationale**: Combines the calm readability of a Bauhaus editorial paper canvas with the vibrant product energy of ElevenLabs' signature violet-orange gradient sparks.

## ADR-005: Decoupled Web Deployment Pipeline from Content Sync

- **Status**: Accepted
- **Context**: The existing `sync.yml` workflow was tightly coupled to Google Drive cron schedules and manual triggers, without triggering on `push: branches: [main]`. Consequently, frontend changes pushed to `main` were not rebuilding GitHub Pages. Furthermore, the combined workflow took 6+ minutes due to Python sync, dependencies, and frontend builds running sequentially.
- **Decision**:
  - Separate CI/CD into two dedicated workflows:
    1. `.github/workflows/deploy.yml`: Dedicated Vite build and deployment action triggering on `push: branches: [main]`, `workflow_dispatch`, and `workflow_run` after Google Drive sync completes.
    2. `.github/workflows/sync.yml`: Streamlined Google Drive sync running on daily cron and manual dispatch.
- **Rationale**:
  - Ensures every push to `main` deploys in under 1-2 minutes without blocking on Google Drive sync.
  - Reactive trigger via `workflow_run` automatically rebuilds the web app whenever new research papers are fetched and committed from Google Drive.

