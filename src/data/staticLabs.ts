export const STATIC_LABS_DATA = [
  {
    id: 1, title: 'Hardware Identification',
    desc: 'Identify components & ESD safety.',
    steps: [
      'Power OFF. Unplug. Wear anti-static strap.',
      'Open ATX cabinet side panel.',
      'Identify: Motherboard, CPU, DDR3/4 RAM, SATA SSD/HDD.',
      'Trace cables: 24-pin ATX, 4-pin CPU, SATA data/power.',
      'Locate CMOS battery (CR2032) & front headers.',
      'Identify networking devices (NIC, RJ45).'
    ],
    links: [
      { label: 'PC Building Guide', url: '#' },
      { label: 'ESD Safety Tips', url: '#' }
    ]
  },
  {
    id: 2, title: 'SMPS Voltage',
    desc: 'Measure voltage using multimeter.',
    steps: [
      'Unmount SMPS. Identify connectors (24-pin, 4-pin, SATA, Molex).',
      'Set multimeter to DC Voltage (20V range).',
      'Black probe to black wire (Ground).',
      'Red probe to colored wires. Verify: Yellow≈12V, Red≈5V, Orange≈3.3V.',
      'Mount SMPS, connect components, test PC.',
      'Diagnose faults using PSU Tester.'
    ],
    links: [
      { label: 'Multimeter Tutorial', url: '#' }
    ]
  },
  {
    id: 3, title: 'Motherboard ID',
    desc: 'Identify components & draw layout.',
    steps: [
      'Locate CPU Socket (LGA 1150), RAM Slots, PCIe, SATA.',
      'Find CMOS battery, 24-pin ATX, 4-pin CPU power.',
      'Draw motherboard layout in observation book.',
      'Run CPU-Z → CPU tab → Note Processor, Speed, Cache.',
      'Check electric flow path and data flow path.',
      'Use Windows Resource Monitor for performance issues.'
    ],
    links: [
      { label: 'Motherboard Guide', url: 'https://en.wikipedia.org/wiki/Motherboard' },
      { label: 'CPU-Z Official', url: 'https://www.cpuid.com/softwares/cpu-z.html' }
    ]
  },
  {
    id: 4, title: 'BIOS/UEFI Config',
    desc: 'Power management & boot order.',
    steps: [
      'Power on. Press Del/F2 repeatedly.',
      'Identify Northbridge & Southbridge chips.',
      'Navigate to "Boot" menu.',
      'Change order: USB → SATA → Network.',
      'Power Management → Enable "Restore on AC Power Loss".',
      'Check System Information in BIOS/UEFI.',
      'F10 to Save & Exit.'
    ],
    links: [
      { label: 'BIOS vs UEFI', url: 'https://www.howtogeek.com/56958/htg-explains-how-uefi-will-replace-the-bios/' },
      { label: 'Access BIOS Keys', url: 'https://www.tomshardware.com/reviews/bios-keys-to-access-your-firmware,5732.html' }
    ]
  },
  {
    id: 5, title: 'OS Installation',
    desc: 'Install OS, configure UI, test mic.',
    steps: [
      'Create bootable USB/CD (Windows 10/11 or Linux).',
      'Boot from device. Select language/timezone.',
      'Choose Clean Install. Partition disk.',
      'Install OS. Update drivers.',
      'Configure UI: Invert/rearrange screen.',
      'Test Microphone input.',
      'Document installation procedures.'
    ],
    links: [
      { label: 'Windows Download', url: 'https://www.microsoft.com/software-download/windows11' },
      { label: 'Rufus Bootable USB', url: 'https://rufus.ie/' }
    ]
  },
  {
    id: 6, title: 'CLI & User Mgmt',
    desc: 'Execute commands, manage users.',
    steps: [
      'Open CMD/PowerShell.',
      'Execute navigation (dir, cd) and file commands (copy, del).',
      'Encrypt/decrypt files via command line.',
      'Create user via Control Panel.',
      'Add/modify/delete users via PowerShell.',
      'Verify by logging in with new credentials.',
      'Write PowerShell script: Read/write to console & files.'
    ],
    links: [
      { label: 'CMD Commands', url: 'https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/windows-commands' },
      { label: 'PowerShell Basics', url: 'https://learn.microsoft.com/en-us/powershell/scripting/learn/ps101/01-getting-started' }
    ]
  },
  {
    id: 7, title: 'OS Troubleshooting',
    desc: 'Solve startup & performance issues.',
    steps: [
      'Boot in Safe Mode.',
      'Use Automatic Repair, System Restore, System Reset.',
      'Check Task Manager for high usage.',
      'Use Resource Monitor, Event Viewer.',
      'Run Disk Cleanup, Check Disk Health.',
      'Check for Malware, Update Drivers.',
      'Document BSOD: causes, error codes, preventive measures.'
    ],
    links: [
      { label: 'Windows Safe Mode', url: 'https://support.microsoft.com/windows/start-your-pc-in-safe-mode-in-windows-92c27cff-cb89-5815-21d4-1cbc608eb10e' },
      { label: 'Event Viewer Guide', url: 'https://www.howtogeek.com/123646/htg-explains-what-the-windows-event-viewer-is-and-how-you-can-use-it/' }
    ]
  },
  {
    id: 8, title: 'File Systems',
    desc: 'Partitioning, MBR/GPT, recovery.',
    steps: [
      'Create & Format a New Partition.',
      'Identify MBR vs GPT.',
      'Resize (Shrink/Extend) a Partition.',
      'Explore Command Line Disk Tools (diskpart).',
      'Delete file & recover using Windows File Recovery.',
      'Registry Backup & Restore.',
      'Create System Restore point, simulate issue, roll back.',
      'Uninstall/reinstall program via Windows Store.',
      'Windows Update: Check, Install, Rollback, View History.'
    ],
    links: [
      { label: 'MBR vs GPT', url: 'https://www.howtogeek.com/193669/whats-the-difference-between-gpt-and-mbr-when-partitioning-a-drive/' },
      { label: 'Diskpart Utility', url: 'https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/diskpart' }
    ]
  },
  {
    id: 9, title: 'Performance & Drivers',
    desc: 'Monitor processes, update drivers.',
    steps: [
      'Monitor processes via Task Manager (Windows) / Process commands (Linux).',
      'Troubleshoot boot delay: Disable unnecessary Startup apps & Services.',
      'Work with Task Scheduler (Windows/Linux).',
      'Install Printer driver, Network driver.',
      'Disable/Enable System drivers.',
      'Run SFC, DISM, Check Disk Utility.',
      'Update System drivers.'
    ],
    links: [
      { label: 'Process Explorer', url: 'https://learn.microsoft.com/en-us/sysinternals/downloads/process-explorer' },
      { label: 'Update Drivers', url: 'https://support.microsoft.com/windows/update-drivers-manually-in-windows-ec62f46c-ff14-c91d-eead-d7126dc1f7b6' }
    ]
  },
  {
    id: 10, title: 'Network Config',
    desc: 'IP, DNS, ping, firewall, sharing.',
    steps: [
      'Configure Network Connections & IP Settings.',
      'Set DNS Server addresses.',
      'View Network Adapter Information.',
      'Disable/Enable Network Adapter.',
      'Use ping, tracert, Check Open Ports.',
      'Network Statistics, Flush DNS Cache, Reset TCP/IP Stack.',
      'Windows Firewall Configuration.',
      'Share Files/Folders with other systems.',
      'Establish Remote Desktop connections.'
    ],
    links: [
      { label: 'IP Config', url: 'https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/ipconfig' },
      { label: 'Ping Explained', url: 'https://www.cloudflare.com/learning/network-layer/what-is-ping/' }
    ]
  },
  {
    id: 11, title: 'Advanced Networking',
    desc: 'Monitor, VM, VPN.',
    steps: [
      'Monitor network activity via Task Manager & Resource Monitor.',
      'Install VM (Hypervisor/Hyper-V).',
      'Document VM Network Utilization Metrics.',
      'Run basic network commands in guest OS.',
      'Download & install third-party VPN app.',
      'Connect internet through VPN.',
      'Manage Routing & Remote Access.'
    ],
    links: [
      { label: 'Hyper-V Setup', url: 'https://learn.microsoft.com/en-us/virtualization/hyper-v-on-windows/quick-start/enable-hyper-v' },
      { label: 'OpenVPN', url: 'https://openvpn.net/' }
    ]
  },
  {
    id: 12, title: 'E-Waste Analysis',
    desc: 'Visit websites, analyze processes.',
    steps: [
      'Visit greene.gov.in & kspcb.karnataka.gov.in.',
      'Find latest regulations & policies by Govt of India.',
      'Analyze e-waste management processes (on-site/virtual case studies).',
      'Document lifecycle: Production → Usage → Disposal.',
      'Understand recycling: Collection, Sorting, Recovery.',
      'Document how to reduce carbon footprint.'
    ],
    links: [
      { label: 'CPCB E-Waste', url: 'https://cpcb.nic.in/e-waste/' },
      { label: 'KSPCB E-Waste', url: 'https://kspcb.karnataka.gov.in/e-waste' }
    ]
  },
  {
    id: 13, title: 'Lab Setup Plan',
    desc: 'Design layout, safety, cybersecurity.',
    steps: [
      'Develop comprehensive lab setup plan for 30 stations.',
      'Hardware procurement list & budget estimation.',
      'Installation planning & timeline.',
      'Electrical safety measurement & outlet planning.',
      'UPS placement & power backup planning.',
      'Network topology design.',
      'Cybersecurity protocols implementation.',
      'Maintenance schedule proposal.'
    ],
    links: [
      { label: 'APC Server Setup', url: 'https://www.apc.com/us/en/solutions/home-and-business-networks/' },
      { label: 'Subnet Calculator', url: 'https://www.calculator.net/ip-subnet-calculator.html' }
    ]
  }
];
