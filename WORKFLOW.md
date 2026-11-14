# SNA Exam Guide — Content Pipeline & Build Workflow

This document describes how the exam guide's content is authored, validated, and built. It replaces the old portal workflow (which targeted a 13-week Learn workspace, Lab Explorer, and admin panel) with the current exam-cram pipeline.

---

## 1. Sources of Truth

| Document | What it feeds | Format | Status |
|---|---|---|---|
| `exam-guide-content/drills.md` | 12 timed drills → `src/exam/generated/drills.ts` | Markdown (structured) | **Active** — edited by hand, compiled on build |
| `exam-guide-content/viva.md` | 30 viva answers → (not compiled) | Markdown | **Reference only** — answers live in `src/exam/guide.ts` |
| `SNA_TeachingPlan.docx` | Legacy curriculum extractor → `src/data/curriculum.ts` | Word | **Orphaned** — extractor kept, output deleted |
| `Laboratory_Manual SNA FV.pdf` | Legacy curriculum extractor | PDF | **Orphaned** |
| `SNA Syllabus.pdf` | Legacy curriculum extractor | PDF | **Orphaned** |

**Rule:** Only `drills.md` is compiled into the live app. Everything else is either hand-authored in TypeScript (`guide.ts`, `labs.ts`, `content.ts`) or orphaned legacy.

---

## 2. The Active Pipeline: Drills

### Authoring `drills.md`

Each drill is a `## Drill N — Title` section with required blocks:

```markdown
## Drill 1 — Hardware specification and compatibility report

**Time:** 12 min
**Phase:** Look, then write
**Viva:** Q1 Q2

### Steps
1. Power off and unplug. Name the front ports, then the rear ports...
   - Sub-step detail
2. Open the side panel and name six things on the board...

### Commands
```
msinfo32
systeminfo
```

### Prove
Read the five-line compatibility statement aloud.

### Traps
Don't forget the 4-pin CPU power connector.

### Note
The H81 board only supports DDR3.
```

Required blocks (parser throws if missing):
- `**Time:**` — integer minutes
- `**Phase:**` — matches one of the 7 `PHASES` in `guide.ts`
- `**Viva:**` — space-separated `Q<number>` references
- `### Steps` — numbered list; sub-steps allowed as `-` bullets
- `### Commands` — fenced code block (optional but validated)
- `### Prove` — single line
- `### Traps` — single line
- `### Note` — single line

### Compilation

```bash
npm run exam:content
# or (runs automatically before build)
npm run prebuild
```

**What happens:**
1. `tools/build-exam-content.mjs` parses `drills.md` → array of `Drill` objects
2. Validates: exactly 12 drills; every drill has steps, `prove`, `traps`
3. Writes `src/exam/generated/drills.ts` with `export const DRILLS: Drill[] = [...]`
4. TypeScript import makes it available to `content.ts` → `DRILL_GROUPS`, `DRILL_MINUTES`

**Failure modes:**
- Wrong drill count → `Error: Expected 12 drills, found N`
- Missing required block → `Error: Incomplete drill parse: 3, 7`
- Markdown syntax drift (e.g., `**Time:** 12min` without space) → parse yields 0, validation fails

---

## 3. Hand-Authored Content (TypeScript source)

These files are edited directly — no build step, no extractor:

| File | What it holds | Change when |
|---|---|---|
| `src/exam/guide.ts` | `PHASES` (7 exam blocks), `GuideView[]` (4 machine photos + 22 hotspots), `Part[]` (6 machine parts), `SafetyRule[]` | Exam timing changes, new hotspot, part spec update |
| `src/exam/labs.ts` | 44 `Lab` cards, `LAB_WEEKS`, `labsForWeek()` ordering | New lab card, week reassignment, procedure change |
| `src/exam/content.ts` | `DRILL_GROUPS`, `EXAM_FACTS`, `CIE5_PARTS`, `LAST_48`, `PROJECT_EVIDENCE` | Drill minutes change (auto from `DRILLS`), CIE-5 parts change, evidence links change |
| `src/exam/routing.ts` | Hash parsing/serialization for 5 tabs | New tab added, tab renamed, week filter logic change |

**Adding a lab card:**
1. Add the `Lab` object to `LABS` array in `labs.ts` (or to the appropriate `weekXX.ts` partial)
2. Ensure `id` is in `LAB_IDS` in `types.ts`
3. Ensure `week` matches a `LabWeek` (5–12)
4. Run `npm run lint` — typecheck will catch missing fields

**Adding a machine hotspot:**
1. Add a `GuidePoint` to the relevant `GuideView.points` in `guide.ts`
2. Coordinates `x,y` are percentages (0–100) on the photo
3. Add a link from the relevant `Phase.links` if the exam block should jump there

---

## 4. Build & Validation Gates

| Gate | Command | What it catches |
|---|---|---|
| **Typecheck** | `npm run lint` (`tsc --noEmit`) | Type errors, missing imports, signature drift |
| **Content validation** | `npm run exam:content` (runs in `prebuild`) | Drill count, required blocks, viva reference format |
| **Tests** | `npm test` | Routing, lab data integrity, LabStage renders, storage migration, PWA logic |
| **Build** | `npm run build` (`vite build`) | Bundle compiles, PWA manifest + SW generated, assets copied |

**CI runs all four** on Node 22 (`.github/workflows/ci.yml`). A push to `main` or a PR must pass all four.

---

## 5. Deploy

| Target | Trigger | Command |
|---|---|---|
| Netlify (prod) | Git push to `main` | `npm run build` → `dist/` |
| Netlify (preview) | Any PR | Same |
| Local CLI | Manual | `npx netlify-cli deploy --build --prod` |
| Drag & drop | Manual | Drop `dist/` on Netlify dashboard |

**Capacitor Android (not in CI):**
```bash
npx cap sync          # copies dist/ to android/app/src/main/assets/public
npx cap open android  # opens Android Studio
# Build APK/AAB from there
```
Requires Android SDK (API 30+), not installed in the repo.

---

## 6. Adding a New Screen (Tab)

The exam guide has 5 tabs. To add a 6th:

1. Add the tab ID to `ExamTab` in `src/exam/types.ts`
2. Add a case to `parseExamHash` / `examHash` in `src/exam/routing.ts`
3. Create `src/exam/components/NewScreen.tsx`
4. Wire it in `ExamPortal.tsx` (import, add to the render switch)
5. Add a nav entry to `NAV` in `ExamShell.tsx` (icon, label)
6. Add the icon to the `lucide-react` imports if new
7. Run `npm run lint` and `npm test`

**Do not** add to `BottomNav.tsx` or `Header.tsx` — those were the old portal's nav and were deleted.

---

## 7. Legacy Artifacts (kept for reference, not used)

| Path | What it was | Why it's still here |
|---|---|---|
| `tools/extract_curriculum.py` | Read `.docx`/`.pdf` → `src/data/curriculum.ts` | Source documents exist locally; extractor proves the mapping |
| `src/data/curriculum.ts` (deleted) | 52 lessons, 58 experiments, 65 viva, 61 CIE questions | Output of the extractor; the portal that consumed it is gone |
| `src/lib/storageService.ts` (deleted) | `localStorage` CRUD for announcements, CIE, notes, labs | Admin panel backend; admin panel deleted |
| `src/lib/googleAuth.ts` (deleted) | `@react-oauth/google` wrapper, `VITE_ADMIN_EMAILS` allowlist | Admin panel auth; admin panel deleted |
| `src/exam/generated/viva.ts` (deleted) | Compiled from `viva.md` | Never wired into a live screen; answers are in `guide.ts` |

**Do not** run `python tools/extract_curriculum.py` expecting useful output for the current app — its output (`curriculum.ts`) is deleted and no live code imports it.

---

## 8. Quick Reference

| Task | Command |
|---|---|
| Dev server | `npm run dev` (port 3000, host 0.0.0.0) |
| Typecheck | `npm run lint` |
| Content build only | `npm run exam:content` |
| All tests | `npm test` |
| Single test file | `node --import tsx tests/exam-routing.test.ts` |
| Production build | `npm run build` |
| Preview build | `npm run preview` |
| Update Capacitor | `npx cap sync` |
| Netlify deploy (CLI) | `npx netlify-cli deploy --build --prod` |

---

## 9. Decisions Recorded Here

| Date | Decision | Reason |
|---|---|---|
| 2026-11-13 | Deleted portal code (44 files, 12k lines) | Unreachable from entry point; drifted from exam guide |
| 2026-11-13 | Kept only `drills.md` as compiled content | Single source of truth for the only repeatable pipeline |
| 2026-11-13 | Moved viva answers to `guide.ts` (hand-authored) | `viva.md` parser was brittle; 30 answers stable enough to edit in TS |
| 2026-11-13 | Dropped 11 npm dependencies | Only 8 runtime deps now; smaller `npm ci`, smaller bundle |
| 2026-11-13 | Renamed package `react-example` → `sna-portal` | Truth in labeling |

---

## 10. If You Need the Old Portal Back

The portal (13-week Learn workspace, Lab Explorer, admin panel, schematic viewers, Google OAuth) existed at commit `0a7392e` (the parent of the sweep). To restore:

```bash
git checkout 0a7392e -- src/components/learn src/components/lab src/components/schematic src/components/assessments src/components/tabs/TabHome.tsx src/components/tabs/TabAdmin.tsx src/components/tabs/TabLabs.tsx src/components/tabs/TabLinks.tsx src/data src/lib/storageService.ts src/lib/progress.ts src/lib/googleAuth.ts src/lib/fileStore.ts src/lib/downloadPdf.ts src/lib/routing.ts src/lib/storageSchema.ts src/types.ts src/exam/components/PlanScreen.tsx src/exam/components/DrillsScreen.tsx src/exam/components/VivaScreen.tsx src/exam/generated/viva.ts src/exam/useNow.ts
# Then restore package.json deps and tests as needed
```

But the entry point (`App.tsx` → `ExamPortal`) will still render the exam guide. You'd need to revert `App.tsx` and `main.tsx` too. The sweep was intentional — the portal was a different product that the course no longer uses.
