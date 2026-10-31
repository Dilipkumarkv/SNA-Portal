import React from 'react';

export const STATIC_NOTES_DATA = [
  {
    week: 1,
    title: 'Hardware Categories',
    list: [
      '<strong class="font-semibold text-ink">External:</strong> Input (mouse, keyboard), output (monitor, printer)',
      '<strong class="font-semibold text-ink">Internal:</strong> Processing (CPU), storage (RAM, HDD/SSD), network (NIC)',
      '<strong class="font-semibold text-ink">Cables:</strong> Power, data, front and rear panel connectors',
      '<strong class="font-semibold text-ink">CMOS:</strong> Battery that keeps BIOS settings alive',
    ],
  },
  {
    week: 2,
    title: 'SMPS — Power Supply',
    custom: (
      <div className="space-y-3">
        <p>A switched-mode power supply converts 230 V AC into the low DC voltages the board needs.</p>
        <div className="overflow-hidden rounded-control border border-line">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-line bg-sunken text-left text-ink-3">
                <th className="px-3 py-2 font-semibold">Wire</th>
                <th className="px-3 py-2 font-semibold">Voltage</th>
                <th className="px-3 py-2 font-semibold">Feeds</th>
              </tr>
            </thead>
            <tbody className="text-ink-2">
              <tr className="border-b border-line">
                <td className="flex items-center gap-2 px-3 py-2"><span className="h-2 w-2 rounded-full bg-yellow-400" />Yellow</td>
                <td className="px-3 py-2 font-mono text-ink">+12 V</td>
                <td className="px-3 py-2">CPU VRM, fans, drives</td>
              </tr>
              <tr className="border-b border-line">
                <td className="flex items-center gap-2 px-3 py-2"><span className="h-2 w-2 rounded-full bg-red-500" />Red</td>
                <td className="px-3 py-2 font-mono text-ink">+5 V</td>
                <td className="px-3 py-2">USB, older drives</td>
              </tr>
              <tr className="border-b border-line">
                <td className="flex items-center gap-2 px-3 py-2"><span className="h-2 w-2 rounded-full bg-orange-500" />Orange</td>
                <td className="px-3 py-2 font-mono text-ink">+3.3 V</td>
                <td className="px-3 py-2">RAM, logic</td>
              </tr>
              <tr>
                <td className="flex items-center gap-2 px-3 py-2"><span className="h-2 w-2 rounded-full bg-neutral-900 ring-1 ring-line-strong" />Black</td>
                <td className="px-3 py-2 font-mono text-ink">0 V</td>
                <td className="px-3 py-2">Ground</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    ),
  },
  {
    week: 3,
    title: 'Motherboard',
    custom: (
      <React.Fragment>
        <p className="mb-2">The main PCB that connects every component. Our lab uses a proprietary H81 board inside the Lenovo M83 tower.</p>
        <p><strong className="font-semibold text-ink">Key parts:</strong> LGA 1150 socket, DDR3 slots, PCIe, SATA, CMOS battery (CR2032). Use CPU-Z to confirm the exact model.</p>
      </React.Fragment>
    ),
  },
  {
    week: 4,
    title: 'Chipset & Booting',
    custom: (
      <React.Fragment>
        <p className="mb-2"><strong className="font-semibold text-ink">Northbridge:</strong> fast links (CPU, RAM, graphics). <strong className="font-semibold text-ink">Southbridge:</strong> slower I/O (USB, SATA). On H81 most of this sits inside the CPU.</p>
        <p><strong className="font-semibold text-ink">Boot sequence:</strong> POST → BIOS/UEFI → bootloader → OS kernel → login.</p>
      </React.Fragment>
    ),
  },
  {
    week: 5,
    title: 'OS Installation',
    list: [
      '• Create a bootable USB or ISO',
      '• Understand file systems (FAT32, NTFS)',
      '• Plan disk partitioning',
      '• Install Windows 10/11 or Linux',
      '• Configure the UI and test peripherals',
    ],
  },
  {
    week: 6,
    title: 'CLI & User Management',
    list: [
      '• Navigation: dir, cd, mkdir, del',
      '• File management: copy, move, attrib',
      '• PowerShell scripting basics',
      '• User accounts via Control Panel and PowerShell',
      '• File encryption',
    ],
  },
  {
    week: 7,
    title: 'OS Administration',
    list: [
      '• Startup issues: Safe Mode, System Restore',
      '• Performance: Task Manager, Resource Monitor',
      '• Disk Cleanup, check disk health',
      '• BSOD: identify causes and error codes',
      '• Update drivers, check for malware',
    ],
  },
  {
    week: 8,
    title: 'File Systems',
    list: [
      '• Types: FAT32, NTFS, exFAT',
      '• Partitioning: MBR vs GPT',
      '• Format, shrink and extend drives',
      '• Data recovery: deleted files, registry',
      '• System Restore, Windows Update management',
    ],
  },
  {
    week: 9,
    title: 'Performance & Drivers',
    list: [
      '• Monitor processes in Task Manager',
      '• Trim startup apps and services',
      '• Task Scheduler on Windows and Linux',
      '• SFC, DISM and Check Disk',
      '• Driver management: install, update, disable',
    ],
  },
  {
    week: 10,
    title: 'Network Configuration',
    list: [
      '• IP addressing, subnetting, DNS, gateway',
      '• Troubleshooting: ping, tracert, ipconfig',
      '• Firewall configuration',
      '• Network profiles, wireless management',
      '• File and folder sharing, Remote Desktop',
    ],
  },
  {
    week: 11,
    title: 'Advanced Networking',
    list: [
      '• Monitor network activity in Task Manager',
      '• Virtual networks in Hyper-V Manager',
      '• Install a VM and record network metrics',
      '• VPN: definition, types, implementation',
      '• Remote access and routing',
    ],
  },
  {
    week: 12,
    title: 'E-Waste Management',
    list: [
      '• Definition and types of e-waste',
      '• Environmental and health impacts',
      '• Lifecycle: production → usage → disposal',
      '• Recycling: collection, sorting, recovery',
      '• Policy: greene.gov.in, kspcb.karnataka.gov.in',
    ],
  },
  {
    week: 13,
    title: 'Mini Project',
    list: [
      '• Lab layout management (20 stations)',
      '• Resource purchase and budget estimation',
      '• Installation planning',
      '• Electrical safety measurement',
      '• Cybersecurity protocols',
    ],
  },
];
