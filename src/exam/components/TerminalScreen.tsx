import { TabTerminal } from '../../components/tabs/TabTerminal';
import { PageHead } from './PageHead';

export function TerminalScreen() {
  return (
    <div>
      <PageHead
        title="The terminal."
        lede="Rehearse the exact command sequence before you run it on the lab PC. Nothing here touches your machine, and every session stays on this device."
      />
      <TabTerminal />
    </div>
  );
}
