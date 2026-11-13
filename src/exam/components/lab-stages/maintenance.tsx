import { stage, Transcript } from './shared';

export const maintenanceStages = {
  'task-manager': stage({
    title: 'Task Manager · observed workload',
    rows: [
      'Processes: Lab Viewer (fictional test app) · Running. No End Task action is available in this guide.',
      'Lab Viewer row: CPU 12% / Memory 180 MB. Memory is a quantity; CPU is a utilization percentage.',
      <><span>CPU sample, whole system:</span><div role="img" className="mt-2 flex h-16 items-end gap-2 border-b border-line-strong" aria-label="CPU samples: 10, 18, 26, 14 percent">{[10, 18, 26, 14].map((v, i) => <span key={i} className="flex-1 bg-brand" style={{ height: `${v * 2}px` }} />)}</div><span>10% → 18% → 26% → 14%; not the selected process alone.</span></>,
      'Four samples 5 seconds apart, same small document workload. Compare like-for-like, not against an unexplained peak.',
    ],
  }),
  services: stage({
    title: 'Services · Lab Practice Service properties',
    rows: [
      'Lab Practice Service (fictional noncritical target) · Status: Running.',
      'Startup type: Manual. A Manual service can still be running after a start request.',
      'Control review: Start unavailable while running; Stop requires explicit approval. No control here operates the OS.',
      'Original configuration record: Manual / Running. Restore both startup type and running state after an approved test.',
    ], note: 'An instructor must select an actual safe noncritical service. Do not substitute an essential service.',
  }),
  'scheduled-task': stage({
    title: 'Task Scheduler · SNA one-time log',
    rows: [
      'Trigger: One time · example lesson day at 14:00. No repetition or elevation requested.',
      <Transcript>{'Program/script: C:\\LabOutput\\labtask.bat\nSaved as: All files · not labtask.bat.txt\nExample content:\n@echo off\necho Task Executed Successfully > "%USERPROFILE%\\Desktop\\tasklog.txt"'}</Transcript>,
      'Last Run Result: 0x0 in this example. This is not enough without checking the expected file.',
      <Transcript>{'%USERPROFILE%\\Desktop\\tasklog.txt\nTask Executed Successfully\nOne line from the approved test; remove only the test task afterward.'}</Transcript>,
    ], note: 'The manual’s %USERPROFILE%\\Desktop may be redirected. Verify it exists or substitute a teacher-approved writable folder, and use that same folder in both the script and the evidence. C:\\LabOutput must already exist and be writable. This script is displayed, never executed.',
  }),
  'device-driver': stage({
    title: 'Device Manager · example USB device',
    rows: [
      'Hardware identity: DEMO-USB · assigned test peripheral, not a real hardware ID or package recommendation.',
      'Driver tab record: version 1.0 before → 1.1 after an approved update. Record the actual publisher/date too.',
      'Driver source: approved manufacturer package matching device, OS and architecture. No third-party updater utility.',
      'Device status example: working properly. Functional check: test peripheral responds; status alone is not the whole check.',
    ],
  }),
  'printer-driver': stage({
    title: 'Printers & scanners · Lab Printer',
    rows: [
      'Lab Printer · fictional assigned model. Match the physical label before choosing its queue.',
      'Connection: USB to the local test PC. Power and cable verified independently of the driver.',
      'Driver: approved matching model package · example v1.0. Queue visible does not mean paper was printed.',
      'Properties: Print Test Page (read-only label). Expected evidence: one legible physical page; no page is also a result to record.',
    ], note: 'Use one supervised test page, not repeated jobs.',
  }),
  'network-driver': stage({
    title: 'Device Manager · local adapter state comparison',
    rows: [
      'Ethernet Lab · assigned local adapter. Original state: Enabled / link connected.',
      'Disable device: supervised local test only. Do not perform through an active Remote Desktop connection.',
      'During approved test: Disabled / link unavailable. This is a configuration state, not removal of the driver package.',
      'After Enable device: Enabled / link connected. Verify assigned connectivity; recover locally if it does not return.',
    ],
  }),
  'system-integrity': stage({
    title: 'Integrity tools · illustrative result categories', kind: 'terminal',
    rows: [
      <Transcript>{'sfc /scannow\nProtected system files\nExample: no integrity violations found.'}</Transcript>,
      <Transcript>{'DISM /Online /Cleanup-Image /ScanHealth\nComponent store scan\nExample: no component store corruption detected.'}</Transcript>,
      <Transcript>{'DISM /Online /Cleanup-Image /RestoreHealth\nModifying repair: only if approved and indicated.\nNot run in this example; rerun SFC if instructed.'}</Transcript>,
      <Transcript>{'chkdsk C:\nVolume structure observation\nExample: no problems reported.\nNo /f or /r repair requested.'}</Transcript>,
    ], note: 'Illustrative terminal only. No scan or repair is running; stable power and an approved repair source may be needed.',
  }),
};
