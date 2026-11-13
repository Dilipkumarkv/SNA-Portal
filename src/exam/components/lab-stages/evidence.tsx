import { Flow, stage, Transcript } from './shared';

export const evidenceStages = {
  'ewaste-policy': stage({
    title: 'Policy evidence worksheet · placeholder entries', kind: 'worksheet',
    rows: [
      'Authority: central ministry (environment) or the state pollution control board. Write the body that actually issued the document you read — the two publish different things.',
      <Transcript>{'Title: E-Waste (Management) Rules, 2022 — as the manual names it\nLater amendment / notification: [exact title and date]\nVerify what is in force today; copy titles and dates exactly.'}</Transcript>,
      'Provision, in your own words: the responsibility you actually read — for example a producer’s end-of-life collection duty under Extended Producer Responsibility. Anything you could not confirm stays marked unverified.',
      <Transcript>{'Sources: https://greene.gov.in/\n         https://kspcb.karnataka.gov.in/\nAccessed: [date you read it]\nNo regulator page is reproduced here.'}</Transcript>,
    ],
    note: 'These portals are entry points, not copies of a rule. Research only — do not register or submit anything on a government portal.',
  }),
  'ewaste-classify': stage({
    title: 'Classification worksheet · sample rows', kind: 'worksheet',
    rows: [
      <Transcript>{'Item: Keyboard\nOriginal function: text input peripheral\nOther example rows: mouse and damaged cable (peripherals),\nfaulty motherboard (computer), old HDD/SSD (storage device).'}</Transcript>,
      'Category: peripheral. Sort every row into computer, peripheral, storage device or communication equipment before choosing a route.',
      <Transcript>{'Keyboard     PCB: unknown   Battery: no\nMotherboard  PCB: yes       Battery: yes (coin cell)\nOld HDD      PCB: yes       Battery: no\nDo not open an item to check — write unknown and ask.'}</Transcript>,
      'Condition → route: working → reuse assessment; repairable → approved repair; non-functional → authorized recycler. Storage devices stay with the institution until data sanitization is confirmed.',
    ],
    note: 'Sample rows for practice, not an inventory of your laboratory. Observe and photograph only; never open a battery, power supply or CRT.',
  }),
  'ewaste-process': stage({
    title: 'Authorized recycling flow · branches drawn separately', kind: 'topology',
    rows: [
      <Flow nodes={['Collection at an approved point', 'Safe transport and storage', 'Segregation']} />,
      <><span>Reuse assessment decides the branch:</span><Flow nodes={['Working or repairable → reuse / approved repair', 'Not reusable → authorized recycler']} /></>,
      'Authorized recovery: dismantling, sorting and material separation (copper, aluminium, precious metals) by an authorized recycler under controlled conditions. No student extraction procedure is given here.',
      <><span>Special waste and protection run alongside the main stream:</span><Flow nodes={['Batteries and hazardous fractions → authorized treatment', 'Worker protection and pollution controls at every stage']} /></>,
    ],
    note: 'A generic outline to confirm against your approved source. If a stage is missing from that source, mark it “not established in this source” rather than inventing it.',
  }),
  'ewaste-case-study': stage({
    title: 'Evidence cards · empty scaffold', kind: 'worksheet',
    rows: [
      <Transcript>{'Observed\n[What you saw yourself, or read in a verifiable record]\nExample: collection bins present at the assigned site.'}</Transcript>,
      <Transcript>{'Reported\n[The facility’s own statement, not independently confirmed]\nExample: “we recover X% of collected material” — a claim\nuntil an official document supports it.'}</Transcript>,
      <Transcript>{'Not established\n[The question your sources could not answer]\nExample: downstream recycler authorization — left open.\nAbsence of evidence is not compliance.'}</Transcript>,
      'Every card carries its source reference and access date. If no verified facility is available, the scaffold stays empty rather than becoming a fictional completed report.',
    ],
    note: 'This guide names no recycler and endorses none. Choose the facility with your teacher; do not contact or visit one without approval.',
  }),
  'lab-energy': stage({
    title: 'Energy worksheet · one hypothetical saving', kind: 'worksheet',
    rows: [
      <Transcript>{'Assumptions (all hypothetical, none measured)\n10 PCs · 40 W saved each\n2 idle hours per day · 20 days'}</Transcript>,
      <Transcript>{'Watts → kilowatts\n40 W ÷ 1000 = 0.04 kW per PC'}</Transcript>,
      <Transcript>{'Energy (kWh) = Power (kW) × Time (hours)\n10 × 0.04 kW × 2 h × 20 days = 16 kWh'}</Transcript>,
      'Not a measurement: a 450 W power-supply label is maximum output capacity, not the draw of the PC. Real savings need rated or measured values, and no CO2e figure is given without a cited, dated grid emissions factor.',
    ],
    note: 'Estimates only. Do not change laboratory power settings or unplug shared equipment without permission, and never open a power supply to measure it.',
  }),
};