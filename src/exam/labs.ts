import type { LabId, LabWeek } from './types';

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
];

export const LABS: Lab[] = [
  {
    id: 'rufus',
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
      { text: 'Find the disk named in the paper and read its size. Right-click the disk label → Properties → Volumes to confirm GPT or MBR.' },
      { text: 'Right-click the unallocated space and choose **New Simple Volume**.' },
      { text: 'In the wizard, enter the size in MB and click Next.' },
      { text: 'Assign an available drive letter such as `E:`.' },
      { text: 'Choose **NTFS**, type a volume label, tick **Perform a quick format**, and click Next.' },
      { text: 'Click Finish and wait for the format to complete.' },
      { text: 'Check the new volume in File Explorer and in Disk Management.' },
    ],
    record: ['Disk number and size', 'Partition size in MB', 'Drive letter and label', 'File system: NTFS'],
    wrong:
      'New Simple Volume greyed out? Right-click the unallocated block itself; the free space must sit on one disk. If the wizard is for the wrong disk, cancel it — nothing changes until you click Finish.',
    check: {
      q: 'What must you confirm before you format the new volume?',
      a: 'That the disk, the unallocated block and the drive letter belong to the test disk named in the paper — formatting erases that space.',
    },
    ask: {
      q: 'Why NTFS rather than FAT32 for this volume?',
      a: 'NTFS supports files over 4 GB, permissions and journaling. FAT32 is meant for small removable media.',
    },
    examLabel: 'Drivers, disks, commands',
  },
  {
    id: 'windows',
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
    record: ['Ubuntu version', 'Disk used', 'Username and password', 'File system: ext4'],
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
    number: '06.1',
    week: 6,
    eyebrow: 'Command line',
    title: 'Read disks with DiskPart',
    aim: 'List, select and inspect a disk without deleting anything.',
    tool: 'DiskPart',
    minutes: 4,
    thumbLabel: 'DISKPART',
    screenNote: 'Screen guide of an administrator Command Prompt running DiskPart.',
    caution: 'This card only reads. `clean`, `delete partition` and `format` destroy data — never run them on a disk the paper did not name.',
    points: [
      { n: 1, name: 'list disk', detail: 'Show every disk with its size and Gpt mark.' },
      { n: 2, name: 'Disk 1 · the test stick', detail: '14 GB with no star, so this one is MBR. Disk 0 is GPT.' },
      { n: 3, name: 'select disk', detail: 'Select by number only after checking the size.' },
      { n: 4, name: 'detail disk', detail: 'Read the model, size and partition style.' },
      { n: 5, name: 'exit', detail: 'Leave DiskPart; nothing has been changed.' },
    ],
    steps: [
      { text: 'Open Command Prompt with administrator privileges.' },
      { text: 'Type `diskpart` and press Enter.' },
      { text: 'Run `list disk`. Match the disk number by size and read the Gpt column.' },
      { text: 'Run `select disk 1`, using the number the paper names.' },
      { text: 'Run `detail disk` to confirm the model, size and partition style.' },
      { text: 'Run `list partition` and `list volume` to read the layout.' },
      { text: 'Type `exit` to close DiskPart.' },
    ],
    record: ['Disk number and size', 'Partition style: GPT or MBR', 'Number of partitions'],
    wrong:
      '“Access denied”? Open Command Prompt as administrator. Selected the wrong disk? Run `list disk`, then `select disk` again with the correct number. No command changes a disk until you select it.',
    check: {
      q: 'How do you know you selected the right disk?',
      a: '`list disk` shows the size and Gpt column; `select disk X` followed by `detail disk` confirms the model, size and style before any other command.',
    },
    ask: {
      q: 'What does the Gpt column tell you?',
      a: 'A * means the disk is GPT. A blank entry generally means MBR.',
    },
    examLabel: 'Drivers, disks, commands',
  },
  {
    id: 'restore',
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
      { text: 'Confirm the restore and let Windows restart.' },
      { text: 'Check that the change is undone, then record the point name and time.' },
    ],
    record: ['Drive protected', 'Restore point name and time', 'What changed after restore'],
    wrong:
      'Protection Off? Turn it on for the system drive before creating a point. Restore did not undo your change? Some app files and personal files are not covered — tell the examiner what you expected.',
    check: {
      q: 'Does System Restore delete your documents?',
      a: 'No. It returns system files, drivers, installed programs and registry settings to the point; personal files are left in place. It is not a backup.',
    },
    ask: {
      q: 'When would you use a restore point?',
      a: 'After a bad driver or update, or a registry change, to return the machine to a known-good state.',
    },
    examLabel: 'Users and repair',
  },
  {
    id: 'startup',
    number: '07.2',
    week: 7,
    eyebrow: 'Performance',
    title: 'Fix a slow start-up',
    aim: 'Find what delays the boot and disable only what is safe.',
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
      { text: 'Open Task Manager with **Ctrl + Shift + Esc**.' },
      { text: 'Open the **Startup apps** tab. On Windows 10 it may be called simply Startup.' },
      { text: 'Read the Status and Startup impact columns.' },
      { text: 'Ask the teacher before disabling anything. Never disable antivirus, a driver helper or lab software.' },
      { text: 'Select one approved, unnecessary app and click **Disable**.' },
      { text: 'Restart the PC and compare the Last BIOS time and the desktop load with the earlier notes.' },
      { text: 'Re-enable anything that turns out to be needed.' },
    ],
    record: ['App disabled and its impact', 'Last BIOS time before and after', 'What you re-enabled'],
    wrong:
      'App starts again? Another scheduled task or service may launch it; check Startup in Settings. Boot time unchanged? Startup apps are only one cause — memory, disk health and updates matter too.',
    check: {
      q: 'What must you check before disabling a startup app?',
      a: 'That it is not antivirus, a driver or lab software, and that the teacher has approved it. Note its impact first.',
    },
    ask: {
      q: 'How do you show that the change helped?',
      a: 'Compare the Last BIOS time and the desktop load before and after, and list what you disabled with its startup impact.',
    },
    examLabel: 'Users and repair',
  },
];

export const labBySlug = (id: LabId) => LABS.find((lab) => lab.id === id);

export const labsForWeek = (week: LabWeek) => LABS.filter((lab) => lab.week === week);
