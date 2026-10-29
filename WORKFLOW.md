# SNA Learning App — Build Workflow

Turns the SNA Portal from a *document viewer* into a *learning app*, modelled on
[learn-esp32.vercel.app](https://learn-esp32.vercel.app/).

**Status:** Phases 0–5 shipped. Phase 6 mostly shipped — offline audit and an accessibility pass
remain, plus the backend question in section 9.

---

## 1. Sources of truth

All curriculum content lives in four teacher-authored documents. Nothing in the app should be
written by hand that already exists in these files.

| Document | What it yields | Extracted? |
|---|---|---|
| `SNA_TeachingPlan.docx` | 13 weeks x 4 day-lessons. Each lesson has What / Why / How sections, CIE questions, quick-revision points. Each week has *Previous Unit Summary*, *Connection to This Unit*, *Syllabus Coverage*, a **LAB SESSION** title, **Practical Tasks**, and **Viva Questions & Answers**. | Yes |
| `Laboratory_Manual SNA FV.pdf` | 58 experiments, each with aim, components, procedure, result. | Yes |
| `SNA Syllabus.pdf` | Weekly reference links (33 across 12 weeks), CIE assessment pattern, CO/PO mapping. | Links yes |
| `SYSTEM AND NETWORK ADMINISTRATION.docx` | Teacher's guide: analogy cues, pivot points, rural-Karnataka pedagogy notes. | No — read as prose when writing lesson copy |
| `QP PT SNA.pdf`, `SNA Practice Test QP.pdf` | Question papers for CIE-1..CIE-4. | Not extracted — the model questions in Learn › Assessments were transcribed by hand |

### Phase 0 — content pipeline (done)

`tools/extract_curriculum.py` reads the documents and emits `src/data/curriculum.ts`.

```
python tools/extract_curriculum.py
```

Current output, verified:

| Module | Lessons | Practical tasks | Viva Q&A | Experiments | Reference links |
|---|---|---|---|---|---|
| W01 Hardware Fundamentals | 4 | 6 | 5 | 3 | 2 |
| W02 SMPS and Power Supply | 4 | 6 | 5 | 4 | 3 |
| W03 Motherboard Architecture | 4 | 6 | 5 | 5 | 2 |
| W04 Chipset and Boot Process | 4 | 6 | 5 | 1 | 3 |
| W05 OS Installation | 4 | 6 | 5 | 4 | 3 |
| W06 Command Line and Users | 4 | 6 | 5 | 1 | 4 |
| W07 OS Config and Troubleshooting | 4 | 6 | 5 | 2 | 3 |
| W08 File Systems and Recovery | 4 | 8 | 5 | 5 | 2 |
| W09 Maintenance and Drivers | 4 | 7 | 5 | 9 | 2 |
| W10 Network Configuration | 4 | 13 | 5 | 11 | 5 |
| W11 Advanced Networking and VPN | 4 | 6 | 5 | 8 | 2 |
| W12 E-Waste Management | 4 | 5 | 5 | 5 | 2 |
| W13 Lab Layout and Mini Project | 4 | 16 | 5 | 0 | 0 |
| **Total** | **52** | **97** | **65** | **58** | **33** |

Also in the generated file: 177 lesson sections, 61 CIE questions, 10 quick-revision key points.

Two data decisions worth knowing:

- **Experiment ids are sequential 1–58**; the manual's own printed number is kept in
  `manualNumber`. The manual prints two different "Experiment 47" and skips 18/19, so ids
  cannot be the printed number.
- **Experiment → week is a hand-written table** (`EXPERIMENT_WEEKS` in the extractor), derived by
  matching each experiment's topic to that week's Practical Tasks. It is one reviewable constant
  — change it there, not in the output.

---

## 2. Where the app is today

| Capability | Before | Shipped |
|---|---|---|
| Theory content | 13 hand-written notes (`staticNotes.tsx`) | 52 lessons from the teaching plan, in `#learn` |
| Lab content | 13 hand-written labs (`staticLabs.ts`) | 58 experiments, searchable, in `#lab` |
| Reference links | 25 hand-written | 33 from the syllabus, per week (Lessons Overview tab + `#links`) |
| Lesson navigation | Flat tab bar, one screen per topic | Week rail + day chips + 6-tab lesson pane (`LearnWorkspace`, `LessonPane`) |
| Schematics | 4 generic SVGs, 24 hotspots, opened as a modal | 7 diagrams for the real lab machine, 49 hotspots: photographs for physical hardware, SVG for sequences |
| Terminal | 26 commands, standalone tab | 33 commands, plus a `TryItTab` console embedded per week |
| Progress | Not persisted | `sna_progress_v1`: per-lesson + per-experiment completion, `lastLesson`, resume card on `#home` |
| Assessment | Static QP links | Learn › Assessments: model papers, `VivaBank` (65), `QuestionBank` (61) |
| Long-form notes | Separate Notes tab | Notes tab inside the lesson, per week |

The Notes and QPs tabs are gone: a nav bar with eight items was crowding the 390px phone, and both
screens were really per-week or per-course content that the Learn workspace already knew how to
scope. `#notes` and `#qps` still resolve to their new homes.


---

## 3. Reference app anatomy → SNA

`learn-esp32` is a 3D lesson player: left icon rail, a lesson list, a 3D canvas beside a lesson
pane with tabs, a progress counter, and a live serial monitor. Its course phases read
*Explore · Build · Connect · Create*.

SNA cannot ship a 3D model of a motherboard, but every other part of the anatomy transfers.

| learn-esp32 | SNA equivalent | Built from |
|---|---|---|
| Rail: Home, Lessons, Components, Reference, Settings, Language | Home, **Learn**, Labs, Terminal, Tracker, Links | `BottomNav` + new Learn tab |
| 20 numbered lessons, one-line hook each | 13 weeks x 4 days = **52 numbered lessons**, hook = first line of the lesson's *What* section | `curriculum.ts` |
| 3D canvas (drag / Q-E rotate / scroll zoom) | **Schematic tab** — photograph or SVG of the lab hardware with zoom buttons and an indexed hotspot list; modal expand for pan/pinch | `SchematicPane`, `SchematicViewer` |
| Lesson tabs: Schematic, Basics, Overview, Pinout, Example, Specifications | Basics, Overview, Notes, Schematic, Try it, Q&A | `LessonPane` |
| "Pinout" tab (ESP32 pin diagram) | Hotspot list inside the Schematic tab — label, description, specs, common issues | `schematics.ts` hotspots |
| "Example" tab (Arduino sketch) | "Try it" tab — the commands for that lesson's lab, runnable | `TerminalEngine` |
| "Specifications" tab | Not a tab — spec tables live inside the What / How bodies (see section 4) | lesson sections |
| Progress "0/20" | "n/52 lessons" in the hero + per-week completed/total in the rail | `progress.ts` |
| Serial monitor (live) | Virtual terminal, 33 commands, CMD/PowerShell/Bash | `TerminalEngine` |
| Explore · Build · Connect · Create | **Explore · Build · Secure · Connect · Create** (see below) | new |
| Reference section | Per-week reference links from the syllabus | `curriculum.ts` |

### Course phases

| Phase | Weeks | Theme |
|---|---|---|
| Explore | 1–3 | Hardware, SMPS, motherboard |
| Build | 4–6 | Chipset and boot, OS installation, command line |
| Secure | 7–9 | OS configuration and troubleshooting, file systems, maintenance and drivers |
| Connect | 10–11 | Network configuration and security, virtualization and VPN |
| Create | 12–13 | E-waste management, lab layout and mini project |

---

## 4. Information architecture

Hash routing, as the app already uses (no router library):

```
#home               dashboard — announcements, CIE schedule, resume-where-you-left-off card
#learn              lessons mode, falls back to lastLesson or week 1 day 1
#learn/3/2          week 3, day 2 — the real route; browser/hardware back work
#learn/assessment   Assessments mode — model papers, viva bank, CIE question bank
#labs               58 experiments — search + week filter + guided-lab runner
#terminal           standalone terminal
#links              reference library, filterable by week
#admin              local-demo publishing panel (unchanged)

#notes  -> #learn   (legacy)
#qps    -> #learn/assessment   (legacy)
```

Learn is one tab with two modes, not two routes with separate tabs. `learn/w3/2` and
`learn/assessment` are hash states inside it, so the browser back button and the Android hardware
back button both work the way they already do for tabs.

The day is part of the lesson hash, not just the week: the original plan had `#learn/w3` opening
the week's carousel. Linking a specific lesson turned out to be the thing the resume card and the Q&A
bank actually needed, so the route carries both numbers.

Merging Notes and QPs into Learn was a later call, made after the eight-item bottom bar proved too
tight on a 390px phone. Both were already keyed by week or by course, which is exactly what the
Learn workspace scopes.



### Lesson workspace layout

The signature of `learn-esp32` is a schematic beside the lesson. That works on a laptop and does
not work on a 360px phone, which is the primary device here. So the layout is two-column only
from `lg` up, and a single scrolling column with tabs below that.

```
lg and up                                          below lg
┌─────────────────────────────────────────────┐    ┌───────────────────────┐
│ HERO  · 13 weeks · 52 lessons · n/52        │    │ HERO  n/52 lessons    │
├───────────────┬─────────────────────────────┤    ├───────────────────────┤
│ WEEK RAIL     │ 1 2 3 4  day chips          │    │ W1 W2 W3 … (scroll)   │
│ W1 Hardware   ├─────────────────────────────┤    ├───────────────────────┤
│ W2 SMPS       │ Lesson title · Mark complete│    │ 1 2 3 4  day chips    │
│ W3 ▸Motherbrd │ Basics Overview Sche…       │    ├───────────────────────┤
│ …             │                             │    │ Basics Overview Sche… │
│ (220px)       │  lesson body                │    │  lesson body          │
│               │  Schematic tab: photo/SVG   │    │  Schematic tab: photo │
│               │  Try it tab: [terminal]     │    │  Try it: [terminal]   │
└───────────────┴─────────────────────────────┘    └───────────────────────┘
```

The schematic did not become a permanent side pane. A third column on a 1280px screen leaves the
lesson body too narrow once the terminal tab is open, and on tablets it collapses to nothing. It
lives as a tab (`SchematicPane`) instead, with zoom buttons, an indexed hotspot list that works
without hover, and an expand action.


### Lesson tabs, and what fills each

Six tabs. Two from the original draft were cut, and one was added when Notes moved in:

- **Layout** was cut because the schematic pane already owns the hotspots — a separate tab showed
  the same data twice.
- **Specs** was cut because filling it meant guessing which lesson sections "look tabular". That
  heuristic misfires. Specification content lives inside the What / How bodies and renders there.
- **Notes** was added from the retired Notes tab: the week's long-form note, its PDF download, any
  admin attachment, and its reference links.

| Tab | Content | Source |
|---|---|---|
| **Basics** | What / Why / How sections, one card per section | `lesson.sections` |
| **Overview** | Syllabus coverage, previous-unit summary, connection to this unit, the week's lab session and its practical tasks, reference links | `module.*` |
| **Notes** | The week's hand-written or admin-uploaded note, with PDF download, attachment and links | `staticNotes.tsx` + `storageService` |
| **Schematic** | The diagram for that week — a photograph of the lab machine for hardware, SVG for sequences; tap a hotspot for label, description, specs, common issues; expand to full screen | `schematics.ts` |
| **Try it** | The commands for that week's practical tasks, runnable inline against the virtual filesystem | `lessonCommands.ts` + `TerminalEngine` |
| **Q&A** | Viva questions for the week (reveal answer), plus this lesson's CIE questions | `module.viva`, `lesson.questions` |

Notes is week-scoped, not day-scoped, so all four days of a week show the same note. That is
deliberate: it is the reading the student returns to, not new material each day.

### Assessments mode

`AssessmentBank` sits in the same tab as the lessons, behind the Lessons / Assessments switch.
It carries the four model papers (CIE-1 and CIE-3 theory, CIE-2 and CIE-4 scenario tasks), the
65-question viva bank and the 61-question CIE bank. Progress counters stay visible in the hero so
the switch does not hide where the student is.

The **Schematic** tab renders inline in the pane on `lg`, and appears as a tab below `lg`. The
inline viewer uses zoom buttons and an expand action rather than pinch-zoom: a pinch-zoom canvas
nested inside a scrolling page fights the page scroll on touch. Expanding opens the existing
full-screen `SchematicViewer`. The same viewer opens from the lab explorer: a **View Schematic**
button in the experiment detail panel, shown only for weeks that have a diagram.

#### Photographs for hardware, SVG for sequences

The lab machines are Lenovo ThinkCentre M83 towers: H81 board, LGA 1150, 4 DDR3 slots with
2×4 GB fitted, SATA SSD in SATA 0 and HDD in SATA 1, integrated Intel graphics (VGA +
DisplayPort), empty PCIe x16, no M.2 or NVMe, proprietary 240 W PSU, no PCIe power leads.
A line drawing of "a motherboard" teaches the wrong hardware, so the four physical diagrams are
photographs of that machine — rear I/O and cables (week 1), PSU (week 2), H81 board (week 3),
the lab itself (week 10) — stored as WebP in `public/schematics/` and precached by Workbox.
Hotspots are percentage positions over the image, so they track the photograph at any width.

A photograph cannot show order or structure, so weeks 4 (boot sequence), 8 (disk layout) and 11
(RDP / VPN paths) stay as inline SVG. Each marker is a 24 px dot inside a 44 px button, which
keeps the touch target without covering the small labels in the vector diagrams.

---

## 5. Data model

`src/data/curriculum.ts` (generated):

```ts
interface Lesson {
  number: number;             // 1..4 within the week
  title: string;
  overview: string;
  sections: { heading: string; body: string[] }[];   // 177 total
  questions: string[];         // 61 CIE questions
  keyPoints: string[];         // 10 quick-revision lines
}

interface Module {
  id: number;                  // 1..13
  title: string;
  previousSummary: string;
  connection: string;
  syllabusCoverage: string[];
  labTitle: string;
  practicalTasks: { topic: string; detail: string }[];   // 97 total
  viva: { number: number; question: string; answer: string }[];  // 65 total
  lessons: Lesson[];           // 52 total
  experimentIds: number[];     // into EXPERIMENTS
  references: { label: string; url: string }[];         // 33 total
}

interface Experiment {
  id: number;                  // 1..58, sequential
  manualNumber: number;        // as printed in the manual
  week: number;
  title: string;
  aim: string;
  components: string[];
  procedure: string[];
  result: string;
}
```

New types to add in Phase 1:

```ts
interface LessonProgress {
  completed: boolean;
  completedAt: string | null;  // ISO timestamp
}

interface CourseProgress {
  version: 1;
  lessons: Record<string, LessonProgress>;  // key: `${week}.${day}`
  experiments: Record<string, boolean>;      // key: experiment id
  lastLesson: { week: number; day: number } | null;
}
```

Stored in `localStorage` under `sna_progress_v1`. Same device-scoped model as the rest of the app —
progress does not follow the student to another phone unless a backend is added (Phase 6, optional).

---

## 6. Reusable assets in the current codebase

Do not rewrite these — reuse them.

| Asset | Path | Use in the learning app |
|---|---|---|
| Virtual terminal | `src/components/terminal/TerminalEngine.tsx` | The "Try it" tab. 33 commands, VFS, DiskPart sub-commands, firewall/user state, session save/load. |
| Terminal UI | `src/components/terminal/TerminalComponents.tsx` | Embeddable terminal panel; the compact variant is what `TryItTab` runs. |
| Schematic viewer | `src/components/schematic/SchematicViewer.tsx` | Full-screen expand target for `SchematicPane`. Pan, pinch-zoom, hotspot popovers. |
| Schematic data | `src/data/schematics.ts` | 7 diagrams, 49 hotspots with specs and common issues — weeks 1, 2, 3, 4, 8, 10, 11. Four are photographs (`imageUrl`), three are SVG (`svgPath`). |
| Schematic photographs | `public/schematics/*.webp` | M83 rear I/O, PSU, H81 board and the lab room, 1400 px wide, ~660 KB total. |
| Guided lab | `src/components/lab/GuidedLab.tsx` | Step-by-step checklist per experiment, launched from `LabExplorer`. |
| Lab scenarios | `src/data/labScenarios.ts` | Terminal walkthroughs for the guided labs. Every command in them is runnable. |
| File store | `src/lib/fileStore.ts` | Attachments (PDF manuals) — already working end to end. |
| Storage service | `src/lib/storageService.ts` | Publishing model for the admin panel. |
| Theme | `src/context/ThemeContext.tsx` | Dark mode throughout. |
| Toasts, motion, cards | `react-hot-toast`, `motion`, `Card` | Existing visual language. |

New in this build: `src/components/learn/*` (workspace, lesson pane, notes tab, assessment bank,
schematic pane, try-it), `src/components/lab/LabExplorer.tsx`,
`src/components/assessments/{VivaBank,QuestionBank}.tsx`, `src/data/lessonCommands.ts`,
`src/lib/progress.ts`.

The old `TabNotes` (13 notes) and `TabLabs` (13 labs) are replaced by the Learn Notes tab and the
Lab explorer, but their *publishing* half stays: the admin panel can still attach a PDF to a week or
experiment, which is how a teacher distributes the real manual.

---

## 7. Build phases

### Phase 0 — content pipeline ✅ done

- `tools/extract_curriculum.py` → `src/data/curriculum.ts`
- Verified: 13 modules, 52 lessons, 58 experiments, 97 tasks, 65 viva, 33 links, all URLs clean.

### Phase 1 — course shell ✅ shipped

Shipped as: `src/components/learn/LearnWorkspace.tsx` (week rail, day chips, progress),
`src/components/learn/LessonPane.tsx` (tabs), `src/lib/progress.ts`, `TabId` `'learn'`,
`#learn/{week}/{day}` routing in `App.tsx`, Learn item in `BottomNav`.

Deviations from the plan:

- No `LessonTabs.tsx` or `ProgressRing.tsx` components. The tab bar is 12 lines inside
  `LessonPane` and the counter is a thin bar inside the hero; separate files would have been
  indirection without reuse. The per-week "ring" became a completed/total label per week in the rail.
- No `useProgress()` hook. `subscribeProgress(cb)` returns the unsubscribe function directly, so
  `useEffect(() => subscribeProgress(...), [])` needs no wrapper. React 19 typing rejected passing
  `key` to `LessonPane`, so tab and accordion state resets via `useEffect` on `[week, day]`.

Acceptance met: all 52 lessons render title, sections, questions, key points; ticking a lesson
updates the counter; reload restores it.

### Phase 2 — lesson tabs ✅ shipped (with cuts)

Shipped as `LessonPane` + `SchematicPane` + `SchematicViewer` (modal expand).

The **Layout** and **Specs** tabs were cut before building them; reasons are in section 4. The
**Schematic** tab shows an honest empty state for the 6 weeks without a diagram rather than reusing
a neighbouring one, which would teach the wrong hardware.

Acceptance met: switching weeks swaps the tab content; hotspots open by click and by the indexed
list (so touch works without hover); Q&A reveals answers.

### Phase 3 — Try it yourself ✅ shipped

Shipped as `src/data/lessonCommands.ts` + `src/components/learn/TryItTab.tsx`.

Two problems surfaced here that were not in the plan:

- `resolvePath` in the VFS requires a drive letter, so `md LabFolder`, `cd Users` and `type note.txt`
  all failed. The lesson command sets and the guided-lab scenarios were rewritten to use absolute
  paths (`C:\Users\Student\readme.txt`). The parser was not loosened — a real `cmd.exe` resolves
  relative paths, but a permissive fallback would have hidden genuine path mistakes in the content.
- `diskpart`, `net user`, `netsh advfirewall`, `copy`, `move`, `ren`, `format` and `defrag` are
  taught in weeks 6, 8 and 10 and were not implemented. Rather than deleting the lessons, they were
  added: the terminal went from 26 to 33 commands, with a DiskPart sub-command interpreter
  (`list disk|volume|partition`, `select disk|partition`, `detail disk`, `create partition primary`)
  and mutable firewall/user state per lab context.

Acceptance met: every command advertised in a lesson or a guided lab returns virtual output; two
throwaway harnesses replayed all 52 lessons' commands and all lab scenarios to prove it.

### Phase 4 — lab workspace ✅ shipped

Shipped as `src/components/lab/LabExplorer.tsx` inside `TabLabs`; `STATIC_LABS_DATA` deleted.

- Search + week filter over all 58 experiments; list/detail split at `lg`, stacked below.
- Procedure is a local checklist that resets when the selection changes; experiment completion is
  persisted in `sna_progress_v1`.
- The week's Practical Tasks render above the experiment, and `GuidedLab` still launches the
  scenario terminal.
- Admin-attached manuals render under "Uploaded Manuals", and only when something is uploaded —
  the old empty-state card implied a feature that was not doing anything.

### Phase 5 — assessment ✅ shipped

1. **QPs**: the CIE-1..CIE-4 cards stay as the hand-transcribed model papers, now under Learn ›
   Assessments. The source PDFs are not bundled and no download link was invented for them —
   distributing a paper is the admin upload path's job, not the build's.
2. **Viva bank**: `VivaBank` renders all 65 questions with search and week chips, multi-open
   accordions.
3. **CIE question bank**: `QuestionBank` renders all 61 `lesson.questions` tagged week/day/lesson.

The "mark as known" toggle that would feed progress was dropped. A viva question is not a lesson
unit, and mixing it into the lesson counter would make the 52-lesson denominator a lie.

### Phase 6 — polish ✅ mostly shipped

1. Progress persists; `resetProgress()` exists in `progress.ts` (not yet surfaced in the UI).
2. `TabHome` has the resume card: week/day, lesson title, `n/52` bar, Resume/Begin button into
   `#learn/{week}/{day}`.
3. **Open:** offline audit (curriculum is bundled in JS, so it should precache, but this has not
   been verified with the network off) and the accessibility pass (focus rings and hotspot
   `aria-label`s are partially done).
4. README and PROJECT_REPORT updated with the real counts.


---

## 8. Verification

Completed for this build:

```
npx tsc --noEmit          # clean
npm run build             # succeeds
```

In the browser, at 390px and at desktop width:

- `#learn` opens the last lesson or week 1 day 1; all 13 weeks and 52 lessons render.
- Toggle a lesson done → hero counter and Home card both move; reload holds (`sna_progress_v1`).
- Terminals: the Try-it console, the standalone `#terminal`, and the guided-lab scenario runner all
  execute the same commands with the same output.
- `#labs` filters to 5 experiments for a week-3 search; procedure checklist resets on selection.
- `#learn/assessment` reports 65/65 viva and 61/61 questions; the Notes tab renders the week's note
  and its download id resolves.
- `#notes` and `#qps` resolve to `#learn` and `#learn/assessment` without adding a history entry.
- Console: no errors on any tab.

Not verified: offline reload with the network off, and screen-reader output for the hotspot list.

---

## 9. Open decisions

1. **Backend or not.** Everything today is device-scoped: admin content, published notes, and
   progress. If students are to share progress or see a teacher's uploads on their own
   phone, a backend is needed — Firebase is the shortest path given the app is already
   client-side, but it changes the security posture and the "local demo" labelling.
2. **Source typos.** The teaching plan contains a few — "Ashram is called volatile" for "RAM is
   called volatile", "he green LED" for "The green LED". The extractor reproduces the source
   verbatim rather than silently rewriting the teacher's words. These should be fixed in the
   `.docx` and the pipeline re-run, not patched in the extractor.
3. **3D versus schematic.** The reference app's centrepiece is a 3D board. SNA ships photographs
   and 2D SVG. A 3D model is out of scope; the photograph is the closer substitute, and it can be
   swapped for a model later without changing the lesson model.
4. **Schematic coverage.** 7 of 13 weeks have a diagram. The other 6 (weeks 5, 6, 7, 9, 12, 13)
   show an explicit "no diagram for this week" state rather than borrowing a neighbour's. Those
   weeks are procedural — reinstalling Windows, DiskPart, registry work, e-waste policy — so a
   diagram adds little; drawing them is content work, not code work.
5. **Language.** `learn-esp32` has a language switcher. The teaching plan is written for rural
   Karnataka learners with mobile-phone analogies — a Kannada translation is the obvious
   candidate, but it doubles the content pipeline and needs a second extraction pass.
6. **Notes versus Learn.** The 13 hand-written notes now render in the lesson's Notes tab, next to
   the generated lesson material. They still overlap it in places. The open question is content,
   not layout: port the unique prose into `curriculum.ts` and retire `staticNotes.tsx`, or keep both
   and state on the tab which one is the long-form version.

