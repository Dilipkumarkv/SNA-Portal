# SNA Portal (System & Network Administration Portal)

**Course:** 25CS34I — System & Network Administration (Semester 3, S.E.T Polytechnic)
**Tech Stack:** React 19 + TypeScript + Vite + Tailwind CSS v4 + PWA + Capacitor
**Deployment:** Netlify (SPA) + PWA + Offline-first — see [Deploying to Netlify](#deploying-to-netlify)

---

## Project Overview

The SNA Portal is a dual-role educational PWA for the Integrated Course 25CS34I (3:0:4, 5 Credits, 91 hours). It serves students (open access) and administrators (Google OAuth) with:

- **Learn workspace** — 13 weeks × 4 day-lessons = 52 lessons, each with Basics / Overview / Notes / Schematic / Try it / Q&A tabs, plus progress and an Assessments view
- **Lab explorer** — all 58 experiments from the lab manual, searchable and filterable by week, with a per-experiment procedure checklist
- **Assessment banks** — inside Learn: CIE model papers, 65 viva questions and 61 CIE questions, filterable by week
- **Resume card** on Home that returns the student to their last lesson
- Virtual Terminal Lab (CMD / PowerShell / Bash, 33 commands) for CLI practice
- Schematic viewers for the real lab machine — photographs of the M83 rear I/O, PSU, H81 board and lab room, plus boot-sequence, disk-layout and RDP/VPN diagrams
- Guided Lab Mode with step tracking and scenario-based CLI exercises
- Admin panel for local notes, lab manuals, notices and the CIE schedule (browser-local demo)
- Offline-first PWA with service worker caching and installable on Android/iOS
- Mobile screen support (responsive 360px–1024px+), touch targets >=44px, safe-area insets

---

## Quick Start

```bash
cd "C:\Users\deep\Downloads\sna-portal gg"
npm install
npm run dev
# Server: http://localhost:3000/
```

Type check, test and production build:

```bash
npm run lint     # tsc --noEmit
npm test         # routing, progress and storage tests (node:test + tsx)
npm run build    # -> dist/
```

GitHub Actions runs all three on every push to `main` and on pull requests
(`.github/workflows/ci.yml`).

---

## Storage Model (read this first)

**This app has no backend server.** There is no Firebase, no Firestore, and no Cloud Run.
Everything is stored on the device that created it:

| Data | Where it lives | Notes |
|---|---|---|
| Announcements, CIE schedule, notes, labs, feedback | `localStorage` | Keys prefixed `sna_` |
| Course progress (lessons, experiments, last opened lesson) | `localStorage` (`sna_progress_v1`) | Device-scoped; does not follow the student to another phone |
| Uploaded PDF attachments | **IndexedDB** (`sna_files`) | Keeps large files out of the 5 MB localStorage quota |
| Terminal sessions, tracker progress, theme | `localStorage` | |

Stored collections use a versioned `{ v: 2, items }` envelope. Older plain arrays are migrated
on load, and rows that fail runtime validation are dropped instead of reaching the UI.

**The admin panel is a local demo, not a shared server.** Google OAuth still gates who can
open it, but the sign-in only gates the UI — the session lives in `localStorage` and the ID
token is decoded but never verified server-side. Anyone who edits `localStorage` in devtools
can bypass it. Data published in one browser is invisible to students on other devices.
Production builds show a dismissible demo banner that says so on every screen.

To make this a real multi-user portal you need an actual backend (see *Future Work* below).

---

## Deliverables

### Task 1 — CMD Terminal Integration
- Integrated repo: github.com/Dilipkumarkv/CMD (public)
- Engine: Virtual File System, tokenizer, command registry, 33 commands across CMD / PowerShell / Bash dialects
- Includes a DiskPart sub-command interpreter and per-session firewall / local-user state
- Features: CMD / PowerShell / Bash simulation, CLI scenarios mapped to Weeks 6/8/10/11, session persistence

### Task 2 — Schematic Viewers (Mobile-First)
- Components: SchematicPane (inline tab), SchematicViewer (full screen, touch/pinch zoom, pan), SchematicIntegration (button in the lab explorer)
- Data: src/data/schematics.ts — 7 diagrams, 49 hotspots, weeks 1, 2, 3, 4, 8, 10, 11
- Media: photographs for physical hardware (public/schematics/*.webp), inline SVG where order or structure matters (boot sequence, disk layout, RDP/VPN)

### Task 3 — Mobile-First PWA Optimizations
- Responsive CSS: viewport scaling (360px–1024px+) in src/index.css
- Touch targets: global min 44px CSS in index.css
- Viewport meta: viewport-fit=cover for native screen support
- Mobile keyboard: visualViewport tracking in terminal

### Task 4 — Netlify Deployment
- `netlify.toml`: Node 22, `npm run build` → `dist`, SPA fallback, cache rules, security headers including a CSP that allows the Google sign-in script/iframe
- `public/_redirects`: same SPA fallback for drag-and-drop deploys of `dist/`
- Build: `npm run build` → `dist/`; the service worker is generated at build time by `vite-plugin-pwa` (Workbox), not checked in as `public/sw.js`
- See [Deploying to Netlify](#deploying-to-netlify) for the one-time setup and the two environment variables.

### Task 5 — Guided Lab Mode
- Component: GuidedLab (step navigation, scenario dropdown)
- Data: src/data/labScenarios.ts (scenarios mapped per experiment)
- Integration: Added to TabLabs with guided mode toggle, schematic + terminal buttons
- Features: Step completion tracking, scenario categories (progress is per-session, not persisted)

---

## Learning App (Learn / Labs)

The app is no longer a document viewer with a terminal bolted on. Two screens carry the course:

| Route | Component | What it does |
|---|---|---|
| `#learn` / `#learn/{week}/{day}` | `src/components/learn/LearnWorkspace.tsx` | Lessons mode: week rail + day chips + `LessonPane`. Falls back to `lastLesson`, then week 1 day 1. |
| `#learn/assessment` | `src/components/learn/AssessmentBank.tsx` | Assessments mode: CIE model papers, 65 viva Q&A, 61 CIE questions. |
| `#labs` | `src/components/lab/LabExplorer.tsx` | 58 experiments, search + week filter, procedure checklist, `GuidedLab` launch, completion persisted. |

Lesson tabs: **Basics** (What/Why/How sections), **Overview** (previous unit, connection, syllabus
coverage, lab session, practical tasks, references), **Notes** (the week's long-form note, with PDF
download, attachment and links), **Schematic** (photograph or SVG + hotspot list), **Try it** (that week's
commands, runnable inline against the virtual filesystem), **Q&A** (week's viva + this lesson's CIE
questions).

The old `#notes` and `#qps` tabs are gone: notes live inside the lesson, papers and question banks
live in Learn › Assessments. Both old hashes still resolve (`#notes` → `#learn`,
`#qps` → `#learn/assessment`).

Progress lives in `src/lib/progress.ts`: per-lesson and per-experiment completion plus `lastLesson`,
read and written through `sna_progress_v1`, with `window` events so every screen updates at once.
Home shows a resume card from `lastLesson`.

The reasoning behind these choices — including what was cut and why — is in
[`WORKFLOW.md`](WORKFLOW.md).

---

## Deploying to Netlify

The repo is configured for a Git deploy: `netlify.toml` holds the build command, Node version,
SPA fallback, cache rules and security headers, so the Netlify UI only needs the repository
connected.

### One-time setup

1. **Import the repo** — Netlify → Add new site → Import an existing project →
   `Dilipkumarkv/SNA-Portal`. Leave build command and publish directory empty; `netlify.toml`
   supplies `npm run build` and `dist`.
2. **Set the environment variables** (Site configuration → Environment variables, scope *Builds*):

   | Variable | Required | Effect |
   |---|---|---|
   | `VITE_GOOGLE_CLIENT_ID` | for admin sign-in | Without it the admin sign-in button is not rendered; the student portal is unaffected |
   | `VITE_ADMIN_EMAILS` | no | Comma-separated allowlist. Empty means any Google account that signs in is treated as admin |

   Both are build-time values baked into the bundle. They are public by design — never put a
   client secret or a service key in a `VITE_*` variable.
3. **Allow the site in Google Cloud** — APIs & Services → Credentials → the OAuth 2.0 client →
   Authorized JavaScript origins → add `https://<your-site>.netlify.app` (and the custom domain,
   if any). Sign-in fails with an origin error until this is done. Deploy previews have their own
   origins; add them individually if admin sign-in is needed on previews.

### Deploying

- **Git** — every push to `main` builds and publishes; pull requests get deploy previews.
- **CLI** — `npx netlify-cli deploy --build --prod` for a one-off publish from this machine
  (uses the same `netlify.toml`; requires `npx netlify-cli login` and `link` once).
- **Drag and drop** — drop the contents of `dist/` on the Netlify dashboard. `_redirects` travels
  with the build so routing still works, but the header rules in `netlify.toml` do not apply to
  drag-and-drop deploys.

### What the deploy gives you

- SPA routing: any unknown path returns `index.html` (200), so `#learn/3/1` and friends work.
- Cache policy: hashed `/assets/*` and `/workbox-*.js` for a year, `/schematics/*` for a week,
  `index.html` revalidated, `sw.js` and the manifest never cached — so a deploy reaches installed
  PWAs on the next visit.
- Security: `X-Frame-Options: DENY`, `nosniff`, `Referrer-Policy`, HSTS, a `Permissions-Policy`
  and a CSP that pins scripts to this origin plus `accounts.google.com`. Anything new loaded from
  a third-party origin must be added to the CSP in `netlify.toml` or it will be blocked in
  production while working in `npm run dev`.
- No third-party asset requests: Inter is self-hosted as two variable-font subsets in
  `src/assets/fonts/` (declared with `@font-face` in `src/index.css`), and the PWA icons are
  generated from `public/icon.svg`. Both are hashed into `/assets/` and precached by the service
  worker, so the portal renders correctly under the CSP and offline.

---

## Syllabus Mapping (25CS34I) — All 13 Weeks

The full curriculum is now extracted from the teacher-authored source documents into
`src/data/curriculum.ts` by a repeatable pipeline:

```
python tools/extract_curriculum.py       # requires: python -m pip install pypdf
```

| Source document | Extracted into |
|---|---|
| `SNA_TeachingPlan.docx` | 13 modules x 4 day-lessons — 52 lessons, 177 sections, 61 CIE questions, 97 practical tasks, 65 viva Q&A |
| `Laboratory_Manual SNA FV.pdf` | 58 experiments with aim / components / procedure / result |
| `SNA Syllabus.pdf` | 33 weekly reference links across 12 weeks |

Source documents live in `C:\Users\deep\Desktop\SNA\` (override with the `SNA_DOCS_DIR`
environment variable): `SNA Syllabus.pdf` (CO1–CO5, CIE scheme), `Laboratory_Manual SNA FV.pdf`,
`SNA_TeachingPlan.docx`, `SYSTEM AND NETWORK ADMINISTRATION.docx` (teacher's reference).

`src/data/curriculum.ts` is **generated — do not edit it by hand.** Edit the extractor and re-run.

The plan for turning this content into a learning app (modelled on learn-esp32) is in
[`WORKFLOW.md`](WORKFLOW.md).

---

## Instructions for AI / Developer Agents

1. Stack: React 19 + TypeScript + Vite + Tailwind v4
2. State: React useState/useEffect; LabContext class for terminal; localStorage events
3. Mobile rules: 44px touch targets minimum; viewport-fit=cover; responsive font scaling
4. Offline: service worker generated by vite-plugin-pwa; localStorage/IndexedDB persistence
5. Terminal engine: src/components/terminal/TerminalEngine.tsx (VFS, tokenizer, registry)
6. Schematic data: src/data/schematics.ts (`imageUrl` photograph or `svgPath` + hotspots); new photographs go in `public/schematics/` and must be added to the Workbox `globPatterns` in vite.config.ts if the format changes
7. File attachments: src/lib/fileStore.ts (IndexedDB). Never store large files in localStorage
8. New tab: Add import to App.tsx + add to BottomNav + add the id to src/types.ts
9. Build: `npm run build`; deploy via Git push or `npx netlify-cli deploy --build --prod` (see [Deploying to Netlify](#deploying-to-netlify))

---

## Known Gaps

- Admin publishing is a local demo: uploads and notices live in this browser only, so they never
  reach another student's device
- Student portal is open — there is no per-student login or progress sync between devices; a
  student's ticks stay in that browser
- `TabNotes` is gone; the 13 hand-written notes now render in the lesson's Notes tab and still
  partly overlap the generated lessons. `TabLabs` no longer uses `staticLabs.ts` — it reads
  `EXPERIMENTS`
- Schematics cover weeks 1, 2, 3, 4, 8, 10 and 11; weeks 5, 6, 7, 9, 12 and 13 show an explicit
  "no diagram for this week" state. The photographs are AI-generated renderings of the M83, not
  photos taken in the lab
- The model papers in Learn › Assessments are hand-transcribed; the source CIE PDFs are not bundled
- Offline reload has not been verified with the network actually off
- Bundle is ~886 kB (278 kB gzip). jsPDF and html2canvas are now lazy chunks (~590 kB total)
  loaded on the first PDF export; the remaining size is curriculum data and the terminal engine

---

## Future Work

- Real backend (Firestore or Postgres + object storage) to make the admin panel shared and let
  progress follow a student between devices
- Server-verified admin sessions with token expiry
- Replace the generated schematic photographs with real photos of the lab machines
- A progress-reset control in the UI (`resetProgress()` exists in `src/lib/progress.ts`)
