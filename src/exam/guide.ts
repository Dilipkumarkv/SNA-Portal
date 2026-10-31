import type { MachineViewId } from './types';

export interface Ask {
  q: string;
  a: string;
}

export interface GuidePoint {
  id: string;
  n: number;
  name: string;
  short: string;
  x: number;
  y: number;
  what: string;
  use: string;
  ask?: Ask;
  tip?: string;
}

export interface GuideView {
  id: MachineViewId;
  label: string;
  title: string;
  lede: string;
  image: string;
  imageAlt: string;
  portrait?: boolean;
  points: GuidePoint[];
}

export interface Part {
  id: string;
  name: string;
  tag: string;
  image: string;
  short: string;
  specs: { label: string; value: string }[];
  fit: string;
  ask: Ask;
  warning?: string;
}

export interface MachineFact {
  label: string;
  value: string;
}

export interface SafetyRule {
  title: string;
  text: string;
}

export interface Phase {
  id: string;
  n: number;
  title: string;
  minutes: number;
  area: string;
  steps: string[];
  show: string[];
  ask: Ask;
  links?: { view: MachineViewId; label: string }[];
  warning?: string;
}

export const MACHINE_FACTS: MachineFact[] = [
  { label: 'Computer', value: 'Lenovo ThinkCentre M73 tower' },
  { label: 'Processor', value: 'Intel Core i5 · 4th generation' },
  { label: 'Socket', value: 'LGA1150' },
  { label: 'Board', value: 'Generic H81' },
  { label: 'Memory', value: '8 GB DDR3 · 2 × 4 GB' },
  { label: 'System disk', value: '240 GB SATA SSD · Disk 0' },
  { label: 'Data disk', value: '500 GB SATA HDD · Disk 1' },
  { label: 'Display', value: 'HDMI out · integrated Intel HD' },
  { label: 'Power', value: 'Generic 450 W ATX SMPS' },
  { label: 'Network', value: 'Wired Ethernet only · no Wi-Fi' },
];

export const SAFETY: SafetyRule[] = [
  {
    title: 'Unplug first',
    text: 'Switch off the supply, pull the mains cable, then hold the power button for five seconds to drain the board.',
  },
  {
    title: 'Drain yourself',
    text: 'Touch bare metal on the case before handling the board, RAM or a drive. Hold every part by its edges.',
  },
  {
    title: 'Respect the supply',
    text: 'Never open the SMPS case; the capacitors hold charge. The loose 450 W unit is standard ATX, but test only the unit the instructor gives you.',
  },
  {
    title: 'Keep the socket covered',
    text: 'Do not touch the CPU socket pins, the RAM contacts or the PCIe slot contacts with your fingers.',
  },
  {
    title: 'Ask before deleting',
    text: 'Never delete or format a partition on Disk 0 unless the instructor or the paper names that disk.',
  },
];

export const GUIDE_VIEWS: GuideView[] = [
  {
    id: 'back',
    label: 'Back',
    title: 'The back panel',
    lede: 'Every cable leaves the case here. Learn the ports in the order you would plug them in: display, USB, network, audio, power.',
    image: '/guide/rear-panel.webp',
    imageAlt:
      'Rear of the lab tower: VGA, HDMI, two USB 2.0, two USB 3.0, Ethernet, three audio jacks, two expansion slot covers and the power inlet.',
    points: [
      {
        id: 'vga',
        n: 1,
        name: 'VGA port',
        short: 'Analogue video for an older monitor.',
        x: 12.1,
        y: 38,
        what: 'A blue, D-shaped 15-pin video output with a screw on each side.',
        use: 'Connect the monitor with a VGA cable only when it has no HDMI. Tighten both screws; a loose plug causes a colour cast or a blank screen.',
        ask: {
          q: 'VGA or HDMI — which gives the better picture?',
          a: 'HDMI, because it carries a digital signal. VGA converts the picture to analogue, so it is softer and carries no sound.',
        },
        tip: 'A blank monitor is often the monitor input, not the PC. Check the source button before opening anything.',
      },
      {
        id: 'hdmi',
        n: 2,
        name: 'HDMI port',
        short: 'Sharp digital video and sound in one cable.',
        x: 23.6,
        y: 39.1,
        what: 'The compact digital video and audio output. It has no screws — the plug is held by friction.',
        use: 'Use HDMI for the lab monitor. Push it in firmly, then set the monitor to the HDMI input. The picture and the monitor speakers both travel through this one cable.',
        ask: {
          q: 'Why is HDMI preferred over VGA?',
          a: 'It is digital, so the picture is exact, and it carries audio as well as video. VGA is analogue video only.',
        },
        tip: 'Some Lenovo boards have DisplayPort in this position instead. It does the same job with a different plug, so connect what the board actually has.',
      },
      {
        id: 'usb2-rear',
        n: 3,
        name: 'USB 2.0 ports',
        short: 'Two black ports for keyboard and mouse.',
        x: 33,
        y: 38,
        what: 'Two rectangular USB ports with a black plastic tongue.',
        use: 'Use these for the keyboard and mouse. A USB 2.0 port also works for a bootable USB when a rear port is needed at boot.',
        ask: {
          q: 'How do you tell USB 2.0 from USB 3.0?',
          a: 'USB 3.0 is usually blue and runs at up to 5 Gb/s; USB 2.0 is black and runs at 480 Mb/s. The plug shape is the same.',
        },
      },
      {
        id: 'usb3',
        n: 4,
        name: 'USB 3.0 ports',
        short: 'Two blue ports — use these for the Windows USB.',
        x: 43.7,
        y: 38,
        what: 'Two USB ports with a blue tongue. The extra contacts behind the tongue carry the faster signal.',
        use: 'Plug the Windows installation USB here. The installer reads the ISO much faster than through a USB 2.0 port.',
        ask: {
          q: 'Which port do you use for the bootable USB?',
          a: 'A USB 3.0 port, because it copies the installation files faster and is detected by the UEFI boot menu.',
        },
      },
      {
        id: 'ethernet',
        n: 5,
        name: 'Ethernet (RJ45)',
        short: 'The only network connection on this PC.',
        x: 53.2,
        y: 37.5,
        what: 'An RJ45 socket with a clip and two small status lights.',
        use: 'Push the LAN cable in until it clicks. One light shows the link and the other blinks with traffic. There is no Wi-Fi card, so this cable is the whole network.',
        ask: {
          q: 'There is no internet. What do you check first?',
          a: 'The cable and the link light, then ipconfig /all, then ping the gateway. That separates a physical fault from an address or DNS fault.',
        },
        tip: 'If the link light is off, reseat both ends before changing any Windows setting.',
      },
      {
        id: 'audio-rear',
        n: 6,
        name: 'Audio jacks',
        short: 'Green for speakers, pink for a microphone.',
        x: 62.6,
        y: 38,
        what: 'Three 3.5 mm jacks: green line-out, pink microphone, blue line-in.',
        use: 'Plug speakers or headphones into green and a microphone into pink. The blue jack accepts a line-level source such as a mixer.',
        ask: {
          q: 'Which jack do headphones use?',
          a: 'The green line-out. Pink is the microphone input and blue is line-in.',
        },
      },
      {
        id: 'expansion',
        n: 7,
        name: 'Expansion slot covers',
        short: 'Blank covers over the PCIe slots.',
        x: 37.1,
        y: 61.6,
        what: 'Two metal covers that blank off the unused PCIe slots on the board.',
        use: 'A card would be fitted here, but the 450 W supply has no PCIe power lead. Leave the covers on unless a card is actually being installed.',
        ask: {
          q: 'Can this PC take a graphics card?',
          a: 'It has a PCIe x16 slot, but the supply has no PCIe power connector, so only a low-power card could run.',
        },
        tip: 'An open slot cover pulls dust into the case. Refit it if you remove a card.',
      },
      {
        id: 'power-inlet',
        n: 8,
        name: 'Power inlet and switch',
        short: 'Mains cable goes here; switch before opening.',
        x: 82.5,
        y: 55,
        what: 'A C14 inlet for the mains cable, with the supply switch beside it.',
        use: 'Plug the power cord in fully. Before opening the case, shut down, switch the supply off, pull this cable and press the power button once.',
        ask: {
          q: 'What is the first step before opening the case?',
          a: 'Shut down, switch off the supply, unplug the mains cable, then press the power button to drain the board.',
        },
        tip: 'The switch shows I for on and O for off. Unplugging the cable is the real isolation.',
      },
    ],
  },
  {
    id: 'front',
    label: 'Front',
    title: 'The front panel',
    lede: 'This is what the user touches every day: the power button, two USB ports, the headphone jacks and the optical drive. The grille keeps the whole case cool.',
    image: '/guide/front-panel.webp',
    imageAlt:
      'Front of the lab tower: DVD-RW drive at the top, a power button, two USB ports and two audio jacks, then a tall ventilation grille.',
    portrait: true,
    points: [
      {
        id: 'dvd-drive',
        n: 1,
        name: 'DVD-RW drive',
        short: 'Reads and writes CDs and DVDs over SATA.',
        x: 49.3,
        y: 15,
        what: 'A 5.25-inch optical drive. It reads and writes CDs and DVDs, and its data cable is SATA, like the disks.',
        use: 'Press the small button to open the tray, place the disc label-up, and push the tray closed. It is not used to install Windows here; the USB does that.',
        ask: {
          q: 'How is the DVD drive connected?',
          a: 'With a SATA data cable to the board and a SATA power lead from the supply — the same two connections as an SSD or HDD.',
        },
        tip: 'The tiny hole is the emergency eject. Use it only with the power off, not as the normal way to open the tray.',
      },
      {
        id: 'power-button',
        n: 2,
        name: 'Power button',
        short: 'Starts the PC and shows activity.',
        x: 29.8,
        y: 26.6,
        what: 'The main power button, with a small light beside it.',
        use: 'A short press starts Windows. Hold it for four seconds only when the PC has frozen and cannot shut down normally.',
        ask: {
          q: 'What happens when you hold the power button?',
          a: 'The board cuts power immediately. It is a forced shutdown, so unsaved work is lost and the file system may need checking.',
        },
        tip: 'A blinking light usually means sleep or disk activity. Shut down from Start, not from this button.',
      },
      {
        id: 'usb-front',
        n: 3,
        name: 'Front USB ports',
        short: 'Two easy-to-reach USB 2.0 ports.',
        x: 48.3,
        y: 26.6,
        what: 'Two USB 2.0 ports on the front panel, wired to the board through an internal header.',
        use: 'Use them for a USB drive, keyboard or mouse. If the boot menu does not list your installation USB here, move it to a rear port.',
        ask: {
          q: 'Why might the same USB drive boot from the back but not the front?',
          a: 'The front ports run through a header cable. A rear port is on the board itself and is always available during boot.',
        },
      },
      {
        id: 'audio-front',
        n: 4,
        name: 'Front audio jacks',
        short: 'Green headphones, pink microphone.',
        x: 64.9,
        y: 26.6,
        what: 'The same green line-out and pink microphone jacks as the back panel, placed within reach.',
        use: 'Plug in headphones or a headset for a call or recording. The rear jacks do the same job, so use one set at a time.',
        ask: {
          q: 'The headphones are silent. What do you check?',
          a: 'The green jack, the headphone volume, and the playback device selected in Windows sound settings.',
        },
      },
      {
        id: 'vent',
        n: 5,
        name: 'Ventilation grille',
        short: 'Cool air enters here. Keep it clear.',
        x: 49.8,
        y: 58.6,
        what: 'The mesh front that lets cool air into the case and across the CPU and drives.',
        use: 'Keep it clear. Do not push the case against a wall or cover the grille, and dust it with the PC switched off and the fan held still.',
        ask: {
          q: 'Why does a PC need airflow?',
          a: 'The CPU, supply and disks produce heat. Airflow carries it out so the parts do not slow down or shut off.',
        },
        tip: 'A blocked grille shows up as a hot case and a noisy fan, long before any error message.',
      },
    ],
  },
  {
    id: 'cables',
    label: 'Cables',
    title: 'Cables and connectors',
    lede: 'Nine connectors cover almost every practical task. Learn each one by shape, then check where it goes before you push it in.',
    image: '/guide/cables.webp',
    imageAlt:
      'Nine cables laid side by side: VGA, HDMI, USB, Ethernet, 3.5 mm audio, SATA data, SATA power, 24-pin ATX and 4-pin CPU power.',
    points: [
      {
        id: 'vga-cable',
        n: 1,
        name: 'VGA cable',
        short: 'Blue D-sub plug with two screws.',
        x: 7.1,
        y: 54.1,
        what: 'A 15-pin analogue video cable. The metal shell is D-shaped so it can only go in one way.',
        use: 'Connect a monitor that has no HDMI. Tighten both screws by hand, then tighten fully; a partly seated plug loses a colour channel.',
        ask: {
          q: 'Why does a VGA plug have screws?',
          a: 'The plug is heavy and can work loose. The screws hold it in place so the analogue signal stays stable.',
        },
      },
      {
        id: 'hdmi-cable',
        n: 2,
        name: 'HDMI cable',
        short: 'Digital video and audio, no screws.',
        x: 19.3,
        y: 54.1,
        what: 'A digital cable with a wide, flat plug. The contacts are fine and the plug is held by friction alone.',
        use: 'Connect the monitor with HDMI. Keep the plug straight when inserting it, and never force it — the plug is keyed.',
        ask: {
          q: 'What does HDMI carry that VGA does not?',
          a: 'Digital video, digital audio and control signals. VGA carries only analogue video.',
        },
      },
      {
        id: 'usb-cable',
        n: 3,
        name: 'USB cable',
        short: 'Flat rectangular plug, one way up.',
        x: 28.9,
        y: 54.1,
        what: 'A USB Type-A plug with a rectangular metal shell and two holes.',
        use: 'Connect a keyboard, mouse, printer or USB drive. If it does not enter smoothly, turn it over; the plug is keyed.',
        ask: {
          q: 'What is the difference between the two ends of a USB cable?',
          a: 'Type-A is the rectangular end at the PC. The other end is Type-B, micro-USB or USB-C, depending on the device.',
        },
      },
      {
        id: 'ethernet-cable',
        n: 4,
        name: 'Ethernet patch cable',
        short: 'RJ45 plug with a plastic clip.',
        x: 38.4,
        y: 54.1,
        what: 'A twisted-pair network cable with an RJ45 plug. The eight contacts sit under a clear plastic body.',
        use: 'Push it into the RJ45 socket until the clip clicks. The cable carries the lab network; there is no Wi-Fi fallback.',
        ask: {
          q: 'What does the clip on an RJ45 plug do?',
          a: 'It locks the plug into the socket so that vibration or a light pull cannot break the connection.',
        },
        tip: 'A cable that clicks but shows no link light may be a crossover or damaged cable. Try another known cable.',
      },
      {
        id: 'audio-cable',
        n: 5,
        name: '3.5 mm audio plug',
        short: 'Green plug for line-out.',
        x: 47.5,
        y: 53.5,
        what: 'A small round analogue audio plug with a tip, ring and sleeve.',
        use: 'Plug speakers or headphones into the green jack. The plug goes in fully, with a small click on some sockets.',
        ask: {
          q: 'Which jack takes a microphone?',
          a: 'The pink jack. Green is line-out for speakers or headphones, and blue is line-in.',
        },
      },
      {
        id: 'sata-data',
        n: 6,
        name: 'SATA data cable',
        short: 'Narrow flat cable, 7 pins.',
        x: 56.3,
        y: 54.6,
        what: 'A thin ribbon cable with a small L-shaped connector. It carries data only.',
        use: 'Connect one end to a SATA port on the board and the other to the SSD, HDD or DVD drive. The L-shape gives only one orientation.',
        ask: {
          q: 'How many cables does a SATA drive need?',
          a: 'Two: one SATA data cable to the board and one SATA power lead from the supply.',
        },
        tip: 'Use SATA 0 for the system SSD, so Windows Setup sees it as Disk 0.',
      },
      {
        id: 'sata-power',
        n: 7,
        name: 'SATA power lead',
        short: 'Wide 15-pin plug from the SMPS.',
        x: 67,
        y: 54.6,
        what: 'A wider flat connector with 15 pins, moulded onto the supply cable.',
        use: 'Power every SATA drive from this lead: SSD, HDD and DVD. The plug is keyed and only fits the drive power socket.',
        ask: {
          q: 'Can a SATA data cable power a drive?',
          a: 'No. Data carries the information and power carries the current; a drive needs both.',
        },
      },
      {
        id: 'atx-24',
        n: 8,
        name: '24-pin ATX plug',
        short: 'Main power to the motherboard.',
        x: 82.9,
        y: 54.6,
        what: 'The largest connector: two rows of pins in a 24-pin block with a latch on one side.',
        use: 'Press it fully into the board socket until the latch clips. It feeds the board, RAM and most expansion slots. A partly seated plug gives a no-power fault.',
        ask: {
          q: 'What does the 24-pin connector power?',
          a: 'The motherboard and its lower-voltage rails, which feed the chipset, RAM and expansion slots.',
        },
        tip: 'Check the latch, not just the push. A 24-pin plug that is half in will make the fans twitch and nothing else.',
      },
      {
        id: 'atx-4',
        n: 9,
        name: '4-pin CPU power',
        short: 'A separate 12 V feed for the CPU.',
        x: 96,
        y: 53.5,
        what: 'A small square 4-pin plug, separate from the 24-pin. It carries the 12 V supply to the CPU voltage regulators.',
        use: 'Connect it to the 4-pin socket near the CPU. The board will not start without it, even if the 24-pin is seated.',
        ask: {
          q: 'The fans spin but the PC does not start. What is a likely cause?',
          a: 'The 4-pin CPU power plug is missing or loose. The board will not run the CPU without it.',
        },
        tip: 'Do not confuse it with a 4-pin fan header; the CPU power plug is keyed and uses thicker wires.',
      },
    ],
  },
  {
    id: 'board',
    label: 'Board',
    title: 'The motherboard',
    lede: 'The generic H81 board carries the CPU, memory, power, drives and every rear port. Learn these nine landmarks; the examiner will point at one and ask what it does.',
    image: '/guide/motherboard.webp',
    imageAlt:
      'Generic H81 motherboard: LGA1150 CPU socket, two DDR3 slots, 24-pin and 4-pin power, SATA ports, PCIe x16 slot, chipset heatsink, CMOS battery and rear I/O block.',
    points: [
      {
        id: 'socket',
        n: 1,
        name: 'CPU socket (LGA1150)',
        short: 'Where the 4th-generation i5 sits.',
        x: 50.9,
        y: 31.6,
        what: 'A square socket with a metal load plate and a lever. The pins are on the board, not on the CPU.',
        use: 'The CPU drops in with its triangle matching the corner mark, then the lever locks the plate. Never touch the pins or force the lever.',
        ask: {
          q: 'Which CPUs fit this socket?',
          a: 'Intel 4th-generation Core processors on LGA1150, such as the i5 in this lab PC.',
        },
        tip: 'Keep the plastic socket cover on until the CPU is ready. A bent pin can be permanent.',
      },
      {
        id: 'dimm',
        n: 2,
        name: 'DDR3 memory slots',
        short: 'Two slots, 8 GB total as 2 × 4 GB.',
        x: 69.6,
        y: 30,
        what: 'Two long slots with clips at each end. The notch near the middle is offset so a DDR4 stick cannot enter.',
        use: 'Open the clips, align the notch, press both ends down until the clips snap up. Fit in matched pairs for the best speed.',
        ask: {
          q: 'Can you fit DDR4 memory to this board?',
          a: 'No. DDR4 has a different notch position and voltage; the H81 board takes DDR3 only.',
        },
        tip: 'Hold the stick by its edges. Touch the case first to discharge static.',
      },
      {
        id: 'atx24-board',
        n: 3,
        name: '24-pin power socket',
        short: 'Main power from the SMPS.',
        x: 84.1,
        y: 35.3,
        what: 'A 24-pin socket on the right edge of the board, with a latch notch.',
        use: 'The 24-pin plug from the supply goes here, latch outward. It feeds the board and the memory slots.',
        ask: {
          q: 'What happens if the 24-pin is loose?',
          a: 'The board may not power on at all, or the fans may twitch. Reseat it until the latch clicks.',
        },
      },
      {
        id: 'cpu4-board',
        n: 4,
        name: '4-pin CPU power',
        short: 'The separate 12 V feed near the socket.',
        x: 35,
        y: 6.5,
        what: 'A small 4-pin socket at the top edge of the board, near the CPU.',
        use: 'Connect the 4-pin lead from the supply. Without it the board will not POST, even with the 24-pin connected.',
        ask: {
          q: 'Why does the CPU need its own power plug?',
          a: 'It draws a large current at 12 V, so it has a dedicated feed instead of sharing the 24-pin.',
        },
      },
      {
        id: 'sata-board',
        n: 5,
        name: 'SATA ports',
        short: 'Four ports for SSD, HDD and DVD.',
        x: 79.6,
        y: 81.9,
        what: 'Four small L-shaped ports on the edge of the board.',
        use: 'Connect the SSD to SATA 0 so it becomes Disk 0, then the HDD and the DVD drive. Each drive also needs a SATA power lead.',
        ask: {
          q: 'Why connect the SSD to SATA 0?',
          a: 'The port order sets the disk order. Windows Setup then sees the SSD as Disk 0 and the HDD as Disk 1.',
        },
      },
      {
        id: 'pcie',
        n: 6,
        name: 'PCIe x16 slot',
        short: 'Long slot for a graphics card.',
        x: 42.9,
        y: 80.8,
        what: 'The long expansion slot with a latch at the right end, wired for sixteen lanes.',
        use: 'A graphics card would sit here, but the 450 W supply has no PCIe power lead, so it stays empty in this lab.',
        ask: {
          q: 'Why is the slot empty on this machine?',
          a: 'The PC uses integrated Intel HD graphics through HDMI, and the supply has no PCIe power connector for a card.',
        },
      },
      {
        id: 'chipset',
        n: 7,
        name: 'H81 chipset',
        short: 'Controls SATA, USB and the slower buses.',
        x: 51.1,
        y: 64.2,
        what: 'The square heatsink below the CPU socket. Under it is the H81 chipset.',
        use: 'It manages SATA ports, USB ports and the link to the CPU. If SATA or USB fails, the chipset and its drivers are part of the check.',
        ask: {
          q: 'What does the chipset do?',
          a: 'It connects the slower devices — SATA, USB and audio — to the CPU and memory.',
        },
      },
      {
        id: 'cmos',
        n: 8,
        name: 'CMOS battery',
        short: 'Keeps the clock and BIOS settings alive.',
        x: 22.1,
        y: 81.9,
        what: 'A coin cell in a round holder near the edge of the board.',
        use: 'It keeps the date, time and BIOS settings when the PC is unplugged. If the clock resets at every boot, test or replace this cell.',
        ask: {
          q: 'What happens if the CMOS battery is flat?',
          a: 'The clock resets and BIOS settings return to defaults at every power loss.',
        },
        tip: 'Remove it only with the PC unplugged, and note any BIOS setting you change afterwards.',
      },
      {
        id: 'rear-io',
        n: 9,
        name: 'Rear I/O block',
        short: 'The ports you see on the back panel.',
        x: 14.6,
        y: 27.8,
        what: 'The metal block along the left edge that carries VGA, HDMI, USB, Ethernet and audio.',
        use: 'It must line up with the cut-out in the case before the board is screwed down. A misaligned block means the board is not seated on its spacers.',
        ask: {
          q: 'Why does the rear I/O block matter when fitting a board?',
          a: 'It shows the board is aligned with the case cut-out and sitting correctly on the brass spacers.',
        },
      },
    ],
  },
  {
    id: 'parts',
    label: 'Parts',
    title: 'The parts',
    lede: 'Six parts explain the whole build. Each one below says what it is, how it fits, and the question the examiner is most likely to ask.',
    image: '',
    imageAlt: '',
    points: [],
  },
];

export const PARTS: Part[] = [
  {
    id: 'ssd',
    name: '240 GB SATA SSD',
    tag: 'System disk · Disk 0',
    image: '/guide/ssd.webp',
    short: 'Fast flash storage with no moving parts. Windows lives here.',
    specs: [
      { label: 'Capacity', value: '240 GB' },
      { label: 'Size', value: '2.5 inch' },
      { label: 'Interface', value: 'SATA III · 6 Gb/s' },
      { label: 'Connections', value: 'SATA data + SATA power' },
    ],
    fit: 'Lower drive bay. Connect it to SATA 0 on the board so Windows Setup sees it as Disk 0.',
    ask: {
      q: 'Why is Windows installed on the SSD rather than the HDD?',
      a: 'The SSD has no moving parts, so Windows boots and programs open much faster than from a spinning disk.',
    },
    warning: 'Disk 0 holds the EFI, MSR and Recovery partitions. Never delete or format them unless the paper names that disk.',
  },
  {
    id: 'hdd',
    name: '500 GB SATA HDD',
    tag: 'Data disk · Disk 1',
    image: '/guide/hdd.webp',
    short: 'Large, cheap storage. It spins, so it is slower than the SSD.',
    specs: [
      { label: 'Capacity', value: '500 GB' },
      { label: 'Size', value: '3.5 inch' },
      { label: 'Speed', value: '7200 rpm' },
      { label: 'Connections', value: 'SATA data + SATA power' },
    ],
    fit: 'Upper drive bay. Connect it to a second SATA port; it is the disk you may repartition for SNA_DATA.',
    ask: {
      q: 'What is the difference between an SSD and an HDD?',
      a: 'An SSD stores data in flash memory and is silent and fast. An HDD stores data on spinning platters and is cheaper per GB but slower.',
    },
    warning: 'Check the size in Windows Setup before touching a disk. Disk 1 is the data disk, and only with permission.',
  },
  {
    id: 'dvd',
    name: 'DVD-RW drive',
    tag: 'Optical · SATA',
    image: '/guide/dvd.webp',
    short: 'Reads and writes CDs and DVDs. It is a SATA device like the disks.',
    specs: [
      { label: 'Size', value: '5.25 inch' },
      { label: 'Media', value: 'CD and DVD read/write' },
      { label: 'Interface', value: 'SATA' },
      { label: 'Connections', value: 'SATA data + SATA power' },
    ],
    fit: 'Top 5.25-inch bay. One SATA data cable to the board and one SATA power lead from the supply.',
    ask: {
      q: 'How do you tell a SATA optical drive from an old IDE drive?',
      a: 'SATA uses a narrow seven-pin data cable; IDE uses a wide grey ribbon cable. This drive uses SATA.',
    },
    warning: 'Press the eject button; do not pull the tray. The emergency hole is for a powered-off drive only.',
  },
  {
    id: 'smps',
    name: 'Generic 450 W SMPS',
    tag: 'Power supply · ATX',
    image: '/guide/psu.webp',
    short: 'Turns 230 V AC from the wall into the DC rails the PC uses.',
    specs: [
      { label: 'Output', value: '450 W' },
      { label: 'Standard', value: 'ATX' },
      { label: 'Main plugs', value: '24-pin ATX + 4-pin CPU' },
      { label: 'Drive plugs', value: 'SATA power and Molex' },
    ],
    fit: 'Top-rear of the case. The 24-pin goes to the board, the 4-pin near the CPU, and one SATA power lead to each drive.',
    ask: {
      q: 'What does the SMPS do?',
      a: 'It converts AC mains into the +12 V, +5 V and +3.3 V DC rails, and the +5 V standby rail keeps the board ready to power on.',
    },
    warning: 'Never open the supply case; the capacitors hold charge. Test only the loose unit the instructor provides.',
  },
  {
    id: 'ram',
    name: 'DDR3 RAM · 8 GB',
    tag: 'Memory · 2 × 4 GB',
    image: '/guide/ram.webp',
    short: 'Working memory. Every open program and file is held here.',
    specs: [
      { label: 'Type', value: 'DDR3' },
      { label: 'Speed', value: '1600 MHz' },
      { label: 'Total', value: '8 GB · 2 × 4 GB' },
      { label: 'Fitting', value: '240-pin DIMM' },
    ],
    fit: 'Slots beside the CPU. Open both clips, align the notch and press both ends until the clips snap up.',
    ask: {
      q: 'Can this board take DDR4 memory?',
      a: 'No. DDR4 has a different notch and voltage, and the H81 board is built for DDR3.',
    },
    warning: 'Touch the case metal first, hold the stick by its edges, and never force it into the slot.',
  },
  {
    id: 'board',
    name: 'Generic H81 motherboard',
    tag: 'Board · LGA1150',
    image: '/guide/motherboard.webp',
    short: 'The board that connects the CPU, memory, drives, power and ports.',
    specs: [
      { label: 'Chipset', value: 'Intel H81' },
      { label: 'Socket', value: 'LGA1150' },
      { label: 'CPU support', value: 'Intel 4th generation' },
      { label: 'Memory', value: '2 × DDR3 DIMM' },
      { label: 'Storage', value: '4 × SATA · no M.2' },
      { label: 'Expansion', value: 'PCIe x16 + PCIe x1' },
    ],
    fit: 'Stands on brass spacers inside the case. The rear I/O block must line up with the back cut-out before any screw is tightened.',
    ask: {
      q: 'What socket and chipset does this board use?',
      a: 'Socket LGA1150 with the Intel H81 chipset, which takes a 4th-generation Intel Core i5.',
    },
    warning: 'Never touch the socket pins and keep the plastic cover on until the CPU is seated.',
  },
];

export const PHASES: Phase[] = [
  {
    id: 'look',
    n: 1,
    title: 'Look, then write',
    minutes: 24,
    area: 'Hardware identification',
    steps: [
      'Power off and unplug. Name the front ports, then the rear ports: VGA, HDMI, USB, Ethernet, audio and the power inlet.',
      'Open the side panel and name six things on the board: socket, RAM, 24-pin, 4-pin CPU power, SATA ports and the empty PCIe x16 slot.',
      'Boot Windows and read the CPU, socket, memory size and speed from `msinfo32` or CPU-Z.',
      'Write the five-line compatibility note: **LGA1150** socket, **DDR3** only, **SATA** only, **integrated graphics**, **450 W** supply.',
    ],
    show: [
      'Point to each part by name without looking at a diagram.',
      'Read the five-line compatibility statement aloud.',
    ],
    ask: {
      q: 'Why can this board not take DDR4 memory?',
      a: 'DDR4 has a different notch position and voltage. The H81 board is built for DDR3 only.',
    },
    links: [
      { view: 'back', label: 'Back panel' },
      { view: 'board', label: 'The board' },
      { view: 'parts', label: 'The parts' },
    ],
  },
  {
    id: 'usb',
    n: 2,
    title: 'Make the boot stick',
    minutes: 15,
    area: 'OS preparation',
    steps: [
      'Plug in an 8 GB or larger USB drive. Confirm it holds nothing you need.',
      'In Rufus choose the Windows ISO and **GPT / UEFI**, then Start and wait for READY.',
      'Reboot and press **F12** for the boot menu. If the USB is missing, enter **F1**, disable Fast Boot, check USB boot and save with **F10**.',
      'Boot the USB and stop at the Windows Setup language screen.',
    ],
    show: ['The USB boots to Windows Setup.', 'Name the one BIOS setting you changed, and why.'],
    ask: {
      q: 'GPT or MBR for this PC?',
      a: 'GPT, because the board boots in UEFI mode and Disk 0 is already GPT.',
    },
    links: [{ view: 'back', label: 'Rear USB ports' }],
  },
  {
    id: 'install',
    n: 3,
    title: 'Install Windows',
    minutes: 30,
    area: 'OS installation',
    steps: [
      'Choose **Custom: Install Windows only (advanced)**.',
      'Identify the disks by size: **Disk 0 = 240 GB SSD**, **Disk 1 = 500 GB HDD**. Install only where the paper says.',
      'Never delete the EFI, MSR or Recovery partitions on Disk 0 unless the instructor says so.',
      'Let Windows restart. Create the account the paper names, sign in, and open Device Manager.',
    ],
    show: [
      'A booted desktop with the required account signed in.',
      'Device Manager open, with every warning mark noted before drivers.',
    ],
    ask: {
      q: 'Clean install or upgrade?',
      a: 'A clean install, because it starts from an empty system partition and leaves no old files or settings behind.',
    },
    warning: 'Do not delete Disk 0 partitions to start clean. That removes the boot files and can end the exam early.',
    links: [{ view: 'parts', label: 'SSD and HDD' }],
  },
  {
    id: 'disks',
    n: 4,
    title: 'Drivers, disks, commands',
    minutes: 30,
    area: 'Software and disk configuration',
    steps: [
      'Install in order: **chipset → Ethernet → audio → graphics**. Reopen Device Manager; no warning marks may remain.',
      'Open `diskmgmt.msc` and confirm Disk 0 is GPT. On **Disk 1 only**, create an NTFS volume labelled `SNA_DATA` and assign a letter.',
      'In `diskpart` run only `list disk`, `select disk 1`, `detail disk`, `list partition` and `exit`. No clean, no format.',
      'In Command Prompt create `C:\\SNA_CLI`, write `note.txt`, then use `copy`, `ren`, `type` and `del` on your own files.',
    ],
    show: [
      'A clean Device Manager with driver versions recorded.',
      'The new NTFS volume visible in File Explorer.',
      'Your command output and the Disk 0 partition style.',
    ],
    ask: {
      q: 'NTFS or FAT32 for the new volume?',
      a: 'NTFS. It supports files over 4 GB, permissions and journaling; FAT32 is for small removable media.',
    },
    warning: 'Never run clean, format or delete volume on a disk the paper did not name.',
  },
  {
    id: 'users',
    n: 5,
    title: 'Users and repair',
    minutes: 39,
    area: 'Administration and repair',
    steps: [
      'Create the account in `lusrmgr.msc` and add it to **Users** — Administrators only if the paper asks.',
      'Repeat in PowerShell with `New-LocalUser` and `Add-LocalGroupMember -Group "Users"`.',
      'Show `net user <name>`, then grant Modify on a test folder with `icacls` and show the new entry.',
      'Task Manager and Resource Monitor: name the top CPU, memory and disk consumers and read one Event Viewer error.',
      'Create a restore point. Run `DISM /Online /Cleanup-Image /ScanHealth`, then `sfc /scannow`, then read-only `chkdsk C:`.',
    ],
    show: [
      'The account in both the GUI and PowerShell, with group membership.',
      'One icacls line showing the granted permission.',
      'The result line from DISM, SFC and CHKDSK, with times.',
    ],
    ask: {
      q: 'What does SFC do that DISM does not?',
      a: 'SFC repairs protected Windows files from the local cache. DISM repairs the image that cache comes from.',
    },
    warning: 'chkdsk /f or /r on C: schedules a reboot. Run read-only chkdsk C: unless the paper asks otherwise.',
  },
  {
    id: 'network',
    n: 6,
    title: 'Network and finish',
    minutes: 27,
    area: 'Wired network',
    steps: [
      'Open `ncpa.cpl` → Ethernet → IPv4 and set the paper\'s IP, mask, gateway and DNS.',
      'Run `ipconfig /all` and record the address, gateway, DNS and MAC address.',
      'Test in order: `ping 127.0.0.1`, the gateway, another PC, `ping example.com`, `nslookup example.com`, `tracert example.com`, `netstat -ano`.',
      'Share `C:\\SNA_Shared` with the approved account and open `\\\\<PC-IP>\\SNA_Shared` from the second PC.',
      'Enable Remote Desktop only if the edition and the paper allow it; use `mstsc`, then disable it and remove the test share.',
    ],
    show: [
      'An ipconfig /all printout with address, gateway, DNS and MAC.',
      'A test table with sent, received, lost and average time.',
    ],
    ask: {
      q: 'Ping by name fails but ping by IP works. What is wrong?',
      a: 'Name resolution. Check the DNS server setting and the DNS service; the cable and IP are working.',
    },
    warning: 'Do not enable RDP unless it is authorised and the edition is Pro. Disable it and remove test shares when you finish.',
  },
  {
    id: 'write',
    n: 7,
    title: 'Write it down and answer',
    minutes: 15,
    area: 'Documentation and viva',
    steps: [
      'Fill one page: machine specifications, what you did with times, evidence, problems found and one improvement.',
      'Put the evidence in front: CPU-Z, `ipconfig /all`, the ping table, Device Manager, the new volume, the new account and the restore point.',
      'Answer in three sentences: **name it → what it does → the lab example**. Stop there.',
      'If you do not know, say what you would check first and why. The method is what is being marked.',
    ],
    show: ['The one-page record, complete and dated.', 'Two viva answers aloud, without reading.'],
    ask: {
      q: 'How do you answer a question you are unsure about?',
      a: 'Say what you would check first and why. That shows a method rather than a guess.',
    },
  },
];

export const EXAM_TOTAL_MINUTES = PHASES.reduce((total, phase) => total + phase.minutes, 0);
