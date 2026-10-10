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

## ADR-006: White Gallery Minimalist Design System Migration

- **Status**: Accepted
- **Context**: The user instructed to simplify the UI/UX and adopt a light-theme white gallery where scientific research claims are the visual centerpiece, surrounded by deliberate monochrome typography, 28px shadowless media frames, Studio Mist (`#f5f5f7`) alternating feature bands, and quiet Blue (`#0066cc` / `#0071e3`) controls.
- **Decision**:
  - **Color Tokens**: Gallery White (`#ffffff`), Studio Mist (`#f5f5f7`), Hairline Silver (`#d6d6d6`), Control Gray (`#e6e6e8`), Ink (`#1d1d1f`), Slate (`#707070`), Steel (`#86868b`), Accent Blue (`#0066cc`), Pricing Blue (`#0071e3`), and Launch Orange (`#b64400`).
  - **Visual Treatment**: Stripped all multi-color gradient fills and drop shadows. Replaced with pure flat surfaces separated by `#ffffff` against `#f5f5f7` and 1px `#d6d6d6` hairline edges.
  - **Card & Geometry Rules**: Feature cards and media frames use `28px` corner radius (`rounded-[28px]`), navigation uses `20px` radius, buttons use `9999px` full pills, search inputs use `980px` radius, and cards remain strictly shadowless.
  - **Typography**: SF Pro Display (`600` weight, tight negative tracking `-1.2px` on display statements, `+0.23px` on kickers) and SF Pro Text (`400/500/600`, negative tracking `-0.12px` to `-0.374px`).
  - **Controls**: Outlined Explore Pills (transparent fill, `#1d1d1f` text, 1px `#86868b` outline), Pricing Blue Pills (`#0071e3` fill, `#ffffff` text, 12px, 9999px radius), and bare `#b64400` launch status text.
- **Rationale**: Elevates readability and simplicity to a clean white gallery standard, focusing user attention purely on scientific evidence, molecular kinetics, and research monographs without decorative noise.

## ADR-007: Token Alpha Channel Support and Semantic Markdown Tables

- **Status**: Accepted
- **Context**: CodeRabbit AI review on PR#4 identified contrast issues in dark mode selected pills, hardcoded utility strings in generated markdown tables, low contrast small labels using steel instead of slate, and missing alpha channel support in CSS color tokens.
- **Decision**:
  - Expose RGB channel variables (`--color-gallery-white-rgb`, `--color-steel-rgb`, `--color-pricing-blue-rgb`) in CSS for Tailwind `/ <alpha-value>` opacity modifier support across both light and dark themes, while preserving existing hex variables.
  - Centralize generated Markdown table styles in `src/index.css` under stable semantic classes (`.markdown-table-wrapper`, `.markdown-table`, `.markdown-table-label`).
  - Standardize small micro-metadata text and input placeholders to `slate` (`#707070` / `#a1a1a6`), reserving `steel` for decorative iconography and hairline borders.
  - Fix pill selected state text to `text-gallery-white` so it adapts correctly across light and dark themes.
- **Rationale**: Guarantees WCAG-compliant contrast ratios in dark mode, keeps generated HTML decoupled from utility class churn, and restores alpha-channel composition across Tailwind utilities.

## ADR-008: Superr Schoolyard Notebook Design System & Reading Ergonomics

- **Status**: Accepted
- **Context**: The user requested a complete color palette and style migration to the **Superr Style Reference** (warm schoolyard notebook on cream paper, uncapped marker orange, tactile 12px cards, 20px pill buttons, 56px rounded marker-orange footer band), while optimizing long-form reading ergonomics and reducing visual density per modern web guidelines (`modern-web-guidance`).
- **Decision**:
  - **Color Tokens**:
    - Cream Paper (`#fdfbf9`): Warm page canvas, card surfaces, and pill button backgrounds.
    - Charcoal (`#171717`): 1.5px structural borders, body text, and button strokes.
    - Cocoa Ink (`#2b1a07`): Warm headline tone for display titles and section openers.
    - Dew Drop (`#f7efe9`): Secondary card layer, specification blocks, and filter pill backgrounds.
    - Marker Orange (`#ff6f1e`): Handwritten captions, script annotations, scroll progress indicator, inline emphasis highlights, and 56px rounded-t footer brand band.
    - Burnt Sienna (`#ce500a`): Body and link accent for contrast against cream.
    - Sky Sticker (`#3b82f6`) & Bubblegum (`#ff66cf`): Decorative illustrated stickers.
  - **Typography**:
    - Display: Custom `gelica` (Fraunces / Plus Jakarta Sans) lowercase display headings in Cocoa Ink, line-height 1.08, weight 600.
    - Body: Clean grotesque `geist` (Inter) paired with Sarabun for Thai text at line-height 1.8.
  - **Button & Card Geometry**:
    - Buttons: 20px pill radius with 1.5px Charcoal border, Cream Paper fill, subtle paper-lift shadow (`rgba(0,0,0,0.25) 0px 1px 2px 0px`). No solid color fills.
    - Cards: 12px radius, 1.5px Charcoal border, whisper-light drop shadow (`rgba(0,0,0,0.06) 0px 2px 20px 0px`).
    - Inputs: 8px radius with 1.5px Charcoal border on Dew Drop.
    - Footer: Marker Orange band with 56px asymmetric top border radius (`rounded-t-[56px]`).
  - **Reading Ergonomics & Performance (modern-web-guidance)**:
    - Constrained reading column measure capped at 65ch–75ch (`max-w-[70ch]`), with real-time reader toolbar toggles (Font size: A-/A/A+, Width: Focus/Standard).
    - Dynamic Table of Contents (TOC) with scroll-spy jump links.
    - Native CSS scroll-driven progress bar (`animation-timeline: scroll()`) in Marker Orange with reactive fallback.
    - Light-dismiss on modal dialog backdrop (`closedby="any"` pattern).
    - Below-the-fold catalog cards optimized with `content-visibility: auto` and `contain-intrinsic-size: auto none auto 260px`.
- **Rationale**: Merges warm, tactile schoolyard notebook aesthetics with evidence-based reading ergonomics, ensuring dense scientific monographs are legible and fatigue-free.

## ADR-009: Scientific Editorial Ergonomics, Category Color-Coding & Tactile Notebook Texturing

- **Status**: Accepted
- **Context**: The user identified that the previous interface appeared visually plain and monotonous (a flat sea of identical white cards and raw unparsed metadata dumps in the monograph reader).
- **Decision**:
  - **Redundant Metadata Stripping**: Eliminated repetitive preamble metadata tables from monograph body text so the reader immediately begins with Section 01, while the top laminated specifications card authoritatively presents research metadata.
  - **Editorial Section Hierarchy**: Standardized 4 primary scientific sections (`01 | Research Objectives`, `02 | Methodology`, `03 | Key Scientific Findings`, `04 | Practical Applications`) with mono-badge numbering, and highlighted Section 03 with an executive findings callout badge (`💡 Key Findings`).
  - **Scientific Metric Formatting**: Augmented temperature parameters (`4°C`, `92°C`) and durations (`24 ชั่วโมง`, `6 นาที`) with distinct micro-parameter pills.
  - **Category Color-Coding**: Equipped `PaperCard` with a 4px category color accent top stripe and matching dot badges (Sky Blue for Extraction, Marker Orange for Sensory, Amber for Roasting, Emerald for Fermentation).
  - **Subtle Notebook Dot Texture**: Implemented `.bg-notebook-dots` via pure CSS `radial-gradient` (per `modern-web-guidance` visual-effects) across Hero and Catalog stages for a tactile lab notebook paper feel.
  - **Footer Subtitle Removal**: Cleaned the footer brand band by removing the verbose subtitle text.
- **Rationale**: Elevates the platform from a plain text list into a vibrant, peer-reviewed scientific editorial notebook with effortless scanability and rich visual rhythm.

## ADR-010: Idempotent Daily Content Pipeline, Off-Peak Cron Scheduling, and Resilient Git Push

- **Status**: Accepted
- **Context**: The scheduled daily GitHub Action (`sync.yml`) was set to `0 5 * * *` (05:00 UTC / 12:00 ICT), experiencing severe runner queue delays (up to 7 hours) due to global top-of-hour contention. Furthermore, `prep_content.py` unconditionally regenerated `taxonomy.lastUpdated` with current timestamps, causing artificial git diffs, redundant daily git commits (`chore: sync papers from Google Drive`), and unnecessary redeployments even when no files in Google Drive changed.
- **Decision**:
  - **Off-Peak Cron Scheduling**: Shifted schedule to `17 5 * * *` (12:17 ICT / 05:17 UTC) to avoid top-of-the-hour runner queue saturation on GitHub Actions.
  - **Single Concurrency Group**: Configured `concurrency: group: sync-gdrive, cancel-in-progress: false` to prevent race conditions between manual dispatches and scheduled triggers.
  - **Content-Aware Idempotency**: Updated `prep_content.py` to compare compiled papers and taxonomy structures against disk before updating `lastUpdated`. If content is identical, the existing timestamp is preserved, yielding zero git diff and avoiding unnecessary commits and downstream deployments.
  - **Resilient Rebase Push**: Enforced `git pull --rebase origin main` before `git push` in `sync.yml` to prevent non-fast-forward push rejections if remote `main` advances during job execution.
- **Rationale**: Eliminates scheduler delays, preserves clean semantic git history without noise commits, and prevents wasted CI/CD runner minutes.

## ADR-011: Multi-Dimensional Modern Web Optimization & Ergonomics

- **Status**: Accepted
- **Context**: The web application was audited to maximize all dimensions (payload size, Core Web Vitals, native browser APIs, accessibility, and theme handling). Initial bundle size was 1,058 kB due to monolithic bundling of KaTeX and full paper contents, the reader modal used custom `div` overlays without top-layer semantics or focus trapping, dark mode suffered from initial paint flash (FOUC), and the TOC scrollspy suffered from layout thrashing loops on every scroll event.
- **Decision**:
  - **Dynamic Code-Splitting**: Code-split `PaperReader` via `React.lazy` with `<Suspense>`, and configured Vite Rollup `manualChunks` to isolate `papers-data` (602 kB), `lucide-icons` (17 kB), and lazy reader (280 kB). Reduced the critical application entry chunk from 1,058 kB down to 161 kB (51 kB gzip).
  - **Speculative Prefetching**: Equipped `PaperCard` with `onMouseEnter` / `onFocus` dynamic `import('./PaperReader')` triggers to eliminate perceived latency when opening monographs.
  - **Native `<dialog closedby="any">` Top Layer**: Migrated the modal from a bespoke fixed `div` to HTML standard `<dialog closedby="any">` opened via `.showModal()`. Leverages native top-layer isolation, native keyboard focus trap, native Esc dismissal, and native `::backdrop` styling with Safari click-boundary fallback.
  - **Zero-FOUC Theme Architecture**: Declared `<meta name="color-scheme" content="light dark">`, paired with an inline synchronous head script that checks `localStorage` or `matchMedia('(prefers-color-scheme: dark)')` prior to first paint. Bound `:root { color-scheme: light dark; }` to automatically adapt native browser scrollbars and inputs.
  - **Decoupled IntersectionObserver Scrollspy**: Replaced the per-scroll `getBoundingClientRect()` loop with an `IntersectionObserver` root-scoped to the reader scroll container. Gated JS scroll progress calculations behind `!CSS.supports('animation-timeline', 'scroll()')` wrapped in `requestAnimationFrame`.
  - **WCAG Accessibility & Landmark Semantics**: Added skip-to-main-content keyboard link, wrapped search in accessible `<form role="search">` with screen-reader `<label>`, added `aria-pressed` to filter tabs/keywords, and added `aria-live="polite"` to filter result counts.
- **Rationale**: Elevates web performance, accessibility, and modern standard conformance to the highest tier while strictly preserving the Superr Schoolyard Notebook aesthetics and reading ergonomics.








