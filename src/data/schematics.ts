/**
 * Schematic data for the lab machines.
 *
 * Every diagram describes the actual lab computer: Lenovo ThinkCentre M83 (Tower),
 * Intel H81 chipset, LGA 1150, four DDR3 DIMM slots with 8 GB fitted, SATA SSD + SATA HDD,
 * integrated Intel graphics, no discrete GPU, no M.2 / NVMe slot.
 *
 * Physical hardware uses a photograph (`imageUrl`) with percentage-positioned hotspots.
 * Sequences and structures (boot order, partition layout, remote access path) use inline
 * SVG (`svgPath`), because a photograph cannot show order or structure.
 */

export interface HotspotData {
  x: number; // % from left
  y: number; // % from top
  label: string;
  description: string;
  specs?: string[];
  commonIssues?: string[];
  videoUrl?: string;
  wikiUrl?: string;
}

export interface SchematicItem {
  id: string;
  title: string;
  week: number;
  category: string;
  imageUrl?: string;
  imageAlt?: string;
  svgPath?: string;
  hotspots: HotspotData[];
}

// ============ Cable and Rear I/O Reference (Week 1) ============
export const CABLE_SCHEMATIC: SchematicItem = {
  id: 'm83-rear-io',
  title: 'M83 Rear I/O and Lab Cables',
  week: 1,
  category: 'cables',
  imageUrl: '/schematics/m83-rear-io.webp',
  imageAlt:
    'Rear panel of a ThinkCentre M83 with VGA, DisplayPort, USB 3.0, Ethernet and audio ports, with a SATA data cable and a SATA power cable on the bench',
  hotspots: [
    {
      x: 27, y: 30,
      label: 'VGA (blue, 15-pin)',
      description:
        'Analogue video output from the integrated Intel HD graphics. This is how the lab monitors are normally connected, usually through the supplied VGA cable.',
      specs: ['15-pin D-sub', 'Analogue only', 'Up to 1920 x 1080 on this board', 'Video only — no audio'],
      commonIssues: ['Bent pins from forced insertion', 'Loose thumbscrews causing a colour cast', 'No signal if the monitor input is set to HDMI'],
    },
    {
      x: 41, y: 32,
      label: 'DisplayPort',
      description:
        'Digital video output from the same integrated graphics. Used with a digital monitor or a DisplayPort-to-HDMI adapter.',
      specs: ['Digital video + audio', 'Up to 4K on supported panels', 'Does not carry power'],
      commonIssues: ['Cheap DP-to-HDMI adapters that fail intermittently', 'Cable not fully latched', 'Monitor set to the wrong input'],
    },
    {
      x: 52, y: 23,
      label: 'USB 3.0 Type-A (blue)',
      description:
        'Three stacked blue USB 3.0 ports on the rear panel. The blue colour marks the 5 Gb/s ports.',
      specs: ['USB 3.0, 5 Gb/s', 'Up to 900 mA per port', 'Hot-plug supported', 'Two more USB ports on the front panel'],
      commonIssues: ['Black USB 2.0 devices plugged into blue ports and still running at 480 Mb/s', 'Worn port that only works at an angle'],
    },
    {
      x: 64, y: 29,
      label: 'RJ45 Ethernet',
      description:
        'Gigabit network port. In the lab it connects the PC to the wall socket and on to the 24-port switch.',
      specs: ['10/100/1000 Mb/s', 'Green LED = link, amber LED = activity', 'Auto MDI-X, so straight-through cables are fine'],
      commonIssues: ['No link LED = cable or switch port fault', 'Cable jacket crimped too deep so the clip snaps', 'APIPA address 169.254.x.x when the switch is down'],
    },
    {
      x: 76, y: 30,
      label: 'Audio jacks (green / pink / blue)',
      description:
        'Line-out, microphone-in and line-in. The green jack drives the speakers or headphones; pink is the microphone.',
      specs: ['3.5 mm stereo jacks', 'Green = output, pink = mic, blue = line-in', 'Realtek onboard codec'],
      commonIssues: ['Front-panel headphone jack disabled in the Realtek control panel', 'Microphone muted in Windows privacy settings'],
    },
    {
      x: 46, y: 56,
      label: 'Expansion slot cover',
      description:
        'Blank cover over the single PCIe x16 slot. On this machine the slot stays empty — the lab machines have no graphics card.',
      specs: ['1 x PCIe 3.0 x16 (empty)', '1 x PCIe 2.0 x1', '1 x PCI', 'No GPU fitted'],
      commonIssues: ['Treating the missing GPU as a fault — it is the factory configuration', 'Fitting a card the 240 W proprietary PSU cannot feed'],
    },
    {
      x: 16, y: 84,
      label: 'SATA data cable (red, 7-pin)',
      description:
        'One SATA data cable per drive. Port 0 goes to the SSD, port 1 to the hard disk. Data only — power comes from the separate SATA power cable.',
      specs: ['7-pin, thin and flat', 'Up to 6 Gb/s on ports 0 and 1', 'L-shaped connector with a latch', 'Maximum 1 m length'],
      commonIssues: ['Latch snapped off so the cable backs out', 'Cables swapped between ports, changing the drive letter', 'Data and power connectors confused'],
    },
    {
      x: 35, y: 81,
      label: 'SATA power cable (black, 15-pin)',
      description:
        'Supplies +5 V and +12 V from the PSU to each SATA drive. The SSD and the HDD each need one of these.',
      specs: ['15-pin, wider than the data cable', 'Supplies +3.3 V, +5 V, +12 V', 'One connector per drive'],
      commonIssues: ['Drive missing from BIOS because only the data cable was connected', 'Loose connector causing the drive to drop out mid-session'],
    },
  ],
};

// ============ SMPS / PSU (Week 2) ============
export const SMPS_SCHEMATIC: SchematicItem = {
  id: 'm83-psu',
  title: 'ThinkCentre M83 Power Supply',
  week: 2,
  category: 'smps',
  imageUrl: '/schematics/m83-psu.webp',
  imageAlt:
    'Proprietary desktop power supply with a 24-pin main connector, a 4-pin CPU connector and two SATA power connectors',
  hotspots: [
    {
      x: 31, y: 30,
      label: 'PSU enclosure',
      description:
        'The M83 Tower uses a proprietary Lenovo unit of roughly 240 W, sized to the chassis. It looks like a standard ATX PSU, but the mounting and the main connector pinout are Lenovo-specific.',
      specs: ['≈ 240 W continuous', 'Proprietary mounting and pinout', '80 mm fan, thermally controlled'],
      commonIssues: ['Swapping in a generic ATX PSU because it fits the bay — the different pinout can kill the board', 'Blocked vents from dust build-up causing thermal shutdown'],
    },
    {
      x: 31, y: 12,
      label: 'Cooling fan and grille',
      description:
        'A single 80 mm fan pulls air through the unit and out of the case. Dust here is the most common cause of a PSU that runs hot and noisy.',
      specs: ['80 mm, 2-wire, thermally controlled', 'Exhaust direction: out of the chassis'],
      commonIssues: ['Dust-clogged fins', 'Failing bearing producing a rattle at start-up'],
    },
    {
      x: 40, y: 77,
      label: '24-pin main connector',
      description:
        'Feeds the motherboard with +3.3 V, +5 V, +12 V and standby +5 V. It is a 24-pin connector, but it is wired to the Lenovo pinout — a standard ATX cable must not be plugged in.',
      specs: ['24-pin', '+3.3 V (orange), +5 V (red), +12 V (yellow), GND (black)', 'Green wire = PS-ON, pulled low to switch on', 'Purple wire = +5 V standby'],
      commonIssues: ['Using a generic ATX PSU with the same plug but a different pinout', 'Partially seated connector causing random shutdowns', 'Running the paper-clip test with no load attached'],
    },
    {
      x: 63, y: 80,
      label: '4-pin CPU power (EPS)',
      description:
        'Dedicated +12 V feed for the CPU voltage regulator on the board. The M83 uses a 4-pin connector, not 8-pin.',
      specs: ['4-pin (2 x 12 V, 2 x GND)', '+12 V only', 'Feeds the VRM, not the CPU directly'],
      commonIssues: ['Left disconnected after a rebuild — the machine powers on briefly and dies', 'PCIe 6-pin used by mistake'],
    },
    {
      x: 78, y: 79,
      label: 'SATA power connectors (x2)',
      description:
        'Two SATA power leads from the stock PSU: one for the SSD and one for the hard disk. There are no Molex and no PCIe power leads.',
      specs: ['15-pin SATA power', '+5 V and +12 V', 'Serves SATA 0 (SSD) and SATA 1 (HDD)'],
      commonIssues: ['Daisy-chaining a third drive onto a splitter', 'Connector not pushed fully home so the drive drops out'],
    },
    {
      x: 60, y: 50,
      label: 'Sleeved cable bundle',
      description:
        'All output cables leave through one grommet. There are no PCIe 6/8-pin leads, because this machine has no graphics card.',
      specs: ['24-pin main', '1 x 4-pin CPU', '2 x SATA power', 'No Molex, no PCIe 6/8-pin'],
      commonIssues: ['Looking for a PCIe cable that does not exist', 'Cables trapped under the drive cage'],
    },
  ],
};

// ============ Motherboard (Week 3) ============
export const MOTHERBOARD_SCHEMATIC: SchematicItem = {
  id: 'm83-h81-board',
  title: 'ThinkCentre M83 — Lenovo H81 Board',
  week: 3,
  category: 'motherboard',
  imageUrl: '/schematics/m83-board.webp',
  imageAlt:
    'Lenovo H81 motherboard: LGA 1150 CPU socket, four DDR3 DIMM slots, chipset heatsink, empty PCIe x16 slot, four SATA ports and a CMOS battery',
  hotspots: [
    {
      x: 38, y: 24,
      label: 'LGA 1150 CPU socket',
      description:
        'Socket for 4th-generation Intel Core processors, with a zero-insertion-force lever. The photo shows the socket with no CPU fitted — how it looks during cleaning or thermal-paste service.',
      specs: ['LGA 1150 (Socket H3)', 'Supports 4th-gen Core i3 / i5 / i7', 'ZIF lever — never force the CPU in', 'Proprietary Lenovo board, not a retail H81'],
      commonIssues: ['Bent socket pins from dropping the CPU in at an angle', 'Paste spread over the socket edge', 'CPU key tabs not lined up with the socket notches'],
    },
    {
      x: 75, y: 30,
      label: 'DDR3 DIMM slots (4)',
      description:
        'Four DDR3 slots, two of them filled with 4 GB modules to give the lab standard of 8 GB. The other two stay empty so the machine can be upgraded later.',
      specs: ['4 x DDR3 DIMM', '1600 MHz is the practical maximum here', '2 x 4 GB fitted = 8 GB total', 'DDR3 only — DDR4 will not key into these slots'],
      commonIssues: ['Trying to fit DDR4 memory', 'Mixing a 2 GB and an 8 GB stick so the board trains at the slower speed', 'Modules not latched at both ends'],
    },
    {
      x: 54, y: 52,
      label: 'H81 chipset (under heatsink)',
      description:
        'The Intel H81 Platform Controller Hub runs USB, SATA, audio and the PCIe x1 slot. It is the part the BIOS identifies the machine by.',
      specs: ['Intel H81 PCH', '2 x SATA 6 Gb/s + 2 x SATA 3 Gb/s', 'USB 3.0 and USB 2.0', 'Passively cooled'],
      commonIssues: ['Overheating when the heatsink clip is loose', 'Missing chipset driver after an operating system reinstall'],
    },
    {
      x: 39, y: 67,
      label: 'PCIe x16 slot (empty)',
      description:
        'The only x16 slot on the board, and it is deliberately empty. The lab machines use integrated Intel HD graphics, so there is no graphics card, no PCIe power lead and no GPU driver to install.',
      specs: ['1 x PCIe 3.0 x16', 'Empty on all lab machines', 'Display comes from integrated graphics (VGA + DisplayPort)'],
      commonIssues: ['Assuming the empty slot is a missing part', 'Fitting a GPU the 240 W PSU cannot supply', 'Forgetting to re-enable integrated graphics after removing a test card'],
    },
    {
      x: 75, y: 88,
      label: 'SATA ports (4)',
      description:
        'Four right-angle SATA ports. Ports 0 and 1 run at 6 Gb/s and carry the SSD and the hard disk; ports 2 and 3 run at 3 Gb/s and stay free.',
      specs: ['SATA 0-1: 6 Gb/s', 'SATA 2-3: 3 Gb/s', 'SATA 0 = SSD, SATA 1 = HDD', 'No M.2 or NVMe slot anywhere on this board'],
      commonIssues: ['Buying an NVMe drive for a board that only has SATA', 'Drives plugged into ports 2/3 and running at half speed', 'Data cable latches snapped off'],
    },
    {
      x: 87, y: 20,
      label: '24-pin main power header',
      description:
        'Takes the main PSU connector. Standard-looking 24-pin shell, Lenovo pinout — the replacement PSU must be a Lenovo part or a correctly rewired equivalent.',
      specs: ['24-pin', '+3.3 V, +5 V, +12 V, +5 V standby', 'Proprietary Lenovo pinout'],
      commonIssues: ['A generic ATX PSU plugged in and the board damaged', 'Connector half-seated after a rebuild'],
    },
    {
      x: 83, y: 44,
      label: 'CPU 4-pin power header',
      description:
        'Separate +12 V input for the CPU voltage regulator. Easy to forget during a rebuild, and the machine will not stay on without it.',
      specs: ['4-pin', '+12 V for the VRM'],
      commonIssues: ['Not connected after cleaning', 'Forced in with the latch on the wrong side'],
    },
    {
      x: 16, y: 84,
      label: 'CMOS battery (CR2032)',
      description:
        'Keeps the real-time clock and the BIOS settings alive when the machine is unplugged. A flat cell is the classic cause of "the clock resets every morning".',
      specs: ['CR2032, 3 V lithium', 'Holds BIOS settings and system time', 'Expect 3-5 years of life'],
      commonIssues: ['Clock and boot order reset at every power loss', '"CMOS checksum error" at boot', 'Battery fitted upside down'],
    },
    {
      x: 11, y: 25,
      label: 'Rear I/O block',
      description:
        'VGA, DisplayPort, USB 3.0, Ethernet and audio are soldered to the board edge and appear on the back panel. Both video outputs come from the integrated graphics, not from a card.',
      specs: ['VGA + DisplayPort from Intel HD graphics', '3-4 x USB 3.0', 'Gigabit Ethernet', '3 x 3.5 mm audio jacks'],
      commonIssues: ['Monitor plugged into the wrong output', 'Damaged USB port from a forced connector'],
    },
  ],
};

// ============ Boot process (Week 4) ============
export const BOOT_SCHEMATIC: SchematicItem = {
  id: 'boot-sequence',
  title: 'Boot Sequence — Power Button to Windows',
  week: 4,
  category: 'boot',
  hotspots: [
    {
      x: 12, y: 24,
      label: '1 · Power button',
      description:
        'The front-panel switch pulls PS-ON low on the PSU, which switches on the main rails. Nothing else starts until +12 V, +5 V and +3.3 V are stable.',
      specs: ['ATX PS-ON signal', 'PSU asserts POWER OK after a short delay', 'CPU is held in reset until POWER OK'],
      commonIssues: ['Dead PSU with a live standby rail', 'Front-panel switch cable loose on the header'],
    },
    {
      x: 31, y: 24,
      label: '2 · POST',
      description:
        'Power-On Self-Test. The firmware checks the CPU, trains the memory, then initialises the chipset and video. One short beep means POST passed; the M83 has no on-board error display, so beeps matter.',
      specs: ['CPU and memory check', '1 short beep = normal', 'Repeated beeps = memory or video fault'],
      commonIssues: ['Repeated beeps from a badly seated DIMM', 'No beep and no video when the 4-pin CPU power is off'],
    },
    {
      x: 49, y: 24,
      label: '3 · Lenovo splash screen',
      description:
        'The logo screen appears while the firmware finishes initialising. This is the moment to press F1 for setup or F12 for the one-time boot menu.',
      specs: ['F1 = BIOS setup', 'F12 = boot device menu', 'Esc = normal boot'],
      commonIssues: ['Missing the key window on a fast SSD', 'USB keyboard not detected until after the splash'],
    },
    {
      x: 67, y: 24,
      label: '4 · Boot order',
      description:
        'The firmware walks the boot order and hands control to the first device with a bootloader. In the lab the order is SSD, then network, then USB.',
      specs: ['SSD (SATA 0) first', 'PXE network boot second', 'USB third'],
      commonIssues: ['A USB stick left in the machine changing the boot device', 'Boot order reset after a CMOS battery change'],
    },
    {
      x: 81, y: 24,
      label: '5 · Windows Boot Manager',
      description:
        'On a UEFI install the firmware launches \\EFI\\Microsoft\\Boot\\bootmgfw.efi, which reads the BCD store and loads the Windows kernel.',
      specs: ['EFI System Partition on the SSD', 'BCD store holds the boot entries', 'BCD errors stop the boot here'],
      commonIssues: ['0xc0000225 boot error from a damaged BCD', 'Boot files left on the HDD after a clone'],
    },
    {
      x: 93, y: 24,
      label: '6 · Kernel, drivers, sign-in',
      description:
        'The kernel loads drivers, starts services and presents the sign-in screen. Everything before this point is firmware; everything after is the operating system.',
      specs: ['Kernel + boot drivers', 'Services and winlogon', 'Fast Startup caches part of this step'],
      commonIssues: ['Hanging at the splash from a bad storage driver', 'BSOD loop after a failed update'],
    },
  ],
  svgPath: `<svg viewBox="0 0 420 240" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;background:#0b1020;border-radius:8px;">
    <rect x="4" y="4" width="412" height="232" rx="8" fill="#0b1020" stroke="#334155" stroke-width="1.5"/>
    <text x="210" y="26" text-anchor="middle" fill="#e2e8f0" font-family="ui-monospace, monospace" font-size="12" font-weight="bold">ThinkCentre M83 boot sequence</text>
    <text x="210" y="44" text-anchor="middle" fill="#64748b" font-family="ui-monospace, monospace" font-size="7.5">firmware ———————————————————————————————— operating system</text>
    <line x1="34" y1="96" x2="392" y2="96" stroke="#334155" stroke-width="2" stroke-dasharray="4 4"/>
    <g font-family="ui-monospace, monospace" font-size="7">
      <circle cx="52" cy="96" r="7" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
      <text x="52" y="99" text-anchor="middle" fill="#38bdf8" font-size="6">1</text>
      <text x="52" y="118" text-anchor="middle" fill="#94a3b8">Power</text>
      <text x="52" y="127" text-anchor="middle" fill="#94a3b8">button</text>
      <circle cx="128" cy="96" r="7" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
      <text x="128" y="99" text-anchor="middle" fill="#38bdf8" font-size="6">2</text>
      <text x="128" y="118" text-anchor="middle" fill="#94a3b8">POST</text>
      <text x="128" y="127" text-anchor="middle" fill="#94a3b8">(beep)</text>
      <circle cx="204" cy="96" r="7" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
      <text x="204" y="99" text-anchor="middle" fill="#38bdf8" font-size="6">3</text>
      <text x="204" y="118" text-anchor="middle" fill="#94a3b8">Lenovo</text>
      <text x="204" y="127" text-anchor="middle" fill="#94a3b8">splash</text>
      <circle cx="280" cy="96" r="7" fill="#1e293b" stroke="#a78bfa" stroke-width="2"/>
      <text x="280" y="99" text-anchor="middle" fill="#a78bfa" font-size="6">4</text>
      <text x="280" y="118" text-anchor="middle" fill="#94a3b8">Boot</text>
      <text x="280" y="127" text-anchor="middle" fill="#94a3b8">order</text>
      <circle cx="340" cy="96" r="7" fill="#1e293b" stroke="#a78bfa" stroke-width="2"/>
      <text x="340" y="99" text-anchor="middle" fill="#a78bfa" font-size="6">5</text>
      <text x="340" y="118" text-anchor="middle" fill="#94a3b8">Windows</text>
      <text x="340" y="127" text-anchor="middle" fill="#94a3b8">Boot Mgr</text>
      <circle cx="392" cy="96" r="7" fill="#1e293b" stroke="#34d399" stroke-width="2"/>
      <text x="392" y="99" text-anchor="middle" fill="#34d399" font-size="6">6</text>
      <text x="386" y="118" text-anchor="middle" fill="#94a3b8">Kernel</text>
      <text x="386" y="127" text-anchor="middle" fill="#94a3b8">+ sign-in</text>
    </g>
    <rect x="30" y="148" width="150" height="24" rx="4" fill="#111c33" stroke="#f59e0b" stroke-width="1"/>
    <text x="105" y="164" text-anchor="middle" fill="#f59e0b" font-size="7.5" font-family="ui-monospace, monospace">F1 = BIOS setup</text>
    <rect x="190" y="148" width="200" height="24" rx="4" fill="#111c33" stroke="#f59e0b" stroke-width="1"/>
    <text x="290" y="164" text-anchor="middle" fill="#f59e0b" font-size="7.5" font-family="ui-monospace, monospace">F12 = one-time boot menu</text>
    <text x="210" y="196" text-anchor="middle" fill="#94a3b8" font-size="7" font-family="ui-monospace, monospace">A beep with no video is almost always memory, or the 4-pin CPU power left off.</text>
    <text x="210" y="214" text-anchor="middle" fill="#64748b" font-size="6.5" font-family="ui-monospace, monospace">UEFI install: SSD → \\EFI\\Microsoft\\Boot\\bootmgfw.efi → BCD → Windows kernel</text>
  </svg>`,
};

// ============ Disk layout (Week 8) ============
export const DISK_SCHEMATIC: SchematicItem = {
  id: 'disk-layout',
  title: 'Lab Disk Layout — SSD + HDD',
  week: 8,
  category: 'disk',
  hotspots: [
    {
      x: 5, y: 9,
      label: 'SATA 0 · 240 GB SSD',
      description:
        'The SSD holds Windows and nothing else. It is the boot disk, so it stays small and fast.',
      specs: ['240 GB SATA SSD (not NVMe)', 'SATA 0 at 6 Gb/s', 'GPT partition table', 'Boot disk'],
      commonIssues: ['Installing Windows to the HDD by mistake', 'Filling it with student files so the machine crawls'],
    },
    {
      x: 5, y: 25,
      label: 'EFI System Partition (100 MB)',
      description:
        'FAT32 partition holding the Windows Boot Manager. Without it the drive will not boot, even with a healthy Windows partition.',
      specs: ['100 MB, FAT32', 'Contains \\EFI\\Microsoft\\Boot', 'Created automatically by a UEFI install'],
      commonIssues: ['Deleted while "cleaning up" — boot fails with 0xc0000225', 'Missing after a clone to a larger disk'],
    },
    {
      x: 5, y: 46,
      label: 'C: Windows (≈223 GB, NTFS)',
      description:
        'The operating system and installed programs. NTFS gives permissions, journaling and files larger than 4 GB.',
      specs: ['NTFS', '≈ 223 GB usable', 'Holds Windows, Program Files and Users'],
      commonIssues: ['Less than 10% free space slowing the SSD', 'Compressing the whole drive to save space'],
    },
    {
      x: 5, y: 68,
      label: 'Recovery partition (≈500 MB)',
      description:
        'WinRE, used by Startup Repair, System Restore and Reset this PC. It is the last partition on the SSD.',
      specs: ['NTFS, ≈ 500 MB', 'Contains winre.wim', 'Accessed from Advanced startup'],
      commonIssues: ['Deleted to gain space, then recovery options stop working', 'Disabled with reagentc /disable and never re-enabled'],
    },
    {
      x: 96, y: 17,
      label: 'SATA 1 · 500 GB HDD',
      description:
        'The hard disk is the data drive. It is slower by an order of magnitude, so only files live here — never the operating system.',
      specs: ['500 GB 7200 rpm HDD', 'SATA 1 at 6 Gb/s', '≈ 100 MB/s sequential', 'MBR partition table'],
      commonIssues: ['Windows installed here and the machine taking minutes to boot', 'Physical shock while running — HDDs do not survive drops'],
    },
    {
      x: 96, y: 46,
      label: 'D: Data (NTFS)',
      description:
        'Student files, the lab share and the D:\\LabShare folder used for the sharing practical. Kept off C: so the system can be reinstalled without touching student work.',
      specs: ['NTFS', 'Single partition covering the disk', 'D:\\LabShare shared read-only'],
      commonIssues: ['Saving work to the Desktop (which is on C:) and losing it on reinstall', 'Sharing the whole D: root instead of a subfolder'],
    },
    {
      x: 5, y: 90,
      label: 'MBR vs GPT',
      description:
        'The SSD is GPT because it boots UEFI; the data HDD is MBR because it does not boot. GPT supports more than four partitions and disks larger than 2 TB; MBR does not.',
      specs: ['GPT: UEFI boot, 128 partitions, > 2 TB', 'MBR: legacy boot, 4 primary partitions, 2 TB limit', 'Check with diskpart → list disk (asterisk = GPT)'],
      commonIssues: ['Converting the boot disk to MBR and breaking UEFI boot', '"clean" wiping the wrong disk in diskpart'],
    },
  ],
  svgPath: `<svg viewBox="0 0 420 250" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;background:#0b1020;border-radius:8px;">
    <rect x="4" y="4" width="412" height="242" rx="8" fill="#0b1020" stroke="#334155" stroke-width="1.5"/>
    <text x="210" y="24" text-anchor="middle" fill="#e2e8f0" font-family="ui-monospace, monospace" font-size="12" font-weight="bold">How the two drives are laid out</text>
    <text x="103" y="46" text-anchor="middle" fill="#38bdf8" font-family="ui-monospace, monospace" font-size="8" font-weight="bold">SATA 0 — 240 GB SSD (GPT, boots)</text>
    <rect x="22" y="54" width="162" height="18" rx="3" fill="#1d4ed8" stroke="#60a5fa" stroke-width="1"/>
    <text x="103" y="66" text-anchor="middle" fill="#dbeafe" font-size="7" font-family="ui-monospace, monospace">EFI  100 MB</text>
    <rect x="22" y="74" width="162" height="82" rx="3" fill="#0f766e" stroke="#2dd4bf" stroke-width="1"/>
    <text x="103" y="112" text-anchor="middle" fill="#ccfbf1" font-size="9" font-family="ui-monospace, monospace">C:  Windows  ≈ 223 GB NTFS</text>
    <text x="103" y="126" text-anchor="middle" fill="#5eead4" font-size="6.5" font-family="ui-monospace, monospace">Windows · Program Files · Users</text>
    <rect x="22" y="158" width="162" height="22" rx="3" fill="#7c2d12" stroke="#fb923c" stroke-width="1"/>
    <text x="103" y="172" text-anchor="middle" fill="#fed7aa" font-size="7" font-family="ui-monospace, monospace">Recovery  500 MB</text>
    <text x="103" y="196" text-anchor="middle" fill="#64748b" font-size="6.5" font-family="ui-monospace, monospace">Small and fast — operating system only</text>

    <text x="313" y="46" text-anchor="middle" fill="#f59e0b" font-family="ui-monospace, monospace" font-size="8" font-weight="bold">SATA 1 — 500 GB HDD (MBR, data)</text>
    <rect x="232" y="54" width="162" height="126" rx="3" fill="#78350f" stroke="#f59e0b" stroke-width="1"/>
    <text x="313" y="112" text-anchor="middle" fill="#fef3c7" font-size="9" font-family="ui-monospace, monospace">D:  Data  NTFS</text>
    <text x="313" y="126" text-anchor="middle" fill="#fcd34d" font-size="6.5" font-family="ui-monospace, monospace">Student files · D:\\LabShare</text>
    <text x="313" y="196" text-anchor="middle" fill="#64748b" font-size="6.5" font-family="ui-monospace, monospace">Big and slow — never the OS</text>

    <rect x="22" y="208" width="372" height="30" rx="4" fill="#111c33" stroke="#475569" stroke-width="1"/>
    <text x="210" y="221" text-anchor="middle" fill="#94a3b8" font-size="6.5" font-family="ui-monospace, monospace">GPT on the boot SSD (UEFI)  ·  MBR on the data HDD  ·  no M.2 slot on this board, both drives are SATA</text>
    <text x="210" y="232" text-anchor="middle" fill="#475569" font-size="6" font-family="ui-monospace, monospace">Boot order: SATA 0 SSD  →  network  →  USB</text>
  </svg>`,
};

// ============ Lab network (Week 10) ============
export const NETWORK_SCHEMATIC: SchematicItem = {
  id: 'lab-network',
  title: 'Computer Lab Network — 192.168.1.0/24',
  week: 10,
  category: 'network',
  imageUrl: '/schematics/lab-network.webp',
  imageAlt:
    'Computer training lab with rows of desktop PCs cabled to a wall rack holding a 24-port switch, a router on top and a wireless access point on the ceiling',
  hotspots: [
    {
      x: 16, y: 12,
      label: 'Router — 192.168.1.1',
      description:
        'Default gateway and DHCP server for the lab. It routes traffic to the internet and hands out addresses to anything that is not statically configured — phones, laptops and student devices.',
      specs: ['LAN 192.168.1.1/24', 'DHCP pool .200-.250 (lab PCs are static)', 'NAT to the ISP link', 'DNS forwarder: 8.8.8.8'],
      commonIssues: ['Default admin password never changed', 'DHCP pool overlapping the static range .101-.120', 'Router unreachable from a PC with the wrong gateway'],
    },
    {
      x: 17, y: 30,
      label: '24-port switch',
      description:
        'Layer-2 switch that connects every PC to the router. All ports are in one broadcast domain, so every PC here is on 192.168.1.0/24.',
      specs: ['24 x Gigabit ports', 'Layer 2, unmanaged in this lab', 'Green link LED, blinking = traffic', 'Cat5e/Cat6 patch leads'],
      commonIssues: ['A loop caused by patching two wall ports together', 'One bad cable bringing a whole desk down', 'Port negotiated at 100 Mb/s from a damaged pair'],
    },
    {
      x: 17, y: 18,
      label: 'Patch panel',
      description:
        'Permanent termination of the building cabling. Each wall socket has a numbered port here, which is why labelling the sockets matters.',
      specs: ['24 ports, T568B punch-down', 'Labelled to match wall sockets', 'Solid-core cable behind, stranded patch leads in front'],
      commonIssues: ['Unlabelled ports making fault-finding guesswork', 'Patch lead in the wrong port so a PC appears on the wrong socket'],
    },
    {
      x: 60, y: 7,
      label: 'Wireless access point',
      description:
        'Broadcasts the lab SSID for student devices. It bridges wireless clients onto the same LAN, so they get addresses from the router.',
      specs: ['2.4 GHz + 5 GHz', 'WPA2-Personal', 'Bridged to 192.168.1.0/24'],
      commonIssues: ['WPA2 replaced by an open SSID', 'AP in a different subnet with no DHCP relay'],
    },
    {
      x: 43, y: 55,
      label: 'Lab PC — 192.168.1.101',
      description:
        'Each M83 has a static address in the .101-.120 range, so you always know which machine is which when you troubleshoot from the teacher station.',
      specs: ['Static IP .101-.120', 'Mask 255.255.255.0', 'Gateway 192.168.1.1', 'DNS 8.8.8.8'],
      commonIssues: ['Duplicate IP from a mistyped address', 'APIPA 169.254.x.x when the patch lead is out', 'Static IP set but gateway left blank — local pings work, internet does not'],
    },
    {
      x: 78, y: 55,
      label: 'Second row of PCs',
      description:
        'The same configuration repeats at every desk. Number the PCs to match the last octet so the address, the desk and the patch port all agree.',
      specs: ['.101 to .120', 'Identical image and drivers', 'Same gateway and DNS'],
      commonIssues: ['A machine cloned with the same static IP', 'Different subnet mask on one machine so it cannot see its neighbours'],
    },
    {
      x: 10, y: 68,
      label: 'Structured cabling',
      description:
        'Solid-core cable runs from wall socket to patch panel; stranded patch leads connect panel to switch and desk to wall socket. Keep power and data runs apart.',
      specs: ['Cat5e/Cat6', '100 m maximum run', 'T568B wiring', 'Runs separated from mains cable'],
      commonIssues: ['Cable run next to a mains conduit picking up noise', 'Lead kinked past its bend radius', 'Cable longer than 100 m'],
    },
  ],
};

// ============ Remote access (Week 11) ============
export const REMOTE_SCHEMATIC: SchematicItem = {
  id: 'remote-access-path',
  title: 'Remote Desktop and VPN Path',
  week: 11,
  category: 'remote',
  hotspots: [
    {
      x: 10, y: 26,
      label: 'Lab PC — Remote Desktop client',
      description:
        'The machine you sit at. It runs mstsc.exe and connects out to TCP 3389 on the computer you want to control.',
      specs: ['mstsc.exe', 'Connects to host:3389', 'Lab PCs: 192.168.1.101-.120'],
      commonIssues: ['Windows 10 Home cannot act as an RDP host', 'Saved credentials failing after a password change'],
    },
    {
      x: 29, y: 26,
      label: 'Switch and router',
      description:
        'Inside the LAN the RDP session never leaves the building: PC to switch to router and back to the target PC. NAT only matters for connections from outside.',
      specs: ['Layer 2 switch', 'Router NAT on the WAN side', 'Port forwarding only for outside access'],
      commonIssues: ['Port 3389 forwarded to the wrong PC', 'Firewall profile set to Public blocking the connection'],
    },
    {
      x: 49, y: 26,
      label: 'Internet',
      description:
        'Traffic to a remote office crosses the ISP link. RDP is encrypted, but 3389 is scanned constantly, so it should never be exposed directly.',
      specs: ['RDP encrypted with TLS', '3389 is a well-known target', 'Prefer a VPN over port forwarding'],
      commonIssues: ['Leaving 3389 open to the whole internet', 'Dynamic public IP changing and breaking a saved bookmark'],
    },
    {
      x: 70, y: 23,
      label: 'VPN tunnel',
      description:
        'A VPN wraps the whole session in an encrypted tunnel to the remote gateway. Once it is up, the remote LAN behaves like a local subnet.',
      specs: ['Encrypted tunnel (IPsec / SSL)', 'Virtual adapter with a routed address', 'Encrypted end to end'],
      commonIssues: ['Split tunnelling sending traffic out unencrypted', 'DNS still pointing at the local router inside the tunnel'],
    },
    {
      x: 89, y: 26,
      label: 'Remote host — 10.8.0.20',
      description:
        'The machine inside the remote network. It must have Remote Desktop enabled, a password on the account, and a firewall rule allowing 3389.',
      specs: ['Remote Desktop enabled', 'Firewall rule for 3389', 'Account with a password', 'Power settings prevent sleep'],
      commonIssues: ['NLA mismatch between client and host', 'Host asleep or on a metered connection', 'Domain account locked out'],
    },
    {
      x: 47, y: 57,
      label: 'Why the tunnel matters',
      description:
        'Port forwarding exposes one machine to everyone. A VPN authenticates the user first and only then gives access to the whole remote subnet.',
      specs: ['VPN = authenticate, then route', 'Port forward = expose, then hope', 'Check with netstat -an after connecting'],
      commonIssues: ['Both configured at once, producing two conflicting routes', 'Forgetting to disconnect and leaving the tunnel open'],
    },
  ],
  svgPath: `<svg viewBox="0 0 420 200" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;background:#0b1020;border-radius:8px;">
    <rect x="4" y="4" width="412" height="192" rx="8" fill="#0b1020" stroke="#334155" stroke-width="1.5"/>
    <text x="210" y="24" text-anchor="middle" fill="#e2e8f0" font-family="ui-monospace, monospace" font-size="12" font-weight="bold">Remote Desktop through a VPN tunnel</text>
    <line x1="44" y1="70" x2="376" y2="70" stroke="#38bdf8" stroke-width="2" stroke-dasharray="3 3"/>
    <g font-family="ui-monospace, monospace" font-size="7">
      <rect x="16" y="52" width="56" height="36" rx="4" fill="#111c33" stroke="#38bdf8" stroke-width="1.5"/>
      <text x="44" y="68" text-anchor="middle" fill="#e2e8f0" font-size="7.5">Lab PC</text>
      <text x="44" y="78" text-anchor="middle" fill="#64748b" font-size="6">mstsc</text>
      <rect x="96" y="52" width="56" height="36" rx="4" fill="#111c33" stroke="#38bdf8" stroke-width="1.5"/>
      <text x="124" y="68" text-anchor="middle" fill="#e2e8f0" font-size="7.5">Switch</text>
      <text x="124" y="78" text-anchor="middle" fill="#64748b" font-size="6">+ router</text>
      <rect x="176" y="52" width="60" height="36" rx="4" fill="#111c33" stroke="#38bdf8" stroke-width="1.5"/>
      <text x="206" y="68" text-anchor="middle" fill="#e2e8f0" font-size="7.5">Internet</text>
      <text x="206" y="78" text-anchor="middle" fill="#64748b" font-size="6">ISP link</text>
      <rect x="256" y="46" width="76" height="48" rx="8" fill="#0f2a1f" stroke="#34d399" stroke-width="2"/>
      <text x="294" y="66" text-anchor="middle" fill="#6ee7b7" font-size="7.5">VPN tunnel</text>
      <text x="294" y="78" text-anchor="middle" fill="#4ade80" font-size="6">encrypted</text>
      <rect x="348" y="52" width="56" height="36" rx="4" fill="#111c33" stroke="#a78bfa" stroke-width="1.5"/>
      <text x="376" y="68" text-anchor="middle" fill="#e2e8f0" font-size="7.5">Host</text>
      <text x="376" y="78" text-anchor="middle" fill="#64748b" font-size="6">10.8.0.20</text>
    </g>
    <rect x="34" y="104" width="126" height="20" rx="10" fill="#111c33" stroke="#38bdf8" stroke-width="1"/>
    <text x="97" y="117" text-anchor="middle" fill="#7dd3fc" font-size="6.5" font-family="ui-monospace, monospace">TCP 3389 inside the LAN</text>
    <rect x="196" y="104" width="150" height="20" rx="10" fill="#0f2a1f" stroke="#34d399" stroke-width="1"/>
    <text x="271" y="117" text-anchor="middle" fill="#6ee7b7" font-size="6.5" font-family="ui-monospace, monospace">3389 wrapped by the tunnel</text>
    <text x="210" y="146" text-anchor="middle" fill="#94a3b8" font-size="7" font-family="ui-monospace, monospace">Port forwarding exposes one machine to the internet. A VPN authenticates first, then routes the subnet.</text>
    <text x="210" y="160" text-anchor="middle" fill="#64748b" font-size="6.5" font-family="ui-monospace, monospace">Host needs: Remote Desktop on · firewall rule for 3389 · password on the account · no sleep</text>
    <text x="210" y="174" text-anchor="middle" fill="#475569" font-size="6.5" font-family="ui-monospace, monospace">Verify from the client: ping host · telnet host 3389 · netstat -an while connected</text>
  </svg>`,
};

// ============ Component index ============
export const ALL_SCHEMATICS: SchematicItem[] = [
  CABLE_SCHEMATIC,
  SMPS_SCHEMATIC,
  MOTHERBOARD_SCHEMATIC,
  BOOT_SCHEMATIC,
  DISK_SCHEMATIC,
  NETWORK_SCHEMATIC,
  REMOTE_SCHEMATIC,
];
