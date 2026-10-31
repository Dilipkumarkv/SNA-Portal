import { useState } from 'react';
import { ClipboardList, FileText, HelpCircle } from 'lucide-react';
import { VivaBank } from '../assessments/VivaBank';
import { QuestionBank } from '../assessments/QuestionBank';

type BankTab = 'papers' | 'viva' | 'questions';

const TABS: { key: BankTab; label: string }[] = [
  { key: 'papers', label: 'Model papers' },
  { key: 'viva', label: 'Viva' },
  { key: 'questions', label: 'CIE questions' },
];

const THEORY_PAPERS = [
  {
    id: 'CIE-1',
    sections: [
      {
        id: '1',
        questions: [
          '1a) Categorize the given devices into multiple categories: Mouse, Phone Display, RAM, RJ45, Flash Drive, NIC, Printer, Projector, Cache (-05 Marks)',
          "1b) Ajay a computer science diploma II year student. One of his friends wanted to buy a new desktop, so he asked Ajay's suggestions, feeling he might know more about computers. What are your suggestions to him with respect to hardware? (-10 Marks)",
          '1c) Compare the hardware components of a computer with your mobile phone. (-10 Marks)',
        ],
      },
      {
        id: '2',
        questions: [
          '2a) How can you diagnose power supply faults using PSU Tester? (-05 Marks)',
          '2b) Rachana was sitting on a plastic chair before trying to check the system unit cabinet. Though the power supply is not connected she got an electric shock. How can you analyze this problem? What are the safety measures for this? (static electricity) (-10 Marks)',
          '2c) How does SMPS work? (-10 Marks)',
        ],
      },
      {
        id: '3',
        questions: [
          '3a) Anil and Hruthvik are debating whether the north bridge is faster or the south bridge is faster? How can you conclude it? Justify your answer. (-05 Marks)',
          "3b) One of the computers in your lab was hanged when Vedant ran application 'X'. He doesn't want to restart the computer but has to kill application 'X'. How can you help him? (-10 Marks)",
          '3c) Khushi wants to install an operating system from her pen drive. But it is not loading. Someone told her to change it to BIOS. She does not understand it clearly. Can you help her with this regard? (-10 Marks)',
        ],
      },
      {
        id: '4',
        questions: [
          '4a) How can you differentiate single boot virtual machine installation? (-05 Marks)',
          '4b) Compare Windows/Linux OS with Android OS (-10 Marks)',
          '4c) Rehman installed an older version of the operating system on his computer. Some of his hardwares like Wi-Fi, is not working. How can you resolve this issue? (-10 Marks)',
        ],
      },
    ],
  },
  {
    id: 'CIE-3',
    sections: [
      {
        id: '1',
        questions: [
          '1a) Compare FAT32, NTFS, and exFAT file systems. (-05 Marks)',
          '1b) Explain MBR vs GPT partitioning schemes. Which is better? (-10 Marks)',
          '1c) Describe data recovery techniques for recovering deleted files. (-10 Marks)',
        ],
      },
      {
        id: '2',
        questions: [
          '2a) List tools available in Windows/Linux for monitoring system performance. (-05 Marks)',
          '2b) Explain the uses of SFC and DISM utilities in resolving system corruption. (-10 Marks)',
          '2c) How would you troubleshoot and optimize a system that takes too long to boot? (-10 Marks)',
        ],
      },
      {
        id: '3',
        questions: [
          '3a) Explain the basics of IP addressing and subnetting. (-05 Marks)',
          '3b) Describe the step-by-step methodology for network troubleshooting. (-10 Marks)',
          '3c) Explain how to configure Windows Firewall for secure network access and managing wireless networks. (-10 Marks)',
        ],
      },
    ],
  },
];

const PRACTICE_PAPERS = [
  {
    id: 'CIE-2',
    scenario:
      'You are instructed to install newer version of Operating system in a computer in your lab. Decide the OS, document hardware requirement for the same, before installing the OS check the BIOS/UEFI settings and do necessary updates in it. Install OS on right PC. Create a new account name CSE_LAB1_01 with a strong password.',
    scheme: [
      'a) Choosing OS and document Hardware - 10M',
      'b) BIOS/UEFI settings - 10M',
      'c) Installation of OS and operations - 15M',
      'd) OS related operations - 10M',
      'e) Portfolio Evaluation - 05M',
    ],
  },
  {
    id: 'CIE-4',
    scenario:
      'You are instructed to set up a secure network in your lab. Configure a static IP address, set up a DNS Server, and appropriately utilize Windows Firewall. Establish a Remote Desktop connection securely to another system in the lab. Finally, install a VPN client and document your steps.',
    scheme: [
      'a) IP Setup and DNS Configuration - 10M',
      'b) Firewall Configuration - 10M',
      'c) Remote Desktop Setup - 15M',
      'd) VPN Installation & Documentation - 10M',
      'e) Portfolio Evaluation - 05M',
    ],
  },
];

export function AssessmentBank() {
  const [tab, setTab] = useState<BankTab>('papers');

  return (
    <div className="space-y-4">
      <div className="flex gap-1 rounded-control bg-sunken p-1" role="tablist" aria-label="Assessment sections">
        {TABS.map(item => (
          <button
            key={item.key}
            onClick={() => setTab(item.key)}
            role="tab"
            aria-selected={tab === item.key}
            className={`min-h-9 flex-1 rounded-[0.5rem] px-2 text-xs font-semibold transition-colors ${
              tab === item.key ? 'bg-surface text-ink shadow-sm' : 'text-ink-3 hover:text-ink-2'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === 'papers' && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {THEORY_PAPERS.map(paper => (
            <section key={paper.id} className="rounded-card border border-line bg-surface p-4 sm:p-5">
              <h3 className="flex items-center gap-2 border-b border-line pb-3 font-display text-sm font-semibold text-ink">
                <ClipboardList size={15} className="text-ink-3" /> {paper.id} · Theory test
              </h3>
              <div className="mt-3 space-y-4">
                {paper.sections.map(section => (
                  <div key={section.id}>
                    <p className="text-xs font-semibold text-ink-3">Question {section.id}</p>
                    <div className="mt-1.5 space-y-2">
                      {section.questions.map((question, index) => (
                        <p key={index} className="text-sm leading-relaxed text-ink-2">{question}</p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}

          {PRACTICE_PAPERS.map(paper => (
            <section key={paper.id} className="rounded-card border border-line bg-surface p-4 sm:p-5">
              <h3 className="flex items-center gap-2 border-b border-line pb-3 font-display text-sm font-semibold text-ink">
                <FileText size={15} className="text-ink-3" /> {paper.id} · Practice test
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-2">{paper.scenario}</p>
              <div className="mt-3 space-y-1.5 border-t border-line pt-3">
                <p className="text-xs font-semibold text-ink">Scheme of assessment · 50 marks</p>
                <dl className="space-y-1">
                  {paper.scheme.map(line => (
                    <dd key={line} className="text-sm text-ink-2">{line}</dd>
                  ))}
                </dl>
              </div>
            </section>
          ))}
        </div>
      )}

      {tab === 'viva' && (
        <section className="rounded-card border border-line bg-surface p-4 sm:p-5">
          <h3 className="mb-4 flex items-center gap-2 font-display text-sm font-semibold text-ink">
            <HelpCircle size={15} className="text-ink-3" /> Viva questions and answers
          </h3>
          <VivaBank />
        </section>
      )}

      {tab === 'questions' && (
        <section className="rounded-card border border-line bg-surface p-4 sm:p-5">
          <h3 className="mb-4 flex items-center gap-2 font-display text-sm font-semibold text-ink">
            <ClipboardList size={15} className="text-ink-3" /> CIE question bank
          </h3>
          <QuestionBank />
        </section>
      )}
    </div>
  );
}
