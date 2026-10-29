import React from 'react';

export const STATIC_NOTES_DATA = [
  { 
    week: 1, 
    title: 'Hardware Categories', 
    list: [
      '<strong class="text-slate-900">External:</strong> Input (Mouse, Keyboard), Output (Monitor, Printer)',
      '<strong class="text-slate-900">Internal:</strong> Processing (CPU), Storage (RAM, HDD/SSD), Network (NIC)',
      '<strong class="text-slate-900">Cables:</strong> Power, Data, Front/Back panel connectors',
      '<strong class="text-slate-900">CMOS:</strong> Battery for BIOS settings'
    ],
    links: [
      { label: '4 Main Categories of Hardware', url: 'https://discover.hubpages.com/technology/The-Four-Main-Categories-Of-Computer-Hardware-Parts' },
      { label: 'Computer Cables & Connectors', url: 'https://www.javatpoint.com/what-are-the-computer-cables' }
    ]
  },
  { 
    week: 2, 
    title: 'SMPS - Power Supply', 
    custom: (
      <div className="space-y-2 text-[13px] text-slate-600 font-medium">
        <p>Switched Mode Power Supply converts 230V AC to low-voltage DC.</p>
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 overflow-hidden">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 text-left">
                  <th className="pb-1 font-bold uppercase">Wire</th>
                  <th className="pb-1 font-bold uppercase">Voltage</th>
                  <th className="pb-1 font-bold uppercase">Function</th>
                </tr>
              </thead>
              <tbody className="text-slate-600">
                <tr className="border-b border-slate-100">
                  <td className="py-2 flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-yellow-400"></div>Yellow</td>
                  <td className="py-2 font-mono">+12V</td>
                  <td className="py-2">CPU/GPU</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="py-2 flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-red-500"></div>Red</td>
                  <td className="py-2 font-mono">+5V</td>
                  <td className="py-2">USB/Drives</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="py-2 flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-orange-500"></div>Orange</td>
                  <td className="py-2 font-mono">+3.3V</td>
                  <td className="py-2">RAM</td>
                </tr>
                <tr>
                  <td className="py-2 flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-black"></div>Black</td>
                  <td className="py-2 font-mono">0V</td>
                  <td className="py-2">Ground</td>
                </tr>
              </tbody>
            </table>
          </div>
      </div>
    ),
    links: [
      { label: 'Power Supply Guide', url: 'https://www.intel.com/content/www/us/en/gaming/resources/power-supply.html' },
      { label: 'Switched-Mode Power Supply', url: 'https://en.wikipedia.org/wiki/Switched-mode_power_supply' }
    ]
  },
  {
    week: 3,
    title: 'Motherboard',
    custom: (
      <React.Fragment>
        <p className="text-[13px] text-slate-600 mb-2 font-medium">Main PCB connecting all components. Types: ATX, Micro-ITX.</p>
        <p className="text-[13px] text-slate-600 font-medium"><strong className="text-slate-900">Key Parts:</strong> CPU Socket (LGA 1150), RAM Slots, PCIe, SATA, CMOS Battery (CR2032). Use CPU-Z tool to identify specs.</p>
      </React.Fragment>
    ),
    links: [
      { label: 'What is a Motherboard?', url: 'https://www.geeksforgeeks.org/what-is-a-motherboard/' },
      { label: 'Exploring Motherboards', url: 'https://www.studocu.com/en-us/document/purdue-university-global/information-technology-concepts/12-exploring-motherboards-processors-and-memory/37160479' }
    ]
  },
  {
    week: 4,
    title: 'Chipset & Booting',
    custom: (
      <React.Fragment>
        <p className="text-[13px] text-slate-600 mb-2 font-medium"><strong className="text-slate-900">Northbridge:</strong> Fast (CPU/RAM/GPU). <strong className="text-slate-900">Southbridge:</strong> Slow (USB/SATA).</p>
        <p className="text-[13px] text-slate-600 font-medium"><strong className="text-slate-900">Boot Sequence:</strong> POST → BIOS/UEFI → Bootloader → OS Kernel → Login</p>
      </React.Fragment>
    ),
    links: [
      { label: 'Baeldung - Chipset', url: 'https://www.baeldung.com/cs/chipset' },
      { label: 'Javatpoint - Booting in OS', url: 'https://www.javatpoint.com/booting-in-operating-system' },
      { label: 'MS Learn - Boot & UEFI', url: 'https://learn.microsoft.com/en-us/windows-hardware/drivers/bringup/boot-and-uefi' }
    ]
  },
  {
    week: 5,
    title: 'OS Installation',
    list: [
      '• Create bootable USB/ISO',
      '• Understand file systems (FAT32, NTFS)',
      '• Plan disk partitioning',
      '• Install Windows 10/11 or Linux',
      '• Configure UI & test peripherals'
    ],
    links: [
      { label: 'Javatpoint - Install Win 10', url: 'https://www.javatpoint.com/how-to-install-windows-10' },
      { label: 'MS Answers - Install Win 10', url: 'https://answers.microsoft.com/en-us/windows/forum/all/steps-to-install-windows-10/a499989c-f31f-49d0-8dbb-3b6425a5f47b' },
      { label: 'GeeksforGeeks - Install Ubuntu', url: 'https://www.geeksforgeeks.org/how-to-install-ubuntu-desktop/' }
    ]
  },
  {
    week: 6,
    title: 'CLI & User Management',
    list: [
      '• Navigation: dir, cd, mkdir, del',
      '• File management: copy, move, attrib',
      '• PowerShell scripting basics',
      '• User accounts via Control Panel & PowerShell',
      '• File encryption'
    ],
    links: [
      { label: 'MS Learn - Windows Commands', url: 'https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/windows-commands' },
      { label: 'FreeCodeCamp - CLI Tutorial', url: 'https://www.freecodecamp.org/news/command-line-commands-cli-tutorial/' },
      { label: 'GeeksforGeeks - CMD Commands', url: 'https://www.geeksforgeeks.org/most-useful-cmd-commands-in-windows/' },
      { label: 'MS DevBlogs - Basic PowerShell', url: 'https://devblogs.microsoft.com/scripting/table-of-basic-powershell-commands/' }
    ]
  },
  {
    week: 7,
    title: 'OS Administration',
    list: [
      '• Startup Issues: Safe Mode, System Restore',
      '• Performance: Task Manager, Resource Monitor',
      '• Disk Cleanup, Check Disk Health',
      '• BSOD: Identify causes & error codes',
      '• Update Drivers, Check for Malware'
    ],
    links: [
      { label: 'MS Learn - Boot Issues', url: 'https://learn.microsoft.com/en-us/troubleshoot/windows-client/performance/windows-boot-issues-troubleshooting' },
      { label: 'MS Learn - Startup Issues', url: 'https://learn.microsoft.com/en-us/troubleshoot/windows-client/performance/windows-startup-issues-troubleshooting' },
      { label: 'MS Support - System Config Tools', url: 'https://support.microsoft.com/en-us/windows/system-configuration-tools-in-windows-f8a49657-b038-43b8-82d3-28bea0c5666b' }
    ]
  },
  {
    week: 8,
    title: 'File Systems',
    list: [
      '• Types: FAT32, NTFS, exFAT',
      '• Partitioning: MBR vs GPT',
      '• Drive formatting, Shrink/Extend',
      '• Data Recovery: Deleted files, Registry',
      '• System Restore, Windows Update Management'
    ],
    links: [
      { label: 'MS Learn - Disk Management', url: 'https://learn.microsoft.com/en-us/windows-server/storage/disk-management/overview-of-disk-management' },
      { label: 'MS Support - File Recovery', url: 'https://support.microsoft.com/en-us/windows/windows-file-recovery-61f5b28a-f5b8-3cc2-0f8e-a63cb4e1d4c4' }
    ]
  },
  {
    week: 9,
    title: 'Performance & Drivers',
    list: [
      '• Monitor processes via Task Manager',
      '• Optimize startup applications & services',
      '• Task Scheduler (Windows/Linux)',
      '• SFC, DISM, Check Disk Utility',
      '• Driver Management: Install, Update, Disable'
    ],
    links: [
      { label: 'MS Support - System Config Tools', url: 'https://support.microsoft.com/en-us/windows/system-configuration-tools-in-windows-f8a49657-b038-43b8-82d3-28bea0c5666b' },
      { label: 'MS Support - Update Drivers', url: 'https://support.microsoft.com/en-us/windows/update-drivers-manually-in-windows-ec62f46c-ff14-c91d-eead-d7126dc1f7b6' }
    ]
  },
  {
    week: 10,
    title: 'Network Configuration',
    list: [
      '• IP Addressing, Subnetting, DNS, Gateway',
      '• Troubleshooting: ping, tracert, ipconfig',
      '• Firewall Configuration',
      '• Network Profiles, Wireless Management',
      '• File/Folder Sharing, Remote Desktop'
    ],
    links: [
      { label: 'Configure Networking', url: 'https://learn.microsoft.com/en-us/training/paths/configure-networking-windows-clients/' },
      { label: 'Windows Firewall', url: 'https://learn.microsoft.com/en-us/windows/security/operating-system-security/network-security/windows-firewall/' }
    ]
  },
  {
    week: 11,
    title: 'Advanced Networking',
    list: [
      '• Monitor Network Activity (Task Manager)',
      '• Virtual Networks (Hyper-V Manager)',
      '• Install VM, document network metrics',
      '• VPN: Definition, Types, Implementation',
      '• Remote Access & Routing'
    ],
    links: [
      { label: 'Virtual Networking', url: 'https://www.vmware.com/topics/virtual-networking' },
      { label: 'What is a VPN?', url: 'https://www.kaspersky.com/resource-center/definitions/what-is-a-vpn' }
    ]
  },
  {
    week: 12,
    title: 'E-Waste Management',
    list: [
      '• Definition & Types (computers)',
      '• Environmental & Health Impacts',
      '• Lifecycle: Production → Usage → Disposal',
      '• Recycling: Collection, Sorting, Recovery',
      '• Policies: greene.gov.in, kspcb.karnataka.gov.in'
    ],
    links: [
      { label: 'E-Waste Gov Portal', url: 'https://greene.gov.in/' },
      { label: 'KSPCB', url: 'https://kspcb.karnataka.gov.in/' }
    ]
  },
  {
    week: 13,
    title: 'Mini Project',
    list: [
      '• Lab Layout Management (30 stations)',
      '• Resource Purchase & Budget Estimation',
      '• Installation Planning',
      '• Electrical Safety Measurement',
      '• Cybersecurity Protocols'
    ]
  }
];
