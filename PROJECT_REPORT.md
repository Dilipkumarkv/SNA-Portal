# Project Report: System & Network Administration (SNA) Portal

## 1. Executive Summary
The System & Network Administration (SNA) Portal is a web-based educational platform for S.E.T Polytechnic. It acts as a single digital hub for course materials, laboratory tasks, academic schedules, and progress tracking for the 25CS34I curriculum. The application has a dual-role structure: an open-access student portal and an admin portal gated behind Google OAuth.

The current build is a **client-only application**. It runs entirely in the browser with no server component, which makes it inexpensive to host and fully usable offline — but it also means data is per-device rather than shared.

## 2. Project Objectives
- **Centralized Content Delivery:** One place to reach lecture notes, lab manuals, question papers (QPs), and reference links mapped by academic week.
- **Academic Tracking:** Let students mark completed modules and labs to track progress through the 13-week course.
- **Administrative Control:** Let an instructor post announcements, manage the CIE schedule, and attach course documents.
- **Practical CLI Skills:** Provide a safe, sandboxed terminal for practising CMD/PowerShell/Bash commands without affecting the student's machine.

## 3. System Architecture & Tech Stack

**Frontend:**
- **Framework:** React 19 with Vite 6 (SPA, hash-based tab routing)
- **Language:** TypeScript 5.8
- **Styling:** Tailwind CSS v4 with dark mode
- **Icons:** Lucide React
- **Data Visualization:** Recharts (admin analytics)
- **Animation / PDF:** Motion, jsPDF + html2canvas

**Offline & Packaging:**
- **PWA:** `vite-plugin-pwa` with Workbox precaching; installable on Android/iOS
- **Native:** Capacitor 8 wrapper for Android

**Storage (client-side, no backend):**
| Concern | Mechanism |
|---|---|
| Content records (announcements, CIE, notes, labs, feedback) | `localStorage` via `src/lib/storageService.ts` |
| Course progress (lessons, experiments, last opened lesson) | `localStorage` (`sna_progress_v1`) via `src/lib/progress.ts` |
| Uploaded PDF attachments | IndexedDB via `src/lib/fileStore.ts` |
| Terminal sessions, tracker progress, theme | `localStorage` |

**Authentication:**
- **Admins:** Google OAuth via `@react-oauth/google`. The ID token is decoded client-side to read the profile; the admin session is persisted in `localStorage` and gated by an optional `VITE_ADMIN_EMAILS` allowlist.
- **Students:** No login. The student portal is open to everyone, which keeps the app usable on shared or low-end devices.

## 4. Key Features & Modules

### 4.1 Student Portal
- **Learn workspace:** 13 weeks × 4 day-lessons = 52 lessons. Week rail, day chips, and a six-tab lesson pane (Basics, Overview, Notes, Schematic, Try it, Q&A). Per-lesson completion and `lastLesson` are persisted in `sna_progress_v1`.
- **Assessments (inside Learn):** CIE-1…4 model papers, the full 65-question viva bank and the 61-question CIE bank.
- **Dashboard/Home:** Announcements, CIE schedule, and a resume card pointing at the last lesson opened.
- **Notes:** The 13 hand-written notes render in each lesson's Notes tab, exportable as PDF via html2canvas, alongside any admin-uploaded note for that week.
- **Laboratory Explorer:** All 58 experiments from the manual with search, week filter, aim/components/procedure/result, a per-experiment checklist, guided practice, and admin-attached documents.
- **Progress Tracker:** Weekly checklist with self-assessment, persisted across sessions.
- **Reference Links:** 33 curated external references per week, shown in the lesson Overview tab and in the Links library.
- **Virtual Terminal Lab:** A Virtual File System with 33 commands across CMD/PowerShell/Bash dialects (including a DiskPart sub-command interpreter), session persistence, and guided scenario walkthroughs.
- **Schematic Viewers:** Seven annotated diagrams of the lab machine (Lenovo ThinkCentre M83: rear I/O and cables, PSU, H81 board, lab room, boot sequence, disk layout, RDP/VPN) with 49 hotspots, pinch-zoom and pan. Physical hardware uses photographs; sequences and structures use SVG. Shown inline in the lesson's Schematic tab, expandable full-screen, and reachable from each experiment's detail panel.

### 4.2 Administrator Portal
- **Dashboard Analytics:** Per-week completion breakdown with filterable CIE grouping (sample data).
- **Content Management:** Upload PDFs for notes and lab manuals; files are stored outside `localStorage` to avoid the quota limit.
- **Announcements:** Broadcast academic notices with an urgent flag.
- **Schedule Management:** Publish CIE entries with badges and progress percentages.
- **Local Demo Notice:** The panel is explicitly labelled as browser-local, so no one mistakes it for a shared server.

## 5. Security Posture (honest assessment)

This is the most important caveat in the project.

- **The admin guard is client-side only.** `isAdminAuthenticated()` reads a JSON profile from `localStorage` and compares the email against an allowlist. There is no server, so there is no session to invalidate and no token signature verification. The Google ID token is decoded for display, not verified. A user with devtools access can set `sna_admin_user_v2` and gain admin UI access.
- **Data isolation is by device.** Content published in the admin panel is stored in the browser that published it. It does not reach other students.
- **Default allowlist is open.** If `VITE_ADMIN_EMAILS` is unset, any Google account that signs in is treated as an admin.
- **Input sanitisation is applied where it matters.** Note and lab content is rendered through DOMPurify. The schematic SVG is static first-party data, and the photographs are static assets from `public/schematics/`.
- **Transport and hosting hygiene are in place.** Netlify serves the SPA with CSP, HSTS, `X-Content-Type-Options`, `X-Frame-Options: DENY`, and `frame-ancestors 'none'`.

To make this production-grade for a real cohort, the admin surface needs a backend with server-verified sessions, and student-facing content needs shared storage.

## 6. Current Coverage

| Asset | Source | Extracted | Rendered in the UI | Gap |
|---|---|---|---|---|
| Theory lessons | 13 weeks × 4 teaching days = 52 | 52 | 52 (`#learn`) | None |
| Lab experiments | 58 (Laboratory Manual FV) | 58 | 58 (`#labs`) | None |
| CIE model question papers | Syllabus (CIE-1, CIE-2, SEE) | Partial | Partial (`#learn/assessment`) | Hand-transcribed cards; source PDFs not bundled |
| Weekly reference links | Syllabus (33 URLs) | 33 | 33 (lesson Overview tab, `#links`) | None |
| Viva questions and answers | Teaching Plan | 65 | 65 (`#learn/assessment`) | None |
| Practical tasks | Teaching Plan | 97 | 97 (Overview tab, lab explorer) | None |
| Lesson CIE questions | Teaching Plan | 61 | 61 (`#learn/assessment`) | None |
| Long-form weekly notes | Teacher-authored | 13 | 13 (lesson Notes tab) | Overlaps the generated lessons |

All curriculum content is extracted into `src/data/curriculum.ts` by
`tools/extract_curriculum.py`, and every extracted item now has a screen. The build record,
including what was cut from the original plan and why, is in [`WORKFLOW.md`](WORKFLOW.md).

## 7. Future Enhancements
- Move content and admin sessions to a real backend (Firestore, or Postgres + object storage)
- Sync per-student progress across devices (today it is browser-local)
- Replace mocked admin analytics with real aggregations of the tracker dataset
- Replace the generated schematic photographs with photos taken of the actual lab machines
- Formative assessment: quizzes and self-check questions per lesson
- Offline quiz mode with local result sync

## 8. Conclusion
The SNA Portal delivers a credible, offline-capable learning companion for 25CS34I. Its strongest assets are the 52-lesson Learn workspace with runnable per-week commands, the virtual terminal, and the interactive schematics; all 58 experiments, 65 viva questions and 61 CIE questions are now reachable in the app rather than buried in source documents. As a local-first prototype it is complete and deployable. Its path to serving an entire cohort depends on moving content storage and admin authentication off the client — the single highest-impact next step.
