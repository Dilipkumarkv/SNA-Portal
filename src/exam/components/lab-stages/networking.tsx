import { Flow, stage, Transcript } from './shared';

export const networkingStages = {
  'ipv4-settings': stage({
    title: 'Ethernet Lab · IPv4 properties',
    rows: [
      'Selected adapter: Ethernet Lab. Original address mode: automatic (DHCP), saved for restoration.',
      <Transcript>{'IP address: 192.168.1.10\nSubnet mask: 255.255.255.0 (/24)'}</Transcript>,
      <Transcript>{'Default gateway: 192.168.1.1\nDNS: teacher-assigned, not supplied here'}</Transcript>,
      <Transcript>{'ipconfig /all\nEthernet Lab\nIPv4: 192.168.1.10\nMask: 255.255.255.0\nGateway: 192.168.1.1'}</Transcript>,
    ], note: 'Hypothetical network: PC-A .10 / PC-B .11 / gateway .1. /24 leaves the last octet for host addressing; do not apply these values to a real lab. VLANs provide logical separation, not extra host addresses in this example.',
  }),
  'dns-settings': stage({
    title: 'Client DNS resolver · query comparison',
    rows: [
      'Preferred DNS: [teacher-assigned resolver]. Alternate: [only if assigned]. Original automatic mode recorded.',
      <Transcript>{'C:\\Lab> nslookup example.com'}</Transcript>,
      'Responding server: [approved resolver identity]. Match it to the assigned client setting; no internal server address is invented here.',
      'Answer section: example.com → [returned address recorded locally]. A timeout or no answer is a valid observation, not proof the cable failed.',
    ], note: 'This configures a client resolver; it does not install a DNS server. No DNS lookup occurs in this guide.',
  }),
  'adapter-details': stage({
    title: 'Ethernet Lab · Status and Details',
    rows: [
      'Status: Connected / Link speed: 1.0 Gbps. This is the local link rate, not measured internet speed.',
      <Transcript>{'IPv4: 192.168.1.10\nMask: 255.255.255.0\nGateway: 192.168.1.1'}</Transcript>,
      'Physical address: 02-00-00-00-00-10 (fictional locally administered MAC). MAC and IP identify different layers.',
      'Adapter: Ethernet Lab. Cross-check this exact adapter in ipconfig /all; do not accidentally compare Wi-Fi details.',
    ],
  }),
  'ping-test': stage({
    title: 'Ping · loopback versus LAN reachability', kind: 'topology',
    rows: [
      <Flow nodes={['PC-A 192.168.1.10/24', 'Lab LAN: gateway 192.168.1.1', 'PC-B 192.168.1.11/24']} />,
      <Transcript>{'ping 127.0.0.1\nSent = 4, Received = 4, Lost = 0\nLoopback tests the local stack, not the cable.'}</Transcript>,
      <Transcript>{'ping 192.168.1.1\nSent = 4, Received = 4, Lost = 0\nMinimum = 1ms, Maximum = 2ms'}</Transcript>,
      'Peer .11 example: 4 sent / 0 received. ICMP filtering is one possible explanation; timeout alone does not prove the peer is off.',
    ], note: 'Illustrative finite tests only, against authorized targets. No packets are sent by this page.',
  }),
  'trace-route': stage({
    title: 'tracert example.com · hop worksheet', kind: 'terminal',
    rows: [
      <Transcript>{'C:\\Lab> tracert example.com\nIllustrative route, not a lookup.'}</Transcript>,
      <Transcript>{'Hop 1\n192.168.1.1\n1 ms / 2 ms / 1 ms\nCommonly the local gateway.'}</Transcript>,
      <Transcript>{'Hop 2\n* / * / *\nRequest timed out\nA hop may filter or omit replies.'}</Transcript>,
      <Transcript>{'Hop 3\nDestination (documentation address)\n203.0.113.10\n21 ms / 20 ms / 22 ms'}</Transcript>,
    ], note: 'Final documentation address is not asserted to be the real example.com address. Intermediate asterisks do not by themselves prove route failure.',
  }),
  'network-statistics': stage({
    title: 'netstat -ano · example connection', kind: 'terminal',
    rows: [
      <Transcript>{'Proto: TCP\nLocal endpoint: 192.168.1.10:51000'}</Transcript>,
      <Transcript>{'Foreign endpoint: 203.0.113.10:443\nDocumentation address, not a real observed peer.'}</Transcript>,
      <Transcript>{'State: ESTABLISHED\nSeparate listener: 127.0.0.1:8080 LISTENING\nUDP has no TCP connection state.'}</Transcript>,
      <Transcript>{'PID: 4200 (fictional)\nIdentify the process locally; do not end it just because a port is open.'}</Transcript>,
    ], note: 'A local LISTENING row does not prove remote or public reachability. Numeric endpoints avoid name-resolution ambiguity.',
  }),
  'dns-reset': stage({
    title: 'DNS cache versus TCP/IP reset', kind: 'terminal',
    rows: [
      <Transcript>{'ipconfig /displaydns\nExample cache entry: example.com\nTTL: 120 seconds'}</Transcript>,
      <Transcript>{'ipconfig /flushdns\nExample: Successfully flushed the DNS Resolver Cache.'}</Transcript>,
      'Before any reset: original DHCP/static mode, IP, gateway and DNS captured from ipconfig /all. A cache flush does not reset these settings.',
      <Transcript>{'netsh int ip reset\nDISRUPTIVE — not run in this example.\nOnly if instructed on a local assigned host.\nRestore settings and restart only as directed.'}</Transcript>,
    ], note: 'The cache flush and TCP/IP reset have different effects. No copy/run control or executor exists here.',
  }),
  'firewall-rule': stage({
    title: 'Inbound rule review · firewall stays on',
    rows: [
      <Transcript>{'Program: C:\\LabTools\\DemoApp.exe\nFictional approved harmless test app.'}</Transcript>,
      'Direction: Inbound / Action: Block for this approved test. Other applications and existing rules remain untouched.',
      'Profile: Private only in this assigned lab example. Domain/Public not selected; firewall remains On for all profiles.',
      'Name: SNA-Test-Rule. Verify the scoped behavior, then remove only this temporary rule.',
    ],
  }),
  'wifi-profile': stage({
    title: 'Wi-Fi · fictional SNA-DEMO network',
    rows: [
      'SSID: SNA-DEMO (fictional). Any real credential is entered only in the operating system, never this guide.',
      'Connection state example: Connected. This label is not a reading of your Wi-Fi adapter.',
      'Network profile: Public. Windows uses a more restrictive trust/sharing posture; this does not mean the WLAN is open to everyone.',
      'Known networks: SNA-DEMO saved. A supervised disconnect/reconnect tests the approved profile; no security key is displayed.',
    ],
  }),
  'folder-sharing': stage({
    title: 'Authenticated share · access worksheet', kind: 'topology',
    rows: [
      <Flow nodes={['Host PC-A · 192.168.1.10', 'Assigned private lab LAN', 'Client PC-B · 192.168.1.11']} />,
      <Transcript>{'Share name: SNA_Shared\nClient path: \\\\192.168.1.10\\SNA_Shared'}</Transcript>,
      'Assigned authenticated test user: Share Read + NTFS Read. No Everyone / Full control shortcut.',
      'Expected client result: open disposable sample.txt allowed; write denied. Unauthorized account denied. Record actual outcomes; remove test share afterward.',
    ], note: 'Both share and NTFS permissions apply. No file access or authentication is performed by this page.',
  }),
  'remote-desktop': stage({
    title: 'Remote Desktop · authorized LAN session',
    rows: [
      'Host readiness: PC-B · supported Windows host edition · NLA retained. Windows Home generally cannot host RDP.',
      'Target: PC-B / 192.168.1.11 on the assigned LAN. Confirm identity before authentication; do not bypass certificate warnings.',
      'Allowed account: [instructor-authorized user]. Credentials remain outside the guide. No public port forwarding.',
      'Session example: Connected to PC-B. Disconnect leaves the session running; Sign out closes it and its apps. Restore the host setting as directed.',
    ],
  }),
};
