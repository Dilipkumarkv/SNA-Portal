# Project Report: SNA Exam Guide (25CS34I)

## 1. Executive Summary

The **SNA Exam Guide** is a client-only Progressive Web App for the System & Network Administration practical exam (course 25CS34I, S.E.T Polytechnic). It replaces the former "SNA Portal" — a 13-week course portal with an admin panel — with a focused, mobile-first exam cram tool that runs entirely in the browser and on Android via Capacitor.

- **Deploy target:** Netlify (SPA) + PWA offline-first + Capacitor Android wrapper  
- **Backend:** None. All state is `localStorage` / `IndexedDB` on the device.  
- **Auth:** None. The student portal is open; the deleted admin panel used Google OAuth as a UI gate only.  
- **Tested:** GitHub Actions on Node 22 — `npm ci`, `tsc --noEmit`, `node:test` (96 cases), `vite build` all pass.

---

## 2. Product Scope

### Delivered screens (5 hash-routed tabs)

| Tab | Hash | Purpose |
|---|---|---|
| Machine | `#machine/back`, `#machine/front`, `#machine/cables`, `#machine/board` | Four annotated photographs of the Lenovo ThinkCentre M73 lab PC. 22 interactive hotspots; tap a port/part → see name, specs, and the examiner question tied to it. Pinch-zoom, pan, full-screen modal. |
| Exam Day | `#day` | Seven timed blocks in paper order (24 + 15 + 30 + 20 + 20 + 20 + 51 = 180 min). Each block: ordered steps, "show the examiner" checklist, most-likely viva question, links to the relevant Machine photo. |
| Labs | `#labs`, `#labs/<lab-id>?week=<n>` | 44 revision cards for weeks 5–12. Filter by week, search by title. Card fields: aim, tool, minutes, prerequisites, ordered procedure with stop/check warnings, expected evidence, self-check Q&A, examiner question. Local `reviewed` + `lastOpened` state per card. |
| Terminal | `#terminal` | Virtual file system + three shells (CMD, PowerShell, Bash) with 33 commands and a DiskPart interpreter. Sessions persist across reloads. Guided scenarios inject the exact command sequence. |
| CIE-5 | `#project` | Three-part portfolio: Portfolio (10 marks), Mini project (20), Online course (20). Evidence links back to Exam Day / Labs so the student copies the right numbers. |

### Content assets

- **12 timed drills** (`exam-guide-content/drills.md` → `generated/drills.ts`) — categories: Hardware, OS & drivers, Disks & accounts, Repair, Network. Each drill: minutes, phase, viva references, ordered steps, commands, prove, traps, note.
- **30 viva answers** embedded in `src/exam/guide.ts` (the `viva.md` source exists but is not compiled into the live app).
- **4 WebP photographs** in `public/schematics/`: M83 rear I/O, PSU, H81 board, lab network diagram. 22 hotspots total.
- **6 machine parts** with specs (`Part[]` in `guide.ts`): Motherboard (H81/LGA1150), RAM (2×4 GB DDR3-1600), SSD (240 GB), HDD (500 GB), PSU (450 W ATX), CPU (i5 4th gen).

### What the syllabus covers vs. what the app covers

| Syllabus area | App coverage |
|---|---|
| Weeks 1–4 (hardware fundamentals, SMPS, boot, BIOS) | Machine photos + Exam Day phases 1–3 touch this; no dedicated lab cards |
| Weeks 5–12 (install media, CLI, repair, disks, networking, VMs, e-waste) | 44 lab cards across 8 weeks; Exam Day phases 1–7 + Terminal scenarios |
| Week 13 | Not covered |
| 58 experiments in lab manual | 44 revision cards (weeks 5–12 only) |

---

## 3. Architecture & Tech Stack

### Frontend

| Layer | Choice | Version |
|---|---|---|
| Framework | React | 19 |
| Build | Vite | 6 |
| Language | TypeScript | 5.8 |
| Styling | Tailwind CSS | 4 (v4, native CSS vars) |
| Routing | Hash-based (`window.location.hash`) | Custom, 5 tabs |
| State | `useState` / `useSyncExternalStore` + `localStorage` | No external store |
| Icons | Lucide React | 0.546 |
| PDF (lazy) | jsPDF + html2canvas | Dynamic `import()` on export |

### Offline & Packaging

| Feature | Implementation |
|---|---|
| PWA | `vite-plugin-pwa` + Workbox; `registerType: 'prompt'`; precaches `js,css,html,ico,png,svg,webp,woff2` |
| Service worker | Generated; `sw.js` + `workbox-*.js` immutable cached; `index.html` revalidated |
| Installability | Android: `beforeinstallprompt`; iOS: "Add to Home Screen" banner via `PwaPrompts` |
| Native wrapper | Capacitor 8; `appId: in.setpoly.snaportal`; `android/` project ready for `npx cap sync` |
| Fonts | Self-hosted Inter + Inter Tight variable subsets (latin + latin-ext), `@font-face` in `index.css` |

### Storage (device-local only)

| Key | Contents | Mechanism |
|---|---|---|
| `sna_exam_state_v1` | Exam date, completed drills/steps, viva marks, last-48 checklist, project checklist, mock timer, quiz seen, last lab, reviewed labs | `localStorage` + `useSyncExternalStore` |
| `sna_terminal_sessions_v1` | All terminal sessions (entries, history, VFS, shell mode) | `localStorage` |
| `sna_files` | Admin PDF uploads (deleted with admin panel) | IndexedDB (`fileStore.ts`) — code remains but unused |

**No backend, no sync.** Data never leaves the browser that created it.

---

## 4. Security Posture (honest)

| Control | Status | Notes |
|---|---|---|
| CSP | ✅ Enforced | `default-src 'self'`, scripts `self` + `accounts.google.com`, frames `accounts.google.com`, workers `self` + `blob:` |
| HSTS | ✅ Enforced | `max-age=31536000; includeSubDomains` via `netlify.toml` |
| Frame protection | ✅ | `X-Frame-Options: DENY`, `frame-ancestors 'none'` |
| MIME sniffing | ✅ | `X-Content-Type-Options: nosniff` |
| Referrer | ✅ | `strict-origin-when-cross-origin` |
| Permissions | ✅ | `camera=(), microphone=(), geolocation=()` |
| Auth | ❌ None | Student portal open; deleted admin panel used client-side ID token decode only — no server verification |
| Data isolation | ⚠️ Per-device | `localStorage` / IndexedDB scoped to origin; no cross-device sync |
| Offline integrity | ⚠️ Untested | Service worker precaches assets; no verification of offline reload with network disabled |

**To make this production-grade for a real cohort:** add a backend (Firestore / Postgres + object storage) with server-verified sessions and shared content.

---

## 5. Testing

| Suite | Framework | Cases | What it covers |
|---|---|---|---|
| `exam-routing.test.ts` | Node `test` + `tsx` | 16 | Hash parsing, tab/view mapping, week filter validation |
| `labs.test.ts` | Node `test` + `tsx` | 13 | 44 cards exist, week membership matches independent ledger, source titles match lab manual |
| `lab-stages.test.tsx` | Node `test` + `tsx` + `react-dom/server` | 48 | `LabStage` SSR renders, evidence text present, accessibility attributes, no form inputs |
| `exam-store.test.ts` | Node `test` + `tsx` | 8 | v1 migration, sanitation discards unknown/duplicate IDs, top-level await |
| `pwa.test.ts` | Node `test` + `tsx` | 11 | Install prompt logic, theme color, native detection, persistent storage |

**Total:** 96 cases, 113 assertions.  
CI runs on Node 22 (`actions/setup-node@v4` with `cache: npm`). The `tsx`/`esbuild` binary crashes on this Android device, so the on-device test run uses a CommonJS build workaround — CI is the authoritative pass.

Typecheck: `tsc --noEmit` (strict: false in `tsconfig.json`) — 0 diagnostics.

---

## 6. Build & Deploy

```bash
npm run build   # vite build (includes prebuild -> exam:content)
```

Outputs to `dist/`:
- Hashed assets (`assets/index-<hash>.js`, `assets/index-<hash>.css`)
- `index.html` (SPA shell)
- `sw.js`, `workbox-<hash>.js`, `manifest.webmanifest`
- Copied `public/schematics/*.webp`, `public/guide/*`, `public/screenshots/*`

Netlify config (`netlify.toml`):
- `[[redirects]]` — SPA fallback `/* → /index.html` (200)
- `[[headers]]` — cache rules + security headers (CSP, HSTS, etc.)
- `command = "npm run build"`, `publish = "dist"`, `NODE_VERSION = "22"`

Capacitor Android:
- `npx cap sync` copies `dist/` to `android/app/src/main/assets/public`
- `android/app/build.gradle` — `minSdkVersion` / `targetSdkVersion` from root `variables.gradle`
- Not built in CI; requires Android SDK locally.

---

## 7. Content Pipeline

Only the exam guide has a repeatable content build:

```bash
npm run exam:content
# reads exam-guide-content/drills.md -> src/exam/generated/drills.ts (12 Drill objects)
# throws if not exactly 12 drills, or if any drill lacks steps/prove/traps
```

The legacy curriculum extractor (`tools/extract_curriculum.py`) reads `.docx`/`.pdf` sources from a local Windows path (`C:\Users\deep\Desktop\SNA\`) and emitted `src/data/curriculum.ts` — that file and the extractor are now orphaned in the repo (the portal they fed was deleted). They are retained for reference only.

---

## 8. Known Gaps

| Gap | Impact | Fix |
|---|---|---|
| No backend | Progress and uploads don't cross devices | Add Firestore / Postgres + object storage |
| No student login | Cannot attribute progress to a person | Add auth + user profile |
| Admin panel deleted | No way to push notices/lab PDFs to students | Rebuild admin on top of a real backend |
| `viva.ts` generated but unused | 30 viva answers sit in `guide.ts` instead | Wire into a screen or delete the generator |
| Weeks 1–4, 13 labs uncovered | 14 of 58 experiments have no revision card | Add cards if syllabus requires |
| Schematic photos are AI renders | Not authentic lab documentation | Replace with real photos |
| Offline reload untested | PWA claim not verified | Test with network disabled |
| Bundle size unknown on CI | README claim "~886 kB / 278 kB gzip" unverified | Add `vite-plugin-visualizer` or CI artifact upload |

---

## 9. Future Work

1. **Backend** — Firestore (simplest, already client-side) or Postgres + S3. Moves admin uploads, CIE schedule, and student progress off-device.
2. **Auth** — Firebase Auth or custom JWT. Server-verified sessions; student accounts; progress sync.
3. **Real photos** — Replace the four WebP renders with photos of the actual M73 lab machines.
4. **Progress reset** — Expose `examActions.reset()` in the UI (exists in `store.ts`).
5. **Lab coverage** — Extend to weeks 1–4 and 13 if the teaching plan requires it.
6. **Bundle audit** — Add `vite-plugin-visualizer` to CI; track gzip size over time.
7. **E2E tests** — Playwright for critical paths (Exam Day flow, Terminal scenario, Lab card review).

---

## 10. Conclusion

The SNA Exam Guide is a focused, offline-capable PWA that does one thing well: it puts the M73 lab PC, the 180-minute exam sequence, 44 lab revision cards, a virtual terminal, and the CIE-5 portfolio requirements into a student's phone. It has no backend, no login, and no shared state — which keeps it simple, free to host, and fully usable offline. The tradeoff is that progress is device-local and the admin surface is gone. If the course needs shared publishing and cross-device progress, the next step is a backend, not more frontend.
