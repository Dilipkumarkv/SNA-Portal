import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LABS, LAB_WEEKS, labBySlug, labsForWeek } from '../src/exam/labs.ts';
import { LAB_IDS, type LabId, type LabWeek } from '../src/exam/types.ts';

const weekOrder: Record<number, string[]> = {
  5: ['rufus', 'partition', 'windows', 'ubuntu'],
  6: ['diskpart'],
  7: ['restore', 'startup'],
  8: ['partition', 'partition-style', 'resize-partition', 'diskpart', 'file-recovery', 'registry-backup', 'restore', 'app-reinstall', 'windows-update'],
  9: ['task-manager', 'startup', 'services', 'scheduled-task', 'device-driver', 'printer-driver', 'network-driver', 'system-integrity'],
  10: ['ipv4-settings', 'dns-settings', 'adapter-details', 'ping-test', 'trace-route', 'network-statistics', 'dns-reset', 'firewall-rule', 'wifi-profile', 'folder-sharing', 'remote-desktop'],
  11: ['network-task-manager', 'network-resource-monitor', 'create-vm', 'vm-network-mode', 'guest-network-commands', 'vm-network-metrics', 'vpn-connect', 'vpn-compare'],
  12: ['ewaste-policy', 'ewaste-classify', 'ewaste-process', 'ewaste-case-study', 'lab-energy'],
};

// Independent source ledger transcribed from the supplied PDF, not from application data.
const sourceTitles = [
  'Creating and Formatting a New Hard Disk Partition',
  'Identification of MBR and GPT Partition Styles',
  'Shrinking and Extending a Disk Partition',
  'Disk Management Using DiskPart Commands',
  'Recovering Deleted Files Using Windows File Recovery',
  'Windows Registry Backup and Restoration',
  'Creating and Using a Windows System Restore Point',
  'Uninstalling and Reinstalling an Application',
  'Windows Update Management and Update History',
  'Monitoring System Performance Using Task Manager',
  'Troubleshooting Slow Windows Start-up',
  'Managing Windows Services',
  'Creating and Managing Tasks Using Windows Task Scheduler',
  'Installing and Updating Device Drivers',
  'Installing a Printer Driver',
  'Enabling and Disabling a Network Driver',
  'System File Repair Using SFC, DISM and CHKDSK',
  'Configuring IP Address, Subnet Mask and Default Gateway',
  'Configuring a DNS Server',
  'Viewing Network Adapter Information and Managing Network Connections',
  'Testing Network Connectivity Using Ping',
  'Tracing Network Routes Using Tracert',
  'Viewing Open Ports and Network Statistics Using Netstat',
  'Flushing DNS Cache and Resetting TCP/IP Configuration',
  'Configuring Windows Defender Firewall',
  'Configuring Network Profiles and Managing Wireless Networks',
  'Sharing Files and Folders over a Local Area Network',
  'Establishing a Secure Remote Desktop Connection',
  'Monitoring Network Activity Using Task Manager',
  'Monitoring Network Utilization Using Resource Monitor',
  'Installation and Configuration of a Virtual Machine',
  'Configuring Virtual Machine Network Settings',
  'Executing Basic Network Commands in a Virtual Machine',
  'Monitoring Virtual Machine Network Utilization',
  'Installing and Configuring a VPN Application',
  'Comparing Network Connectivity With and Without VPN',
  'Study of E-Waste Management Policies and Regulations in India',
  'Identification and Classification of Electronic Waste',
  'Study of E-Waste Recycling and Disposal Processes',
  'Virtual Case Study of an E-Waste Recycling Facility',
  'Identifying Methods to Reduce Carbon Footprint in a Computer Laboratory',
];

function card(id: string) {
  const lab = labBySlug(id as LabId);
  assert.ok(lab, `missing card ${id}`);
  return lab;
}
const text = (id: string) => JSON.stringify(card(id));
const procedure = (id: string) => card(id).steps.map((step) => step.text).join('\n');

test('44 unique cards retain the original seven IDs and append all 37 approved slugs in order', () => {
  const expected = [...new Set(Object.values(weekOrder).flat())];
  assert.equal(LABS.length, 44);
  assert.equal(new Set(LABS.map((lab) => lab.id)).size, 44);
  assert.deepEqual(LABS.map((lab) => lab.id), expected);
  assert.deepEqual([...LAB_IDS], expected);
  assert.equal(new Set(LABS.map((lab) => lab.number)).size, 44);
  assert.equal(labBySlug('unknown' as LabId), undefined);
});

test('week lookups return all 48 memberships exactly once in approved order', () => {
  assert.deepEqual(LAB_WEEKS.map((meta) => meta.week), [5, 6, 7, 8, 9, 10, 11, 12]);
  assert.deepEqual(LAB_WEEKS.map((meta) => labsForWeek(meta.week).length), [4, 1, 2, 9, 8, 11, 8, 5]);
  for (const [week, ids] of Object.entries(weekOrder)) {
    const result = labsForWeek(Number(week) as LabWeek);
    assert.deepEqual(result.map((lab) => lab.id), ids);
    assert.equal(new Set(result).size, ids.length);
    for (const lab of result) {
      assert.equal(lab, labBySlug(lab.id), 'memberships share the canonical record');
      assert.ok(lab.week === Number(week) || lab.alsoInWeeks?.includes(Number(week) as LabWeek));
    }
  }
  for (const lab of LABS) {
    const memberships = [lab.week, ...(lab.alsoInWeeks ?? [])];
    assert.equal(new Set(memberships).size, memberships.length);
    assert.deepEqual(LAB_WEEKS.filter(({ week }) => labsForWeek(week).includes(lab)).map(({ week }) => week), memberships);
  }
});

test('only four original cards are shared and canonical numbers and weeks never change', () => {
  assert.deepEqual(LABS.filter((lab) => lab.alsoInWeeks?.length).map((lab) => lab.id), ['partition', 'diskpart', 'restore', 'startup']);
  for (const [id, number, week, also] of [
    ['partition', '05.2', 5, 8], ['diskpart', '06.1', 6, 8],
    ['restore', '07.1', 7, 8], ['startup', '07.2', 7, 9],
  ] as const) {
    assert.equal(card(id).number, number);
    assert.equal(card(id).week, week);
    assert.deepEqual(card(id).alsoInWeeks, [also]);
  }
  for (const week of [8, 9, 10, 11, 12] as const) {
    labsForWeek(week).forEach((lab, index) => {
      if (lab.week === week) assert.equal(lab.number, `${String(week).padStart(2, '0')}.${index + 1}`);
    });
  }
});

// Printed experiment numbers transcribed from the manual, pages 20–60 in order.
// Page 48 repeats the number 47; the two cards are distinguished by page and title.
const printedExperiments = [
  '20', '21', '22', '23', '24', '25', '26', '27', '28', '29',
  '30', '31', '32', '33', '34', '35', '36', '37', '38', '39',
  '40', '41', '42', '43', '44', '45', '46', '47', '47', '48',
  '49', '50', '51', '52', '53', '54', '55', '56', '57', '58', '59',
];

test('each manual page 20–60 is cited once by its corresponding card with exact title and experiment', () => {
  const ids = [8, 9, 10, 11, 12].flatMap((week) => weekOrder[week]);
  assert.equal(ids.length, 41);
  assert.equal(printedExperiments.length, 41);
  ids.forEach((id, index) => {
    const page = index + 20;
    assert.deepEqual(card(id).sources?.find((source) => source.page === page), {
      document: 'lab-manual', page, experiment: printedExperiments[index], title: sourceTitles[index],
    });
    assert.equal(LABS.flatMap((lab) => lab.sources ?? []).filter((source) => source.page === page).length, 1);
  });
  assert.equal(card('remote-desktop').sources[0].experiment, '47');
  assert.equal(card('network-task-manager').sources[0].experiment, '47');
  assert.notEqual(card('remote-desktop').sources[0].title, card('network-task-manager').sources[0].title);
});

test('legacy installation citations retain their real manual numbering', () => {
  for (const [id, page, experiment, title] of [
    ['rufus', 16, '14', 'Creating a Bootable USB Drive Using Rufus'],
    ['partition', 17, '15', 'Hard Disk Partitioning and Formatting'],
    ['windows', 18, '16', 'Installation of Windows 10 Using a Bootable USB'],
    ['ubuntu', 19, '17', 'Installation of Linux (Ubuntu) Using a Bootable USB'],
  ] as const) {
    assert.deepEqual(card(id).sources?.find((source) => source.page === page), { document: 'lab-manual', experiment, page, title });
  }
});

test('all cards supply complete study content, requirements and verification rather than success claims', () => {
  for (const lab of LABS) {
    assert.match(lab.number, /^(0[5-9]|1[0-2])\.[1-9]\d*$/);
    for (const field of ['eyebrow', 'title', 'aim', 'tool', 'thumbLabel', 'screenNote', 'caution', 'wrong', 'examLabel'] as const) {
      assert.ok(lab[field].trim().length > 0, `${lab.id} ${field}`);
    }
    assert.ok(lab.minutes > 0);
    assert.ok(lab.steps.length >= 8, `${lab.id} complete procedure`);
    assert.ok(lab.steps.every((step) => step.text.trim().length > 0));
    for (const field of ['record', 'prerequisites', 'expected'] as const) {
      assert.ok(lab[field]?.length > 0, `${lab.id} ${field}`);
      assert.ok(lab[field].every((value) => value.trim().length > 0));
    }
    assert.ok(Array.isArray(lab.concepts), `${lab.id} concepts`);
    assert.ok(Array.isArray(lab.related), `${lab.id} related`);
    assert.equal(new Set(lab.related).size, lab.related.length);
    for (const id of lab.related) assert.ok(id !== lab.id && labBySlug(id), `${lab.id} valid related ${id}`);
    assert.ok(lab.sources?.length > 0);
    assert.ok(lab.sources.every((source) => source.document === 'lab-manual' && Number.isInteger(source.page) && source.title && source.experiment));
    assert.ok(lab.check.q && lab.check.a && lab.ask.q && lab.ask.a);
    assert.ok(lab.points.length >= 3 && lab.points.length <= 5);
    assert.deepEqual(lab.points.map((point) => point.n), lab.points.map((_, index) => index + 1));
    assert.ok(lab.points.every((point) => point.name.trim() && point.detail.trim()));
  }
});

test('recovery and integrity command examples carry the approved syntax corrections', () => {
  assert.ok(procedure('file-recovery').includes('winfr D: E: /regular /n "\\Lab Data\\sample.txt"'));
  assert.match(text('file-recovery'), /different.*destination|destination.*different/i);
  assert.match(text('file-recovery'), /TRIM/);
  assert.match(text('file-recovery'), /help/i);
  assert.ok(procedure('system-integrity').includes('DISM /Online /Cleanup-Image /ScanHealth'));
  assert.ok(procedure('system-integrity').includes('DISM /Online /Cleanup-Image /RestoreHealth'));
  assert.ok(procedure('system-integrity').includes('chkdsk C:'));
  assert.doesNotMatch(procedure('system-integrity'), /Clean-up-Image|chkdsk C: \/[fr]/i);
  assert.match(text('system-integrity'), /rerun.*SFC/i);
});

test('legacy safety regressions cannot reintroduce password capture, destructive inspection or BIOS timing', () => {
  assert.match(card('ubuntu').record.join(' '), /username.*password (policy|type)/i);
  assert.match(card('ubuntu').record.join(' '), /never.*value/i);
  assert.ok(procedure('diskpart').includes('select volume Y'));
  assert.ok(procedure('diskpart').includes('detail volume'));
  assert.match(procedure('diskpart'), /not only.*selected disk/i);
  assert.doesNotMatch(procedure('diskpart'), /`(?:clean|format|delete partition)`/i);
  assert.match(card('startup').record.join(' '), /sign-in|desktop readiness/i);
  assert.doesNotMatch(card('startup').record.join(' '), /BIOS/);
  assert.match(text('startup'), /firmware/i);
  assert.match(card('startup').check.a, /not.*uninstall/i);
});

test('risk-specific steps preserve target checks, cleanup and limits of observations', () => {
  for (const id of ['resize-partition', 'file-recovery', 'registry-backup', 'services', 'network-driver', 'system-integrity', 'ipv4-settings', 'dns-reset', 'firewall-rule', 'folder-sharing', 'remote-desktop', 'vm-network-mode', 'vpn-connect']) {
    assert.ok(card(id).steps.some((step) => step.stop), `${id} warning at action`);
  }
  assert.match(text('registry-backup'), /merg/i);
  assert.match(procedure('registry-backup'), /existing value/i);
  assert.match(text('scheduled-task'), /All files/i);
  assert.match(text('scheduled-task'), /redirected/i);
  assert.match(procedure('scheduled-task'), /remove.*test task/i);
  assert.match(text('network-statistics'), /does not prove.*reachab/i);
  assert.match(text('firewall-rule'), /keep.*firewall on/i);
  assert.match(text('folder-sharing'), /NTFS/);
  assert.match(text('remote-desktop'), /network.level authentication|NLA/i);
  assert.match(text('vpn-compare'), /split.tunnel/i);
  assert.match(procedure('guest-network-commands'), /ping -c 4 127\.0\.0\.1/);
  assert.match(procedure('vm-network-metrics'), /ip -s link/);
  assert.match(text('lab-energy'), /16 kWh/);
  assert.match(text('lab-energy'), /emissions factor/i);
  assert.match(procedure('ewaste-policy'), /E-Waste \(Management\) Rules, 2022/);
  assert.match(procedure('ewaste-case-study'), /advantages/i);
});

test('syllabus-only supplements are distinguished from manual practical coverage', () => {
  const concepts = (week: LabWeek) => labsForWeek(week).flatMap((lab) => lab.concepts).join(' ');
  assert.match(concepts(8), /FAT32.*NTFS.*exFAT/i);
  assert.match(concepts(9), /syllabus.only/i);
  assert.match(concepts(9), /Linux/);
  assert.match(concepts(9), /desktop customization/i);
  assert.match(concepts(10), /VLAN/);
  assert.match(concepts(10), /\/24/);
  assert.match(concepts(11), /Hyper-V/);
  assert.match(concepts(11), /modem/i);
  assert.match(concepts(12), /EPR/);
  assert.match(text('ewaste-policy'), /verify.*current|current.*verif/i);
  assert.match(text('ewaste-case-study'), /not established/i);
});

test('switching an adapter to a static address keeps name resolution working', () => {
  const steps = procedure('ipv4-settings');
  assert.match(steps, /DNS/i, 'the card must tell the student to record the current DNS servers');
  assert.match(steps, /DNS server addresses/i, 'the card must tell the student to re-enter them in the static dialog');
});

test('a card only teaches procedures its own citations cover', () => {
  assert.doesNotMatch(
    procedure('partition'),
    /Properties.*Volumes/,
    'the Properties → Volumes check belongs to Experiment 21, which partition does not cite',
  );
  assert.match(procedure('partition-style'), /Properties/, 'partition-style cites page 21 and must keep teaching it');
  assert.match(procedure('partition-style'), /Volumes/);
  assert.ok(card('partition-style').sources?.some((source) => source.page === 21));
  assert.ok(card('partition').related.includes('partition-style'), 'partition must still point at the card that teaches the check');
});

test('the startup card records where it deliberately departs from the manual', () => {
  const concepts = card('startup').concepts.join(' ');
  assert.match(concepts, /one (startup )?app at a time/i, 'the one-app substitution for manual step 7 must be disclosed');
  assert.match(concepts, /repeat/i, 'the disclosure must name the manual step it replaces');
});
