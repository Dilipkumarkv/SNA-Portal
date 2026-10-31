# 30 Viva Answers — SEE Practical (25CS34I)

**How to answer.** Name it → say what it does → give the lab example. Three sentences, then stop.
The invigilator is checking that you can explain what your hands just did, not that you can recite
a textbook.

**Where these come from.** Every question in the syllabus theory model paper is covered here
(marked **Model paper**), plus the lab-manual experiments and the M83 hardware. Section 2 of the
SEE is 5 marks; the viva usually lasts 3–5 minutes.

**Most likely ten:** Q1, Q4, Q6, Q8, Q10, Q13, Q14, Q18, Q27, Q30.

---

## A. Hardware and power

### Q1. Categorise these into input, output, processing/memory, storage and network: mouse, phone display, RAM, RJ45, flash drive, NIC, printer, projector, cache. *(Model paper)*

- **Input:** mouse.
- **Output:** phone display, printer, projector.
- **Processing/memory:** RAM, cache. Both are volatile; cache is inside the CPU and fastest.
- **Storage:** flash drive — secondary, non-volatile.
- **Network:** NIC (the adapter) and RJ45 (the connector on it, not a device by itself).

A device can have more than one role — a phone display is both input (touch) and output — but give
the primary category and say why.

**Trap:** calling RAM "storage". RAM is working memory; it loses its contents when power goes off.

---

### Q2. A friend asks what to look for when buying a desktop. What do you advise? *(Model paper)*

Ask about **use first**: office work, programming, design or gaming decides the CPU, RAM and
graphics. Then check compatibility — CPU socket matches the motherboard, memory type matches the
board (DDR3 vs DDR4 vs DDR5), storage is SSD for the OS, and the PSU has enough watts and the right
connectors for the chosen card. Prefer a board with free RAM slots and a free drive bay so it can
be upgraded, and check the warranty and service support. Avoid unbranded PSUs and "gaming" cases
with no airflow. In the lab, the M83 shows the trade-off: a 240 W proprietary PSU and no PCIe power
lead mean a graphics card is not an option.

**Trap:** recommending the fastest CPU first. The budget usually belongs in an SSD and enough RAM.

---

### Q3. Compare the hardware of a desktop with a mobile phone. *(Model paper)*

Both have a CPU, memory, storage, display, battery/power and network radios — the architecture is
the same. A desktop uses a socketed CPU (LGA1150), separate DDR3 DIMMs, 2.5"/3.5" SATA drives, a
standard ATX power supply and replaceable expansion cards. A phone uses a soldered SoC (CPU + GPU +
RAM in one package), UFS/eMMC storage, a lithium battery, integrated Wi-Fi/cellular/Bluetooth and
no user-serviceable parts. The desktop is upgradeable and repairable; the phone is smaller, more
power-efficient and sealed. Same concepts, different packaging.

**Trap:** saying a phone has "no RAM" or "no operating system". It has both, just soldered.

---

### Q4. What is an SMPS and how does it work? *(Model paper)*

SMPS = Switched-Mode Power Supply. It converts 230 V AC mains into the regulated DC rails a PC
needs (+3.3 V, +5 V, +12 V, −12 V, +5 VSB). The mains is filtered, rectified and smoothed to about
325 V DC, then switched on and off at high frequency (tens of kHz) by a MOSFET through a ferrite
transformer. The secondary side rectifies and filters that into the output rails, and a feedback
circuit adjusts the switching duty cycle to hold the voltage steady. High frequency allows a small
transformer, so it is lighter and 70–90 % efficient, unlike an old linear supply. ATX adds +5 VSB
standby and the PS-ON signal that lets the motherboard turn the supply on.

**Trap:** saying it "steps down AC with a transformer". It rectifies first, then switches.

---

### Q5. What are the SMPS voltage colour codes? Why can't you trust them on the lab M83?

Standard ATX: **yellow +12 V, red +5 V, orange +3.3 V, black ground, purple +5 VSB, green PS-ON,
grey PWR-OK, blue −12 V**, and white −5 V on very old units. The M83's Lenovo 24-pin connector
looks like ATX but uses a Lenovo-specific pinout, so the colours and pin positions on that harness
must not be assumed to match. That is why the SMPS experiments use the loose standard ATX units for
tester and multimeter work, and why the Lenovo harness is never plugged into a standard tester
without an approved adapter.

**Trap:** probing the Lenovo board connector with standard ATX pin assumptions — it can short a
rail.

---

### Q6. How do you diagnose PSU faults with a PSU tester? *(Model paper)*

Connect the 24-pin and the 4-pin CPU connector to the tester (some testers also need a SATA or
Molex load), switch the supply on and read each rail. Check against ±5 % tolerance: 3.3 V →
3.14–3.47 V, 5 V → 4.75–5.25 V, 12 V → 11.4–12.6 V; also check the PG (power-good) delay of about
100–500 ms and that the fan spins. A rail that is missing or out of range points to a faulty supply
or a blown rail, not a motherboard fault. A tester is a quick go/no-go check; a multimeter under
load is more reliable, and neither measures ripple or full-load behaviour.

**Trap:** testing with no load and passing a supply that fails under load. Also, a dead fan is a
symptom, not proof — check the rails.

---

### Q7. A student on a plastic chair got a shock while touching the cabinet, even with the PSU unplugged. Why, and how do you prevent it? *(Model paper)*

Moving on a synthetic chair or carpet separates charge — the triboelectric effect — and the body can
hold thousands of volts at very low current. Touching the earthed metal chassis discharges that
charge through the hand, which is felt as a shock; the same discharge can destroy CMOS chips
(ESD damage can occur from as little as tens of volts). Prevention: wear an antistatic wrist strap
connected to bare metal, work on a grounded mat, touch the unpainted chassis before handling parts,
hold cards by the edges, store them in antistatic bags, and avoid synthetic clothing and carpet.
Unplug the PC and hold the power button for a few seconds to drain residual charge before working.

**Trap:** saying "the PSU was unplugged, so it was safe". The shock is static from the body, not
mains.

---

## B. Motherboard, boot and OS

### Q8. Which is faster, the northbridge or the southbridge? *(Model paper)*

The northbridge is faster. It connects the CPU to the high-speed components — RAM, PCIe/graphics —
and runs close to the CPU's front-side bus. The southbridge handles slower I/O — USB, SATA, audio,
LAN, legacy ports and the BIOS — through a slower internal link. On modern Intel platforms such as
the M83's H81, the memory controller and PCIe lanes are inside the CPU, so the northbridge no
longer exists as a separate chip; the remaining chip is the PCH (Platform Controller Hub), which
does the southbridge job. For the exam: northbridge faster, and on H81 the old two-chip split is
conceptual.

**Trap:** pointing at the H81 chip and calling it the northbridge. It is the PCH.

---

### Q9. What happens when you press the power button?

1. The PSU asserts **PWR-OK** (power good) and the CPU starts from its reset vector.
2. **POST** runs from BIOS/UEFI: CPU, memory, graphics and devices are initialised; faults are
   reported by beeps or on-screen messages.
3. Firmware reads the **boot order** and loads the bootloader from the EFI System Partition
   (UEFI/GPT) or the MBR (legacy BIOS).
4. The bootloader — Windows Boot Manager (`bootmgr`) or GRUB — loads the **kernel**
   (`ntoskrnl.exe` or `vmlinuz`) and its drivers.
5. Session Manager, services (`smss`, `csrss`, `winlogon`) start, then **Winlogon/LSASS** presents
   the sign-in screen.
6. After authentication, the shell (Explorer) loads and the desktop appears.

**Trap:** skipping POST. If there is no display and no beep, the fault is before the OS.

---

### Q10. BIOS or UEFI — and why won't the PC boot from a pen drive? *(Model paper)*

BIOS is the legacy 16-bit firmware: MBR disks, a 2 TB limit, four primary partitions, slow INT13
disk access. UEFI is the modern 32/64-bit firmware: GPT disks, more than 2 TB, Secure Boot, faster
boot, graphical setup, and the bootloader lives on an EFI System Partition. A USB drive fails to
boot if it is not first in the boot order, Fast Boot skips USB, the USB was made for the wrong
mode (Legacy/MBR USB on a UEFI-only setting, or the reverse), Secure Boot rejects it, the USB is
not actually bootable, or the port/hub is faulty. On the M83: press **F12** for the boot menu, **F1**
for setup, set Boot Mode to UEFI, enable USB boot and disable Fast Boot, then save with F10.

**Trap:** changing Secure Boot before checking boot order and boot mode.

---

### Q11. How do you make a bootable Windows USB?

Use Rufus with the Windows ISO. Choose **GPT / UEFI** for a modern UEFI machine like the M83 (the
system disk is GPT), or MBR/BIOS only for a legacy target. Use FAT32 where possible, because UEFI
firmware reads FAT32; if `install.wim` is larger than 4 GB, use NTFS with Rufus's UEFI:NTFS
option or split the image. Start the write, wait for "READY", then test it from the boot menu.
The same idea applies to Linux ISOs, where Rufus writes the ISO in DD mode or ISO mode as the
distro recommends.

**Trap:** using a FAT32 stick with a 5 GB `install.wim` and wondering why Setup fails.

---

### Q12. Clean install, upgrade or reset — what is the difference?

A **clean install** wipes the target partition and installs a fresh OS: fastest and cleanest, but
you must back up and reinstall apps. An **upgrade** replaces the OS in place and keeps files, apps
and settings: convenient, but it can carry old faults forward. A **reset** reinstalls Windows from
the recovery image, keeping or removing files as chosen: useful without media, but it can restore
OEM software. In the exam, "install the OS" means a clean install to the instructor-designated disk,
followed by drivers, updates and the required account (`CSE_LAB1_01` in the CIE-2 pattern).

**Trap:** deleting Disk 0's EFI/MSR/Recovery partitions to "make it clean" without permission.

---

### Q13. A student installs an older OS and the Wi-Fi/chipset devices stop working. Why, and how do you fix it? *(Model paper)*

The older OS does not include drivers for the newer chipset (for example H81), so Device Manager
shows unknown devices or warning marks and the network, audio or video does not work. Install the
**chipset INF package first**, then the LAN, audio, graphics and USB drivers, using the
manufacturer's package for that machine type or Windows Update. In Device Manager, right-click the
device → Update driver → Browse, or use `pnputil /add-driver <file>.inf /install`. Recheck Device
Manager and test the device. If the vendor never released a driver for that OS, the OS is not
supported on that hardware — the correct fix is a supported OS, not a driver hunt.

**Trap:** installing the graphics driver before the chipset, or downloading from a random driver
site.

---

## C. OS behaviour and virtualisation

### Q14. An app has hung and the student refuses to restart. How do you kill it? *(Model paper)*

Open Task Manager with `Ctrl+Shift+Esc`, select the app on the Processes tab and choose **End task**.
If the window will not respond, go to the Details tab and use `taskkill /PID <pid> /F` (or
`taskkill /IM app.exe /F`) from an elevated prompt. Use Resource Monitor to see what the process is
blocked on — disk, CPU or network — and Event Viewer → Windows Logs → Application to find the
faulting module. In PowerShell, `Get-Process | Where-Object Responding -eq $false` lists hung
processes. Unsaved data in that app is lost, but Windows itself keeps running.

**Trap:** ending `explorer.exe` or a system process. Kill the application, not the shell.

---

### Q15. What is the difference between a single-boot VM and a dual-boot machine? *(Model paper)*

Dual boot installs two operating systems on the same physical disk; only one runs at a time and a
bootloader chooses between them, so the disk must be partitioned. A VM installs the guest OS inside
a hypervisor (VirtualBox, VMware, Hyper-V) on a virtual disk file; the host keeps running and both
systems run at the same time. The VM sees emulated hardware — virtual CPU, RAM, disk and NIC — and
does not touch the host's partitions. "Single-boot" simply means the VM boots its own OS inside the
window. VMs give snapshots, isolation and easy rollback; dual boot gives full hardware performance.

**Trap:** saying a VM "needs a separate partition". It needs a virtual disk file.

---

### Q16. Compare Windows, Linux and Android. *(Model paper)*

**Windows** is a closed-source commercial desktop OS: NTFS, GUI-first, .exe/MSI installers, the
registry, a large driver ecosystem and paid licences. **Linux** is an open-source kernel with
distributions: ext4/Btrfs, package managers (apt, dnf), POSIX permissions, terminal-first
administration and no licence fee. **Android** is a mobile OS built on the Linux kernel with the
AOSP framework and Google services: ext4/F2FS, APK apps, each app sandboxed under its own user ID,
optimised for ARM and battery. All three have a kernel, a file system, users and permissions; they
differ in form factor, licensing and app model.

**Trap:** calling Android "just Linux". It uses the Linux kernel but not the GNU userland or a
desktop stack.

---

### Q17. What are NAT, bridged and host-only networking in a VM?

**NAT:** the VM shares the host's IP and can reach the internet, but inbound connections need port
forwarding; this is the default and the safest. **Bridged:** the VM gets its own address on the
physical LAN and appears as a separate machine — use this for ping, file-sharing and RDP tests
between the VM and a lab PC. **Host-only:** the VM can talk only to the host through a virtual
adapter, isolated from the LAN — useful for safe experiments. VirtualBox also has an internal
network for VM-to-VM traffic. VMware offers the same NAT/bridged/host-only trio.

**Trap:** using NAT and then wondering why the second PC cannot ping the VM.

---

## D. Storage and recovery

### Q18. MBR or GPT — what is the difference, and which does the M83 use?

**MBR** lives in the first 512-byte sector: boot code plus a four-entry partition table, a 2 TB disk
limit, and BIOS booting. **GPT** stores up to 128 entries with 64-bit LBA addresses, has a
protective MBR and a backup header at the end of the disk, uses CRC32 checksums, supports disks far
beyond 2 TB and requires UEFI for booting. The M83's Disk 0 is **GPT** because Windows was installed
in UEFI mode; check with Disk Management → Properties → Volumes, or `diskpart` → `list disk` and
look for the asterisk in the GPT column. Converting between the two destroys data.

**Trap:** running `diskpart clean` to "convert". Back up first; conversion is not a repair step.

---

### Q19. FAT32, NTFS or exFAT — when do you use each?

**FAT32:** maximum 4 GB file size, widely compatible, no permissions or journaling — good for small
boot USBs and legacy devices. **NTFS:** journaling, ACL permissions, EFS encryption, compression,
quotas, large files and volumes — the Windows system and data choice. **exFAT:** designed for flash
media, no 4 GB file limit, no journaling or permissions, works across Windows, macOS and Linux —
good for large removable drives. In the lab, format the new data partition as NTFS; use exFAT only
when a large file must move between different operating systems.

**Trap:** formatting the Windows system partition as exFAT. Windows will not boot from it.

---

### Q20. Why can't you extend a partition, and how does shrink work?

**Extend** needs unallocated space immediately to the right of the volume on the same disk; if
another partition sits between them, Disk Management cannot extend it. **Shrink** needs free space
at the end of the volume, and unmovable files — the page file, hibernation file or MFT — can block
it; disabling hibernation or moving the page file can free the space. Neither operation can cross a
physical disk. In the lab, do this on Disk 1, never Disk 0. Back up before repartitioning; a
third-party tool can move partitions, but that is slower and riskier in an exam.

**Trap:** shrinking C: and expecting to extend D: on a different disk. Unallocated space is
per-disk.

---

### Q21. How does deleted-file recovery work?

Deleting a file removes its directory entry and marks its clusters free, but the data stays on disk
until something overwrites it. Recovery therefore works best immediately: stop writing to that
volume, check the Recycle Bin first, then use Windows File Recovery —
`winfr C: D: /regular /n *.docx` — writing the output to a different drive. Recuva or PhotoRec are
alternatives for deeper scans. On an SSD, TRIM may erase the blocks quickly, so recovery is less
certain than on a hard disk. Restoring from a backup or a Previous Versions snapshot is always
safer than carving.

**Trap:** recovering onto the same drive you are recovering from — it overwrites the data.

---

### Q22. System Restore, Reset, Recovery or an image — what does each do?

**System Restore** rolls back the registry, system files, drivers and settings to a restore point;
personal files stay, and apps installed later may need reinstalling — it is not a backup.
**Reset this PC** reinstalls Windows, either keeping personal files or removing everything.
**Windows Recovery Environment (WinRE)** provides Startup Repair, System Restore, Command Prompt,
Startup Settings (Safe Mode) and Reset when the OS will not boot. **A system image** restores the
entire disk to a previous state, including apps and data. Choose by the fault: a bad driver or
update → System Restore; a corrupted OS → Reset or WinRE; a dead disk → image.

**Trap:** using System Restore as a file backup. It does not restore documents.

---

### Q23. How do you back up and restore the registry?

Open `regedit` → File → Export, choose "All" or a branch, and save a `.reg` file; or use
`reg export "HKLM\SOFTWARE\..." backup.reg` from a prompt. Restore by double-clicking the `.reg`
file (merge) or `reg import backup.reg`; for offline repair, `reg save` and `reg load` work on hive
files. System Restore also snapshots the registry, so a restore point is a second safety net. Never
hand-edit registry values without a backup, and do not import a `.reg` file from an untrusted
source.

**Trap:** exporting only one branch and thinking the whole registry is covered.

---

## E. Users and security

### Q24. What is the difference between a standard user and an administrator? What does UAC do?

A **standard user** can run applications and change their own settings; an **administrator** can
install software, change system-wide settings, manage devices and other users. **UAC** prompts when
an action needs elevation — a consent prompt for an administrator, a password prompt for a standard
user — so the session does not run with full rights all the time. Least privilege limits what
malware can do and is why the built-in Administrator account is disabled by default. In the lab,
create `CSE_LAB1_01` as a standard user unless the paper asks for an administrator.

**Trap:** adding every new account to Administrators "to make it work".

---

### Q25. How do you create and verify a local user account?

Three routes: **Control Panel** → User Accounts → Manage another account → Add; **`lusrmgr.msc`**
on Pro/Enterprise; or the command line. In Command Prompt:
`net user CSE_LAB1_01 P@ssw0rd /add` then `net localgroup Users CSE_LAB1_01 /add`. In PowerShell:
`New-LocalUser -Name "CSE_LAB1_01" -Password (Read-Host -AsSecureString "Password")` then
`Add-LocalGroupMember -Group "Users" -Member "CSE_LAB1_01"`. Verify by signing out and back in as
the new user, then check `whoami` and `net user CSE_LAB1_01`; confirm group membership with
`Get-LocalGroupMember -Group "Users"`. Remove test accounts with `Remove-LocalUser`.

**Trap:** creating the account but never signing in to verify it.

---

### Q26. What is the difference between NTFS permissions and encryption?

**NTFS permissions** are an access-control list: they decide who can read, write, modify or execute
a file, locally or over a share. They do not protect the data if the disk is removed, because an
administrator can take ownership. **Encryption** protects the data itself at rest: **EFS** encrypts
individual files and folders and ties the key to the user's certificate (`cipher /e` to encrypt,
`/d` to decrypt, `/c` to check); **BitLocker** encrypts the whole volume and uses the TPM or a PIN.
Both EFS and BitLocker are Pro/Enterprise features — not Home. Back up the EFS certificate, or the
files are unrecoverable if the profile is lost.

**Trap:** thinking NTFS permissions stop someone who physically removes the drive.

---

## F. Networking

### Q27. Explain IP address, subnet mask, default gateway and DNS.

The **IP address** is the device's logical address on the network, e.g. `192.168.1.10`. The **subnet
mask** says which part is the network and which is the host — `255.255.255.0` (/24) means the first
three octets identify the network and the last identifies the host. The **default gateway** is the
router that forwards traffic to other networks, e.g. `192.168.1.1`. **DNS** resolves names to IP
addresses, e.g. `example.com` → an address, using a server such as `8.8.8.8` or the lab DNS. Private
ranges are `10.0.0.0/8`, `172.16.0.0/12` and `192.168.0.0/16`; an address starting `169.254.` means
DHCP failed.

**Trap:** blaming DNS when `ping 8.8.8.8` works but `ping example.com` fails — that is DNS; if both
fail, it is routing or the link.

---

### Q28. Static or DHCP — when do you use which?

**DHCP** leases an address, mask, gateway and DNS automatically from a server, with a lease time and
optional reservations; it avoids duplicates and is right for most clients. **Static** addressing is
set by hand and is right for servers, printers, routers and network devices that must be found at a
fixed address — and for exam tasks that tell you to configure one. A static address must be outside
the DHCP pool or reserved, or a duplicate-IP conflict can take both machines off the network. The
lab exercise gives `192.168.1.10/24` with gateway `192.168.1.1` as the pattern.

**Trap:** picking an address already in the DHCP range and causing a conflict.

---

### Q29. What do ping, tracert, nslookup and netstat each prove?

**Ping** sends ICMP echo requests and reports replies and round-trip time: `127.0.0.1` tests the
local TCP/IP stack, the gateway tests the LAN, a name tests DNS plus routing. **Tracert** sends
packets with increasing TTL and lists each router (hop) and its latency, showing where the path
slows or breaks. **Nslookup** queries DNS directly and shows the resolved address and the server
used, separating DNS faults from routing faults. **Netstat** lists active connections and listening
ports, with states such as LISTENING and ESTABLISHED; `-ano` adds numeric addresses and process IDs.
Together they move from "is it plugged in" to "which layer is failing".

**Trap:** using ping to prove a service is running. A reply only proves the host is reachable.

---

### Q30. How do firewall rules, file sharing and Remote Desktop actually work together?

**Windows Defender Firewall** filters traffic per profile — Domain, Private, Public — with inbound
rules that allow or block a program or port (outbound is allowed by default). **File sharing** uses
SMB over TCP 445; it needs the File and Printer Sharing rules enabled, a share with share
permissions, and matching NTFS permissions, and it should be limited to authenticated users with
minimum rights. **Remote Desktop** uses TCP 3389; the host must be Windows Pro or Enterprise, Remote
Desktop enabled, the user in the Remote Desktop Users group with a strong password, and the firewall
rule for RDP open. RDP must never be exposed directly to the Internet — use a VPN. In the lab, share
`SNA_Shared`, open it from the second PC by `\\<IP>\SNA_Shared`, then disable RDP and remove the
share afterwards.

**Trap:** sharing to "Everyone" or leaving RDP enabled after the exercise. Also, Home edition cannot
host RDP.

---

## Quick revision table

| Area | Must-know | Lab proof |
|------|-----------|-----------|
| Hardware | M83: H81, LGA1150, DDR3, SATA only, 240 W proprietary PSU | CPU-Z, physical inspection |
| Power | SMPS working, colour codes, ±5 % rails, ESD | PSU tester table |
| Boot | POST → firmware → bootloader → kernel → services → login | F12/F1 settings |
| OS | Clean install vs upgrade vs reset; chipset first | Installed desktop, clean Device Manager |
| Storage | MBR/GPT, NTFS/exFAT, shrink/extend rules | Disk 1 partition, `list disk` |
| Recovery | SFC → DISM → CHKDSK; restore point | Command output |
| Users | Standard vs admin, `New-LocalUser`, `icacls` | Account and group check |
| Network | IP/mask/gateway/DNS, ping/tracert/nslookup/netstat | `ipconfig /all`, test table |
| Security | Firewall profiles, share permissions, RDP limits | Share opened, RDP sign-in |
