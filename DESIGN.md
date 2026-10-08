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

## ADR-004: ElevenLabs Bauhaus Studio Notebook Design System

- **Status**: Accepted
- **Context**: The user specified redesigning the site to follow the ElevenLabs Core Style Reference: warm cream editorial with whispered headlines, Bauhaus studio notebook on eggshell paper.
- **Decision**:
  - **Color Palette**: Eggshell canvas (`#fdfcfc`), Warm Taupe secondary surfaces (`#f5f3f1`), Stone hairline borders (`#ebe8e4`), and Ink (`#000000`). Dual accent sparks (`#0447ff` Violet Spark, `#ff4704` Ember Orange) are quarantined strictly to product visual moments (the Audio Sphere graphic) and never used in UI chrome.
  - **Typography**: Whisper-weight display headings at weight 300 with tight `-0.02em` tracking and `text-wrap: balance`. Neutral Inter at 400/500 with `+0.01em` tracking and `text-wrap: pretty`. Geist/JetBrains Mono for technical micro-metadata at 13px.
  - **Component Hierarchy**: Strictly `#000000` filled pill buttons paired with `#fdfcfc` outline pill buttons (both `9999px` radius). Feature cards at `20px` radius, large modal panels at `24px` radius. Hairline `1px` stone dividers replace heavy shadows.
- **Rationale**: Elevates scientific coffee research into an authoritative, restrained, high-legibility publication that feels like an architectural studio notebook rather than a generic tech template.

