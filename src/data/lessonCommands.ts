/**
 * Commands for the "Try it" tab, one set per teaching week.
 *
 * Only commands the virtual terminal actually implements are listed here —
 * offering a command that falls through to "not recognized" would teach the
 * wrong thing. Shell (cmd vs PowerShell) follows the week's topic.
 */

export interface LessonCommand {
  cmd: string;
  label: string;
}

export interface WeekCommands {
  shell: 'cmd' | 'ps';
  note?: string;
  commands: LessonCommand[];
}

export const WEEK_COMMANDS: Record<number, WeekCommands> = {
  1: {
    shell: 'cmd',
    commands: [
      { cmd: 'systeminfo', label: 'Read the machine summary — OS, RAM, BIOS' },
      { cmd: 'tasklist', label: 'See what is running on the machine' },
      { cmd: 'dir C:\\', label: 'List the top-level folders on C:' },
    ],
  },
  2: {
    shell: 'cmd',
    note: 'SMPS work is physical — unmount, measure with a multimeter, record the rails. There is nothing to simulate in the terminal for this week.',
    commands: [],
  },
  3: {
    shell: 'cmd',
    commands: [
      { cmd: 'systeminfo', label: 'Find the motherboard and BIOS version lines' },
      { cmd: 'cd C:\\', label: 'Move to the root of the C: drive' },
      { cmd: 'dir', label: 'List the root folders' },
    ],
  },
  4: {
    shell: 'cmd',
    commands: [
      { cmd: 'systeminfo', label: 'BIOS version, boot device order, total memory' },
      { cmd: 'dir', label: 'Inspect what the booted OS can see' },
    ],
  },
  5: {
    shell: 'cmd',
    commands: [
      { cmd: 'systeminfo', label: 'Confirm the installed OS edition and build' },
      { cmd: 'dir C:\\', label: 'Look at the installed Windows folder tree' },
      { cmd: 'cd C:\\Users', label: 'Navigate into the user profiles' },
      { cmd: 'dir', label: 'List the profiles on this machine' },
    ],
  },
  6: {
    shell: 'cmd',
    commands: [
      { cmd: 'dir C:\\', label: 'Start at the root — it holds Users' },
      { cmd: 'cd C:\\Users\\Student', label: 'Move into the student profile' },
      { cmd: 'dir', label: 'Documents, Downloads, Desktop and readme.txt' },
      { cmd: 'type C:\\Users\\Student\\readme.txt', label: 'Read a file' },
      { cmd: 'md C:\\LabFolder', label: 'Create a directory at the root' },
      { cmd: 'cd C:\\LabFolder', label: 'Change into it' },
      { cmd: 'echo Hello > C:\\LabFolder\\note.txt', label: 'Write a file' },
      { cmd: 'type C:\\LabFolder\\note.txt', label: 'Read it back' },
      { cmd: 'del C:\\LabFolder\\note.txt', label: 'Delete it' },
      { cmd: 'cls', label: 'Clear the screen' },
    ],
  },
  7: {
    shell: 'cmd',
    commands: [
      { cmd: 'tasklist', label: 'Every running process — find the memory hogs' },
      { cmd: 'systeminfo', label: 'Uptime and installed hotfixes' },
      { cmd: 'chkdsk', label: 'Check the disk for errors' },
    ],
  },
  8: {
    shell: 'cmd',
    commands: [
      { cmd: 'diskpart', label: 'Open the disk partition tool' },
      { cmd: 'list disk', label: 'Show the attached disks (inside DiskPart)' },
      { cmd: 'select disk 0', label: 'Select the first disk' },
      { cmd: 'list partition', label: 'Show the partitions on the selected disk' },
      { cmd: 'exit', label: 'Leave DiskPart' },
      { cmd: 'chkdsk C:', label: 'Check the C: volume' },
      { cmd: 'dir', label: 'Confirm the files are still there' },
    ],
  },
  9: {
    shell: 'cmd',
    commands: [
      { cmd: 'sfc /scannow', label: 'Repair protected system files' },
      { cmd: 'dism /online /cleanup-image /restorehealth', label: 'Repair the component store' },
      { cmd: 'chkdsk C: /f', label: 'Check and fix the disk' },
      { cmd: 'tasklist', label: 'See what is running' },
    ],
  },
  10: {
    shell: 'cmd',
    commands: [
      { cmd: 'ipconfig /all', label: 'Full adapter detail — IP, gateway, DNS, MAC' },
      { cmd: 'ping 8.8.8.8', label: 'Test reachability of a public address' },
      { cmd: 'tracert google.com', label: 'Follow the route packets take' },
      { cmd: 'nslookup google.com', label: 'Resolve a name to an address' },
      { cmd: 'netstat -an', label: 'List listening and connected ports' },
      { cmd: 'ipconfig /flushdns', label: 'Clear the DNS resolver cache' },
    ],
  },
  11: {
    shell: 'cmd',
    commands: [
      { cmd: 'ipconfig', label: 'Address of the host — compare with the guest VM' },
      { cmd: 'ping 192.168.1.1', label: 'Reach the gateway from inside the VM' },
      { cmd: 'tracert google.com', label: 'Route taken once the VPN is up' },
      { cmd: 'netstat -an', label: 'Which connections exist with the VPN active' },
    ],
  },
  12: {
    shell: 'cmd',
    note: 'E-waste work is research and inventory, not command line. Use the reference links in the Overview tab.',
    commands: [],
  },
  13: {
    shell: 'cmd',
    commands: [
      { cmd: 'systeminfo', label: 'Machine inventory for the lab setup plan' },
      { cmd: 'ipconfig /all', label: 'Addressing scheme for the network design document' },
      { cmd: 'tasklist', label: 'Baseline the software running on each machine' },
    ],
  },
};

export function getCommandsForWeek(week: number): WeekCommands {
  return WEEK_COMMANDS[week] ?? { shell: 'cmd', commands: [] };
}
