# SNA Exam Guide — 25CS34I

**Course:** 25CS34I — System & Network Administration (Semester 3, S.E.T Polytechnic)  
**Stack:** React 19 + TypeScript + Vite + Tailwind CSS v4 + PWA + Capacitor  
**Deploy:** Netlify (SPA) + PWA offline-first + Capacitor Android — see [Deploying to Netlify](#deploying-to-netlify)

---

## What this is

A mobile-first PWA for the SNA practical exam (M73 lab PC, 180 min, 50 marks). Five screens, zero backend:

| Screen | Route | What you get |
|---|---|---|
| **Machine** | `#machine/back` `#machine/front` `#machine/cables` `#machine/board` | Four annotated photographs of the Lenovo ThinkCentre M73: rear I/O, front panel, cable routing, motherboard. 22 hotspots total — tap a port/part, see what it is and the examiner question tied to it. |
| **Exam day** | `#day` | Seven timed blocks in paper order (24+15+30+20+20+20+51 = 180 min). Each block expands to steps, what to show the examiner, and the most likely viva question. Links jump to the relevant machine photo. |
| **Labs** | `#labs` `#labs/partition?week=8` | 44 revision cards across weeks 5–12. Filter by week, search by title. Each card: aim, tool, minutes, prerequisites, ordered procedure with stop/check warnings, expected evidence, self-check + viva Q, examiner question. Local `reviewed` + `resume` state per card. |
| **Terminal** | `#terminal` | Virtual file system + three shells (CMD, PowerShell, Bash) with 33 commands and a DiskPart interpreter. Sessions persist. Guided scenarios (partition style, DiskPart, network tests, etc.) inject the exact command sequence. |
| **CIE-5** | `#project` | The three-part portfolio: Portfolio (10), Mini project (20), Online course (20). Evidence links back to Exam Day / Labs so you copy the right numbers. |

No login. No server. All progress in `localStorage` (exam state at key `sna_exam_state_v1`, terminal sessions at `sna_terminal_sessions_v1`). Data is device-local and does not sync between phones.

---

## Quick start

```bash
npm install
npm run dev          # http://localhost:3000
npm run lint         # tsc --noEmit
npm test             # 96 test cases on Node 22
npm run build        # -> dist/ (Netlify-ready)
```

GitHub Actions runs all three on every push to `main` and on PRs (`.github/workflows/ci.yml`).

---

## Project structure (what's actually in the repo)

```
src/
├─ main.tsx                 # App entry, SW registration, ThemeProvider
├─ App.tsx                  # -> ExamPortal
├─ exam/
│  ├─ ExamPortal.tsx        # Hash router (5 tabs), focus mgmt, document.title sync
│  ├─ ExamShell.tsx         # Top bar (wordmark, exam facts, PWA prompts), bottom nav (5 tabs)
│  ├─ components/
│  │  ├─ MachineScreen.tsx  # Photo + hotspots, pinch-zoom/pan, accessibility
│  │  ├─ ExamDayScreen.tsx  # 7 phases, timed schedule, examiner views
│  │  ├─ LabsScreen.tsx     # Week filter, search, 44 cards, local reviewed state
│  │  ├─ ProjectScreen.tsx  # CIE-5 three parts, evidence links
│  │  ├─ TerminalScreen.tsx # -> components/tabs/TabTerminal.tsx
│  │  ├─ LabStage.tsx       # Single lab card: procedure, stop/check, self-check, viva
│  │  ├─ PageHead.tsx, AskBlock.tsx, RichText.tsx, Sheet.tsx, ui.ts
│  │  └─ lab-stages/        # Disk recovery, evidence, maintenance, monitoring, networking, shared
│  ├─ types.ts              # ExamState, LabId, LabWeek, MachineViewId, Drill, VivaQuestion…
│  ├─ store.ts              # localStorage sync, useSyncExternalStore, examActions
│  ├─ guide.ts              # All exam content: PHASES, Machine parts, Parts, Safety, SafetyRules
│  ├─ labs.ts               # 44 Lab cards + week membership + ordering
│  ├─ content.ts            # DRILLS (12), CIE5_PARTS, EXAM_FACTS, LAST_48, PROJECT_EVIDENCE
│  ├─ routing.ts            # Hash parse/serialize, tab ↔ view mapping
│  ├─ pwa.ts                # Install prompt, update handler, persistent storage
│  └─ generated/
│     └─ drills.ts          # Generated from exam-guide-content/drills.md
├─ components/
│  ├─ tabs/TabTerminal.tsx  # Full terminal UI (shells, sessions, scenarios, DiskPart)
│  ├─ terminal/
│  │  ├─ TerminalEngine.tsx # VFS, tokenizer, command registry, DiskPart interpreter
│  │  └─ TerminalComponents.tsx # TerminalScreen, ShellHeader/BottomBar, OfflineIndicator, SCENARIOS
│  ├─ ErrorBoundary.tsx
│  ├─ Header.tsx            # (deleted — was portal nav)
│  └─ BottomNav.tsx         # (deleted — was portal nav)
├─ context/ThemeContext.tsx # Dark mode + system preference + persist
├─ index.css                # Tailwind v4 + self-hosted Inter variable fonts + CSS vars
├─ pwa/manifest.ts          # Web app manifest (name, icons, theme color)
├─ assets/fonts/            # Inter + Inter Tight, latin + latin-ext, woff2
└─ vite-env.d.ts

public/
├─ schematics/              # 4 WebP photographs (m83-rear-io, m83-psu, m83-board, lab-network)
├─ guide/                   # (empty — reserved)
├─ screenshots/             # (empty — reserved)
├─ icon.svg                 # PWA icon source
├─ favicon.ico
└─ _redirects               # SPA fallback for Netlify drag-and-drop

tools/
├─ build-exam-content.mjs   # drills.md + viva.md -> generated/drills.ts (viva.ts not used)
└─ extract_curriculum.py    # Legacy: reads .docx/.pdf -> curriculum.ts (deleted from src)

tests/                      # 5 files, 96 cases
├─ exam-routing.test.ts     # 16 — hash parsing, tab/view mapping
├─ labs.test.ts             # 13 — 44 cards, week membership, source titles
├─ lab-stages.test.tsx      # 48 — LabStage SSR renders, accessibility, evidence text
├─ exam-store.test.ts       # 8  — storage migration, sanitation, ID validation
└─ pwa.test.ts              # 11 — install prompt logic, theme color, native detection

.github/workflows/ci.yml    # Node 22, npm ci, lint, test, build
netlify.toml                # SPA redirect, cache headers, CSP + security headers
capacitor.config.ts         # appId: in.setpoly.snaportal, webDir: dist
android/                    # Capacitor Android project (appId in.setpoly.snaportal)
```

**What is NOT in the repo anymore** (removed in the dead-code sweep):  
`src/data/curriculum.ts`, `src/components/learn/*`, `src/components/lab/*`, `src/components/schematic/*`, `src/components/assessments/*`, `src/components/tabs/TabHome/Admin/Labs/Links`, `src/lib/storageService.ts`, `src/lib/progress.ts`, `src/lib/googleAuth.ts`, `src/lib/downloadPdf.ts`, `src/lib/fileStore.ts`, `src/lib/routing.ts`, `src/lib/storageSchema.ts`, `src/types.ts`, `src/exam/components/Plan/Drills/VivaScreen.tsx`, `src/exam/generated/viva.ts`, `src/exam/useNow.ts`, and their tests. The old "portal" (13 weeks × 4 lessons, admin panel, Google OAuth, schematic viewers, lab explorer) was a different product that the entry point never reached.

---

## Deploying to Netlify

**Git CD (recommended)** — push to `main`; Netlify runs `npm run build` and publishes `dist/`.  
**CLI** — `npx netlify-cli deploy --build --prod` (after `npx netlify-cli login` and `link` once).  
**Drag & drop** — drop `dist/` on the Netlify dashboard; `_redirects` travels but `netlify.toml` headers do not.

### Build output guarantees
- SPA routing: unknown paths return `index.html` (200), so `#machine/back` works.
- Cache: hashed `/assets/*` + `/workbox-*.js` → 1 year; `/schematics/*` → 1 week; `index.html` revalidated; `sw.js` + `manifest.webmanifest` never cached.
- Security headers (from `netlify.toml`): `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, HSTS, `Permissions-Policy`, and a CSP pinning scripts to `self` + `accounts.google.com`. New third-party script origins must be added to the CSP or they'll be blocked in production.
- Self-hosted fonts: Inter + Inter Tight variable subsets in `src/assets/fonts/` declared via `@font-face` in `src/index.css`. PWA icons generated from `public/icon.svg`. All hashed and precached by the service worker.

---

## Content pipeline (exam guide only)

The exam guide's prose lives in two markdown files and is compiled to typed arrays:

```bash
npm run exam:content   # or npm run prebuild (runs before build)
```

| Source | Output | Validation |
|---|---|---|
| `exam-guide-content/drills.md` | `src/exam/generated/drills.ts` (`DRILLS: Drill[]`) | Must yield **exactly 12 drills**; each drill must have steps, `prove`, `traps` |
| `exam-guide-content/viva.md`  | Not used — the viva answers are in `src/exam/guide.ts` | — |

The content builder throws if counts don't match, so a missing drill or viva question fails the build.

---

## Key implementation notes

- **Exam state** (`src/exam/store.ts`): Versioned v1 envelope, `useSyncExternalStore` for React 18 concurrent safety, `storage` event listener so tabs stay in sync, graceful quota handling.
- **Terminal engine** (`src/components/terminal/TerminalEngine.tsx`): VirtualFileSystem with directories/files/permissions, command tokenizer, 33 built-in commands (CMD/PS/Bash), DiskPart sub-interpreter (`list disk`, `select disk`, `create partition`, `format`, `assign`), session persistence (`saveLabState`/`loadLabState`).
- **Accessibility**: skip link in `ExamShell`, focus moved to `<h1>` on route change, 126 `aria-*` attributes, 44 px touch targets, `viewport-fit=cover`, safe-area insets.
- **PWA**: `vite-plugin-pwa` with Workbox; install prompt on Android, iOS "Add to Home Screen" banner; `prompt` registration; `globPatterns` includes `webp` for the schematic photos.
- **Capacitor**: `appId: in.setpoly.snaportal`, `backgroundColor: #f2eee3`. Android project in `android/` builds with `npx cap sync && npx cap open android` (requires Android SDK, not in this repo).
- **Tests**: Node 22 `node:test` + `tsx`. The test runner on this device crashes `tsx`/`esbuild` (binary spawn issue), so CI is the authoritative run — it passes 96 cases.

---

## Known gaps (honest)

- No backend → progress does not follow the student to another device.
- No per-student login → anyone with the URL sees the same exam guide.
- The admin panel and Google OAuth code were deleted; if you need shared publishing, add a backend (see `WORKFLOW.md`).
- `src/pwa/manifest.ts` and `src/vite-env.d.ts` are technically unreachable from the import graph (used by Vite/Capacitor config) — they stay.
- `viva.ts` was generated but never wired into a live screen; `drills.ts` feeds `content.ts` → `ProjectScreen` and the LAST_48 checklist.
- Offline reload not tested with network actually off.
- Schematic photographs are AI-generated WebP renderings of the M83, not photos taken in the lab.
- Only weeks 5–12 have lab cards (44 total); the syllabus has 58 experiments across 13 weeks. Weeks 1–4 and 13 are uncovered.

---

## Future work

- Real backend (Firestore or Postgres + object storage) to share admin uploads and sync progress.
- Server-verified admin sessions with token expiry.
- Replace AI-generated schematic photographs with real lab photos.
- Add a progress-reset control in the UI (`reset()` exists in `store.ts`).
- Extend lab coverage to weeks 1–4 and 13 if the syllabus requires it.
