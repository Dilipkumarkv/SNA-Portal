# Weeks 8–12: content and implementation handoff

Date: 2026-11-13
Status: planning deliverable; proposed implementation, not implemented or deployed.
Audience: the next coding agent and the course teacher.
Baseline observed: commit `6cb7e0c`, React/TypeScript/Vite static student guide.

## 1. Objective and scope

Extend the existing Labs surface to teach weeks 8–12 of System and Network Administration, 25CS34I. Students primarily revise on phones without a computer at home. Keep the existing read-only guide approach: annotated visual, ordered procedure, stop/check warnings, observation prompts, self-check, viva, and local reviewed/resume state. A reviewed card means revision, not successful execution of an experiment.

This document authorizes no application changes, commits or deployments by itself. The next agent should obtain approval to implement this proposal. Commit and production deployment require explicit approval; a push to main can publish through Netlify Git CD.

### Source priority

1. Syllabus determines week coverage and course outcomes.
2. Supplied laboratory manual determines aims, materials, practical sequence and expected observations.
3. Correct syntax, safe operation and verified platform behavior override typographical mistakes or oversimplifications; record the correction rather than silently attributing it to the manual.
4. Existing app content is reusable UI/content material, not the syllabus authority.

Sources (local originals, do not publish or embed automatically):
- `C:/Users/deep/Desktop/SNA/SNA Syllabus.pdf`: 10 PDF pages. Weeks 8–9 on pp. 4–5; weeks 10–11 on p. 5; week 12 on pp. 5–6.
- `C:/Users/deep/Desktop/SNA/Laboratory_Manual SNA FV.pdf`: 60 PDF pages. Relevant procedures on pp. 20–60 inclusive.

Both documents were text-extracted with pypdf. The PDF renderer was unavailable, so page layout/illustrations were not visually verified. References below are 1-based PDF pages. The manual's extracted printed page labels agree with them. The manual does not itself label these sections by week; the week mapping below is inferred by matching the syllabus topics.

### Explicit exclusions

No backend, student account system, real command execution, credential collection, network probing by the web app, full OS simulator, exam grading, APK build, or week 13 implementation. No automatic PDF export or new dependency is needed. No new tab: extend Labs. Do not rebuild the older learning portal or its dynamic/admin lab system.

## 2. Source reconciliation and coverage

The manual has **41 relevant procedure entries**:

| Week | Outcome | Manual references | Entries | Primary learning outcome |
|---|---|---|---:|---|
| 8 | CO3 | Ex. 20–28, pp. 20–28 | 9 | Manage disks and recover files/configuration safely |
| 9 | CO3 | Ex. 29–36, pp. 29–36 | 8 | Observe performance, automate a task, maintain drivers and repair integrity |
| 10 | CO4 | Ex. 37–47, pp. 37–47 | 11 | Configure, troubleshoot and securely share a lab network |
| 11 | CO4 | Ex. 47–54, pp. 48–55 | 8 | Monitor traffic, use VM networking and compare approved VPN behavior |
| 12 | CO5 | Ex. 55–59, pp. 56–60 | 5 | Document responsible e-waste handling and energy savings |

### Numbering and duplication

- Manual Ex. 47 occurs twice: Remote Desktop on p. 47 and Task Manager network monitoring on p. 48. Store source page AND title, not just experiment number. Do not renumber the source.
- Preserve existing slugs `partition`, `diskpart`, `restore`, `startup` and their stored progress. Reuse them in weeks 8 or 9 as well as the existing group; do not make four near-identical copies.
- Existing seven cards plus 37 new cards yield **44 unique cards**. Week memberships total **48**: existing groups 4/1/2 plus new groups 9/8/11/8/5. Index totals and reviewed totals must count unique cards, not memberships.
- Existing cards remain discoverable at their current routes and weeks. Their early-week grouping is a revision arrangement, not evidence that it exhausts those weeks' syllabus requirements.
- Week 5–7 omissions (accounts, PowerShell, broader recovery, etc.) are not filled in this project. Do not claim full weeks 5–12 syllabus coverage.

### Syllabus concepts not given a full manual procedure

Add short conceptual explanations within the relevant cards, clearly distinguished from manual steps:
- W8: FAT32/NTFS/exFAT, files versus partitions, MBR/GPT, recovery limitations. Do not add disk conversion exercises.
- W9: SFC/DISM/CHKDSK are covered in Ex. 36 even though the syllabus lists them in theory. Linux process commands/task scheduling and desktop customization have no matching detailed procedure here: mark as syllabus-only supplementary coverage, not completed practical coverage.
- W10: subnetting and VLANs need a small worked concept explanation; do not invent switch CLI or production VLAN configuration tasks.
- W11: explain NAT/bridged/host-only and a brief Hyper-V terminology comparison. The manual uses VirtualBox/VMware; do not replace it with Hyper-V-only instructions. Modem routing/remote access and VPN types need conceptual notes, not invented router credentials/procedures.
- W12: lifecycle, health/environment effects and EPR fit the five cards. Global e-waste statistics need dated verified sources; omit unverified numbers rather than inventing a current statistic.

## 3. Recommended product approach

Options considered:
1. **Extend current guide cards (recommended):** reuses navigation, accessibility, local progress and PWA behavior; manageable content review and no backend. Limitation: revision is not real practical execution.
2. Build fully interactive simulations: deeper practice but much more state, validation and testing; not required for this release.
3. Embed the manual: fastest, but long PDF pages are poor phone UX and do not provide focused self-checks or safe step guidance.

### Student flow

Labs → choose week → select card → understand aim and required equipment → inspect example → read supervised procedure → check expected evidence → reveal self-check/viva → mark reviewed → next card in the SAME week.

- Keep All plus Week 5 through Week 12 filter chips. Allow wrapping; no clipped labels or tiny targets.
- In All, display grouped memberships, with a small “Also covered in Week …” cue for reused cards. Explain unique-card count once so repeated listings do not confuse progress.
- On a week landing, show that week's topic and card count. Do not show all 44 expanded cards at once; keep the current compact index cards.
- Default the card to the annotated example; show plain-text point explanations that remain usable without zoom.
- Use “Illustrative example — not your computer's current state.” Never claim fabricated outputs are live readings.
- `minutes` remains estimated reading time, not experiment runtime; scans, installs and update operations can take much longer.
- Week 12 uses evidence/process/observation panels, not fake Windows dialogs.
- Do not collect observation text or screenshots in this release. `record` remains a checklist for the student's notebook.
- The manual's Result becomes an **expected verification criterion**, not a pre-filled success claim. Include unsuccessful or unavailable outcomes where appropriate.

### Proposed URL and navigation contract

Preserve `#labs` and all existing `#labs/<slug>` URLs. Add optional context with hash query parameters:
- `#labs?week=8`
- `#labs/partition?week=8`

Parse path and query separately; accept only integer weeks 5–12. Invalid slug falls back to Labs index; invalid week falls back to All. A known card requested with a week it does not belong to opens without that context. Build hashes through a helper rather than string concatenation throughout components.

Back to labs preserves a valid week. Next uses that group's ordered entries; at the last entry offer Back to Week N, not a jump into an unrelated week. Without a week context, Next traverses unique LABS order. Browser Back/Forward must retain the selected filter. Continue existing heading focus and scroll reset behavior.

Resume still stores only `lastLab`; it resumes that card without a week context. No new persisted field or storage version is necessary.

## 4. Shared editorial and safety rules

Each card must have: plain-English title/aim, prerequisites, manual citation, 3–5 useful annotated points, complete ordered procedure (normally 8–10 concise steps), warnings before risky actions, expected verification, observation checklist, failure explanation, one self-check and one viva with answers, and cleanup/reversal where applicable.

Keep the manual's sequence unless a correction is explicitly noted below. Simplification may combine adjacent UI clicks but must not omit verification, permission or cleanup steps. Avoid marking read-only observations as destructive and avoid burying genuine risks in a generic warning banner.

### Required corrections and clarifications

1. Manual p. 24: quote the filter path containing a space: `winfr D: E: /regular /n "\Lab Data\sample.txt"`. D:/E: are examples only; require assigned source and different destination drives. Verify installed winfr help before final publication. Regular mode is not appropriate for every filesystem/deletion case. Stop writes to the source; SSD TRIM can make recovery impossible. Failed recovery is a valid documented outcome.
2. Manual p. 36: `/Clean-up-Image` is incorrect; use `DISM /Online /Cleanup-Image /ScanHealth` and, only when approved, `/RestoreHealth`. Distinguish scanning from modifying repair. Preserve initial SFC observation; after component-store repair, rerun SFC if instructed. `chkdsk C:` does not request `/f` repairs; do not silently add `/f`, `/r` or disk repair scheduling.
3. Registry import merges exported values; it is not a complete rollback that necessarily removes newly created values. Use an instructor-assigned noncritical HKCU test key and change an existing value for this demonstration. Never give instructions to alter boot/security keys.
4. Startup application changes affect sign-in/post-boot behavior. “Last BIOS time” measures firmware initialization and is not valid evidence of improvement from disabling a startup app. Correct the reused startup card's record/self-check accordingly.
5. Restore points are not personal-file backups. Only an approved change under supervision; never corrupt a system deliberately to demonstrate repair.
6. Partition formatting/resize only on approved backed-up test storage. No conversion/clean/system partition deletion. DiskPart card remains inspection-only and should include `select volume Y` / `detail volume` to match manual p. 23.
7. Current install cards contain oversimplified claims about Custom/Next automatically formatting and UEFI always requiring GPT. These are separate legacy-content review findings: do not repeat them in the new filesystem explanation; log for teacher review rather than expanding this task into a full installer rewrite.
8. Existing Ubuntu record asks for a password. As a narrowly scoped safety correction, change it to username and password policy/type, never password value. No real credentials from any source, particularly `NEW PASSWORDS.txt`, may enter content, screenshots, fixtures or artifacts.
9. Task Scheduler: save an actual `.bat` with All files selected; avoid `.bat.txt`. The manual's `%USERPROFILE%\Desktop` may not be the actual redirected Desktop. Explain this prerequisite and use a teacher-approved existing output folder when needed. No elevation unless necessary; remove the test task afterward.
10. Network adapter changes, TCP/IP resets, firewall changes, sharing, RDP and VPN work only on assigned lab hosts; never disconnect an active remote management session. Record original settings and restore them.
11. `netstat` lists local connections/listeners; it does not prove a remote port is reachable. Ping failure alone does not prove a host is down; ICMP can be filtered. Asterisks in tracert are not conclusive route failure.
12. Keep firewall on. Scope temporary rules to the approved application/profile, prefer a harmless test, remove the rule afterward. Never suggest broad “turn off firewall” troubleshooting.
13. Shares require authenticated users and least privilege. Share permissions and NTFS permissions both matter. No Everyone/full-control shortcut, SMB1, or password-protected-sharing disablement.
14. RDP requires a supported host edition, authorized account and network-level authentication where available. No public port forwarding. No real account details in the app. State disconnect versus sign-out difference.
15. VPN is institution-approved only, not a way to bypass lab policy. A VPN does not guarantee anonymity. Public IP may remain unchanged under split tunneling; a new IP alone is not proof that all traffic is protected.
16. Do not equate VM NAT with full security isolation. Bridging places the guest on the LAN and requires permission. Reserve host resources rather than turning “4 GB minimum” into a universal guarantee.
17. E-waste: observation/documentation only. No opening PSU enclosures, breaking batteries/CRTs, burning, acid recovery or dismantling hazardous parts. Battery-specific obligations must be verified separately rather than treated as identical to e-waste rules.
18. Watts on a PSU nameplate are capacity, not measured PC consumption. `kWh = watts / 1000 × hours`; CO2e requires a cited dated emissions factor. Never present energy savings as verified carbon savings without it.

## 5. Card-by-card content specification

IDs below are stable proposed route IDs. Source number/page are preserved separately from app numbering. Existing reused cards retain their original app numbers; new cards use the week sequence below. Every row's procedure synopsis must be expanded into ordered readable steps using the cited manual page, not treated as the complete final prose.

### Week 8 — Disks, recovery and updates (9 memberships)

**08.1 / `partition` (reuse existing 05.2), Ex.20 p.20**
- Aim/tools: create an NTFS volume in approved unallocated space, Disk Management.
- Sequence: identify disk by number/capacity → New Simple Volume → size in MB → available letter → NTFS and label → quick format → Finish → verify in Explorer and disk map.
- Visual points: target disk, unallocated block, wizard size, finished volume. Record disk/capacity/size/letter/filesystem. Expected: assigned volume appears with correct values.
- Self-check: What gets formatted? Only the selected new volume, not every partition. Viva: Why NTFS? Large files, permissions and journaling. Cancel if target cannot be identified.

**08.2 / `partition-style`, Ex.21 p.21**
- Inspect disk label Properties → Volumes → Partition style; compare administrator DiskPart `list disk`; exit.
- Visual: disk label, Volumes tab, Partition style, GPT column. Record actual disk/style and agreement across tools. No conversion.
- Check: Does an asterisk mean GPT? Yes; a blank generally means MBR, verify Properties. Viva: style versus filesystem? Partition organization versus how files are stored inside a volume.

**08.3 / `resize-partition`, Ex.22 p.22**
- Back up approved volume → note original size → Shrink Volume amount → inspect new unallocated space → confirm immediately adjacent space on same disk → Extend Volume → verify size.
- Visual: before/after disk map, shrink amount, eligible/ineligible extend layout. Record sizes before/shrink/after.
- Check: Why is Extend greyed out? Suitable adjacent space/layout may be absent. Viva: Free space inside a filesystem versus unallocated disk space. Never delete a neighbor to force the exercise.

**08.4 / `diskpart` (reuse 06.1), Ex.23 p.23**
- Admin terminal → `diskpart` → `list disk` → identify → `select disk X` → `detail disk` → `list partition` → `list volume` → approved `select volume Y` / `detail volume` → `exit`.
- Visual: prompt, selected disk evidence, volume selection/details. Record disk and volume identities. Explicitly explain list volume covers available volumes, not only the selected disk.
- Check: Does select modify data? No, but it sets the target for later commands. Viva: Why verify capacity/model? Disk numbers are not universal identities.

**08.5 / `file-recovery`, Ex.24 p.24**
- Install approved Windows File Recovery → create disposable test file → delete only that file → stop source writes → admin terminal → corrected quoted command → confirm → inspect destination recovery folder → record outcome, including failure.
- Visual: distinct source/destination, quoted filter, completion report, recovered file. Record original filename, mode, destination, readable result; no private file contents.
- Check: Same source/destination allowed? No. Viva: Why no guaranteed SSD recovery? TRIM and overwritten data. Do not tell students to repeat this on valuable files.

**08.6 / `registry-backup`, Ex.25 p.25**
- Open regedit → assigned HKCU key → export Selected branch → verify `.reg` → approved existing-value change → import same export → inspect value.
- Visual: key path, Selected branch, file, before/after value. Record test key, export filename, observed restored value (non-sensitive).
- Check: Does import remove every new key? No, it merges. Viva: Why export first? Preserve original assigned values. Never import downloaded registry tweaks.

**08.7 / `restore` (reuse 07.1), Ex.26 p.26**
- System Protection enabled → named point → creation confirmation → approved small change → select correct point → affected programs → supervised restore/restart → verify.
- Visual: protection state, point name/time, affected programs, confirmation. Record actual result rather than auto-success.
- Check: Personal-file backup? No. Viva: Why inspect affected programs? Apps/drivers added after the point may change.

**08.8 / `app-reinstall`, Ex.27 p.27**
- Settings Apps → approved disposable app → uninstall → confirm removal → Store/official installer → reinstall → launch/test.
- Visual: selected app/version, uninstall, trusted source, launch. Record versions and functional check; back up app data if needed.
- Check: Does reinstall guarantee personal settings recovery? No. Viva: Why official installer? Provenance and compatibility. Never remove institutional/security software.

**08.9 / `windows-update`, Ex.28 p.28**
- Version-specific Settings path → check → inspect → install only approved updates → restart as needed → history → categories → pause/advanced settings → examine uninstall route; actual rollback only if approved.
- Visual: pending status, update entry, history, uninstall availability. Record identifier/date/outcome and whether rollback is available.
- Check: Must every update be removable? No. Viva: Why test before lab-wide deployment? Detect compatibility problems. Do not label an illustrative KB as a real current recommendation.

### Week 9 — Performance and maintenance (8 memberships)

**09.1 / `task-manager`, Ex.29 p.29**
- Processes → observe CPU/memory consumers → Performance CPU/RAM/disk/network → optionally end only approved test app → record.
- Visual: process row, resource columns, graph and interval. Record utilization with units and observation time. Check: high utilization always fault? No, compare workload/baseline. Viva: process view versus whole-system view. End Task can lose unsaved work.

**09.2 / `startup` (reuse 07.2), Ex.30 p.30**
- Note baseline sign-in behavior → Startup tab → impact/status → approved nonessential item → disable → restart → compare same workload → restore as instructed.
- Visual: impact, enabled status, selected app, disable/re-enable. Record app/status and observed desktop readiness, not Last BIOS time as proof. Check: disable equals uninstall? No. Viva: why one controlled change at a time? Attribute observed effects.

**09.3 / `services`, Ex.31 p.31**
- `services.msc` → read service/description/status/type → approved noncritical service Properties → note original → authorized start/stop/type change → restore → verify.
- Visual: status, startup type, controls, original configuration. Check: Manual means currently stopped? Not necessarily. Viva: service versus startup application. Never name an essential service as the default test target.

**09.4 / `scheduled-task`, Ex.32 p.32**
- Create manual's harmless logging batch script in approved folder → verify extension/output folder → `taskschd.msc` → Basic Task name → one-time trigger → program/script → finish → Run → inspect log/status → remove only test task.
- Visual: trigger, action path, Last Run Result, log file. Record task/action/time/log output. Check: task listed means it ran? No, verify output. Viva: trigger versus action.

**09.5 / `device-driver`, Ex.33 p.33**
- Device Manager → correct device → note current driver → Update driver → automatic/local approved compatible package → install → restart if needed → status/function.
- Visual: hardware identity, driver version, source, device status. Record before/after version and function. Check: newest from any download site acceptable? No. Viva: why match OS/architecture/device model? Compatibility. No driver-updater utilities.

**09.6 / `printer-driver`, Ex.34 p.34**
- Connect approved USB/network printer → power → version-specific Printers & scanners → add/detect or assigned details → compatible driver → Properties → Print Test Page → check physical output.
- Visual: printer identity, connection, driver, test page control. Record model/connection/driver/result. Check: queue entry proves print? No. Viva: driver versus physical connectivity. Use one test page, avoid unnecessary printing.

**09.7 / `network-driver`, Ex.35 p.35**
- Device Manager Network adapters → identify local test adapter → record state → disable under supervision → observe disconnect → enable → verify restored connection.
- Visual: adapter identity, disable action, disabled status, restored status. Check: safe over active RDP? No. Viva: disable versus uninstall. Recover locally; never remove the package.

**09.8 / `system-integrity`, Ex.36 p.36**
- Admin terminal → `sfc /scannow` → record → corrected DISM ScanHealth → conditional approved RestoreHealth → consider rerun SFC → `chkdsk C:` observation → document messages; reboot only if requested by approved repair.
- Visual: tool/purpose comparison and sample result lines, clearly illustrative. Record exact result categories, not fabricated corruption. Check: ScanHealth repairs? No. Viva: protected system files versus component store versus volume structure. Stable power; repair may require network/source files.

### Week 10 — Network configuration and troubleshooting (11 memberships)

Use an explicitly hypothetical topology consistently across drawings: PC-A `192.168.1.10/24`, PC-B `.11`, gateway `.1`. These are illustrative private addresses from the manual's pattern, never defaults to apply to the actual lab. DNS comes from the teacher; no invented internal server. Show a compact /24 network/host explanation and a VLAN-as-logical-separation concept note, not a router programming exercise.

**10.1 / `ipv4-settings`, Ex.37 p.37**
- Capture original DHCP/static settings → adapter IPv4 Properties → assigned unique address/mask/gateway → save → `ipconfig /all` → test as directed → restore original.
- Visual: selected adapter and three fields, matching output. Record assigned values/result in notebook. Check: arbitrary free-looking address safe? No, use assigned address. Viva: gateway purpose. Warn about conflicts and managed network policy.

**10.2 / `dns-settings`, Ex.38 p.38**
- Record original DNS mode → same adapter IPv4 → approved preferred/optional alternate DNS → save → `nslookup example.com` where permitted → inspect answer → restore.
- Visual: resolver field, query, responding server, answer. Check: successful ping to IP proves DNS? No. Viva: DNS maps names to addresses. Title must mean configuring the CLIENT resolver, not installing a DNS server.

**10.3 / `adapter-details`, Ex.39 p.39**
- `ncpa.cpl` → correct adapter Status → speed/connectivity → Details → `ipconfig /all` → record → locally disable/re-enable only if approved → verify.
- Visual: status speed, address details, MAC, adapter identity. Check: link speed equals internet speed? No. Viva: MAC versus IP. Cross-link network-driver but retain separate manual evidence.

**10.4 / `ping-test`, Ex.40 p.40**
- Confirm authorized connection/configuration → loopback → assigned gateway → permitted peer → example.com only when allowed → compare sent/received/lost/latency.
- Visual: topology plus labeled output. Check: loopback proves cable works? No. Viva: timeout possible with filtering. Use finite ordinary tests only; no continuous or flood commands.

**10.5 / `trace-route`, Ex.41 p.41**
- Verify config → `tracert example.com` where permitted → inspect hops/first hop/times/timeouts → another assigned destination → compare.
- Visual: vertical hop list and final destination; avoid overflowing wide tables. Check: `*` proves broken route? No. Viva: first hop is commonly the gateway, not universally identical in every topology.

**10.6 / `network-statistics`, Ex.42 p.42**
- `netstat`, `-a`, `-n`, `-ano`, `-e`, `-s` → identify local/foreign/state/PID and counters → record relevant sample.
- Visual: local endpoint, foreign endpoint, state, PID; distinguish TCP state from UDP output. Check: LISTENING proves public reachability? No. Viva: why numeric output? Avoid name-resolution ambiguity. Do not kill processes merely because a port is open.

**10.7 / `dns-reset`, Ex.43 p.43**
- Admin prompt → `ipconfig /displaydns` → `/flushdns` → confirmation → `/all` and original configuration → `netsh int ip reset` ONLY if instructed → restart if requested → restore needed settings → verify.
- Visual: separate cache-flush and disruptive reset sections. Check: same effect? No. Viva: why capture settings first? Reset can affect custom configuration. No automatic copy/run button for reset.

**10.8 / `firewall-rule`, Ex.44 p.44**
- Observe profiles/firewall-on → Advanced Security Inbound Rules → Program rule for approved harmless app → assigned allow/block action → minimum appropriate profile → unique test name → verify presence/authorized behavior → remove temporary rule.
- Visual: app path, direction/action, profile, rule name. Check: disable entire firewall? No. Viva: why profile scope matters. Do not alter pre-existing rules.

**10.9 / `wifi-profile`, Ex.45 p.45**
- Approved WLAN → credential entered only on real OS, never in app → connection Properties → policy-approved Public/Private → known networks → disconnect/reconnect.
- Visual: fictional SSID, connected status, profile, known networks. Check: Public means anyone can use your Wi-Fi? No, it controls Windows trust/sharing behavior. Viva: why avoid Private on untrusted networks. No actual security key in drawings.

**10.10 / `folder-sharing`, Ex.46 p.46**
- Two assigned PCs → identify/connectivity → disposable SNA_Shared folder → Advanced Sharing → approved authenticated user and minimum permissions → client UNC path → allowed access and denied unauthorized access → remove test share as directed.
- Visual: host/client topology, share name, permissions, client result. Record read/write expectation versus observation. Check: share permission alone determines access? No, NTFS also applies. Viva: why least privilege.

**10.11 / `remote-desktop`, Ex.47 p.47**
- Assigned LAN hosts → host edition/support → authorization → enable and retain NLA → permitted account → `mstsc` host → identity check/authentication outside app → verify session → sign out/disconnect appropriately → restore host setting.
- Visual: host readiness, host identity, allowed account placeholder, session status. Check: Windows Home can host? Generally no. Viva: disconnect versus sign out. No public exposure or certificate-warning bypass instructions.

### Week 11 — Monitoring, virtual machines and VPNs (8 memberships)

Default illustrated hypervisor: VirtualBox with a Linux guest, following manual's allowed choices. Label version-dependent controls; actual installation uses institution-approved versions and host capacity. Hyper-V comparison is conceptual. Do not promise a VM will run on every lab PC.

**11.1 / `network-task-manager`, duplicate Ex.47 p.48**
- Processes Network column → small approved browser activity → Performance adapter graph → send/receive values → identify app/time interval.
- Visual: process, Network column, adapter graph, units. Check: graph is per app? Performance graph is adapter-wide. Viva: why a baseline matters. No stress traffic generation.

**11.2 / `network-resource-monitor`, Ex.48 p.49**
- `resmon` Network → processes/network activity → remote addresses/rates → TCP connections → listening ports → approved activity → compare.
- Visual: four expandable sections, process selection and rates. Record process/rates/connection observation, redacting real addresses before publication. Check: bytes/sec equal bits/sec? No, 8 bits per byte. Viva: monitor versus firewall rule control.

**11.3 / `create-vm`, Ex.49 p.50**
- Check virtualization/host free resources → approved official hypervisor → New VM name/type → allocate safe RAM/CPU → virtual disk → attach Linux ISO → install guest → detach install ISO as needed → boot guest.
- Visual: host/guest boundary, RAM, virtual disk, ISO. Record hypervisor/guest/resources/boot evidence. Check: virtual disk erases host disk? A normal virtual disk is a host file; do not use raw physical disks. Viva: host versus guest. No BIOS changes without permission.

**11.4 / `vm-network-mode`, Ex.50 p.51**
- VM settings → compare NAT/bridged/host-only → NAT enabled → boot → guest address → shut down → bridged only if approved → reboot → compare observations → restore mode.
- Visual: three small topology panels with arrows and addresses labeled examples. Check: bridge always permitted? No. Viva: host-only normally supplies internet by itself? No. Explain hypervisor-specific differences; no universal claim about inbound access.

**11.5 / `guest-network-commands`, Ex.51 p.52**
- Linux guest terminal → `ip addr` → `ip route` → `ping -c 4 127.0.0.1` → assigned gateway → permitted domain → `ss -tuln` → record.
- Visual: Linux prompt, interface/address, default route, listeners. Check: Windows ping syntax identical? No, use -c on Linux. Viva: why verify guest route, not host route. Missing command is a prerequisite/tool issue, not automatic network failure.

**11.6 / `vm-network-metrics`, Ex.52 p.53**
- Start guest/network → host adapter graph → guest `ip -s link` baseline → small approved guest request → host graph → guest counters again → compare.
- Visual: host rate beside guest before/after counters and interval. Record RX/TX deltas plus units. Check: cumulative counter equals current rate? No. Viva: why host traffic can exceed guest traffic. Do not claim causal attribution from aggregate graph alone.

**11.7 / `vpn-connect`, Ex.53 p.54**
- Internet baseline → official approved client install → authorized account outside app → approved profile → connect → status/adapter or permitted public-IP observation → disconnect.
- Visual: provider-neutral connection states, tunnel concept, adapter observation. Record client/version/status without secrets. Check: VPN guarantees anonymity? No. Viva: tunnel purpose/trust boundary. No specific commercial provider endorsement without teacher selection.

**11.8 / `vpn-compare`, Ex.54 p.55**
- Baseline `ipconfig /all` and approved IP-check site → connect → repeat → compare adapter/public egress → disconnect → verify original connectivity.
- Visual: illustrative before/after table with separate private and public-address labels. Record changed/unchanged values in notebook; never upload real network info. Check: unchanged public IP always failure? No, split tunneling/policy can explain it. Viva: private adapter IP versus public egress.

### Week 12 — E-waste and energy (5 memberships)

These cards are guided observation/report tasks, not software installation guides. Use semantic text tables and process diagrams; do not generate fake regulator pages or invented recycler case studies. Phone-only virtual study is a valid path when the teacher approves it.

**12.1 / `ewaste-policy`, Ex.55 p.56**
- Visit syllabus portals `https://greene.gov.in/` and `https://kspcb.karnataka.gov.in/` → locate official rules/notifications → verify title/issue date/applicability/amendments → identify roles/EPR → write short findings with access date.
- Visual: evidence worksheet (authority, document title, date, provision, source), not asserted current legal facts. Record source URL/title/date and extracted responsibility.
- Check: an old webpage proves latest rules? No. Viva: EPR meaning and producer responsibility. Manual names E-Waste (Management) Rules, 2022 and subsequent amendments; current applicability was NOT independently checked for this handoff. Final legal summaries need official-source verification before release.

**12.2 / `ewaste-classify`, Ex.56 p.57**
- Observe teacher-provided items or approved photos → name/function → category → PCB/battery flags → reusable versus repair/recycle candidates → material/risk → record route.
- Visual: inventory rows with safe handling flags. Record item/category/condition/recommended authorized route. Check: every faulty item must be discarded? No, assess safe repair/reuse. Viva: why batteries need special handling. No hazardous dismantling; storage devices require institution-controlled data sanitization before transfer.

**12.3 / `ewaste-process`, Ex.57 p.58**
- Approved source → collection → transport/storage → segregation → authorized dismantling/material recovery → special-waste controls → worker/environment protection → draw process → explain authorized recycler role.
- Visual: vertical process flow, separate reuse branch and hazardous handling branch. Record source and stage-specific safeguards. Check: material recovery is a student DIY task? No. Viva: why authorized handling. No chemical extraction procedure.

**12.4 / `ewaste-case-study`, Ex.58 p.59**
- Select teacher-approved verified facility/source → location/activities → accepted categories → collection/storage → process evidence → recovery → worker safety/pollution controls → report observations and limitations.
- Visual: evidence cards “Observed / Reported / Not established”. Record facility/source/access date/evidence and conclusions. Check: missing evidence means compliant? No. Viva: observation versus marketing claim. If no verified case selected, retain a generic report scaffold, not a fictional completed report.

**12.5 / `lab-energy`, Ex.59 p.60**
- Inventory devices → measured or explicitly estimated watts → idle hours → sleep settings → repair/upgrade/printing/disposal practices → calculate energy → recommendations.
- Visual: one worked example: hypothetical 10 PCs saving 40 W each for 2 h/day over 20 days = 16 kWh. Show all assumptions; not a measurement of this lab.
- Record device count, power source, time assumptions, kWh, recommendations. Check: PSU 450 W label equals actual draw? No. Viva: energy versus power. CO2e only with verified emissions factor; no live calculator needed initially.

## 6. Implementation architecture and exact change targets

### Verified current extension points

- `src/exam/types.ts:66–70`: seven LAB_IDS and LabWeek = 5 | 6 | 7.
- `src/exam/labs.ts:14–39`: Lab fields and LAB_WEEKS metadata; seven data objects and lookup helpers at 334–336.
- `src/exam/components/LabStage.tsx:544`: exhaustive `Record<LabId, ComponentType<ScreenProps>>` dispatch. Adding IDs without updating visuals breaks completeness.
- `src/exam/components/LabsScreen.tsx:82–175`: filter held in local state; hardcoded seven/week5–7 copy; index/resume. Card at 180 onward uses global next-card order.
- `src/exam/routing.ts:17–32`: hash parsing/building; no week query handling yet.
- `src/exam/ExamPortal.tsx:11–65`: route state, history, heading focus and scroll reset.
- `src/exam/store.ts:29–63,153–158`: LAB_IDS-based sanitation and lastLab/reviewed persistence.
- `tests/labs.test.ts:6–52`: hardcoded 7, [5,6,7], [4,1,2], and number regex `/^0\d\.\d$/`; all must change intentionally.
- `package.json:14`: explicit list of test files, not automatic test discovery.

Older staticNotes/labScenarios and dynamic labs are separate content systems. Do not add new cards there expecting them to appear in ExamPortal. The exam content generator is for existing generated exam content, not the manually authored Lab objects; do not hand-edit generated drills/viva as part of this work.

### Proposed data contract (minimal, content-oriented)

- Extend LabWeek to 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 and LAB_IDS with the 37 new stable slugs specified above.
- Retain `Lab.week` as canonical/original week and `Lab.number` as existing display number. Add `alsoInWeeks?: LabWeek[]` for the four reused cards. `labsForWeek` includes primary and secondary memberships in the explicit week ordering given in section 5.
- Add source metadata to cards: `sources: { document: 'lab-manual'; experiment: string; page: number; title: string }[]`. Use page to distinguish duplicate 47. Populate citations for old cards from their actual matching manual pages (Rufus p16, partition pp17/20, Windows p18, Ubuntu p19, DiskPart p23, restore p26, startup p30).
- Add `prerequisites: string[]` and `expected: string[]`; old cards receive honest values too. Keep existing steps/record/check/ask fields. Use final procedural steps for cleanup, not a second competing sequence.
- Add `related?: LabId[]` for useful cross-links only (adapter/driver, VM sequence, recovery/restore). Do not require every card to link somewhere.
- A week-scoped presentation number can be derived from that week's array position (08.1…10.11); show original source citation separately. Do not mutate persisted IDs or duplicate data for numbering.
- If an explicit ordering map is introduced, validate every membership exactly once and reject unknown IDs; keep one canonical copy of each card.
- Update number validation to allow two-digit weeks and multi-digit positions, e.g. `/^(0[5-9]|1[0-2])\.[1-9]\d*$/`; also assert number uniqueness for canonical records.
- Keep the storage key and v1 schema. New IDs are accepted by existing sanitation; old state must survive. No reset/migration that clears progress.

### Content and visual organization

Do not append 37 full components to the already large LabStage file. Preserve its wrapper, accessible annotations, zoom and selection behavior. Extract existing screen components only as needed to let a typed registry compose focused files under `src/exam/components/lab-stages/` (new directory proposed).

Split new data into `src/exam/labs/week08.ts` through `week12.ts` (proposed), with a small shared Lab type module if needed to prevent runtime import cycles. Keep `src/exam/labs.ts` as aggregator and public lookup API so callers need minimal changes. Keep old seven records stable except approved reuse/safety corrections.

Use a typed exhaustive registry keyed by LabId. Reuse layout primitives across screen families, but every card gets content-specific annotations and a meaningful visual. No generic “screen coming soon” fallback:
- disk map / properties / command output;
- Settings / Device Manager / task table;
- IPv4 and DNS fields / topology / diagnostic transcript;
- monitoring graphs / VM settings / mode topology / before-after metrics;
- evidence worksheet / inventory / process flow / worked energy table.

A visual can be a labeled HTML diagram rather than raster art. Hardware photos should remain real or supplied reference images; no new image generation is required. Any future screenshots must redact personal data and have permission/provenance.

For the first release, command examples stay read-only in the cards. Do not expand the Terminal simulation to pretend to execute SFC, VPN, recovery or network settings. A future terminal-practice task must separately define supported simulated commands and label all outputs as simulated.

## 7. Ordered implementation workflow for the next agent

### Phase 0 — Confirm baseline and scope

1. Read this document and repository instructions. Inspect git status; preserve unrelated work, ignored artifacts and generated line-ending changes.
2. Confirm both source PDFs are accessible; if not, use this mapping as a draft and request the originals before claiming full manual verification.
3. Get approval for the proposed guide-card scope and shared-membership approach. Defaults are Windows 10 with Windows 11 path notes, VirtualBox/Linux example, provider-neutral VPN, teacher-selected case study.
4. Run existing tests/typecheck/build to establish a baseline. Do not assume historical green evidence applies to the current checkout.

Deliverable: confirmed scope and baseline results, no broad refactor.

### Phase 1 — Test-first data, route and progress foundation

1. Write failing tests for weeks 5–12, exact membership counts, unique IDs, retained old routes, duplicate manual-number disambiguation, source fields and every new required content field.
2. Add failing tests for week-aware hash parsing/building, malformed query/invalid membership handling, preserving existing machine/day/project/terminal routes.
3. Add store tests loading old v1 fixtures and new slugs; unknown IDs discarded; reviewed toggles/lastLab survive reload and storage events. Assert 44 unique cards, not 48 progress targets.
4. Implement data types, grouping/order helpers, route contract and minimally update callers. Keep unfinished cards off the production registry until their complete content/visuals land; use a branch, not visible placeholder cards.
5. Tests for first/middle/last contextual next navigation, All order, and repeated memberships sharing one reviewed mark.

Deliverable: tested contracts with no lost progress. Grouping and route helpers should be pure so node:test can test behavior without browser mocks.

### Phase 2 — Week 8 vertical slice

Implement nine memberships (six new cards plus three reused). Correct recovery command, registry merge wording and source/destination warnings. Add citation/prerequisite/expected-result rendering and a first meaningful new visual. Verify a card end-to-end on mobile before multiplying content.

Deliverable: every week 8 manual step/verification traced, no mock execution. Explicitly check invalid volume targets, unavailable recovery tool, recovery failure and unavailable rollback in copy.

### Phase 3 — Week 9

Implement eight memberships (seven new plus reused startup). Correct firmware-time measurement claim. Build task/driver/services/integrity visuals; keep service and adapter recovery steps visible.

Deliverable: no unsupported command spelling, no automatic repair or essential-service disablement, scheduled-task log path caveat included.

### Phase 4 — Week 10

Implement eleven distinct cards following local configuration → diagnosis → controlled repair → secured sharing/RDP sequence. Use one consistent illustrative topology. Validate that networking examples never execute from browser controls and no real network credentials appear.

Deliverable: all networking manual pages covered, with permission/cleanup and failure interpretation. Unknown DNS/SSID/host details remain explicitly teacher-assigned, not invented defaults.

### Phase 5 — Week 11

Implement eight cards. Reuse monitoring primitives while separating system totals from process metrics and host/guest counters. VM install and network mode cards have capacity/policy prerequisites. VPN pair stays provider-neutral.

Deliverable: NAT/bridged/host-only explained accurately; split-tunnel outcome supported; duplicate Ex.47 citations distinguishable.

### Phase 6 — Week 12

Implement five evidence-oriented cards and static worked energy example. Verify official sources before writing any current legal summary; include source title/date/access date. If sources are unavailable, deliver the research procedure and explicit “verify current notifications” caveat, not an invented compliance summary. A real recycler case study is optional until verified material is approved; the scaffold remains useful without one.

Deliverable: useful offline study structure, clearly marked online research steps, no fabricated facility or statistic.

### Phase 7 — Full QA and teacher content review

1. Review each of the 41 source entries against its implemented card, including omissions, modifications, safety corrections and expected results.
2. Typecheck, tests, production build. Add new tests to the explicit package script if new test files were created.
3. Start app and browser-test actual interactions, not just screenshots or source scanning.
4. Review phone and desktop layouts in light/dark themes; fix observed issues in one bounded batch and confirm.
5. Ask teacher to review legal sources, actual Windows/hypervisor versions, app/service/printer/VPN prerequisites and network policy. Unknown local details do not block generic revision cards, but must not be asserted as facts about the lab.
6. Report exactly what is implemented/tested/unverified. No “full syllabus coverage” claim while supplementary items in section 2 remain unimplemented.
7. Commit/deploy only on explicit approval. For native packaging later, build and verify separately; web verification is not APK verification.

Suggested implementation batches can become separate commits after approval: contracts + W8; W9; W10; W11; W12 + final QA. Do not commit a broken intermediate production branch.

## 8. Verification and acceptance checklist

### Automated

- [ ] 44 unique cards / IDs; 48 memberships; new week counts exactly 9/8/11/8/5; old counts 4/1/2 retained.
- [ ] Registry covers every LabId; no unimplemented visual fallback; every annotation number maps to visible controls/points.
- [ ] Metadata, source citation (page/title/number), prerequisites, ordered steps, observations, expected verification, check and viva present.
- [ ] Page 47 and 48 source records have distinct titles despite identical printed experiment number.
- [ ] Old hashes still resolve. Week filter/card context survives browser history. Invalid input falls back deliberately.
- [ ] Contextual next never skips out of the selected week. All mode uses unique-card order.
- [ ] Old v1 state retains reviewed marks and lastLab. New IDs persist. Reused cards toggle a single mark, never double-count.
- [ ] No fixtures with real passwords/tokens, no text inserted as unsafe HTML, no live system operations.
- [ ] `npm test`, `npm run lint`, `npm run build` all pass on the actual final tree.

Avoid tests that merely assert a helper constant exists. Assert grouping/route/persistence behaviors and source-to-card coverage. Editorial checks can verify exact known corrections, but manual semantic review is still necessary.

### Browser golden paths

At 390×844: open Week 8 → partition → annotations → answer reveal → reviewed → next → back; shared partition mark also visible in its old group. Open a W10 deep link fresh. Navigate back/forward. Open W11 guest command and W12 evidence card. Reload and Resume. Test keyboard Tab/Enter/Escape where applicable and heading focus on navigation.

At 320px width and 200% zoom: wrapped filters, long titles, command output, IP tables and source labels do not force whole-page horizontal scrolling. Local scroll on a clearly labeled code block is acceptable. Buttons have at least 44px usable targets, visible focus, no overlapping expanded hit regions. Color is not the only status indicator.

At desktop 1280×800: reasonable reading width, visual/text relationships intact. Light and dark themes: readable caution, annotations, diagrams and example tables. Test safe-area bottom navigation and install/offline prompt overlap. Do not regress Machine, Exam day, CIE-5 or Terminal.

### Offline / PWA

- Load the production build online; allow service-worker install, then disconnect network and reload a new week deep link.
- All authored cards and essential visuals work offline. Source websites, installers, VPN and regulations lookup explicitly require network; do not promise those operate offline.
- Compare generated precache against built assets, especially any lazy chunks/new media. Do not hardcode historical 38-entry precache count as a new acceptance requirement.
- If screenshots/shortcut wording still say Week 5–7, update them to reflect the expanded Labs surface; recapture actual UI screenshots, retaining exact manifest dimensions. Update tests that intentionally pin old shortcut copy.
- Test update prompt and state preservation through a new build. Never clear caches/localStorage merely to make a test pass on the student's device.

### Safety and content sign-off

- [ ] Disk/registry/repair examples have target checks and supervision; recovery can fail.
- [ ] No broad firewall/security disablement, public RDP exposure, unrestricted shares or unauthorized targets.
- [ ] No credentials in notebook prompts, code, screenshots, examples or handoff artifacts.
- [ ] Units and baseline comparisons correct; no invented measured values.
- [ ] Official regulation claims dated and verified, or explicitly unverified research tasks.
- [ ] All 41 mapped entries have manual-aligned procedure coverage; conceptual supplements clearly labeled.

## 9. Handoff instructions to paste to the next agent

Read WEEKS-08-12-HANDOFF.md and inspect the current repository before coding. This is a proposed static mobile revision-guide extension, not a real administration tool. Confirm implementation approval, preserve old URLs/progress, and follow phases 0–7. Use the syllabus for coverage and the supplied manual for procedural detail, with the documented safety/syntax corrections. Do not execute the administration commands while implementing the website. Keep 44 unique guides with shared week memberships rather than duplicate records. Test changes first, verify actual mobile UI and offline behavior, and return a page-by-page coverage report plus test evidence. Do not commit, push, deploy, add a backend, generate credentials, or claim native APK verification without explicit authorization/evidence.
