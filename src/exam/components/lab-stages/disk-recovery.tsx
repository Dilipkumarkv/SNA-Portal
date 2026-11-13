import { DiskMap, stage, Transcript } from './shared';

export const diskRecoveryStages = {
  'partition-style': stage({
    title: 'Disk 1 properties · Volumes',
    rows: [
      'Disk 1 · removable test disk · 14 GB. Identity must match the assigned device.',
      'Properties tabs: General / Volumes (selected) / Driver. Volume DATA (E:) uses NTFS.',
      'Partition style: GPT. This describes disk organization, not the NTFS filesystem.',
      <Transcript>{'DISKPART> list disk\n  Disk ###  Status   Size     Free     Dyn  Gpt\n  --------  -------  -------  -------  ----  ---\n  Disk 1    Online     14 GB      0 B        *\nDISKPART> exit'}</Transcript>,
    ], note: 'Inspection only. No conversion or changes to the disk.',
  }),
  'resize-partition': stage({
    title: 'Test disk · shrink and extend layouts',
    rows: [
      <><span>Before: DATA 40 GB on the assigned backed-up disk.</span><DiskMap parts={['DATA 40 GB', 'Other 20 GB']} /></>,
      'Shrink: 10240 MB. The layouts below are rounded to whole GB for readability; the dialog maximum may be smaller because of immovable files.',
      <><span>After shrink: space immediately to the right is eligible.</span><DiskMap parts={['DATA 30 GB', 'Unallocated 10 GB', 'Other 20 GB']} /></>,
      <><span>Ineligible: a neighbor separates DATA from the free region.</span><DiskMap parts={['DATA 30 GB', 'Other 20 GB', 'Unallocated 10 GB']} /><span>Do not delete the neighbor. Eligible extension would return DATA to 40 GB.</span></>,
    ], note: 'Capacity labels are simplified examples; only approved test storage may be resized.',
  }),
  'file-recovery': stage({
    title: 'Windows File Recovery · example transcript', kind: 'terminal',
    rows: [
      'Source D: (NTFS test volume) → destination E: (different drive). Stop writes to D:.',
      <Transcript>{'winfr D: E: /regular /n "\\Lab Data\\sample.txt"'}</Transcript>,
      'Example report: 1 file found. Destination: E:\\Recovery_Example. A run may instead find no recoverable files.',
      'E:\\Recovery_Example\\sample.txt → readable disposable text checked. A filename alone does not prove intact recovery.',
    ], note: 'No command runs here. Verify installed winfr help and suitable mode first; overwrite or SSD TRIM may prevent recovery.',
  }),
  'registry-backup': stage({
    title: 'Registry Editor · assigned test branch',
    rows: [
      <Transcript>{'Computer\\HKEY_CURRENT_USER\\Software\\SNA_Test\n(HKCU · instructor-assigned noncritical example)'}</Transcript>,
      'Export range: Selected branch. Only the assigned SNA_Test branch, not the entire registry.',
      'Saved export: SNA_Test-before.reg. Verify the path and file before the supervised existing-value test.',
      'Existing DisplayMode value: compact → wide → import → compact. Import merges; a newly added value is not necessarily removed.',
    ], note: 'Illustrated path is not a recommended key to create or modify without assignment. Never import downloaded tweaks.',
  }),
  'app-reinstall': stage({
    title: 'Apps · disposable Lab Notes example',
    rows: [
      'Selected: Lab Notes · example version 1.0 · disposable test app. App data backed up if needed.',
      'Uninstall review: only Lab Notes. Example after removal: app no longer appears in Installed apps.',
      'Reinstall source: teacher-approved official publisher installer or Store listing. Publisher and compatibility checked.',
      'Launch check: Lab Notes opens a new blank note; version 1.0 shown. Personal settings recovery is not guaranteed.',
    ], note: 'Lab Notes is fictional; never remove institutional or security software for this example.',
  }),
  'windows-update': stage({
    title: 'Windows Update · status and history',
    rows: [
      'Pending review: 1 example update. Restart not started; lab approval still required.',
      'DEMO-UPDATE · fictional quality update identifier, not a real KB or recommendation.',
      'History row: DEMO-UPDATE / example session date / Installed. Record the actual result, including failure.',
      'Uninstall availability: Not available for this example entry. Some updates cannot be removed; do not assume rollback exists.',
    ], note: 'Version-dependent Settings layout. No check, install, pause, restart or uninstall operation is performed here.',
  }),
};
