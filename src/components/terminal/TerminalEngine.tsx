/**
 * SNA Terminal Engine - Adapted from CMD project
 * Provides Virtual File System, Command Execution, and Shell Environments
 * for SNA syllabus CLI practice (Weeks 6, 8, 10, 11)
 */

export type ShellMode = 'cmd' | 'ps' | 'bash';

export interface TerminalEntry {
  id: string;
  type: 'input' | 'output' | 'error' | 'system';
  shell: ShellMode;
  prompt?: string;
  commandText?: string;
  output?: string;
  timestamp: number;
}

export interface CommandResult {
  text?: string;
  error?: boolean;
  clearScreen?: boolean;
}

export interface LabContext {
  vfs: VirtualFileSystem;
  currentUser: string;
  computerName: string;
  terminalColor: 'green' | 'amber' | 'white' | 'blue';
  activeShell: ShellMode;
  inDiskPart: ShellMode | null;
}

// ============ Virtual File System ============

export interface VFSNode {
  name: string;
  isFile: boolean;
  content?: string;
  children?: Map<string, VFSNode>;
  parent?: VFSNode;
  attributes?: string;
  createdAt?: Date;
  modifiedAt?: Date;
}

export class VirtualFileSystem {
  private drives: Map<string, VFSNode> = new Map();
  private cwdNode: VFSNode;
  private cwdPath: string = 'C:\\';

  constructor() {
    this.initializeDefaultDrives();
    this.cwdNode = this.drives.get('C:')!;
  }

  private initializeDefaultDrives() {
    // C: drive with Windows structure
    const cDrive = this.createDrive('C:');
    const users = this.createDir(cDrive, 'Users');
    const student = this.createDir(users, 'Student');
    this.createDir(student, 'Documents');
    this.createDir(student, 'Downloads');
    this.createDir(student, 'Desktop');
    this.createFileInternal(student, 'readme.txt', 'Welcome to SNA Terminal Lab!\nPractice CLI commands safely here.');

    // D: drive (empty)
    this.createDrive('D:');
    // E: drive (empty)
    this.createDrive('E:');
    // F: drive (empty)
    this.createDrive('F:');
  }

  private createDrive(name: string): VFSNode {
    const node: VFSNode = { name, isFile: false, children: new Map() };
    this.drives.set(name, node);
    return node;
  }

  private createDir(parent: VFSNode, name: string): VFSNode {
    const node: VFSNode = { name, isFile: false, children: new Map(), parent };
    parent.children!.set(name.toLowerCase(), node);
    return node;
  }

  private createFileInternal(parent: VFSNode, name: string, content: string): VFSNode {
    const node: VFSNode = { name, isFile: true, content, parent };
    parent.children!.set(name.toLowerCase(), node);
    return node;
  }

  getCwd(): string {
    return this.cwdPath;
  }

  setCwd(path: string): boolean {
    const node = this.resolvePath(path);
    if (node && !node.isFile) {
      this.cwdNode = node;
      this.cwdPath = this.getNodePath(node);
      return true;
    }
    return false;
  }

  getCwdNode(): VFSNode {
    return this.cwdNode;
  }

  listDir(path?: string): VFSNode[] {
    const target = path ? this.resolvePath(path) : this.cwdNode;
    if (!target || target.isFile) return [];
    return Array.from(target.children!.values());
  }

  createDirectory(path: string): boolean {
    const parts = this.parsePath(path);
    const parent = this.resolvePath(parts.dirPath);
    if (!parent || parent.isFile) return false;
    if (parent.children!.has(parts.name.toLowerCase())) return false;
    this.createDir(parent, parts.name);
    return true;
  }

  createFile(path: string, content: string = ''): boolean {
    const parts = this.parsePath(path);
    const parent = this.resolvePath(parts.dirPath);
    if (!parent || parent.isFile) return false;
    if (parent.children!.has(parts.name.toLowerCase())) return false;
    this.createFileInternal(parent, parts.name, content);
    return true;
  }

  readFile(path: string): string | null {
    const node = this.resolvePath(path);
    if (node && node.isFile) return node.content || '';
    return null;
  }

  delete(path: string): boolean {
    const parts = this.parsePath(path);
    const parent = this.resolvePath(parts.dirPath);
    if (!parent || parent.isFile) return false;
    return parent.children!.delete(parts.name.toLowerCase());
  }

  resolvePath(path: string): VFSNode | null {
    // Handle drive letter
    const driveMatch = path.match(/^([A-Za-z]:)(.*)/);
    if (!driveMatch) return null;
    
    const driveLetter = driveMatch[1].toUpperCase();
    const restPath = driveMatch[2];
    
    let current = this.drives.get(driveLetter);
    if (!current) return null;
    
    if (!restPath || restPath === '\\' || restPath === '/') {
      return current;
    }

    const segments = restPath.split(/[\\/]+/).filter(Boolean);
    for (const segment of segments) {
      if (current.isFile) return null;
      const next = current.children!.get(segment.toLowerCase());
      if (!next) return null;
      current = next;
    }
    return current;
  }

  private parsePath(path: string): { dirPath: string; name: string } {
    const normalized = path.replace(/\//g, '\\');
    const lastSlash = normalized.lastIndexOf('\\');
    if (lastSlash <= 2) { // e.g., "C:\file.txt"
      return { dirPath: normalized.substring(0, 3), name: normalized.substring(3) };
    }
    return { dirPath: normalized.substring(0, lastSlash), name: normalized.substring(lastSlash + 1) };
  }

  private getNodePath(node: VFSNode): string {
    const parts: string[] = [];
    let current: VFSNode | undefined = node;
    while (current && current.parent) {
      parts.unshift(current.name);
      current = current.parent;
    }
    return parts.join('\\');
  }

  // Serialization for localStorage persistence
  toJSON(): object {
    const drivesObj: Record<string, any> = {};
    for (const [name, node] of this.drives) {
      drivesObj[name] = this.serializeNode(node);
    }
    return { drives: drivesObj, cwd: this.cwdPath };
  }

  private serializeNode(node: VFSNode): any {
    const obj: any = { name: node.name, isFile: node.isFile };
    if (node.isFile) {
      obj.content = node.content;
    } else {
      obj.children = {};
      for (const [name, child] of node.children!) {
        obj.children[name] = this.serializeNode(child);
      }
    }
    return obj;
  }

  static fromJSON(data: any): VirtualFileSystem {
    const vfs = new VirtualFileSystem();
    vfs.drives.clear();
    for (const [name, nodeData] of Object.entries(data.drives)) {
      vfs.drives.set(name, vfs.deserializeNode(nodeData as any, null));
    }
    vfs.cwdPath = data.cwd || 'C:\\';
    vfs.cwdNode = vfs.resolvePath(vfs.cwdPath) || vfs.drives.get('C:')!;
    return vfs;
  }

  private deserializeNode(data: any, parent: VFSNode | null): VFSNode {
    const node: VFSNode = { name: data.name, isFile: data.isFile, parent };
    if (data.isFile) {
      node.content = data.content;
    } else {
      node.children = new Map();
      for (const [name, childData] of Object.entries(data.children || {})) {
        node.children.set(name, this.deserializeNode(childData, node));
      }
    }
    return node;
  }
}

// ============ Tokenizer ============

export function tokenize(input: string): string[] {
  const tokens: string[] = [];
  let current = '';
  let inQuotes = false;
  let quoteChar = '';

  for (let i = 0; i < input.length; i++) {
    const char = input[i];
    
    if ((char === '"' || char === "'") && !inQuotes) {
      inQuotes = true;
      quoteChar = char;
      current += char;
    } else if (char === quoteChar && inQuotes) {
      inQuotes = false;
      quoteChar = '';
      current += char;
    } else if (char === ' ' && !inQuotes) {
      if (current) {
        tokens.push(current);
        current = '';
      }
    } else {
      current += char;
    }
  }
  
  if (current) tokens.push(current);
  return tokens;
}

// ============ Command Registry ============

type CommandHandler = (args: string[], context: LabContext) => CommandResult;

interface Command {
  name: string;
  aliases: string[];
  handler: CommandHandler;
  description: string;
  shell: ShellMode | 'all';
}

const commands: Command[] = [];

export function registerCommand(command: Command) {
  commands.push(command);
}

export function getCommand(name: string, shell: ShellMode): Command | undefined {
  const lower = name.toLowerCase();
  return commands.find(cmd => 
    (cmd.shell === 'all' || cmd.shell === shell) &&
    (cmd.name.toLowerCase() === lower || cmd.aliases.some(a => a.toLowerCase() === lower))
  );
}

export function getAllCommands(shell: ShellMode): Command[] {
  return commands.filter(cmd => cmd.shell === 'all' || cmd.shell === shell);
}

// ============ Built-in Commands ============

// CMD Commands
registerCommand({
  name: 'cls',
  aliases: ['clear'],
  shell: 'cmd',
  description: 'Clears the screen',
  handler: () => ({ clearScreen: true })
});

registerCommand({
  name: 'dir',
  aliases: ['ls'],
  shell: 'all',
  description: 'Lists directory contents',
  handler: (args, context) => {
    const path = args[0] || '.';
    const target = path === '.' ? context.vfs.getCwdNode() : context.vfs.resolvePath(path);
    if (!target || target.isFile) {
      return { text: 'File Not Found', error: true };
    }
    const items = Array.from(target.children!.values());
    if (items.length === 0) return { text: 'No files found' };
    
    const lines = items.map(item => {
      const type = item.isFile ? 'File' : 'Dir';
      const size = item.isFile ? ` (${item.content?.length || 0} bytes)` : '';
      return `${item.name.padEnd(20)} [${type}]${size}`;
    });
    return { text: lines.join('\n') }
  }
});

registerCommand({
  name: 'cd',
  aliases: ['chdir'],
  shell: 'all',
  description: 'Changes the current directory',
  handler: (args, context) => {
    const path = args[0] || 'C:\\';
    if (context.vfs.setCwd(path)) {
      return { text: '' };
    }
    return { text: `The system cannot find the path specified: ${path}`, error: true };
  }
});

registerCommand({
  name: 'md',
  aliases: ['mkdir'],
  shell: 'all',
  description: 'Creates a directory',
  handler: (args, context) => {
    if (args.length === 0) return { text: 'Syntax error: mkdir <path>', error: true };
    const path = args[0];
    if (context.vfs.createDirectory(path)) {
      return { text: `Directory created: ${path}` };
    }
    return { text: 'Failed to create directory', error: true };
  }
});

registerCommand({
  name: 'type',
  aliases: ['cat'],
  shell: 'all',
  description: 'Displays file contents',
  handler: (args, context) => {
    if (args.length === 0) return { text: 'Syntax error: type <file>', error: true };
    const content = context.vfs.readFile(args[0]);
    if (content === null) return { text: 'File not found', error: true };
    return { text: content };
  }
});

registerCommand({
  name: 'echo',
  aliases: [],
  shell: 'all',
  description: 'Displays messages or writes to file',
  handler: (args, context) => {
    const text = args.join(' ');
    // Handle redirection: echo hello > file.txt
    const redirectIdx = args.findIndex(a => a === '>' || a === '>>');
    if (redirectIdx > 0) {
      const filePath = args[redirectIdx + 1];
      const content = args.slice(0, redirectIdx).join(' ') + '\n';
      const append = args[redirectIdx] === '>>';
      // Simple implementation - would need file append logic
      context.vfs.createFile(filePath, content);
      return { text: '' };
    }
    return { text };
  }
});

registerCommand({
  name: 'del',
  aliases: ['erase', 'rm'],
  shell: 'all',
  description: 'Deletes files',
  handler: (args, context) => {
    if (args.length === 0) return { text: 'Syntax error: del <file>', error: true };
    if (context.vfs.delete(args[0])) {
      return { text: `Deleted: ${args[0]}` };
    }
    return { text: 'File not found', error: true };
  }
});

function destinationPath(source: string, destArg: string, context: LabContext): string {
  const destNode = context.vfs.resolvePath(destArg);
  if (destNode && !destNode.isFile) {
    const name = source.split(/[\\/]/).pop()!;
    return destArg.replace(/[\\/]+$/, '') + '\\' + name;
  }
  return destArg;
}

function replaceWithFile(path: string, content: string, context: LabContext): boolean {
  if (context.vfs.resolvePath(path)) context.vfs.delete(path);
  return context.vfs.createFile(path, content);
}

registerCommand({
  name: 'copy',
  aliases: ['cp'],
  shell: 'all',
  description: 'Copies a file to another location',
  handler: (args, context) => {
    if (args.length < 2) return { text: 'The syntax of the command is incorrect.', error: true };
    const [source, destArg] = args;
    const content = context.vfs.readFile(source);
    if (content === null) return { text: 'The system cannot find the file specified.', error: true };
    const destination = destinationPath(source, destArg, context);
    if (!replaceWithFile(destination, content, context)) {
      return { text: 'The system cannot find the path specified.', error: true };
    }
    return { text: '        1 file(s) copied.' };
  }
});

registerCommand({
  name: 'move',
  aliases: ['mv'],
  shell: 'all',
  description: 'Moves a file to another location',
  handler: (args, context) => {
    if (args.length < 2) return { text: 'The syntax of the command is incorrect.', error: true };
    const [source, destArg] = args;
    const content = context.vfs.readFile(source);
    if (content === null) return { text: 'The system cannot find the file specified.', error: true };
    const destination = destinationPath(source, destArg, context);
    if (!replaceWithFile(destination, content, context)) {
      return { text: 'The system cannot find the path specified.', error: true };
    }
    context.vfs.delete(source);
    return { text: '        1 file(s) moved.' };
  }
});

registerCommand({
  name: 'ren',
  aliases: ['rename'],
  shell: 'all',
  description: 'Renames a file',
  handler: (args, context) => {
    if (args.length < 2) return { text: 'The syntax of the command is incorrect.', error: true };
    const [source, newName] = args;
    const content = context.vfs.readFile(source);
    if (content === null) return { text: 'The system cannot find the file specified.', error: true };
    const parent = source.replace(/[\\/][^\\/]*$/, '');
    const destination = `${parent}\\${newName}`;
    if (!replaceWithFile(destination, content, context)) {
      return { text: 'The system cannot find the path specified.', error: true };
    }
    context.vfs.delete(source);
    return { text: '' };
  }
});

interface VirtualUser {
  fullName: string;
  active: boolean;
  comment: string;
}

const userTables = new WeakMap<LabContext, Map<string, VirtualUser>>();

function getUserTable(context: LabContext): Map<string, VirtualUser> {
  let table = userTables.get(context);
  if (!table) {
    table = new Map<string, VirtualUser>([
      ['Administrator', { fullName: '', active: true, comment: 'Built-in account for administering the computer/domain' }],
      ['Guest', { fullName: '', active: false, comment: 'Built-in account for guest access to the computer/domain' }],
      ['Student', { fullName: 'SNA Lab Student', active: true, comment: 'Standard lab account' }],
    ]);
    userTables.set(context, table);
  }
  return table;
}

registerCommand({
  name: 'net',
  aliases: [],
  shell: 'cmd',
  description: 'Manages local users and accounts',
  handler: (args, context) => {
    if ((args[0] || '').toLowerCase() !== 'user') {
      return {
        text: [
          'The syntax of this command is:',
          '',
          'NET USER [username [password | *] [options]] [/DOMAIN]',
          '         username {password | *} /ADD [options] [/DOMAIN]',
          '         username [/DELETE] [/DOMAIN]',
        ].join('\n'),
        error: true,
      };
    }

    const table = getUserTable(context);
    const name = args[1];

    if (!name) {
      return {
        text: [
          `User accounts for \\\\${context.computerName}`,
          '',
          '-'.repeat(79),
          Array.from(table.keys()).join('    '),
          '-'.repeat(79),
          'The command completed successfully.',
        ].join('\n'),
      };
    }

    const key = Array.from(table.keys()).find(k => k.toLowerCase() === name.toLowerCase());
    const add = args.some(a => a.toLowerCase() === '/add');
    const remove = args.some(a => a.toLowerCase() === '/delete');

    if (add) {
      if (key) return { text: 'The account already exists.\n\nMore help is available by typing NET HELPMSG 2224.', error: true };
      table.set(name, { fullName: '', active: true, comment: '' });
      return { text: 'The command completed successfully.' };
    }

    if (remove) {
      if (!key) return { text: 'The user name could not be found.\n\nMore help is available by typing NET HELPMSG 2221.', error: true };
      table.delete(key);
      return { text: 'The command completed successfully.' };
    }

    if (!key) return { text: 'The user name could not be found.\n\nMore help is available by typing NET HELPMSG 2221.', error: true };

    const user = table.get(key)!;
    const activeArg = args.find(a => a.toLowerCase().startsWith('/active:'));
    if (activeArg) {
      user.active = activeArg.split(':')[1]?.toLowerCase() !== 'no';
      return { text: 'The command completed successfully.' };
    }

    return {
      text: [
        `User name                    ${key}`,
        `Full Name                    ${user.fullName}`,
        `Comment                      ${user.comment}`,
        "User's comment",
        'Country/region code          000 (System Default)',
        `Account active               ${user.active ? 'Yes' : 'No'}`,
        'Account expires              Never',
        '',
        'Password last set            <never>',
        'Password expires             <never>',
        'Password changeable          <never>',
        'Password required            No',
        'User may change password     Yes',
        '',
        'Workstations allowed         All',
        'Logon script',
        'User profile',
        'Home directory',
        'Last logon                   <never>',
        '',
        'Logon hours allowed          All',
        '',
        'Local Group Memberships      *Users',
        'Global Group memberships     *None',
        'The command completed successfully.',
      ].join('\n'),
    };
  }
});

const firewallStates = new WeakMap<LabContext, boolean>();

function firewallEnabled(context: LabContext): boolean {
  return firewallStates.get(context) ?? true;
}

registerCommand({
  name: 'netsh',
  aliases: [],
  shell: 'cmd',
  description: 'Network shell — firewall profiles and rules',
  handler: (args, context) => {
    const notFound = { text: `The following command was not found: ${args.join(' ')}.`, error: true };
    const [area = '', section = '', ...rest] = args;
    if (area.toLowerCase() !== 'advfirewall') return notFound;

    const profileBlock = (label: string) => [
      `${label} Profile Settings:`,
      '-'.repeat(40),
      `State                                 ${firewallEnabled(context) ? 'ON' : 'OFF'}`,
      'Firewall Policy                       BlockInbound,AllowOutbound',
      'LocalFirewallRules                    N/A (GPO-store only)',
      '',
    ];

    if (section.toLowerCase() === 'show' && (rest[0] || '').toLowerCase() === 'allprofiles') {
      return {
        text: [
          ...profileBlock('Domain'),
          ...profileBlock('Private'),
          ...profileBlock('Public'),
          'Ok.',
        ].join('\n'),
      };
    }

    if (section.toLowerCase() === 'set' && (rest[0] || '').toLowerCase() === 'allprofiles' && (rest[1] || '').toLowerCase() === 'state') {
      const value = (rest[2] || '').toLowerCase();
      if (value !== 'on' && value !== 'off') return notFound;
      firewallStates.set(context, value === 'on');
      return { text: `Ok.` };
    }

    if (section.toLowerCase() === 'firewall' && (rest[0] || '').toLowerCase() === 'add' && (rest[1] || '').toLowerCase() === 'rule') {
      const nameArg = args.find(a => a.toLowerCase().startsWith('name='));
      const ruleName = nameArg ? nameArg.slice(nameArg.indexOf('=') + 1).replace(/^"|"$/g, '') : '(unnamed)';
      return { text: `Ok.\nRule "${ruleName}" added to the inbound ruleset.` };
    }

    return notFound;
  }
});

registerCommand({
  name: 'format',
  aliases: [],
  shell: 'cmd',
  description: 'Formats a disk for use with Windows',
  handler: (args, context) => {
    const drive = (args.find(a => /^[A-Za-z]:$/.test(a)) || '').toUpperCase();
    if (!drive) return { text: 'The syntax of the command is incorrect.', error: true };
    if (drive === 'C:') return { text: 'Cannot format the system volume. Access is denied.', error: true };
    const fs = args.find(a => a.toLowerCase().startsWith('/fs:'))?.split(':')[1]?.toUpperCase() || 'NTFS';
    return {
      text: [
        `Insert new disk for drive ${drive}`,
        'and press ENTER when ready...',
        'The type of the file system is RAW.',
        `The new file system is ${fs}.`,
        '',
        `Verifying 1,024 MB on ${drive}`,
        'Initializing the file allocation table...',
        '',
        '   1,048,576 KB total disk space.',
        '           0 KB in bad sectors.',
        '     1,048,576 KB are available.',
        '',
        'Initializing the file system...',
        'The format was completed successfully.',
      ].join('\n'),
    };
  }
});

registerCommand({
  name: 'defrag',
  aliases: [],
  shell: 'cmd',
  description: 'Analyzes and optimizes drive fragmentation',
  handler: (args, context) => {
    const drive = (args.find(a => /^[A-Za-z]:$/.test(a)) || 'C:').toUpperCase();
    const header = 'Microsoft Drive Optimizer\nCopyright (C) Microsoft Corporation.';
    if (args.some(a => a.toLowerCase() === '/a')) {
      return {
        text: [
          header,
          '',
          `Invoking analysis on (${drive})...`,
          '',
          '   Pre-optimization layout:',
          '     Extents in the created file : 412',
          '     Total fragmented space     : 6%',
          '',
          '   Analysis complete. Fragmentation is within acceptable limits.',
        ].join('\n'),
      };
    }
    return {
      text: [
        header,
        '',
        `Invoking optimization on (${drive})...`,
        '',
        '   Phase 1: Scanning',
        '   Phase 2: Consolidating free space',
        '   Phase 3: Defragmenting',
        '',
        '   Optimization complete.',
      ].join('\n'),
    };
  }
});

registerCommand({
  name: 'diskpart',
  aliases: [],
  shell: 'cmd',
  description: 'Disk partitioning utility',
  handler: (args, context) => {
    context.inDiskPart = 'cmd';
    return { text: 'Microsoft DiskPart version 10.0.19041.1\n\nCopyright (C) Microsoft Corporation.\nOn computer: DESKTOP-STUDENT\n\nDISKPART>' };
  }
});

registerCommand({
  name: 'exit',
  aliases: [],
  shell: 'all',
  description: 'Exits current shell or diskpart',
  handler: (args, context) => {
    if (context.inDiskPart) {
      context.inDiskPart = null;
      diskPartStates.delete(context);
      return { text: 'Leaving DiskPart...' };
    }
    return { text: 'Use "cmd", "powershell", or "bash" to switch shells' };
  }
});

// Network Commands (Week 10)
registerCommand({
  name: 'ping',
  aliases: [],
  shell: 'all',
  description: 'Tests network connectivity',
  handler: (args, context) => {
    const target = args[0] || '8.8.8.8';
    const count = parseInt(args.find(a => a.startsWith('-n'))?.split('=')[1] || '4', 10);
    const lines = [
      `Pinging ${target} with 32 bytes of data:`,
      ''
    ];
    for (let i = 0; i < count; i++) {
      const time = Math.floor(Math.random() * 50) + 1;
      lines.push(`Reply from ${target}: bytes=32 time=${time}ms TTL=128`);
    }
    lines.push('', `Ping statistics for ${target}:`, `    Packets: Sent = ${count}, Received = ${count}, Lost = 0 (0% loss)`, `Approximate round trip times in milli-seconds:`, `    Minimum = ${Math.floor(Math.random() * 10) + 1}ms, Maximum = ${Math.floor(Math.random() * 100) + 50}ms, Average = ${Math.floor(Math.random() * 30) + 10}ms`);
    return { text: lines.join('\n') };
  }
});

registerCommand({
  name: 'tracert',
  aliases: ['traceroute'],
  shell: 'all',
  description: 'Traces route to destination',
  handler: (args, context) => {
    const target = args[0] || '8.8.8.8';
    const lines = [
      `Tracing route to ${target} over a maximum of 30 hops`,
      ''
    ];
    for (let i = 1; i <= 5; i++) {
      const ip = `192.168.${i}.1`;
      const times = [Math.floor(Math.random()*20)+1, Math.floor(Math.random()*20)+1, Math.floor(Math.random()*20)+1];
      lines.push(`  ${i.toString().padStart(2)}    ${times[0]} ms    ${times[1]} ms    ${times[2]} ms    ${ip}`);
    }
    lines.push('', 'Trace complete.');
    return { text: lines.join('\n') };
  }
});

registerCommand({
  name: 'ipconfig',
  aliases: [],
  shell: 'all',
  description: 'Displays IP configuration',
  handler: (args, context) => {
    const showAll = args.includes('/all');
    const lines = [
      'Windows IP Configuration',
      '',
      'Ethernet adapter Ethernet0:',
      '',
      '   Connection-specific DNS Suffix  . : local',
      '   IPv4 Address. . . . . . . . . . . : 192.168.1.100',
      '   Subnet Mask . . . . . . . . . . . : 255.255.255.0',
      '   Default Gateway . . . . . . . . . : 192.168.1.1',
      ''
    ];
    if (showAll) {
      lines.push(
        '   DHCP Enabled. . . . . . . . . . . : Yes',
        '   DHCP Server . . . . . . . . . . . : 192.168.1.1',
        '   DNS Servers . . . . . . . . . . . : 8.8.8.8',
        '                                       8.8.4.4',
        ''
      );
    }
    return { text: lines.join('\n') };
  }
});

registerCommand({
  name: 'nslookup',
  aliases: [],
  shell: 'all',
  description: 'Queries DNS',
  handler: (args, context) => {
    const target = args[0] || 'google.com';
    return { 
      text: `Server:  dns.google\nAddress:  8.8.8.8\n\nNon-authoritative answer:\nName:    ${target}\nAddresses:  142.250.190.46\n            2607:f8b0:4005:80b::200e` 
    };
  }
});

registerCommand({
  name: 'netstat',
  aliases: [],
  shell: 'all',
  description: 'Displays network connections',
  handler: (args, context) => {
    return {
      text: `Active Connections\n\n  Proto  Local Address          Foreign Address        State\n  TCP    192.168.1.100:139      0.0.0.0:0              LISTENING\n  TCP    192.168.1.100:445      0.0.0.0:0              LISTENING\n  TCP    192.168.1.100:5040     0.0.0.0:0              LISTENING\n  TCP    192.168.1.100:5357     0.0.0.0:0              LISTENING\n  UDP    192.168.1.100:137      *:*\n  UDP    192.168.1.100:138      *:*`
    };
  }
});

// System Commands (Week 6, 8)
registerCommand({
  name: 'systeminfo',
  aliases: [],
  shell: 'all',
  description: 'Displays system information',
  handler: (args, context) => {
    return {
      text: `Host Name:                 DESKTOP-STUDENT\nOS Name:                   Microsoft Windows 11 Pro\nOS Version:                10.0.22631 N/A Build 22631\nSystem Manufacturer:       Virtual Machine\nSystem Model:              VirtualBox\nSystem Type:               x64-based PC\nProcessor(s):              1 Processor(s) Installed.\n                           [01]: Intel64 Family 6 Model 142 Stepping 10 GenuineIntel ~2500 Mhz\nTotal Physical Memory:     8,192 MB\nAvailable Physical Memory: 4,096 MB\nVirtual Memory: Max Size:  16,384 MB`
    };
  }
});

registerCommand({
  name: 'tasklist',
  aliases: [],
  shell: 'all',
  description: 'Lists running processes',
  handler: (args, context) => {
    return {
      text: `Image Name                     PID Session Name        Session#    Mem Usage\n========================= ======== ================ =========== ============\nSystem Idle Process              0 Services                   0         24 K\nSystem                           4 Services                   0        256 K\nRegistry                        96 Services                   0      4,128 K\nsmss.exe                       356 Services                   0      1,088 K\ncsrss.exe                      448 Services                   0      3,456 K\nwininit.exe                    544 Services                   0      5,120 K\nservices.exe                   640 Services                   0      7,680 K\nlsass.exe                      688 Services                   0     12,288 K\nsvchost.exe                    804 Services                   0     15,360 K`
    };
  }
});

registerCommand({
  name: 'sfc',
  aliases: [],
  shell: 'all',
  description: 'System File Checker',
  handler: (args, context) => {
    const scanNow = args.includes('/scannow');
    if (scanNow) {
      return {
        text: `Beginning system scan. This process will take some time.\n\nBeginning verification phase of system scan.\nVerification 100% complete.\n\nWindows Resource Protection did not find any integrity violations.`
      };
    }
    return { text: 'Usage: sfc /scannow' };
  }
});

registerCommand({
  name: 'dism',
  aliases: [],
  shell: 'all',
  description: 'Deployment Image Servicing and Management',
  handler: (args, context) => {
    if (args.includes('/online') && args.includes('/cleanup-image') && args.includes('/restorehealth')) {
      return { text: `Deployment Image Servicing and Management tool\nVersion: 10.0.22631.1\n\nImage Version: 10.0.22631.1\n\n[==========================100.0%==========================]\nThe restore operation completed successfully.` };
    }
    return { text: 'Usage: dism /online /cleanup-image /restorehealth' };
  }
});

registerCommand({
  name: 'chkdsk',
  aliases: [],
  shell: 'all',
  description: 'Checks disk for errors',
  handler: (args, context) => {
    const drive = args[0] || 'C:';
    const fix = args.includes('/f');
    return { text: `Checking file system on ${drive}\nVolume label is Windows.\n\nStage 1: Examining basic file structure ...\n  File verification completed.\nStage 2: Examining file name linkage ...\n  Index verification completed.\nStage 3: Examining security descriptors ...\n  Security descriptor verification completed.\n\nWindows has checked the file system and found no problems.\n\n  100,000,000 KB total disk space.\n   50,000,000 KB in 100,000 files.\n     100,000 KB in 50,000 indexes.\n         0 KB in bad sectors.\n    50,000 KB in use by the system.\n   49,900,000 KB available on disk.` };
  }
});

// PowerShell Commands
registerCommand({
  name: 'Get-Process',
  aliases: ['ps', 'gps'],
  shell: 'ps',
  description: 'Gets running processes',
  handler: (args, context) => {
    return { text: `Handles  NPM(K)    PM(K)      WS(K)     CPU(s)     Id  SI ProcessName\n-------  ------    -----      -----     ------     --  -- -----------\n    123      12     4567       1234       0.12    456   1  explorer\n    234      15     8901       2345       0.34    789   1  chrome\n    345      18    12345       3456       0.56   1011   1  code` };
  }
});

registerCommand({
  name: 'Get-Service',
  aliases: ['gsv'],
  shell: 'ps',
  description: 'Gets services',
  handler: (args, context) => {
    return { text: `Status   Name               DisplayName\n------   ----               -----------\nRunning  wuauserv           Windows Update\nRunning  bits               Background Intelligent Transfer\nStopped  DiagTrack          Connected User Experiences` };
  }
});

registerCommand({
  name: 'Get-ChildItem',
  aliases: ['gci', 'ls', 'dir'],
  shell: 'ps',
  description: 'Lists directory contents (PowerShell)',
  handler: (args, context) => {
    // Reuse dir logic
    const cmd = getCommand('dir', 'ps');
    return cmd?.handler(args, context) || { text: '', error: true };
  }
});

// Bash Commands
registerCommand({
  name: 'ls',
  aliases: [],
  shell: 'bash',
  description: 'List directory contents',
  handler: (args, context) => {
    const cmd = getCommand('dir', 'bash');
    return cmd?.handler(args, context) || { text: '', error: true };
  }
});

registerCommand({
  name: 'pwd',
  aliases: [],
  shell: 'bash',
  description: 'Print working directory',
  handler: (args, context) => {
    let path = context.vfs.getCwd();
    path = path.replace(/\\/g, '/');
    if (path.startsWith('C:')) path = path.substring(2);
    return { text: path || '/' };
  }
});

registerCommand({
  name: 'whoami',
  aliases: [],
  shell: 'bash',
  description: 'Print current user',
  handler: (args, context) => {
    return { text: context.currentUser.toLowerCase() };
  }
});

registerCommand({
  name: 'grep',
  aliases: [],
  shell: 'bash',
  description: 'Search text patterns',
  handler: (args, context) => {
    if (args.length < 2) return { text: 'Usage: grep <pattern> <file>', error: true };
    const pattern = args[0];
    const filePath = args[1];
    const content = context.vfs.readFile(filePath);
    if (content === null) return { text: 'File not found', error: true };
    const matches = content.split('\n').filter(line => line.includes(pattern));
    return { text: matches.join('\n') || '(no matches)' };
  }
});

// ============ DiskPart Interpreter ============

interface DiskPartState {
  disk: number | null;
  partition: number | null;
}

const diskPartStates = new WeakMap<LabContext, DiskPartState>();

const DISKPART_DISKS = [
  { index: 0, status: 'Online', size: '238 GB', free: '0 B', gpt: true, boot: true },
  { index: 1, status: 'Online', size: '14 GB', free: '14 GB', gpt: false, boot: false },
];

function partitionsFor(disk: number): { index: number; type: string; size: string; offset: string }[] {
  if (disk === 0) {
    return [
      { index: 1, type: 'Primary', size: '500 MB', offset: '1024 KB' },
      { index: 2, type: 'Primary', size: '237 GB', offset: '501 MB' },
    ];
  }
  return [{ index: 1, type: 'Primary', size: '14 GB', offset: '1024 KB' }];
}

function getDiskPartState(context: LabContext): DiskPartState {
  let state = diskPartStates.get(context);
  if (!state) {
    state = { disk: null, partition: null };
    diskPartStates.set(context, state);
  }
  return state;
}

const DISKPART_SYNTAX_ERROR: CommandResult = {
  text: 'The arguments specified for this command are not valid.\nFor more information on the command type: HELP',
  error: true,
};

const DISKPART_NO_DISK = 'There is no disk selected.\nPlease select a disk and try again.';

/**
 * DiskPart keeps its own prompt, so its sub-commands never go through the
 * shell registry. Handling them here keeps `list disk`, `select disk` and
 * friends from falling through to "is not recognized".
 */
function runDiskPart(tokens: string[], context: LabContext): CommandResult {
  const state = getDiskPartState(context);
  const sub = tokens[0].toLowerCase();
  const target = (tokens[1] || '').toLowerCase();

  if (sub === 'help') {
    return {
      text: [
        'Microsoft DiskPart syntax:',
        '',
        '  LIST DISK            Show every attached disk',
        '  LIST VOLUME          Show volumes with drive letters',
        '  LIST PARTITION       Show partitions on the selected disk',
        '  SELECT DISK <n>      Choose a disk to work on',
        '  SELECT PARTITION <n> Choose a partition on that disk',
        '  DETAIL DISK          Show details of the selected disk',
        '  CREATE PARTITION PRIMARY [SIZE=<MB>]',
        '  EXIT                 Leave DiskPart',
      ].join('\n'),
    };
  }

  if (sub === 'list') {
    if (target === 'disk') {
      return {
        text: [
          '  Disk ###  Status         Size     Free     Dyn  Gpt',
          '  --------  -------------  -------  -------  ---  ---',
          ...DISKPART_DISKS.map(d =>
            `  Disk ${d.index}    ${d.status.padEnd(13)}  ${d.size.padStart(6)}  ${d.free.padStart(7)}       ${d.gpt ? '*' : ' '}`
          ),
        ].join('\n'),
      };
    }
    if (target === 'volume') {
      return {
        text: [
          '  Volume ###  Ltr  Label        Fs     Type        Size     Status     Info',
          '  ----------  ---  -----------  -----  ----------  -------  ---------  --------',
          '  Volume 0     C                NTFS   Partition    238 GB  Healthy    Boot',
          '  Volume 1     D                NTFS   Partition     14 GB  Healthy',
        ].join('\n'),
      };
    }
    if (target === 'partition') {
      if (state.disk === null) return { text: DISKPART_NO_DISK, error: true };
      return {
        text: [
          '  Partition ###  Type              Size     Offset',
          '  -------------  ----------------  -------  -------',
          ...partitionsFor(state.disk).map(p =>
            `  Partition ${p.index}    ${p.type.padEnd(16)}  ${p.size.padStart(7)}  ${p.offset}`
          ),
        ].join('\n'),
      };
    }
    return DISKPART_SYNTAX_ERROR;
  }

  if (sub === 'select') {
    const index = Number.parseInt(tokens[2] ?? '', 10);
    if (target === 'disk') {
      const disk = DISKPART_DISKS.find(d => d.index === index);
      if (!disk) {
        return { text: 'Virtual Disk Service error:\nThe disk is not present.', error: true };
      }
      state.disk = disk.index;
      state.partition = null;
      return { text: `Disk ${disk.index} is now the selected disk.` };
    }
    if (target === 'partition') {
      if (state.disk === null) return { text: DISKPART_NO_DISK, error: true };
      const partition = partitionsFor(state.disk).find(p => p.index === index);
      if (!partition) {
        return { text: 'The specified partition is not valid.\nPlease select a valid partition.', error: true };
      }
      state.partition = partition.index;
      return { text: `Partition ${partition.index} is now the selected partition.` };
    }
    return DISKPART_SYNTAX_ERROR;
  }

  if (sub === 'detail') {
    if (target === 'disk') {
      if (state.disk === null) return { text: DISKPART_NO_DISK, error: true };
      const disk = DISKPART_DISKS.find(d => d.index === state.disk)!;
      return {
        text: [
          `Disk ${disk.index} is now the selected disk.`,
          '',
          'SNA-VM Virtual Disk',
          'Disk ID: 00000000-0000-0000-0000-000000000000',
          'Type   : Virtual',
          `Status : ${disk.status}`,
          'Path   : 0',
          'Target : 0',
          'LUN ID : 0',
          'Current Read-only State : No',
          'Read-only  : No',
          `Boot Disk  : ${disk.boot ? 'Yes' : 'No'}`,
          'Pagefile Disk  : Yes',
          'Hibernation File Disk : No',
          'Crashdump Disk : No',
        ].join('\n'),
      };
    }
    return DISKPART_SYNTAX_ERROR;
  }

  if (sub === 'create') {
    if (target !== 'partition') return DISKPART_SYNTAX_ERROR;
    if (state.disk === null) return { text: DISKPART_NO_DISK, error: true };
    const sizeArg = tokens.find(t => t.toLowerCase().startsWith('size='));
    const size = sizeArg ? sizeArg.split('=')[1] : null;
    return { text: `DiskPart succeeded in creating the specified partition.${size ? `\nSize: ${size} MB` : ''}` };
  }

  return DISKPART_SYNTAX_ERROR;
}

// ============ Command Executor ============

export function executeCommand(input: string, context: LabContext): CommandResult {
  const tokens = tokenize(input);
  if (tokens.length === 0) return {};
  
  const cmdName = tokens[0];
  const args = tokens.slice(1);

  const lowerName = cmdName.toLowerCase();
  if (context.inDiskPart && lowerName !== 'exit' && lowerName !== 'diskpart') {
    return runDiskPart(tokens, context);
  }
  
  const command = getCommand(cmdName, context.activeShell);
  if (!command) {
    return { text: `'${cmdName}' is not recognized as an internal or external command, operable program or batch file.`, error: true };
  }
  
  try {
    return command.handler(args, context);
  } catch (err: any) {
    return { text: `Command error: ${err.message}`, error: true };
  }
}

// ============ Shell Banners ============

export function getShellBanner(shell: ShellMode): string {
  switch (shell) {
    case 'cmd':
      return `Microsoft Windows [Version 10.0.22631.1]\n(c) Microsoft Corporation. All rights reserved.\n\nDeveloped by Dilip Kumar for SNA Lab`;
    case 'ps':
      return `Windows PowerShell\nCopyright (C) Microsoft Corporation. All rights reserved.\n\nDeveloped by Dilip Kumar for SNA Lab`;
    case 'bash':
      return `GNU bash, version 5.0.0(1)-release\nDeveloped by Dilip Kumar for SNA Lab`;
  }
}

// ============ Storage ============

const STORAGE_KEY = 'sna_terminal_lab_state';

export function saveLabState(context: LabContext): void {
  try {
    const data = {
      vfs: context.vfs.toJSON(),
      currentUser: context.currentUser,
      computerName: context.computerName,
      terminalColor: context.terminalColor,
      activeShell: context.activeShell,
      inDiskPart: context.inDiskPart,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save terminal state:', e);
  }
}

export function loadLabState(): LabContext | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    const context = new LabContext();
    context.vfs = VirtualFileSystem.fromJSON(data.vfs);
    context.currentUser = data.currentUser || 'Student';
    context.computerName = data.computerName || 'DESKTOP-STUDENT';
    context.terminalColor = data.terminalColor || 'green';
    context.activeShell = data.activeShell || 'cmd';
    context.inDiskPart = data.inDiskPart;
    return context;
  } catch (e) {
    console.error('Failed to load terminal state:', e);
    return null;
  }
}

export function clearLabState(): void {
  localStorage.removeItem(STORAGE_KEY);
}

// ============ LabContext Class ============

export class LabContextImpl implements LabContext {
  vfs: VirtualFileSystem;
  currentUser: string;
  computerName: string;
  terminalColor: 'green' | 'amber' | 'white' | 'blue';
  activeShell: ShellMode;
  inDiskPart: ShellMode | null;

  constructor() {
    this.vfs = new VirtualFileSystem();
    this.currentUser = 'Student';
    this.computerName = 'DESKTOP-STUDENT';
    this.terminalColor = 'green';
    this.activeShell = 'cmd';
    this.inDiskPart = null;
  }
}

// Re-export for compatibility
export const LabContext = LabContextImpl;

// ============ Utility Functions ============

export function generateTerminalEntryId(prefix: string = 'entry'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function getTerminalColors(color: string, isPS: boolean) {
  const schemes: Record<string, { bg: string; fg: string; prompt: string; error: string; system: string }> = {
    green: { bg: '#000000', fg: '#cccccc', prompt: '#00ff00', error: '#ff4444', system: '#ffff00' },
    amber: { bg: '#000000', fg: '#ffbf00', prompt: '#ffbf00', error: '#ff4444', system: '#ffffff' },
    white: { bg: '#000000', fg: '#ffffff', prompt: '#ffffff', error: '#ff4444', system: '#ffff00' },
    blue: { bg: '#000000', fg: '#64b5f6', prompt: '#64b5f6', error: '#ff4444', system: '#ffff00' },
  };
  return schemes[color] || schemes.green;
}

// ============ Default Context Export ============

export const defaultLabContext = new LabContextImpl();