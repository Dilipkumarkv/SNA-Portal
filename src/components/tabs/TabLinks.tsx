import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { ExternalLink, Leaf, GraduationCap, ChevronRight, MessageSquare } from 'lucide-react';
import { Card } from '../Card';
import { FeedbackModal } from '../FeedbackModal';

function LinkItem({ 
  href, 
  title, 
  source, 
  iconType = 'external' 
}: { 
  href: string, 
  title: string, 
  source: string, 
  iconType?: 'external' | 'leaf'
}) {
  const isLeaf = iconType === 'leaf';
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="flex items-center p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors group">
      <div className={`w-9 h-9 rounded-full flex items-center justify-center mr-3 transition-colors ${
        isLeaf ? 'bg-emerald-50 dark:bg-emerald-950/70 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/60' : 'bg-indigo-50 dark:bg-indigo-950/70 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/60'
      }`}>
        {isLeaf ? (
          <Leaf className="text-emerald-600 dark:text-emerald-400" size={14} />
        ) : (
          <ExternalLink className="text-indigo-600 dark:text-indigo-400" size={14} />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{title}</p>
        <p className="text-[10px] text-slate-500 dark:text-slate-400">{source}</p>
      </div>
      <ChevronRight className="text-slate-300 dark:text-slate-600 group-hover:text-slate-400 dark:group-hover:text-slate-300 transition-colors" size={14} />
    </a>
  );
}

function SectionHeader({ title, color = 'indigo' }: { title: string, color?: 'indigo' | 'emerald' }) {
  const isEmerald = color === 'emerald';
  return (
    <div className={`px-4 py-2 border-y mt-2 first:mt-0 ${
      isEmerald ? 'bg-emerald-50/50 dark:bg-emerald-950/40 border-emerald-100 dark:border-emerald-800/60' : 'bg-slate-50 dark:bg-slate-800/70 border-slate-100 dark:border-slate-800'
    }`}>
      <p className={`text-[10px] font-bold uppercase tracking-widest ${isEmerald ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`}>{title}</p>
    </div>
  );
}

export function TabLinks({ onLogout }: { onLogout: () => void }) {
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  const handleInstallClick = async () => {
    if (window.deferredPrompt) {
      // Show the install prompt
      window.deferredPrompt.prompt();
      // Wait for the user to respond to the prompt
      const { outcome } = await window.deferredPrompt.userChoice;
      // We've used the prompt, and can't use it again, throw it away
      window.deferredPrompt = null;
      if (outcome === 'accepted') {
        toast.success('App installed successfully!');
      } else {
        toast('Installation dismissed.');
      }
    } else {
      let isIframe = false;
      try {
        isIframe = window !== window.parent;
      } catch (e) {
        isIframe = true;
      }

      if (isIframe) {
        toast.loading("Opening app in a new tab for installation...", { duration: 1500 });
        setTimeout(() => {
          window.open(window.location.href, '_blank');
        }, 500);
      } else {
        toast("To install this app on your device:\n\nAndroid/Chrome: Tap the browser menu and select 'Add to home screen' or 'Install app'.\n\niOS/Safari: Tap the Share button, then 'Add to Home Screen'.", {
          duration: 8000,
          icon: '📱',
          style: {
            whiteSpace: 'pre-line',
            textAlign: 'left'
          }
        });
      }
    }
  };

  return (
    <div className="space-y-6 pb-8">
      <h2 className="mb-2 text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">References & Resources</h2>

      <Card className="p-0 overflow-hidden shadow-sm border-indigo-100 dark:border-indigo-900/60 relative group">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500"></div>
        <a href="https://infyspringboard.onwingspan.com/" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-5 sm:p-6 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
          <div className="pl-2">
            <div className="text-[10px] font-bold text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-100 dark:border-indigo-800/60 px-2 py-0.5 rounded inline-block mb-3 tracking-widest uppercase">CIE-5 | 20 MARKS</div>
            <h3 className="text-base font-bold mb-1 text-slate-900 dark:text-slate-100">Infosys Springboard / Swayam</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Complete the mandatory 10-hour course. Click here to open portal.</p>
          </div>
          <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-100 dark:border-indigo-800 flex items-center justify-center group-hover:scale-110 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/60 transition-all shrink-0 ml-4 text-indigo-600 dark:text-indigo-400">
            <ExternalLink size={20} />
          </div>
        </a>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col gap-6">
          <Card className="p-0 overflow-hidden flex flex-col">
            <SectionHeader title="WEEK 1 - Hardware Categories" />
            <LinkItem href="https://discover.hubpages.com/technology/The-Four-Main-Categories-Of-Computer-Hardware-Parts" title="4 Main Categories of Hardware" source="Hubpages" />
            <div className="h-px bg-slate-100 dark:bg-slate-800 mx-4"></div>
            <LinkItem href="https://www.javatpoint.com/what-are-the-computer-cables" title="Computer Cables & Connectors" source="Javatpoint" />

            <SectionHeader title="WEEK 2 - SMPS Power Supply" />
            <LinkItem href="https://www.intel.com/content/www/us/en/gaming/resources/power-supply.html" title="Power Supply Guide" source="Intel" />
            <div className="h-px bg-slate-100 dark:bg-slate-800 mx-4"></div>
            <LinkItem href="https://en.wikipedia.org/wiki/Switched-mode_power_supply" title="Switched-Mode Power Supply" source="Wikipedia" />

            <SectionHeader title="WEEK 3 - Motherboard" />
            <LinkItem href="https://www.geeksforgeeks.org/what-is-a-motherboard/" title="What is a Motherboard?" source="GeeksforGeeks" />
            <div className="h-px bg-slate-100 dark:bg-slate-800 mx-4"></div>
            <LinkItem href="https://www.studocu.com/en-us/document/purdue-university-global/information-technology-concepts/12-exploring-motherboards-processors-and-memory/37160479" title="Exploring Motherboards & Processors" source="Studocu" />

            <SectionHeader title="WEEK 4 - Chipset & Booting" />
            <LinkItem href="https://www.baeldung.com/cs/chipset" title="Chipset Architecture" source="Baeldung" />
            <div className="h-px bg-slate-100 dark:bg-slate-800 mx-4"></div>
            <LinkItem href="https://learn.microsoft.com/en-us/windows-hardware/drivers/bringup/boot-and-uefi" title="Boot and UEFI" source="Microsoft Learn" />

            <SectionHeader title="WEEK 5 - OS Installation" />
            <LinkItem href="https://answers.microsoft.com/en-us/windows/forum/all/steps-to-install-windows-10/a499989c-f31f-49d0-8dbb-3b6425a5f47b" title="Steps to Install Windows 10/11" source="Microsoft Answers" />
            <div className="h-px bg-slate-100 dark:bg-slate-800 mx-4"></div>
            <LinkItem href="https://www.geeksforgeeks.org/how-to-install-ubuntu-desktop/" title="How to Install Ubuntu Desktop" source="GeeksforGeeks" />

            <SectionHeader title="WEEK 6 - CLI & User Management" />
            <LinkItem href="https://www.freecodecamp.org/news/command-line-commands-cli-tutorial/" title="Command Line Commands Tutorial" source="FreeCodeCamp" />
            <div className="h-px bg-slate-100 dark:bg-slate-800 mx-4"></div>
            <LinkItem href="https://devblogs.microsoft.com/scripting/table-of-basic-powershell-commands/" title="Basic PowerShell Commands" source="Microsoft DevBlogs" />
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card className="p-0 overflow-hidden flex flex-col">
            <SectionHeader title="WEEK 7 - OS Administration" />
            <LinkItem href="https://learn.microsoft.com/en-us/troubleshoot/windows-client/performance/windows-startup-issues-troubleshooting" title="Startup Issues Troubleshooting" source="Microsoft Learn" />
            <div className="h-px bg-slate-100 dark:bg-slate-800 mx-4"></div>
            <LinkItem href="https://support.microsoft.com/en-us/windows/system-configuration-tools-in-windows-f8a49657-b038-43b8-82d3-28bea0c5666b" title="System Configuration Tools" source="Microsoft Support" />

            <SectionHeader title="WEEK 8 - File Systems" />
            <LinkItem href="https://learn.microsoft.com/en-us/windows-server/storage/disk-management/overview-of-disk-management" title="Overview of Disk Management" source="Microsoft Learn" />
            <div className="h-px bg-slate-100 dark:bg-slate-800 mx-4"></div>
            <LinkItem href="https://support.microsoft.com/en-us/windows/windows-file-recovery-61f5b28a-f5b8-3cc2-0f8e-a63cb4e1d4c4" title="Windows File Recovery" source="Microsoft Support" />

            <SectionHeader title="WEEK 9 - Performance & Drivers" />
            <LinkItem href="https://support.microsoft.com/en-us/windows/update-drivers-manually-in-windows-ec62f46c-ff14-c91d-eead-d7126dc1f7b6" title="Update Drivers Manually" source="Microsoft Support" />
            <div className="h-px bg-slate-100 dark:bg-slate-800 mx-4"></div>
            <LinkItem href="https://support.microsoft.com/en-us/windows/system-configuration-tools-in-windows-f8a49657-b038-43b8-82d3-28bea0c5666b" title="System Configuration Tools" source="Microsoft Support" />

            <SectionHeader title="WEEK 10 - Network Configuration" />
            <LinkItem href="https://learn.microsoft.com/en-us/training/paths/configure-networking-windows-clients/" title="Configure Networking" source="Microsoft Learn" />
            <div className="h-px bg-slate-100 dark:bg-slate-800 mx-4"></div>
            <LinkItem href="https://learn.microsoft.com/en-us/windows/security/operating-system-security/network-security/windows-firewall/" title="Windows Firewall" source="Microsoft Learn" />
            
            <SectionHeader title="WEEK 11 - Advanced Networking" />
            <LinkItem href="https://www.vmware.com/topics/virtual-networking" title="Virtual Networking" source="VMware" />
            <div className="h-px bg-slate-100 dark:bg-slate-800 mx-4"></div>
            <LinkItem href="https://www.kaspersky.com/resource-center/definitions/what-is-a-vpn" title="What is a VPN?" source="Kaspersky" />

            <SectionHeader title="WEEK 12 - E-Waste" color="emerald" />
            <LinkItem href="https://greene.gov.in/" title="E-Waste Management Portal" source="Govt of India" iconType="leaf" />
            <div className="h-px bg-slate-100 dark:bg-slate-800 mx-4"></div>
            <LinkItem href="https://kspcb.karnataka.gov.in/" title="Karnataka State Pollution Control Board" source="kspcb.karnataka.gov.in" iconType="leaf" />
          </Card>

          <Card className="p-5 flex flex-col justify-center">
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 mb-3 uppercase tracking-widest">Syllabus Quick Facts</h3>
            <div className="text-[11px] text-slate-600 dark:text-slate-300 space-y-2">
              <p className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2"><strong className="text-slate-800 dark:text-slate-200">Course Code</strong> <span>25CS34I (Sem III)</span></p>
              <p className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2"><strong className="text-slate-800 dark:text-slate-200">Credits</strong> <span>5 (7 hrs/week)</span></p>
              <p className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2"><strong className="text-slate-800 dark:text-slate-200">Scheme</strong> <span>3 : 0 : 4</span></p>
              <p className="flex justify-between pb-1"><strong className="text-slate-800 dark:text-slate-200">Assessment</strong> <span>CIE 50 | SEE 50</span></p>
            </div>
          </Card>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-200 dark:border-slate-800 mt-8">
        <div className="bg-indigo-50/70 dark:bg-indigo-950/40 rounded-2xl p-5 border border-indigo-100 dark:border-indigo-900/60 text-center">
          <div className="h-12 w-12 bg-indigo-100 dark:bg-indigo-900/60 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600 dark:text-indigo-400"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-2">Install App on Device</h3>
          <p className="text-[13px] text-slate-600 dark:text-slate-300 mb-4 max-w-sm mx-auto">Install the SNA Portal on your home screen for quick offline access to all notes, labs, and resources.</p>
          <button onClick={handleInstallClick} className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2.5 px-6 rounded-full transition-colors inline-flex items-center shadow-sm">
            Download App
          </button>
        </div>
      </div>
      
      <div className="flex justify-center mt-6 gap-4">
        <button 
          onClick={() => setIsFeedbackOpen(true)}
          className="flex items-center space-x-2 px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors"
        >
          <MessageSquare size={16} />
          <span>Feedback</span>
        </button>
        <button 
          onClick={onLogout}
          className="flex items-center space-x-2 px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/50 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
          <span>Log Out</span>
        </button>
      </div>

      <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />
    </div>
  );
}
