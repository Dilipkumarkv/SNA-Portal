# 12 Drill Cards — SEE Practical (25CS34I)

**Model paper scenario.** One integrated task, 45 marks: set up and maintain a computer for a small
office — verify the hardware, install and configure the operating system, install drivers and
utility software, diagnose and document issues, and set up wired networking.

**Time budget.** 180 minutes total: 165 minutes of drills + 15 minutes for documentation and viva.
Practise the drills in the order below — it is the order the paper follows.

**Machine.** Every drill assumes the lab PC is the Lenovo ThinkCentre M83 tower: H81 board,
LGA1150, 8 GB DDR3, 240 GB SATA SSD as Disk 0 (GPT, boots Windows), 500 GB SATA HDD as Disk 1,
integrated Intel HD graphics (VGA + DisplayPort only), Ethernet only, and the proprietary ~240 W
Lenovo PSU. There is no NVMe slot, no M.2, no graphics card and no PCIe power cable.

> **Two rules that protect the machine.** Never delete partitions on Disk 0 unless the instructor
> tells you to. Never connect the M83's Lenovo 24-pin harness to a standard PSU tester or a
> standard ATX supply.

---

## Time budget

| # | Drill | Min | Model-paper phase |
|---|-------|-----|-------------------|
| 01 | Hardware specification and compatibility report | 12 | Hardware identification |
| 02 | SMPS/PSU check | 12 | Hardware identification, diagnosis |
| 03 | Bootable USB and BIOS/UEFI settings | 15 | OS preparation |
| 04 | Windows clean install | 30 | OS installation and configuration |
| 05 | Drivers and utility software | 10 | Software installation |
| 06 | Partition, format and MBR/GPT identification | 12 | Disk configuration |
| 07 | DiskPart and command-line file operations | 8 | Disk configuration, CLI |
| 08 | Local users, groups and permissions | 12 | Administration |
| 09 | Performance triage | 12 | Diagnose and resolve |
| 10 | SFC, DISM, CHKDSK and System Restore | 15 | Diagnose and resolve |
| 11 | Network configuration and tests | 15 | Wired network setup |
| 12 | File sharing and Remote Desktop | 12 | Network services |
| — | Documentation and viva | 15 | Section 2 (5 marks) |
|   | **Total** | **180** | |

---

## Drill 01 — Hardware specification and compatibility report

**Time:** 12 min · **Phase:** hardware identification · **Viva:** Q1, Q2, Q3

**Do this**

1. With the PC powered off and unplugged, identify the front-panel ports (USB, audio, power button)
   and the rear ports (VGA, DisplayPort, USB 2.0/3.0, Ethernet, audio jacks, power inlet).
   The M83 has no HDMI and no Wi-Fi antenna.
2. Open the side panel and point out: H81 motherboard, LGA1150 CPU with heatsink, 4 DDR3 DIMM
   slots (two filled = 8 GB), 24-pin power, 4-pin CPU power, two SATA data cables, two SATA power
   leads, the two drive bays, and the empty PCIe x16 slot.
3. Boot Windows and open CPU-Z. Record CPU name, socket, chipset, BIOS version, memory size and
   speed, and the graphics adapter.
4. Write a five-line compatibility statement in the record book:
   - CPU socket LGA1150 matches the H81 board.
   - Memory is DDR3, not DDR4 — the board will not accept DDR4.
   - Storage is SATA only; there is no M.2/NVMe slot.
   - Graphics is integrated; there is no GPU and no PCIe power lead.
   - The 240 W proprietary PSU limits any future add-in card.

**Commands / paths:** `cpuz.exe` (portable), `msinfo32`, `dxdiag`

**Prove it:** point to each component by name, then read the compatibility statement aloud.

**Traps:** calling the DIMMs "RAM sticks" without saying DDR3; claiming the PCIe x16 slot can take
any card (the PSU has no PCIe power connector); confusing the VGA and DisplayPort outputs.

---

## Drill 02 — SMPS/PSU check

**Time:** 12 min · **Phase:** hardware identification and diagnosis · **Viva:** Q4, Q5, Q6, Q7

**Do this**

1. Use a loose standard ATX SMPS if the lab provides one for Experiments 4–7. Do **not** connect
   the M83's Lenovo harness to a standard tester — the Lenovo 24-pin looks like ATX but is wired
   to a different pinout.
2. On the loose unit, identify the 24-pin ATX, 4-pin CPU, SATA power and any Molex connectors.
3. Read the colour code: yellow +12 V, red +5 V, orange +3.3 V, black ground, purple +5 VSB,
   green PS-ON, grey PWR-OK.
4. Connect the 24-pin and 4-pin to the PSU tester (add a SATA/Molex load if the tester requires
   one). Switch on and read each rail.
5. Compare with tolerance ±5 %: 3.3 V → 3.14–3.47, 5 V → 4.75–5.25, 12 V → 11.4–12.6. Check the
   PG value (roughly 100–500 ms) and confirm the fan spins.
6. If a rail is out of tolerance, say which rail and what it feeds (12 V → drives and fans,
   5 V → logic and USB, 3.3 V → chipset and memory).

**Commands / paths:** PSU tester, multimeter (DC volts, black probe to ground)

**Prove it:** a completed rail table with measured values and a pass/fail verdict.

**Traps:** testing with no load and declaring the PSU good; probing the Lenovo harness with
standard pin assumptions; reporting the 5 VSB reading as the main 5 V rail.

---

## Drill 03 — Bootable USB and BIOS/UEFI settings

**Time:** 15 min · **Phase:** OS preparation · **Viva:** Q10, Q11

**Do this**

1. Plug in the USB drive (8 GB or larger) and note its letter. Confirm it contains nothing needed.
2. Open Rufus, select the Windows ISO, choose **GPT / UEFI** partition scheme (the M83 boots UEFI
   with a GPT Disk 0), FAT32 or NTFS with the UEFI:NTFS option if the ISO has a large `install.wim`,
   then Start and wait for "READY".
3. Reboot the M83 and press **F12** for the boot menu (F1 enters setup). Confirm the USB appears.
4. Enter **F1** setup and check: Boot Mode = UEFI, USB boot enabled, Secure Boot state, boot order.
   If the USB does not appear, disable Fast Boot and recheck.
5. Save and exit (F10). Boot from the USB and stop at the Windows Setup language screen — do not
   install yet.

**Commands / paths:** Rufus, F12 boot menu, F1 setup, F10 save

**Prove it:** the USB boots to Windows Setup, and you can name the setting you changed.

**Traps:** making a Legacy/MBR USB for a UEFI-only boot entry; leaving Fast Boot on; changing
Secure Boot without being asked; formatting the wrong USB drive.

---

## Drill 04 — Windows clean install

**Time:** 30 min · **Phase:** OS installation and configuration · **Viva:** Q12, Q13

**Do this**

1. Boot from the prepared USB. Choose language and keyboard, then **Install now** → "I don't have
   a product key" if instructed.
2. Choose **Custom: Install Windows only (advanced)**.
3. Identify the disks by size: **Disk 0 = 240 GB SSD** (system, GPT), **Disk 1 = 500 GB HDD**.
   Install only to the instructor-designated disk. On the M83, never delete the EFI, MSR or
   Recovery partitions on Disk 0 unless the instructor explicitly says so.
4. Select the target partition, format it if instructed, and install. The PC restarts several times.
5. At first-run setup, create the account required by the paper — for the CIE-2 pattern that is
   `CSE_LAB1_01` with a strong password. Choose privacy settings as instructed.
6. After the desktop loads, check Device Manager for warning triangles, then install drivers
   (Drill 05). Record the install path, time taken and any errors.

**Commands / paths:** Windows Setup, `devmgmt.msc`, `winver`, `msinfo32`

**Prove it:** a booted desktop, the correct account signed in, and a completed install log.

**Traps:** deleting Disk 0 partitions to "start clean"; installing to the USB itself; skipping the
account requirement; leaving Device Manager with unknown devices.

---

## Drill 05 — Drivers and utility software

**Time:** 10 min · **Phase:** software installation · **Viva:** Q13

**Do this**

1. Open Device Manager and expand every category. Note any device with a yellow warning mark or
   listed under "Other devices".
2. Install in this order: chipset INF → Ethernet → audio → graphics → USB/other. Use the
   Lenovo-approved package for the M83 machine type, or Windows Update if instructed.
3. Use **Update driver → Browse my computer** for a supplied package; use **Search automatically**
   only when the network is available.
4. Install CPU-Z (or the approved utility) and read CPU, memory and mainboard tabs.
5. Reopen Device Manager and confirm no warning marks remain. Record driver versions.

**Commands / paths:** `devmgmt.msc`, `pnputil /add-driver <inf> /install`, `msinfo32`

**Prove it:** a clean Device Manager and the CPU-Z mainboard/CPU readings.

**Traps:** installing the graphics driver before the chipset; downloading random "driver pack"
sites; forgetting that the M83 has no Wi-Fi adapter, so a "missing Wi-Fi driver" is not a fault.

---

## Drill 06 — Partition, format and MBR/GPT identification

**Time:** 12 min · **Phase:** disk configuration · **Viva:** Q18, Q19, Q20

**Do this**

1. Open Disk Management (`diskmgmt.msc`). Identify Disk 0 (SSD, system, GPT) and Disk 1 (HDD).
2. Confirm the partition style: right-click Disk 0 → Properties → Volumes, or use DiskPart
   `list disk` and read the GPT column (`*` = GPT).
3. On **Disk 1 only**, and only after the instructor confirms it can be repartitioned: shrink an
   existing volume or delete a non-system volume to create unallocated space.
4. Create a new simple volume, assign a letter, format **NTFS**, quick format, label it
   `SNA_DATA`. Confirm it appears in File Explorer.
5. Note in the record book: Disk 0 is GPT because Windows was installed in UEFI mode; MBR would
   limit the disk to 2 TB and four primary partitions.

**Commands / paths:** `diskmgmt.msc`, `diskpart` → `list disk` → `select disk 1` → `detail disk`

**Prove it:** the new NTFS volume mounted, plus the partition-style evidence for both disks.

**Traps:** touching Disk 0; converting MBR↔GPT (destroys data); using `clean` on any disk;
forgetting that extend needs adjacent unallocated space to the right.

---

## Drill 07 — DiskPart and command-line file operations

**Time:** 8 min · **Phase:** disk configuration and CLI · **Viva:** Q18

**Do this**

1. Open Command Prompt as administrator.
2. Run DiskPart and inspect only: `list disk`, `select disk 1`, `detail disk`, `list partition`,
   `list volume`, `exit`. Do not run `clean`, `create` or `format` here.
3. In the command prompt, create a working folder and practise:
   `cd /d C:\`, `mkdir SNA_CLI`, `cd SNA_CLI`, `echo test > note.txt`, `type note.txt`,
   `copy note.txt copy.txt`, `ren copy.txt renamed.txt`, `move renamed.txt C:\SNA_CLI\`,
   `dir /a`, `del renamed.txt`, `rmdir /s /q C:\SNA_CLI` (on your own folder only).
4. Show the difference between `dir` (current folder) and `dir /s` (recursive), and between
   `del` (file) and `rmdir` (folder).

**Commands / paths:** `diskpart`, `cd`, `mkdir`, `dir`, `copy`, `move`, `ren`, `del`, `type`

**Prove it:** the folder created, files copied/renamed, and the DiskPart `detail disk` output.

**Traps:** running `clean` on Disk 1 "to see what happens"; deleting anything outside your own
folder; using `del` on a folder without `/s`.

---

## Drill 08 — Local users, groups and permissions

**Time:** 12 min · **Phase:** administration · **Viva:** Q24, Q25, Q26

**Do this**

1. Open `lusrmgr.msc` (Windows Pro/Enterprise) and show Local Users and Groups. On Home edition,
   use Control Panel → User Accounts instead.
2. Create the account `CSE_LAB1_01` with a strong password. Add it to **Users**; add it to
   **Administrators** only if the paper asks for an admin account.
3. Repeat the same creation in PowerShell:
   `New-LocalUser -Name "CSE_LAB2_01" -Password (Read-Host -AsSecureString "Password")`
   then `Add-LocalGroupMember -Group "Users" -Member "CSE_LAB2_01"`.
4. Show group membership with `net user CSE_LAB1_01` and `Get-LocalGroupMember -Group "Users"`.
5. Create `C:\SNA_Test\report.txt`. Use `icacls` to show permissions, grant Modify to
   `CSE_LAB1_01`, and show the change. Then remove the test account with `Remove-LocalUser`.
6. State the difference between share permissions and NTFS permissions.

**Commands / paths:** `lusrmgr.msc`, `net user`, `net localgroup`, `New-LocalUser`,
`Add-LocalGroupMember`, `Get-LocalUser`, `icacls`

**Prove it:** the account visible in both GUI and PowerShell, correct group membership, and an
`icacls` output showing the granted permission.

**Traps:** creating the account without a password; adding every account to Administrators;
confusing `net user` (local account) with a Microsoft account; forgetting to remove test accounts.

---

## Drill 09 — Performance triage

**Time:** 12 min · **Phase:** diagnose and resolve · **Viva:** Q14

**Do this**

1. Open Task Manager (`Ctrl+Shift+Esc`). On the Processes tab, sort by CPU, Memory and Disk and
   name the top three consumers.
2. Open the Performance tab and read CPU, memory, disk and Ethernet graphs. Note whether memory
   is near 100 % (the M83 has 8 GB).
3. Open Resource Monitor (`resmon`) → Overview, then the Disk tab. Identify which process is doing
   the most disk I/O.
4. Open the Startup apps tab and disable one unnecessary startup item (record what you disabled).
5. Open Services (`services.msc`) and find one non-essential service; do not stop it unless the
   instructor approves.
6. Open Event Viewer (`eventvwr.msc`) → Windows Logs → System and find the most recent error.
   Read its source, ID and time.
7. Run Disk Cleanup (`cleanmgr`) on C: and note the reclaimable space.

**Commands / paths:** `taskmgr`, `resmon`, `services.msc`, `eventvwr.msc`, `cleanmgr`

**Prove it:** a short table — top process by CPU, memory and disk, plus one Event Viewer error
with its ID.

**Traps:** ending a system process; disabling a service without recording it; treating a full
disk as a CPU problem; forgetting that 8 GB RAM makes memory pressure normal under load.

---

## Drill 10 — SFC, DISM, CHKDSK and System Restore

**Time:** 15 min · **Phase:** diagnose and resolve · **Viva:** Q22, Q23

**Do this**

1. Create a restore point first: `sysdm.cpl` → System Protection → Create, or
   `Checkpoint-Computer -Description "Before repair checks"`.
2. Open Command Prompt as administrator.
3. Run `DISM /Online /Cleanup-Image /ScanHealth`. If corruption is reported, run
   `DISM /Online /Cleanup-Image /RestoreHealth` (instructor approval).
4. Run `sfc /scannow` and record the result.
5. Run `chkdsk C:` (read-only). Do **not** add `/f` or `/r` unless instructed — they need a
   dismount or a reboot.
6. Open `rstrui.exe` and show the restore points available. Do not restore unless the paper asks.
7. Record: the exact commands, the result line from each, and the time taken.

> The lab manual prints `/Clean-up-Image`. The correct switch is `/Cleanup-Image`. Use the correct
> form in the exam and point out the typo if asked.

**Commands / paths:** `DISM /Online /Cleanup-Image /ScanHealth`,
`DISM /Online /Cleanup-Image /RestoreHealth`, `sfc /scannow`, `chkdsk C:`, `rstrui.exe`

**Prove it:** the command output for each tool and a restore point with a timestamp.

**Traps:** running SFC without elevation; running `chkdsk /f` on C: mid-exam (it schedules a
reboot); restoring a restore point after the work is done; mis-typing `/Cleanup-Image`.

---

## Drill 11 — Network configuration and tests

**Time:** 15 min · **Phase:** wired network setup · **Viva:** Q27, Q28, Q29, Q30

**Do this**

1. Open `ncpa.cpl` and identify the Ethernet adapter. The M83 has no built-in Wi-Fi.
2. Open adapter Properties → IPv4 → Properties. Set the instructor-supplied static values, e.g.
   IP `192.168.1.10`, mask `255.255.255.0`, gateway `192.168.1.1`, DNS as provided.
3. Run `ipconfig /all` and confirm the address, mask, gateway, DNS and the adapter description and
   MAC address.
4. Run these tests in order and record each result:
   - `ping 127.0.0.1` — TCP/IP stack
   - `ping <gateway>` — local network
   - `ping <other-PC-IP>` — another permitted machine
   - `ping example.com` — DNS plus routing
   - `nslookup example.com` — DNS resolution
   - `tracert example.com` — hops and latency
   - `netstat -ano` — listening and established connections with PIDs
5. Show the DNS cache: `ipconfig /displaydns`, then `ipconfig /flushdns`.
6. Open `wf.msc` and show the Domain, Private and Public profiles. Note the active profile.
7. Run `netsh int ip reset` only if the instructor explicitly asks; note that it resets custom
   settings and needs a restart.

**Commands / paths:** `ncpa.cpl`, `ipconfig /all`, `ping`, `nslookup`, `tracert`, `netstat -ano`,
`ipconfig /displaydns`, `ipconfig /flushdns`, `wf.msc`

**Prove it:** a printed/screenshot `ipconfig /all` plus a test table with sent/received/lost and
average round-trip time.

**Traps:** setting a duplicate IP; forgetting the gateway; blaming DNS when `ping 8.8.8.8` works
but names do not resolve (that is DNS); running `netsh int ip reset` without approval.

---

## Drill 12 — File sharing and Remote Desktop

**Time:** 12 min · **Phase:** network services · **Viva:** Q30

**Do this**

1. On PC A, create `C:\SNA_Shared` and put two test files in it.
2. Right-click → Properties → Sharing → Advanced Sharing → **Share this folder**. Set a share name
   and permissions for the approved user or group only.
3. Confirm the NTFS permissions on the Security tab match the intended access.
4. On PC B, press `Win+R` and open `\\<PC-A-IP>\SNA_Shared`. Enter the approved credentials and
   open a file.
5. On PC A, open Settings → System → Remote Desktop. Enable it **only if** the edition is Pro or
   Enterprise and the instructor authorises it. Add the approved user to Remote Desktop Users.
6. On PC B, run `mstsc`, enter the host name or IP, connect and sign in. Then sign out.
7. Disable Remote Desktop and remove the test share when instructed. Record what was enabled.

**Commands / paths:** `\\<IP>\<share>`, `mstsc`, `SystemPropertiesRemote.exe`, `net share`,
`Get-SmbShare`

**Prove it:** PC B opening a file from `\\<PC-A-IP>\SNA_Shared`, then a clean RDP sign-in and
sign-out.

**Traps:** enabling sharing for "Everyone"; leaving RDP enabled after the drill; trying to host RDP
from Windows Home; exposing port 3389 beyond the lab LAN.

---

## Documentation and viva (15 min)

The paper ends with documentation and a short viva (Section 2, 5 marks). Keep one page ready:

- Machine: ThinkCentre M83, H81, LGA1150, 8 GB DDR3, 240 GB SATA SSD (Disk 0, GPT) + 500 GB SATA
  HDD (Disk 1), integrated graphics, Ethernet only, 240 W proprietary PSU.
- What you did: the drills completed, in order, with times.
- Evidence: CPU-Z readings, `ipconfig /all`, ping/tracert output, Device Manager clean, new
  partition, new account, restore point, share path.
- Problems found and how you resolved them.
- One thing you would do differently.

Answer viva questions in this shape: **name it → say what it does → give the lab example**. Keep
answers to three sentences and stop. If you do not know, say what you would check first.

---

## Corrections and gaps in the lab manual

Flag these to the teacher; do not copy them into the exam.

1. **DISM typo.** Experiment 36 prints `DISM /Online /Clean-up-Image`. The correct switch is
   `/Cleanup-Image`. `sfc /scannow`, `chkdsk C:` and the rest of the experiment are correct.
2. **Missing experiments 18 and 19.** The manual jumps from 17 to 20 with no explanation.
3. **Duplicate Experiment 47.** "Monitoring Network Activity Using Task Manager" repeats the
   number used by Remote Desktop. The content is valid; the numbering is not.
4. **No user-account or PowerShell experiment.** Syllabus week 6 requires creating and verifying
   local accounts (Control Panel, PowerShell) and simple PowerShell scripts, but no experiment
   covers it. Drill 08 fills that gap.
5. **Printer experiment 34** needs a physical printer. If the exam hall has none, the invigilator
   may substitute a driver-install demonstration (Drill 05).
6. **M83 PSU warning.** Experiments 4–7 assume a standard ATX supply. The M83's Lenovo 24-pin is
   not standard; the loose SMPS units must be used for tester and multimeter work.
