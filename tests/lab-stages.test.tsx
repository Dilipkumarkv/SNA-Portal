import React from 'react';
import assert from 'node:assert/strict';
import test from 'node:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { LabStage } from '../src/exam/components/LabStage';
import type { Lab } from '../src/exam/labs';
import { LABS, labBySlug } from '../src/exam/labs';

const energy: Lab = {
  id: 'lab-energy', number: '12.5', week: 12, sources: [], prerequisites: [], expected: [], related: [], concepts: [],
  eyebrow: 'Energy', title: 'Lab energy worksheet', aim: 'Estimate savings', tool: 'Worksheet', minutes: 4,
  thumbLabel: 'ENERGY', screenNote: 'Hypothetical, not measured.', caution: 'No measured values supplied.',
  points: [
    { n: 1, name: 'Device inventory', detail: 'Count the PCs.' },
    { n: 2, name: 'Power assumption', detail: 'Estimated reduction.' },
    { n: 3, name: 'Time assumption', detail: 'Hours and days.' },
    { n: 4, name: 'Energy calculation', detail: 'Convert Wh to kWh.' },
  ], steps: [], record: [], wrong: '', check: { q: '', a: '' }, ask: { q: '', a: '' }, examLabel: '',
};

test('energy stage renders a worked example, not just the supplied point descriptions', () => {
  let html = '';
  assert.doesNotThrow(() => { html = renderToStaticMarkup(<LabStage lab={energy} active={2} onSelect={() => {}} />); });
  assert.match(html, /16 kWh/);
  assert.match(html, /Illustrative example — not your computer’s current state\./);
  assert.match(html, /aria-label="Point 2: Power assumption" aria-pressed="true"/);
  assert.doesNotMatch(html, /<input|<textarea|contenteditable/i);
});

const examples = {
  'partition-style': 'Partition style: GPT', 'resize-partition': 'Shrink: 10240 MB',
  'file-recovery': 'Recovery_Example', 'registry-backup': 'HKCU', 'app-reinstall': 'Lab Notes', 'windows-update': 'DEMO-UPDATE',
  'task-manager': 'Lab Viewer', services: 'Lab Practice Service', 'scheduled-task': 'labtask.bat', 'device-driver': 'DEMO-USB',
  'printer-driver': 'Lab Printer', 'network-driver': 'Ethernet Lab', 'system-integrity': 'ScanHealth',
  'ipv4-settings': '192.168.1.10', 'dns-settings': 'nslookup example.com', 'adapter-details': '1.0 Gbps',
  'ping-test': 'Received = 4', 'trace-route': 'Request timed out', 'network-statistics': 'LISTENING',
  'dns-reset': 'flushdns', 'firewall-rule': 'SNA-Test-Rule', 'wifi-profile': 'SNA-DEMO', 'folder-sharing': 'SNA_Shared', 'remote-desktop': 'PC-B',
  'network-task-manager': '0.8 Mbps', 'network-resource-monitor': '12500 B/sec', 'create-vm': 'Linux-Lab.vdi',
  'vm-network-mode': 'Host-only', 'guest-network-commands': 'ip route', 'vm-network-metrics': '6000 bytes',
  'vpn-connect': 'Institution-approved profile', 'vpn-compare': '198.51.100.20',
  'ewaste-policy': 'greene.gov.in', 'ewaste-classify': 'Keyboard', 'ewaste-process': 'Reuse assessment',
  'ewaste-case-study': 'Not established', 'lab-energy': '16 kWh',
} as const;

for (const [id, evidence] of Object.entries(examples)) {
  test(`${id} dispatches to its own read-only example with named selected annotations`, () => {
    const lab = labBySlug(id as Lab['id']);
    assert.ok(lab, `${id} must be a real card`);
    const second = lab.points[1];
    assert.ok(second, `${id} must have a second point`);
    let html = '';
    assert.doesNotThrow(() => { html = renderToStaticMarkup(<LabStage lab={lab} active={second.n} onSelect={() => {}} />); });
    assert.ok(html.includes(evidence), `Missing specific example: ${evidence}`);
    assert.ok(
      html.includes(`aria-label="Point ${second.n}: ${second.name}" aria-pressed="true"`),
      `${id} must select its own point ${second.n} (${second.name}), not a fixture point`,
    );
    assert.doesNotMatch(html, /<input|<textarea|contenteditable/i);
  });
}

test('legacy startup example does not offer firmware time as application evidence', () => {
  const html = renderToStaticMarkup(<LabStage lab={{ ...energy, id: 'startup' }} active={null} onSelect={() => {}} />);
  assert.doesNotMatch(html, /Last BIOS time:/);
  assert.match(html, /Illustrative example/);
});

const drawnScreens = new Set(['rufus', 'partition', 'windows', 'ubuntu', 'diskpart', 'restore', 'startup']);

test('every authored example fills one read-only row per point of the real card', () => {
  for (const lab of LABS) {
    const html = renderToStaticMarkup(<LabStage lab={lab} active={null} onSelect={() => {}} />);
    assert.match(html, /Illustrative example — not your computer’s current state\./, `${lab.id} missing the illustrative note`);
    assert.doesNotMatch(html, /<input|<textarea|contenteditable/i, `${lab.id} offers an editable control`);
    for (const point of lab.points) {
      assert.ok(html.includes(`aria-label="Point ${point.n}: ${point.name}"`), `${lab.id} missing point ${point.n}`);
    }
    const authored = html.includes(`data-lab-example="${lab.id}"`);
    if (!authored) {
      assert.ok(drawnScreens.has(lab.id), `${lab.id} must render its own authored example, not a legacy drawn screen`);
      continue;
    }
    const rows = [...html.matchAll(/<dd[^>]*>([\s\S]*?)<\/dd>/g)].map((match) => match[1].trim());
    assert.equal(rows.length, lab.points.length, `${lab.id} row count does not match its points`);
    rows.forEach((row, index) => assert.ok(row.length > 0, `${lab.id} point ${index + 1} has an empty example row`));
  }
});

test('the firewall rule card names the same temporary rule in its steps and its example', () => {
  const lab = LABS.find((entry) => entry.id === 'firewall-rule');
  assert.ok(lab, 'firewall-rule card must exist');
  const quoted = lab.steps.map((step) => step.text).join('\n').match(/`[^`]+`/g) ?? [];
  const rule = quoted.map((token) => token.slice(1, -1)).find((token) => /rule/i.test(token));
  assert.ok(rule, 'firewall-rule steps must name a temporary rule');
  const html = renderToStaticMarkup(<LabStage lab={lab} active={null} onSelect={() => {}} />);
  assert.ok(html.includes(rule), `the example must show the same rule name: ${rule}`);
});

const render = (id: string) => {
  const lab = labBySlug(id as Lab['id']);
  assert.ok(lab, `${id} must be a real card`);
  return renderToStaticMarkup(<LabStage lab={lab} active={null} onSelect={() => {}} />);
};

/** The terminal line a numbered annotation dot is attached to. */
const lineWithDot = (html: string, n: number) => {
  const segment = html.split('</div>').find((part) => part.includes(`aria-label="Point ${n}:`));
  assert.ok(segment, `no line carries annotation dot ${n}`);
  return segment;
};

test('the DiskPart drawing shows every inspection command its card steps require', () => {
  const html = render('diskpart');
  for (const command of ['list disk', 'select disk', 'detail disk', 'list partition', 'list volume', 'select volume', 'detail volume', 'exit']) {
    assert.ok(html.includes(command), `the drawing must show \`${command}\``);
  }
  assert.ok(lineWithDot(html, 5).includes('detail volume'), 'dot 5 is named "Volume details" and must sit on detail volume, not exit');
});

test('the DiskPart drawing does not invent fields the real command never prints', () => {
  assert.doesNotMatch(render('diskpart'), /Style\s*:\s*MBR/, 'detail disk prints no Style field');
});

test('the scheduled-task example uses the same script and log file as its card steps', () => {
  const lab = labBySlug('scheduled-task');
  assert.ok(lab);
  const html = render('scheduled-task');
  const script = lab.steps.map((step) => step.text).join('\n').match(/`([a-z]+\.bat)`/i)?.[1];
  assert.ok(script, 'the card must name its batch file');
  assert.ok(html.includes(script), `the example must show ${script}, not a different filename`);
  const log = lab.steps.map((step) => step.text).join('\n').match(/([A-Za-z]+\.txt)/)?.[1];
  assert.ok(log, 'the card must name its log file');
  assert.ok(html.includes(log), `the example must show ${log}`);
  assert.ok(html.includes('Task Executed Successfully'), 'the example must show the manual’s echo text');
});

test('the startup drawing highlights an app the caution actually permits disabling', () => {
  const html = render('startup');
  const highlighted = lineWithDot(html, 3);
  assert.doesNotMatch(highlighted, /Lab Agent|SecurityHealth|Antivirus|Driver/i, 'the highlighted row must not be lab, security or driver software');
  assert.match(highlighted, /Enabled/, 'the highlighted row must still show its status');
});

test('the partition-style transcript uses the real list disk column layout', () => {
  const html = render('partition-style');
  assert.doesNotMatch(html, /GPT \*/, 'the Gpt column holds a star; it is not a "GPT *" cell');
  assert.match(html, /Gpt/, 'the real column is named Gpt');
});

test('the shrink example states its units consistently with the drawn layout', () => {
  const html = render('resize-partition');
  assert.match(html, /10240 MB/);
  assert.doesNotMatch(html, /10240 MB \(10 GiB\)/, '10 GiB is not the 10 GB the layout draws');
});

test('decorative diagrams expose their label to assistive technology', () => {
  const resize = render('resize-partition');
  assert.match(resize, /role="img"[^>]*aria-label="Disk regions/, 'the disk map needs a role for its aria-label to be announced');
  const taskManager = render('task-manager');
  assert.match(taskManager, /role="img"[^>]*aria-label="CPU samples/, 'the CPU bar chart needs a role for its aria-label to be announced');
});
