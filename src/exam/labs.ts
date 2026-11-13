import type { LabId, LabWeek } from './types';
import { WEEK08_LABS } from './labs/week08';
import { WEEK09_LABS } from './labs/week09';
import { WEEK10_LABS } from './labs/week10';
import { WEEK11_LABS } from './labs/week11';
import { WEEK12_LABS } from './labs/week12';

export interface LabPoint {
  n: number;
  name: string;
  detail: string;
}

export interface LabStep {
  text: string;
  stop?: string;
}

export interface Lab {
  id: LabId;
  number: string;
  week: LabWeek;
  alsoInWeeks?: LabWeek[];
  sources: { document: 'lab-manual'; experiment: string; page: number; title: string }[];
  prerequisites: string[];
  expected: string[];
  related: LabId[];
  /** Syllabus supplements, not additional manual procedures. */
  concepts: string[];
  eyebrow: string;
  title: string;
  aim: string;
  tool: string;
  minutes: number;
  thumbLabel: string;
  screenNote: string;
  caution: string;
  points: LabPoint[];
  steps: LabStep[];
  record: string[];
  wrong: string;
  check: { q: string; a: string };
  ask: { q: string; a: string };
  examLabel: string;
}

export const LAB_WEEKS: { week: LabWeek; topic: string }[] = [
  { week: 5, topic: 'install media' },
  { week: 6, topic: 'the command line' },
  { week: 7, topic: 'repair and tuning' },
  { week: 8, topic: 'disks, recovery and updates' },
  { week: 9, topic: 'performance and maintenance' },
  { week: 10, topic: 'network configuration and troubleshooting' },
  { week: 11, topic: 'monitoring, virtual machines and VPNs' },
  { week: 12, topic: 'e-waste and energy' },
];

export const LABS: Lab[] = [
  {
    id: 'rufus',
    sources: [{ document: 'lab-manual', experiment: '14', page: 16, title: 'Creating a Bootable USB Drive Using Rufus' }],
    prerequisites: ['Approved Windows PC, official Rufus and authorized OS ISO.', 'Assigned USB of sufficient capacity, backed up before erasure; teacher-confirmed target firmware compatibility.'],
    expected: ['Rufus reports READY for the intended USB and ISO; verify boot selection on the assigned PC only when authorized.'],
    related: ['windows', 'ubuntu'],
    concepts: [],
    number: '05.1',
    week: 5,
    eyebrow: 'Install media',
    title: 'Make a bootable USB',
    aim: 'Turn a Windows 10 ISO into a stick the lab PC can start from.',
    tool: 'Rufus',
    minutes: 4,
    thumbLabel: 'RUFUS',
    screenNote: 'Screen guide of the Rufus window. Your lab copy may show a newer version number.',
    caution: 'Rufus erases the whole stick. Check the Device line before you press START.',
    points: [
      { n: 1, name: 'Device', detail: 'The USB stick. The size shown is your last check.' },
      { n: 2, name: 'Select', detail: 'Choose the Windows 10 ISO file.' },
      { n: 3, name: 'Partition scheme', detail: 'GPT for UEFI. MBR only when the paper says Legacy.' },
      { n: 4, name: 'Start', detail: 'Erases the stick, then writes it. Wait for READY.' },
    ],
    steps: [
      { text: 'Plug in the USB stick and open Rufus. The Device line should show the stick, for example `USB (E:) · 14.5 GB`.' },
      {
        text: '**Device:** pick the stick by label and size.',
        stop: 'This is the drive that gets erased, not a hard disk.',
      },
      { text: '**Boot selection:** click SELECT and open the Windows 10 ISO you downloaded from Microsoft.' },
      { text: '**Partition scheme:** choose GPT for a UEFI board. Choose MBR only when the paper names a Legacy BIOS machine.' },
      { text: '**File system:** leave FAT32 and the cluster size as Rufus sets them.' },
      { text: 'Press START, confirm OK to erase the stick, and wait for READY.' },
      { text: 'Close Rufus, then eject the stick safely from the system tray.' },
      { text: 'Write the OS, scheme and date on the stick with a marker.' },
    ],
    record: ['Stick label and size', 'Partition scheme: GPT or MBR', 'ISO file name'],
    wrong:
      'Selected the wrong device? Close Rufus without pressing START — nothing is written before START. Stick missing at boot? Check the scheme against the board mode, then the F12 boot menu.',
    check: {
      q: 'What must match the target PC before you press START?',
      a: 'GPT for a UEFI board, MBR for legacy BIOS — and Device must be the USB stick, not a hard disk.',
    },
    ask: {
      q: 'Why must the scheme match the board?',
      a: 'UEFI firmware boots from a GPT disk; older BIOS boots from MBR. With the wrong scheme the board will not start from the stick.',
    },
    examLabel: 'Make the boot stick',
  },
  {
    id: 'partition',
    alsoInWeeks: [8],
    sources: [
      { document: 'lab-manual', experiment: '15', page: 17, title: 'Hard Disk Partitioning and Formatting' },
      { document: 'lab-manual', experiment: '20', page: 20, title: 'Creating and Formatting a New Hard Disk Partition' },
    ],
    prerequisites: ['Windows Disk Management with authorized disk-management access.', 'Backed-up instructor-approved test disk with identified unallocated space; assigned size and available drive letter.'],
    expected: ['The new volume appears in Explorer and Disk Management with the assigned capacity, letter, label and NTFS filesystem.', 'If the target or free space cannot be identified, cancel and record why no change was made.'],
    related: ['partition-style', 'resize-partition', 'diskpart'],
    concepts: ['Supplement: FAT32 has a per-file limit just below 4 GiB; NTFS supports large files, Windows permissions and journaling; exFAT supports large removable-media files but lacks NTFS permissions and journaling.', 'Supplement: a partition is a disk region; a filesystem organizes files inside a volume. Deleting a file is not deleting a partition. MBR/GPT describes partition layout, not the filesystem or a universal firmware compatibility rule.'],
    number: '05.2',
    week: 5,
    eyebrow: 'Disks',
    title: 'Partition and format',
    aim: 'Create a volume in Disk Management without touching the system disk.',
    tool: 'Disk Management',
    minutes: 3,
    thumbLabel: 'DISK MGMT',
    screenNote: 'Screen guide of Disk Management: the volume list, the disk map and the unallocated block.',
    caution: 'Work only on the unallocated space of the disk named in the paper. Never shrink or delete the system or recovery partitions.',
    points: [
      { n: 1, name: 'Disk 0 · check the disk', detail: 'Size and partition style must match the paper.' },
      { n: 2, name: 'Unallocated space', detail: 'The free block the new volume will use.' },
      { n: 3, name: 'New Simple Volume', detail: 'Right-click the unallocated block, not the disk label.' },
      { n: 4, name: 'New volume', detail: 'Your letter, label and NTFS file system appear here.' },
    ],
    steps: [
      { text: 'Open Disk Management with `diskmgmt.msc`.' },
      { text: 'Find the disk named in the paper and read its size. Confirm GPT or MBR with the **Identify MBR or GPT** guide before creating a volume.' },
      { text: 'Right-click the unallocated space and choose **New Simple Volume**.' },
      { text: 'In the wizard, enter the size in MB and click Next.' },
      { text: 'Assign an available drive letter such as `E:`.' },
      { text: 'Choose **NTFS**, type a volume label, tick **Perform a quick format**, and click Next.', stop: 'Only the new volume on approved backed-up test storage may be formatted. Cancel if the target cannot be identified.' },
      { text: 'Click Finish and wait for the format to complete.' },
      { text: 'Check the new volume in File Explorer and in Disk Management.' },
    ],
    record: ['Disk number and size', 'Partition size in MB', 'Drive letter and label', 'File system: NTFS'],
    wrong:
      'New Simple Volume greyed out? Right-click the unallocated block itself; the free space must sit on one disk. If the wizard is for the wrong disk, cancel it — nothing changes until you click Finish.',
    check: {
      q: 'What gets formatted when you finish this wizard?',
      a: 'Only the selected new volume, not every partition. Confirm the disk, unallocated block and letter before formatting; cancel if uncertain.',
    },
    ask: {
      q: 'Why NTFS rather than FAT32 for this volume?',
      a: 'NTFS supports large files, permissions and journaling; FAT32 has a per-file limit just below 4 GiB and may be chosen for compatibility.',
    },
    examLabel: 'Drivers, disks, commands',
  },
  {
    id: 'windows',
    sources: [{ document: 'lab-manual', experiment: '16', page: 18, title: 'Installation of Windows 10 Using a Bootable USB' }],
    prerequisites: ['Compatible assigned lab PC, authorized Windows media, institution licensing procedure and bootable USB.', 'Backups and teacher-approved target partition; do not collect product keys or passwords in this guide.'],
    expected: ['Windows boots from the installed disk after Setup, with the assigned edition and account.', 'Verify required user, driver, display and audio settings; record unavailable devices rather than assuming all drivers work.'],
    related: ['rufus', 'device-driver'],
    concepts: [],
    number: '05.3',
    week: 5,
    eyebrow: 'Install',
    title: 'Install Windows 10',
    aim: 'Boot from the stick and finish Setup on the lab PC.',
    tool: 'Windows Setup',
    minutes: 5,
    thumbLabel: 'SETUP',
    screenNote: 'Screen guide of the partition screen in Windows Setup. The disk numbers and sizes will match your machine.',
    caution: '“Custom: Install Windows only” formats the partition you select. Delete or format only where the paper tells you.',
    points: [
      { n: 1, name: 'Custom install', detail: 'The clean-install choice on the type screen.' },
      { n: 2, name: 'Target partition', detail: 'Find it by disk number and size.' },
      { n: 3, name: 'Next', detail: 'Setup formats only this partition.' },
      { n: 4, name: 'Delete and Format', detail: 'Do not use unless the paper says so.' },
    ],
    steps: [
      { text: 'Plug in the boot stick, restart, and open the F12 boot menu. Choose the USB device.' },
      { text: 'On Windows Setup, set language, time and keyboard, then click **Install now**.' },
      { text: 'Enter the product key when the paper provides one, then accept the licence terms.' },
      { text: 'Choose the edition the paper names. Do not guess a higher edition.' },
      { text: 'Choose **Custom: Install Windows only (advanced)**.' },
      { text: 'Find the target partition by disk and size. Do not delete the EFI, MSR or Recovery partitions.' },
      { text: 'Select the target partition and click **Next**.' },
      { text: 'Let Setup copy files and restart. After the restart, do not boot from the stick again.' },
      { text: 'Complete the first-run setup with the region, keyboard, account and password the paper names.' },
    ],
    record: ['Windows edition', 'Disk and partition used', 'Account name and password type'],
    wrong:
      'Stick boots again after the restart? Remove it and let the disk boot; Setup continues on the hard disk. Setup cannot see the disk? Check the SATA cable and the BIOS mode, or load the storage driver.',
    check: {
      q: 'Which install type do you choose for a clean lab machine?',
      a: 'Custom: Install Windows only (advanced), then select the target partition. Upgrade keeps the old Windows.',
    },
    ask: {
      q: 'Why must you not delete the EFI, MSR or Recovery partitions?',
      a: 'The board needs the EFI partition to boot. Deleting it can stop the machine from starting and end the exam early.',
    },
    examLabel: 'Install Windows',
  },
  {
    id: 'ubuntu',
    sources: [{ document: 'lab-manual', experiment: '17', page: 19, title: 'Installation of Linux (Ubuntu) Using a Bootable USB' }],
    prerequisites: ['Compatible assigned computer, official Ubuntu ISO and bootable USB.', 'Backed-up test disk, approved partition plan and local account policy.'],
    expected: ['Ubuntu boots from the installed disk and the created account can sign in.', 'Verify storage, display, sound and network settings; note missing hardware support or errors.'],
    related: ['rufus', 'create-vm'],
    concepts: [],
    number: '05.4',
    week: 5,
    eyebrow: 'Install',
    title: 'Install Ubuntu',
    aim: 'Install Linux on the test disk, then sign in.',
    tool: 'Ubuntu installer',
    minutes: 4,
    thumbLabel: 'UBUNTU',
    screenNote: 'Screen guide of the installation-type screen in the Ubuntu installer.',
    caution: '“Erase disk” wipes the whole selected disk. Check the disk size before you confirm; never pick the disk that holds Windows.',
    points: [
      { n: 1, name: 'Erase disk', detail: 'Only on the disk assigned to this experiment.' },
      { n: 2, name: 'Something else', detail: 'Create partitions yourself; ext4 for the system.' },
      { n: 3, name: 'Install', detail: 'Nothing is written before you confirm.' },
      { n: 4, name: 'User account', detail: 'Record the username; keep a strong password.' },
    ],
    steps: [
      { text: 'Make an Ubuntu stick with Rufus, using the ISO from ubuntu.com.' },
      { text: 'Back up anything you need from the test disk, then boot the stick from the F12 menu.' },
      { text: 'Choose the language and keyboard, and connect the wired network if the installer asks.' },
      { text: 'Choose **Install Ubuntu** and keep the normal installation unless the paper says minimal.' },
      { text: 'On the installation-type screen, choose **Erase disk and install Ubuntu** only on the assigned test disk.' },
      { text: 'If the paper asks for manual partitioning, choose **Something else** and create the partitions it names, with ext4 for the system partition.' },
      { text: 'Set the time zone, then enter the name, computer name, username and a strong password.' },
      { text: 'Review the summary, install, restart when asked, remove the stick, and sign in.' },
    ],
    record: ['Ubuntu version', 'Disk used', 'Username and password policy/type — never the password value', 'File system: ext4'],
    wrong:
      'No disk shown? Check the SATA cable and the BIOS mode. Installer offers no Erase disk? Use Something else and create the partitions the paper names.',
    check: {
      q: 'Which file system does the Ubuntu system partition use?',
      a: 'ext4. It is the default Linux file system for the system and home partitions.',
    },
    ask: {
      q: 'Erase disk or Something else — what is the difference?',
      a: 'Erase disk uses the whole assigned disk automatically. Something else lets you create /, swap and home partitions yourself.',
    },
    examLabel: 'Drivers, disks, commands',
  },
  {
    id: 'diskpart',
    alsoInWeeks: [8],
    sources: [{ document: 'lab-manual', experiment: '23', page: 23, title: 'Disk Management Using DiskPart Commands' }],
    prerequisites: ['Windows with authorized administrator Command Prompt.', 'Instructor-identified test disk and volume; known capacity/model for comparison.'],
    expected: ['Disk and volume identities agree with the assigned storage; record layout without changing data.', 'Exit if identity is ambiguous or access is denied; inspection is not permission to modify a disk.'],
    related: ['partition', 'partition-style'],
    concepts: ['Supplement: disk numbers can change across computers or reconnection. Selection sets command focus, not a persistent identity.'],
    number: '06.1',
    week: 6,
    eyebrow: 'Command line',
    title: 'Read disks with DiskPart',
    aim: 'List, select and inspect a disk without deleting anything.',
    tool: 'DiskPart',
    minutes: 4,
    thumbLabel: 'DISKPART',
    screenNote: 'Screen guide of an administrator Command Prompt running DiskPart.',
    caution: 'Inspection only: do not run clean, delete partition, format or conversion commands anywhere in this exercise.',
    points: [
      { n: 1, name: 'list disk', detail: 'Show every disk with its size and Gpt mark.' },
      { n: 2, name: 'Disk 1 · the test stick', detail: '14 GB with no star, so this one is MBR. Disk 0 is GPT.' },
      { n: 3, name: 'select disk', detail: 'Select by number only after checking the size.' },
      { n: 4, name: 'detail disk', detail: 'Confirm the selected disk model and layout against the assignment.' },
      { n: 5, name: 'Volume details', detail: 'select volume Y and detail volume inspect the approved volume; exit leaves DiskPart.' },
    ],
    steps: [
      { text: 'Open Command Prompt with administrator privileges.' },
      { text: 'Type `diskpart` and press Enter.' },
      { text: 'Run `list disk`. Match the disk number by size and read the Gpt column.' },
      { text: 'Run `select disk X`, replacing X with the assigned disk number.', stop: 'Confirm capacity and model; do not assume Disk 1 is always the test disk.' },
      { text: 'Run `detail disk` and compare its identity with the assignment.' },
      { text: 'Run `list partition` to inspect partitions on the selected disk.' },
      { text: 'Run `list volume`. This lists available volumes, not only those on the selected disk.' },
      { text: 'Run `select volume Y`, replacing Y with the approved volume number after checking its letter, label and size.' },
      { text: 'Run `detail volume` and record the volume identity and associated disk information.' },
      { text: 'Type `exit` to close DiskPart; close the terminal after recording the read-only observations.' },
    ],
    record: ['Disk number, model and size', 'Partition style: GPT or MBR', 'Number of partitions', 'Approved volume number, letter, label and size'],
    wrong:
      'Access denied? Ask for authorized administrator access. Ambiguous disk or volume identity? Stop and ask the teacher. Selecting changes focus but not data; later modifying commands could act on that focus.',
    check: {
      q: 'Does select disk or select volume modify stored data?',
      a: 'No. It sets the target for later commands, so verify identity before proceeding even in an inspection exercise.',
    },
    ask: {
      q: 'Why verify capacity and model as well as the disk number?',
      a: 'Disk numbers are not universal identities; checking capacity and model avoids inspecting or later changing the wrong disk.',
    },
    examLabel: 'Drivers, disks, commands',
  },
  {
    id: 'restore',
    alsoInWeeks: [8],
    sources: [{ document: 'lab-manual', experiment: '26', page: 26, title: 'Creating and Using a Windows System Restore Point' }],
    prerequisites: ['Authorized Windows test PC with System Protection enabled or teacher approval to enable it.', 'Saved work, separate personal-file backup, stable power and a small approved reversible change.'],
    expected: ['Point creation is confirmed before the change; after supervised restore/restart, compare the assigned configuration with its original state.', 'Record the actual restore result or error; personal-file recovery is not a verification criterion.'],
    related: ['registry-backup', 'file-recovery'],
    concepts: ['Supplement: restore points protect selected system configuration, not personal documents. Separate backups remain necessary; never deliberately corrupt a system.'],
    number: '07.1',
    week: 7,
    eyebrow: 'Repair',
    title: 'Create a restore point',
    aim: 'Save a known-good state, then return to it.',
    tool: 'System Protection',
    minutes: 4,
    thumbLabel: 'RESTORE',
    screenNote: 'Screen guide of the System Protection tab and the Create a restore point dialog.',
    caution: 'A restore point is not a backup. It restores system files, drivers and settings; personal files stay as they are. Restore only under supervision.',
    points: [
      { n: 1, name: 'Protection: On', detail: 'System Protection must be on for the drive.' },
      { n: 2, name: 'Create a point', detail: 'Make the point before the change, not after.' },
      { n: 3, name: 'Description', detail: 'A name you can find again.' },
      { n: 4, name: 'Create', detail: 'Wait for the confirmation.' },
    ],
    steps: [
      { text: 'Search for **Create a restore point** and open System Properties.' },
      { text: 'On the **System Protection** tab, select the system drive and check that Protection is **On**.' },
      { text: 'Click **Create** and name the point, for example `Lab test 1 — before changes`.' },
      { text: 'Wait for the confirmation, then make the small change the teacher approves.' },
      { text: 'Open **System Restore** from the same tab.' },
      { text: 'Choose the point by name and time, and read the affected programs.' },
      { text: 'Confirm the restore under supervision and let Windows restart.', stop: 'Save work first. Never interrupt restoration or deliberately damage the system to create a test.' },
      { text: 'Compare the assigned setting before and after; record the point name, time and actual result, including an unsuccessful restore.' },
    ],
    record: ['Drive protected', 'Restore point name and time', 'What changed after restore'],
    wrong:
      'Protection Off? Ask the teacher to enable it before creating a point. Restore did not undo your change? Some app files and personal files are not covered; record the result and ask before attempting any further repair.',
    check: {
      q: 'Does System Restore delete your documents?',
      a: 'No. It returns system files, drivers, installed programs and registry settings to the point; personal files are left in place. It is not a backup.',
    },
    ask: {
      q: 'Why inspect affected programs before restoring?',
      a: 'Apps and drivers installed after the point may be removed or changed. Check the consequences with the teacher before confirming.',
    },
    examLabel: 'Users and repair',
  },
  {
    id: 'startup',
    alsoInWeeks: [9],
    sources: [{ document: 'lab-manual', experiment: '30', page: 30, title: 'Troubleshooting Slow Windows Start-up' }],
    prerequisites: ['Assigned Windows PC, Task Manager and one teacher-approved nonessential startup app.', 'Saved work and a repeatable sign-in workload; permission to restart and restore the original status.'],
    expected: ['The chosen app status changes to Disabled; compare post-sign-in desktop readiness with the same workload.', 'Record unchanged or variable timing honestly and verify the original startup status after cleanup.'],
    related: ['task-manager', 'services'],
    concepts: ['Supplement: Last BIOS time measures firmware initialization, not sign-in or startup-app delay; it is not evidence of improvement from disabling an app.', 'Manual deviation: page 30 step 7 says to repeat the disable for other approved nonessential apps. This guide changes one startup app at a time so the before/after comparison stays attributable to a single change, then restores it.'],
    number: '07.2',
    week: 7,
    eyebrow: 'Performance',
    title: 'Fix a slow start-up',
    aim: 'Examine post-sign-in delays and disable only an approved nonessential startup app.',
    tool: 'Task Manager',
    minutes: 3,
    thumbLabel: 'STARTUP',
    screenNote: 'Screen guide of the Startup apps list in Task Manager.',
    caution: 'Disable only what the teacher approves. Antivirus, drivers and lab software must stay enabled.',
    points: [
      { n: 1, name: 'Startup apps', detail: 'The tab that lists what runs at sign-in.' },
      { n: 2, name: 'Startup impact', detail: 'High, Medium or Low. Start with High.' },
      { n: 3, name: 'Status', detail: 'Enabled means it starts every time.' },
      { n: 4, name: 'Disable', detail: 'Only for an approved, unnecessary app.' },
    ],
    steps: [
      { text: 'Sign in normally and note the time from sign-in to a usable desktop under the agreed workload.' },
      { text: 'Open Task Manager with **Ctrl + Shift + Esc**.' },
      { text: 'Open **Startup apps**; Windows 10 may call the tab Startup.' },
      { text: 'Read app names, Status and Startup impact; note the original status of the proposed test app.' },
      { text: 'Ask the teacher to approve one nonessential app.', stop: 'Antivirus, driver helpers and institutional software must stay enabled.' },
      { text: 'Select the approved app and click **Disable**; verify its new status.' },
      { text: 'Save work, restart and compare post-sign-in desktop readiness using the same workload and timing method.' },
      { text: 'Record the observed effect, including no clear improvement; do not infer causation from one noisy timing.' },
      { text: 'Restore the original app status as instructed and verify it in Startup apps.' },
    ],
    record: ['App, original status and startup impact', 'Post-sign-in desktop readiness before and after, workload and timing method', 'Observed effect and restored status'],
    wrong:
      'App starts again? Another scheduled task or service may launch it; check Startup in Settings. Boot time unchanged? Startup apps are only one cause — memory, disk health and updates matter too.',
    check: {
      q: 'Does disabling a startup app uninstall it?',
      a: 'No. It prevents this automatic startup entry; it does not uninstall the application and other mechanisms may still launch it.',
    },
    ask: {
      q: 'Why change one startup app at a time?',
      a: 'A controlled change makes post-sign-in comparisons more meaningful; use the same workload and restore the original status afterward.',
    },
    examLabel: 'Users and repair',
  },
  ...WEEK08_LABS,
  ...WEEK09_LABS,
  ...WEEK10_LABS,
  ...WEEK11_LABS,
  ...WEEK12_LABS,
];

// Only shared groups need an override; other groups already follow canonical order.
const SHARED_WEEK_ORDER: Partial<Record<LabWeek, LabId[]>> = {
  8: ['partition', 'partition-style', 'resize-partition', 'diskpart', 'file-recovery', 'registry-backup', 'restore', 'app-reinstall', 'windows-update'],
  9: ['task-manager', 'startup', 'services', 'scheduled-task', 'device-driver', 'printer-driver', 'network-driver', 'system-integrity'],
};

export const labBySlug = (id: LabId) => LABS.find((lab) => lab.id === id);

export const labsForWeek = (week: LabWeek): Lab[] => {
  const members = LABS.filter((lab) => lab.week === week || lab.alsoInWeeks?.includes(week));
  const order = SHARED_WEEK_ORDER[week];
  if (!order) return members;
  if (order.length !== members.length || new Set(order).size !== order.length) {
    throw new Error(`Invalid lab membership order for week ${week}`);
  }
  return order.map((id) => {
    const lab = members.find((member) => member.id === id);
    if (!lab) throw new Error(`Unknown lab membership ${id} for week ${week}`);
    return lab;
  });
};
