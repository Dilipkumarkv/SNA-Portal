import type { DrillCategory } from './types';
import { DRILLS } from './generated/drills';

export const DRILL_MINUTES = DRILLS.reduce((total, drill) => total + drill.minutes, 0);
export const DOCUMENTATION_MINUTES = 15;

export const DRILL_GROUPS: { category: DrillCategory; drills: typeof DRILLS }[] = (
  ['Hardware', 'OS & drivers', 'Disks & accounts', 'Repair', 'Network'] as DrillCategory[]
).map((category) => ({
  category,
  drills: DRILLS.filter((drill) => drill.category === category),
}));

export const EXAM_FACTS: { label: string; value: string }[] = [
  { label: 'Paper', value: 'One integrated scenario, then documentation and viva' },
  { label: 'Time', value: '180 minutes' },
  { label: 'Marks', value: '45 for the scenario + 5 for documentation and viva' },
  { label: 'Pass mark', value: '20 of 50' },
  { label: 'Machine', value: 'Lenovo ThinkCentre M73 · Core i5 4th gen · 8 GB DDR3 · 240 GB SSD + 500 GB HDD · HDMI · 450 W SMPS' },
];

export const CIE5_PARTS: { label: string; marks: number; note: string }[] = [
  {
    label: 'Portfolio',
    marks: 10,
    note: 'The observation book, with every lab exercise recorded and signed.',
  },
  {
    label: 'Mini project',
    marks: 20,
    note: 'The lab setup management plan. One document, ten sections.',
  },
  {
    label: 'Online course',
    marks: 20,
    note: 'Ten hours or more on Linux, networking or cloud, with a completion record.',
  },
];

export const LAST_48: { id: string; text: string }[] = [
  { id: 'mock', text: 'Sit one full 180-minute mock with the timer running. Stop when it ends.' },
  { id: 'walk', text: 'Walk the twelve drills on the M83 and note anything the lab does not have.' },
  { id: 'partition', text: 'Rehearse the Disk 1 partition from list disk through to assign.' },
  { id: 'account', text: 'Create and delete a local user, then confirm both with net user.' },
  { id: 'network', text: 'Print ipconfig /all and one ping plus tracert test table.' },
  { id: 'compat', text: 'Write the five-line compatibility statement from memory.' },
  { id: 'viva', text: 'Answer the ten featured viva questions aloud, three sentences each.' },
  { id: 'pack', text: 'Pack the observation book, portfolio, college ID and a pen. Then sleep.' },
];

export const PROJECT_SECTIONS: {
  id: string;
  title: string;
  detail: string;
}[] = [
  {
    id: 'summary',
    title: 'Purpose, capacity and budget',
    detail: 'Open with the lab\'s purpose, the number of students it must serve and the total budget.',
  },
  {
    id: 'room',
    title: 'Room and workstation layout',
    detail: 'Floor plan with dimensions, doors, windows, workstation positions, aisles and clearances.',
  },
  {
    id: 'hardware',
    title: 'Hardware procurement',
    detail: 'Item-wise specifications, quantities, vendor quotations and the costed total.',
  },
  {
    id: 'network',
    title: 'Network design',
    detail: 'IP addressing scheme, switch and router placement, cable routes, outlets and labelling.',
  },
  {
    id: 'electrical',
    title: 'Electrical plan',
    detail: 'Connected load calculation, circuit design, UPS sizing, earthing and ELCB protection.',
  },
  {
    id: 'safety',
    title: 'Safety measures',
    detail: 'Fire equipment, first aid, electrical safety, emergency exits and the response procedure.',
  },
  {
    id: 'security',
    title: 'Security policy',
    detail: 'Account rules, password policy, antivirus, firewall profiles, sharing rules and backups.',
  },
  {
    id: 'maintenance',
    title: 'Maintenance schedule',
    detail: 'Daily, weekly, monthly and annual tasks, with who owns each one.',
  },
  {
    id: 'ewaste',
    title: 'E-waste management',
    detail: 'Equipment lifecycle register, disposal timeline and the authorised recycler.',
  },
  {
    id: 'timeline',
    title: 'Timeline and handover',
    detail: 'A Gantt chart covering procurement, installation, testing and handover.',
  },
];

export const PROJECT_EVIDENCE: { source: string; use: string }[] = [
  {
    source: 'The machine · specifications',
    use: 'Quote the M73 baseline in the procurement table: H81, LGA1150, i5 4th gen, 8 GB DDR3, 240 GB SSD + 500 GB HDD, HDMI, 450 W ATX supply. Then scale quantities and costs for the whole room.',
  },
  {
    source: 'Exam day · disks',
    use: 'Use the Disk 0 GPT system disk and the Disk 1 NTFS data volume as the workstation build and backup rule.',
  },
  {
    source: 'Exam day · accounts',
    use: 'Reuse the account and group model — standard user first, administrator only when asked — in the security policy.',
  },
  {
    source: 'Exam day · network',
    use: 'Lift the IP scheme, static settings and ping test table straight into the network design and test plan.',
  },
  {
    source: 'Exam day · sharing',
    use: 'Turn the share permissions, RDP rule and LAN-only limit into the service policy.',
  },
];

/** Drill 1 is the shortest evidence trail; the featured viva set is the highest-yield answer set. */
export const FEATURED_QUIZ = 'featured';
