/**
 * Lab Scenarios: Pre-configured CLI scenarios mapped to syllabus experiments
 */
import { CLScenario } from '../components/terminal/TerminalComponents';

export const LAB_SCENARIOS: Record<number, CLScenario[]> = {
  // Experiment 1: Hardware Identification (Week 1)
  1: [
    {
      id: 'lab1-step1',
      title: 'Hardware Identification - Step 1',
      description: 'Identify motherboard components. Open schematic and locate CPU socket, RAM slots, PCIe.',
      week: 1,
      category: 'system',
      commands: ['dir', 'echo "Starting Experiment 1: Hardware Identification"', 'mkdir Observations'],
    },
  ],
  // Experiment 2: SMPS Voltage (Week 2)
  2: [
    {
      id: 'lab2-step3',
      title: 'SMPS Voltage - Step 3',
      description: 'Identify SMPS connectors. View SMPS schematic. Measure voltage using commands.',
      week: 2,
      category: 'system',
      commands: ['echo "Experiment 2: SMPS Voltage Measurement"', 'echo "Identify 24-pin ATX, 4-pin CPU, SATA connectors"', 'echo "Verify voltage color codes"'],
    },
    {
      id: 'lab2-step4',
      title: 'SMPS Voltage - Step 4',
      description: 'Practice measuring voltage levels in terminal.',
      week: 2,
      category: 'system',
      commands: ['echo "Setting multimeter to DC Voltage (20V range)"', 'echo "Yellow wire ≈ +12V (CPU/GPU)"', 'echo "Red wire ≈ +5V (USB/Drives)"', 'echo "Orange wire ≈ +3.3V (RAM)"', 'echo "Black wire = 0V Ground"'],
    },
  ],
  // Experiment 5: OS Installation (Week 5)
  5: [
    {
      id: 'lab5-step1',
      title: 'OS Installation - Step 1',
      description: 'Create bootable USB and install OS.',
      week: 5,
      category: 'navigation',
      commands: ['echo "Creating OS Image (Bootable Device)"', 'mkdir BootableUSB', 'echo "Install and boot Windows 10/11 or Linux OS"'],
    },
  ],
  // Experiment 6: CLI & User Mgmt (Week 6)
  6: [
    {
      id: 'lab6-step1',
      title: 'CLI Practice - Basic Navigation',
      description: 'Practice navigation commands in terminal.',
      week: 6,
      category: 'navigation',
      commands: ['dir', 'cd Documents', 'mkdir PracticeFolder', 'dir', 'cd PracticeFolder', 'echo "CLI Practice Complete" > progress.txt'],
    },
    {
      id: 'lab6-step2',
      title: 'CLI Practice - File Management',
      description: 'Create, edit, delete files using CLI.',
      week: 6,
      category: 'filesystem',
      commands: ['echo "File created" > file1.txt', 'type file1.txt', 'copy file1.txt file_backup.txt', 'del file_backup.txt', 'dir'],
    },
  ],
  // Experiment 10: Network Config (Week 10)
  10: [
    {
      id: 'lab10-step1',
      title: 'Network Config - IP Settings',
      description: 'Configure IP settings using ipconfig and ping.',
      week: 10,
      category: 'network',
      commands: ['ipconfig', 'ping 192.168.1.1', 'tracert google.com'],
    },
  ],
  // Experiment 13: Mini Project (Week 13)
  13: [
    {
      id: 'lab13-step1',
      title: 'Mini Project - Lab Setup',
      description: 'Design lab layout for 20 stations.',
      week: 13,
      category: 'system',
      commands: ['echo "Lab Setup Plan - 20 Stations"', 'mkdir LabPlan', 'echo "Resource Purchase & Budget" >> LabPlan/notes.txt'],
    },
  ],
};

export function getScenariosForLab(labId: number): CLScenario[] {
  return LAB_SCENARIOS[labId] || [];
}
