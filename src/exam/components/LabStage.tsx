import type { ComponentType, ReactNode } from 'react';
import type { LabId } from '../types';
import type { Lab, LabPoint } from '../labs';

interface ScreenProps {
  active: number | null;
  onSelect: (n: number) => void;
  points: LabPoint[];
}

const FIELD =
  'relative flex h-5 min-w-0 items-center rounded-[3px] border border-black/15 bg-white px-1.5 font-mono text-[9px] text-black/75 sm:h-6 sm:text-[10px]';
const ACTION =
  'relative flex h-5 shrink-0 items-center justify-center rounded-[3px] border border-[#c8d3dc] bg-[#e9eef3] px-1.5 text-[8.5px] text-[#3f627d] sm:h-6 sm:text-[9.5px]';
const SMALL_BTN =
  'flex h-5 items-center rounded-[3px] border border-black/20 bg-[#f0f0ea] px-1.5 text-[8.5px] text-black/70 sm:h-6 sm:text-[9.5px]';

function PointDot({
  n,
  name,
  active,
  onSelect,
  className,
}: {
  n: number;
  name: string;
  active: number | null;
  onSelect: (n: number) => void;
  className: string;
}) {
  const on = active === n;
  return (
    <button
      type="button"
      onClick={() => onSelect(n)}
      aria-label={`Point ${n}: ${name}`}
      aria-pressed={on}
      className={`absolute z-10 grid h-5 w-5 place-items-center rounded-full border-2 font-mono text-[9px] font-bold shadow-[0_2px_6px_rgba(70,30,10,0.35)] transition-transform after:absolute after:-inset-2 after:content-[''] ${
        on
          ? 'scale-110 border-brand bg-white text-brand ring-2 ring-brand/25'
          : 'border-white/95 bg-brand text-white'
      } ${className}`}
    >
      {n}
    </button>
  );
}

function makeDot({ points, active, onSelect }: ScreenProps) {
  return (n: number, className: string) => (
    <PointDot
      n={n}
      name={points.find((point) => point.n === n)?.name ?? ''}
      active={active}
      onSelect={onSelect}
      className={className}
    />
  );
}

function Window({
  title,
  menu = false,
  tone = 'windows',
  children,
}: {
  title: string;
  menu?: boolean;
  tone?: 'windows' | 'terminal' | 'ubuntu';
  children: ReactNode;
}) {
  const ubuntu = tone === 'ubuntu';
  const terminal = tone === 'terminal';
  return (
    <div
      className={`overflow-hidden rounded-[10px] border shadow-[0_1px_2px_rgba(40,35,20,0.06)] ${
        terminal ? 'border-black/50 bg-[#0c0c0c]' : 'border-line-strong bg-[#f7f7f4]'
      }`}
    >
      <div
        className={`flex h-6 items-center gap-1.5 border-b px-2 font-mono text-[10px] ${
          ubuntu
            ? 'border-black/25 bg-[#4a2b45] text-white/80'
            : terminal
              ? 'border-white/15 bg-[#2b2b2b] text-white/65'
              : 'border-black/10 bg-[#ececea] text-black/55'
        }`}
      >
        {!ubuntu && !terminal ? (
          <>
            <span className="h-1.5 w-1.5 rounded-full bg-black/15" />
            <span className="h-1.5 w-1.5 rounded-full bg-black/15" />
            <span className="h-1.5 w-1.5 rounded-full bg-black/15" />
          </>
        ) : null}
        <span className="ml-0.5 truncate">{title}</span>
      </div>
      {menu ? (
        <div className="flex gap-3 border-b border-black/10 bg-[#f2f2ee] px-2 py-1 text-[9.5px] text-black/60">
          <span>File</span>
          <span>Action</span>
          <span>View</span>
          <span>Help</span>
        </div>
      ) : null}
      {children}
    </div>
  );
}

function RufusRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[74px_1fr_auto] items-center gap-1.5 sm:grid-cols-[88px_1fr_auto] sm:gap-2">
      <span className="text-right text-[9px] text-black/55 sm:text-[10px]">{label}</span>
      {children}
    </div>
  );
}

function RufusScreen(props: ScreenProps) {
  const dot = makeDot(props);
  return (
    <Window title="Rufus 4.6">
      <div className="flex flex-col gap-1.5 px-2.5 pb-2 pt-2.5 sm:gap-2">
        <RufusRow label="Device">
          <span className={FIELD}>
            USB (E:) · 14.5 GB
            {dot(1, '-right-2.5 top-1/2 -translate-y-1/2')}
          </span>
          <span className={ACTION}>SELECT</span>
        </RufusRow>
        <RufusRow label="Boot selection">
          <span className={`${FIELD} pl-4`}>
            Windows10.iso
            {dot(2, '-left-2 top-1/2 -translate-y-1/2')}
          </span>
          <span className={ACTION}>SELECT</span>
        </RufusRow>
        <RufusRow label="Partition scheme">
          <span className={FIELD}>
            GPT
            {dot(3, '-right-2.5 top-1/2 -translate-y-1/2')}
          </span>
          <span className="flex h-5 shrink-0 items-center justify-center rounded-[3px] border border-black/10 bg-[#f2f2ee] px-1.5 text-[8px] text-black/45 sm:h-6 sm:text-[9px]">
            Target: UEFI
          </span>
        </RufusRow>
        <RufusRow label="File system">
          <span className={FIELD}>FAT32</span>
          <span className="text-[8px] text-black/40 sm:text-[9px]">Default</span>
        </RufusRow>
        <RufusRow label="Cluster size">
          <span className={FIELD}>4096 bytes</span>
          <span className="text-[8px] text-black/40 sm:text-[9px]">Default</span>
        </RufusRow>
        <RufusRow label="Volume label">
          <span className={FIELD}>WIN10</span>
          <span className="text-[8px] text-black/40 sm:text-[9px]">—</span>
        </RufusRow>
        <div className="mt-1 flex items-center justify-between border-t border-black/10 pt-1.5">
          <span className="inline-flex items-center gap-1.5 text-[9px] text-black/55">
            <span className="h-1.5 w-1.5 rounded-full bg-[#4d785b]" />
            Ready
          </span>
          <span className="relative rounded-[3px] bg-[#4d785b] px-3 py-1 text-[9px] font-bold tracking-wide text-white">
            START
            {dot(4, '-right-2 -top-2')}
          </span>
        </div>
      </div>
    </Window>
  );
}

const VOLUME_COLS = 'grid grid-cols-[1fr_44px_34px_54px] items-center gap-x-1 sm:grid-cols-[1fr_62px_44px_52px] sm:gap-x-2';

function DiskManagementScreen(props: ScreenProps) {
  const dot = makeDot(props);
  return (
    <Window title="Disk Management" menu>
      <div className="px-2.5 pb-2.5 pt-2">
        <div className="flex items-center justify-between gap-2 rounded-[3px] bg-[#e9e9e4] px-1.5 py-1 text-[9px] text-black/70 sm:text-[10px]">
          <span className="relative pl-4 font-medium">
            Disk 0 · Basic
            {dot(1, '-left-2 top-1/2 -translate-y-1/2')}
          </span>
          <span className="tnum">465 GB</span>
          <span>Online</span>
        </div>

        <div className={`${VOLUME_COLS} mt-1.5 border-b border-black/10 px-1 pb-0.5 text-[8px] uppercase tracking-wide text-black/45`}>
          <span>Volume</span>
          <span>Type</span>
          <span>FS</span>
          <span className="pr-4 text-right">Size</span>
        </div>
        <div className="mt-0.5 space-y-0.5 text-[9px] text-black/70 sm:text-[10px]">
          <div className={`${VOLUME_COLS} px-1 py-0.5`}>
            <span className="truncate">Windows (C:)</span>
            <span>Primary</span>
            <span>NTFS</span>
            <span className="pr-4 text-right tnum">120 GB</span>
          </div>
          <div className={`${VOLUME_COLS} px-1 py-0.5`}>
            <span className="truncate">Data (D:)</span>
            <span>Primary</span>
            <span>NTFS</span>
            <span className="pr-4 text-right tnum">300 GB</span>
          </div>
          <div className={`${VOLUME_COLS} relative px-1 py-0.5`}>
            <span className="truncate">DATA (E:)</span>
            <span>Primary</span>
            <span>NTFS</span>
            <span className="pr-4 text-right tnum">40 GB</span>
            {dot(4, '-right-2 top-1/2 -translate-y-1/2')}
          </div>
        </div>

        <div className="mt-1.5 flex h-8 overflow-hidden rounded-[3px] border border-black/20">
          <span className="flex w-[26%] items-center justify-center border-r border-white/70 bg-[#dbe6f2] text-[8px] text-black/55">
            C:
          </span>
          <span className="flex w-[52%] items-center justify-center border-r border-white/70 bg-[#dbe6f2] text-[8px] text-black/55">
            D:
          </span>
          <span className="relative flex flex-1 items-center justify-center bg-[repeating-linear-gradient(45deg,#efede4,#efede4_4px,#e4e1d6_4px,#e4e1d6_8px)] text-[8px] text-black/50">
            Unallocated
            {dot(2, '-left-2 top-1/2 -translate-y-1/2')}
          </span>
        </div>
        <div className="ml-auto mt-0.5 w-40 rounded-[3px] border border-black/15 bg-white p-0.5 text-[9px] text-black/70 shadow-md">
          <span className="relative flex items-center justify-between rounded-[2px] bg-[#cfe0f0] px-1.5 py-1">
            New Simple Volume…
            {dot(3, '-right-2 top-1/2 -translate-y-1/2')}
          </span>
          <span className="flex px-1.5 py-1 text-black/45">Properties</span>
        </div>
      </div>
    </Window>
  );
}

function WindowsSetupScreen(props: ScreenProps) {
  const dot = makeDot(props);
  return (
    <Window title="Windows Setup">
      <div className="px-2.5 pb-2.5 pt-2">
        <div className="relative flex items-center gap-1.5 rounded-[3px] border border-black/10 bg-[#eef3f8] px-1.5 py-1 text-[9px] text-black/65">
          <span className="text-[#3f627d]">✓</span>
          Custom: Install Windows only (advanced)
          {dot(1, '-right-2 top-1/2 -translate-y-1/2')}
        </div>
        <p className="mt-2 text-[9.5px] font-semibold text-black/75">Where do you want to install Windows?</p>

        <div className="mt-1 grid grid-cols-[1fr_42px_38px_46px] gap-x-1.5 border-b border-black/10 pb-0.5 text-[8px] uppercase tracking-wide text-black/45 sm:grid-cols-[1fr_50px_44px_48px] sm:gap-x-1">
          <span>Name</span>
          <span>Total</span>
          <span>Free</span>
          <span>Type</span>
        </div>
        <div className="mt-0.5 space-y-0.5 text-[8.5px] text-black/70 sm:text-[9.5px]">
          <div className="relative grid grid-cols-[1fr_42px_38px_46px] items-center gap-x-1.5 pl-4 pr-1 py-0.5 sm:grid-cols-[1fr_50px_44px_48px] sm:gap-x-1">
            <span className="truncate">Drive 0 · Partition 1: Windows</span>
            <span className="tnum">120 GB</span>
            <span className="tnum">98 GB</span>
            <span>System</span>
            {dot(2, '-left-2 top-1/2 -translate-y-1/2')}
          </div>
          <div className="grid grid-cols-[1fr_42px_38px_46px] items-center gap-x-1.5 px-1 py-0.5 sm:grid-cols-[1fr_50px_44px_48px] sm:gap-x-1">
            <span className="truncate">Drive 0 · Partition 2: Data</span>
            <span className="tnum">300 GB</span>
            <span className="tnum">260 GB</span>
            <span>Primary</span>
          </div>
          <div className="grid grid-cols-[1fr_42px_38px_46px] items-center gap-x-1.5 px-1 py-0.5 sm:grid-cols-[1fr_50px_44px_48px] sm:gap-x-1">
            <span className="truncate">Drive 0 · Unallocated Space</span>
            <span className="tnum">44 GB</span>
            <span className="tnum">44 GB</span>
            <span>—</span>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-1">
          <span className={SMALL_BTN}>Refresh</span>
          <span className={`relative ${SMALL_BTN}`}>
            Delete
            {dot(4, '-top-4 left-0')}
          </span>
          <span className={SMALL_BTN}>Format</span>
          <span className={SMALL_BTN}>New</span>
          <span className={`relative ml-auto ${SMALL_BTN}`}>
            Next
            {dot(3, '-top-4 right-0')}
          </span>
        </div>
      </div>
    </Window>
  );
}

function UbuntuScreen(props: ScreenProps) {
  const dot = makeDot(props);
  return (
    <Window title="Install Ubuntu 24.04 LTS" tone="ubuntu">
      <div className="px-2.5 pb-2.5 pt-2">
        <p className="text-[9.5px] font-semibold text-black/75">Installation type</p>

        <div className="relative mt-1.5 rounded-[4px] border border-[#7a3b6d] bg-[#f6eef4] px-2 py-1.5">
          <p className="flex items-center gap-1.5 text-[9.5px] font-medium text-black/80">
            <span className="grid h-2.5 w-2.5 place-items-center rounded-full border border-[#7a3b6d]">
              <span className="h-1 w-1 rounded-full bg-[#7a3b6d]" />
            </span>
            Erase disk and install Ubuntu
          </p>
          <p className="mt-0.5 pl-4 text-[8.5px] text-black/50">The whole assigned disk is erased.</p>
          {dot(1, '-right-2 top-1/2 -translate-y-1/2')}
        </div>

        <div className="relative mt-1 rounded-[4px] border border-black/15 bg-white px-2 py-1.5">
          <p className="flex items-center gap-1.5 text-[9.5px] font-medium text-black/75">
            <span className="grid h-2.5 w-2.5 place-items-center rounded-full border border-black/30" />
            Something else
          </p>
          <p className="mt-0.5 pl-4 text-[8.5px] text-black/50">Create /, swap and home yourself.</p>
          {dot(2, '-right-2 top-1/2 -translate-y-1/2')}
        </div>

        <p className="mt-1.5 flex items-center gap-1.5 text-[8.5px] text-black/55">
          <span className="grid h-2.5 w-2.5 place-items-center rounded-[2px] border border-black/30 bg-white text-[6px] text-black/60">
            ✓
          </span>
          Install third-party software for graphics and Wi-Fi
        </p>

        <div className="mt-3 flex items-center justify-end gap-1 border-t border-black/10 pt-1.5">
          <span className={SMALL_BTN}>Back</span>
          <span className="relative rounded-[3px] bg-[#7a3b6d] px-2.5 py-1 text-[8.5px] font-semibold text-white">
            Install
            {dot(3, '-top-4 right-0')}
          </span>
        </div>

        <div className="mt-2 grid grid-cols-2 gap-x-2 gap-y-1 border-t border-black/10 pt-1.5">
          <AccountField label="Your name" value="Lab Student" />
          <AccountField label="Computer name" value="lab-pc" />
          <AccountField label="Username" value="student" dot={dot(4, '-right-2 top-1/2 -translate-y-1/2')} />
          <AccountField label="Password" value="••••••••" />
        </div>
      </div>
    </Window>
  );
}

function AccountField({ label, value, dot }: { label: string; value: string; dot?: ReactNode }) {
  return (
    <div>
      <p className="text-[7.5px] uppercase tracking-wide text-black/40">{label}</p>
      <p className="relative mt-0.5 flex h-4 items-center rounded-[2px] border border-black/15 bg-white px-1 font-mono text-[8px] text-black/65">
        {value}
        {dot}
      </p>
    </div>
  );
}

const TERM_LINE = 'relative whitespace-pre rounded-[2px]';

function DiskPartScreen(props: ScreenProps) {
  const dot = makeDot(props);
  return (
    <Window title="Administrator: Command Prompt" tone="terminal">
      <div className="overflow-x-auto px-2.5 py-2 font-mono text-[9px] leading-[1.75] text-[#d6d6d6] sm:text-[10.5px]">
        <div className={TERM_LINE}>
          C:\Users\Lab&gt; <span className="text-white">diskpart</span>
        </div>
        <div className="text-[#9a9a9a]">Microsoft DiskPart version 10.0.19041.3636</div>
        <div>&nbsp;</div>
        <div className={TERM_LINE}>
          DISKPART&gt; list disk
          {dot(1, '-right-2 top-1/2 -translate-y-1/2')}
        </div>
        <div className="text-[#9a9a9a]">  Disk ###  Status   Size     Free     Dyn  Gpt</div>
        <div className="text-[#9a9a9a]">  --------  -------  -------  -------  ----  ---</div>
        <div className={TERM_LINE}>
          {'  Disk 0    Online    465 GB      0 B        *'}
        </div>
        <div className={TERM_LINE}>
          {'  Disk 1    Online     14 GB      0 B'}
          {dot(2, '-right-2 top-1/2 -translate-y-1/2')}
        </div>
        <div>&nbsp;</div>
        <div className={TERM_LINE}>
          DISKPART&gt; select disk 1
          {dot(3, '-right-2 top-1/2 -translate-y-1/2')}
        </div>
        <div className="text-[#9a9a9a]">Disk 1 is now the selected disk.</div>
        <div>&nbsp;</div>
        <div className={TERM_LINE}>
          DISKPART&gt; detail disk
          {dot(4, '-right-2 top-1/2 -translate-y-1/2')}
        </div>
        <div className="text-[#9a9a9a]">  Type   : USB</div>
        <div className="text-[#9a9a9a]">  Status : Online</div>
        <div className="text-[#9a9a9a]">  Size   : 14 GB</div>
        <div className="text-[#9a9a9a]">  Style  : MBR</div>
        <div>&nbsp;</div>
        <div className={TERM_LINE}>
          DISKPART&gt; exit
          {dot(5, '-right-2 top-1/2 -translate-y-1/2')}
        </div>
      </div>
    </Window>
  );
}

function RestoreScreen(props: ScreenProps) {
  const dot = makeDot(props);
  return (
    <Window title="System Properties" menu>
      <div className="px-2.5 pb-2.5 pt-1.5">
        <div className="flex items-end gap-2 overflow-hidden border-b border-black/10 text-[8.5px] text-black/50">
          <span className="pb-1">Computer Name</span>
          <span className="pb-1">Hardware</span>
          <span className="pb-1">Advanced</span>
          <span className="-mb-px rounded-t-[2px] border border-b-0 border-black/15 bg-white px-1.5 pb-1 pt-0.5 font-medium text-black/75">
            System Protection
          </span>
          <span className="pb-1">Remote</span>
        </div>

        <p className="mt-2 text-[9px] font-semibold text-black/70">Protection Settings</p>
        <div className="mt-1 rounded-[3px] border border-black/15 bg-white px-2 py-1 text-[9px] text-black/70">
          <div className="flex items-center justify-between gap-2">
            <span>Local Disk (C:) (System)</span>
            <span className="relative pr-3 font-medium">
              On
              {dot(1, '-right-2 top-1/2 -translate-y-1/2')}
            </span>
          </div>
        </div>
        <div className="mt-4 flex gap-1">
          <span className={SMALL_BTN}>Configure…</span>
          <span className={`relative ${SMALL_BTN}`}>
            Create…
            {dot(2, '-top-4 left-0')}
          </span>
          <span className={SMALL_BTN}>System Restore…</span>
        </div>

        <div className="mt-2 rounded-[4px] border border-black/15 bg-[#f2f2ee] p-2 shadow-sm">
          <p className="text-[9px] font-semibold text-black/75">Create a restore point</p>
          <p className="mt-0.5 text-[8.5px] text-black/50">Type a description for this restore point.</p>
          <div className="relative mt-1 flex h-5 items-center rounded-[2px] border border-black/20 bg-white px-1.5 font-mono text-[8.5px] text-black/70">
            Before lab test
            {dot(3, '-right-2 top-1/2 -translate-y-1/2')}
          </div>
          <div className="mt-4 flex justify-end gap-1">
            <span className={`relative ${SMALL_BTN}`}>
              Create
              {dot(4, '-top-4 left-0')}
            </span>
            <span className={SMALL_BTN}>Cancel</span>
          </div>
        </div>
      </div>
    </Window>
  );
}

const STARTUP_COLS = 'grid grid-cols-[1fr_50px_58px] items-center gap-x-1 sm:grid-cols-[1fr_64px_76px]';

function StartupScreen(props: ScreenProps) {
  const dot = makeDot(props);
  return (
    <Window title="Task Manager">
      <div className="px-2.5 pb-2.5 pt-1.5">
        <div className="flex items-end gap-2.5 border-b border-black/10 text-[8.5px] text-black/50">
          <span className="pb-1">Processes</span>
          <span className="pb-1">Performance</span>
          <span className="relative -mb-px rounded-t-[2px] border-b-2 border-[#4d785b] pb-1 pl-4 font-medium text-black/80">
            Startup apps
            {dot(1, '-left-2 top-1/2 -translate-y-1/2')}
          </span>
          <span className="pb-1">Users</span>
        </div>

        <div className={`${STARTUP_COLS} mt-1.5 border-b border-black/10 px-1 pb-0.5 text-[8px] uppercase tracking-wide text-black/45`}>
          <span>Name</span>
          <span className="pl-4">Status</span>
          <span className="relative pr-4 text-right">
            <span className="sm:hidden">Impact</span>
            <span className="hidden sm:inline">Startup impact</span>
            {dot(2, '-right-2 top-1/2 -translate-y-1/2')}
          </span>
        </div>
        <div className="mt-0.5 space-y-0.5 text-[8.5px] text-black/70 sm:text-[9.5px]">
          <StartupRow name="SecurityHealth" status="Enabled" impact="Low" />
          <StartupRow name="OneDrive" status="Enabled" impact="Medium" />
          <StartupRow
            name="Lab Agent"
            status="Enabled"
            impact="High"
            statusDot={dot(3, '-left-2 top-1/2 -translate-y-1/2')}
          />
          <StartupRow name="Teams" status="Disabled" impact="None" />
        </div>

        <div className="mt-3 flex items-center justify-between gap-2 border-t border-black/10 pt-1.5 text-[8.5px] text-black/50">
          <span>Last BIOS time: 12.4 seconds</span>
          <span className={`relative ${SMALL_BTN}`}>
            Disable
            {dot(4, '-top-4 left-0')}
          </span>
        </div>
      </div>
    </Window>
  );
}

function StartupRow({
  name,
  status,
  impact,
  statusDot,
}: {
  name: string;
  status: string;
  impact: string;
  statusDot?: ReactNode;
}) {
  return (
    <div className={`${STARTUP_COLS} px-1 py-0.5`}>
      <span className="truncate">{name}</span>
      <span className="relative pl-4">
        {status}
        {statusDot}
      </span>
      <span className="text-right">{impact}</span>
    </div>
  );
}

const SCREENS: Record<LabId, ComponentType<ScreenProps>> = {
  rufus: RufusScreen,
  partition: DiskManagementScreen,
  windows: WindowsSetupScreen,
  ubuntu: UbuntuScreen,
  diskpart: DiskPartScreen,
  restore: RestoreScreen,
  startup: StartupScreen,
};

export function LabStage({
  lab,
  active,
  onSelect,
}: {
  lab: Lab;
  active: number | null;
  onSelect: (n: number) => void;
}) {
  const Screen = SCREENS[lab.id];
  return (
    <div>
      <Screen active={active} onSelect={onSelect} points={lab.points} />
      <p className="mt-1.5 text-[0.7rem] leading-snug text-ink-3">{lab.screenNote}</p>

      <div className="mt-3 overflow-hidden rounded-control border border-line bg-surface">
        {lab.points.map((point) => {
          const on = active === point.n;
          return (
            <button
              key={point.n}
              type="button"
              onClick={() => onSelect(point.n)}
              aria-pressed={on}
              className={`flex w-full items-start gap-2.5 border-b border-line px-2.5 py-2.5 text-left transition-colors last:border-b-0 ${
                on ? 'bg-brand-soft' : 'hover:bg-sunken'
              }`}
            >
              <span
                className={`mt-px grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand font-mono text-[10px] font-semibold text-on-brand ${
                  on ? 'ring-2 ring-brand/30' : ''
                }`}
              >
                {point.n}
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-medium leading-snug text-ink">{point.name}</span>
                <span className="mt-0.5 block text-xs leading-snug text-ink-3">{point.detail}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function LabThumb({ label }: { label: string }) {
  return (
    <span
      aria-hidden="true"
      className="block h-14 w-[74px] shrink-0 overflow-hidden rounded-[6px] border border-line bg-[#f7f7f4]"
    >
      <span className="block h-2.5 border-b border-black/10 bg-[#e8e8e2]" />
      <span className="grid h-[calc(100%-0.625rem)] place-items-center">
        <span className="font-mono text-[7px] tracking-[0.06em] text-black/45">{label}</span>
      </span>
    </span>
  );
}
