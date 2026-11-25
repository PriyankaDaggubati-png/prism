// Educational content for PRISM. One entry per protocol a topology
// supports. Config excerpts come from docs/topology-digest.md; nothing
// here claims production experience for lab or learning content.
import { getTopology } from './topologies'
import type { EduContent, Protocol } from './types'

const BASE: Record<Protocol, Omit<EduContent, 'whyHere' | 'config'>> = {
  icmp: {
    commands: ['ping 192.168.10.1', 'ping 8.8.8.8', 'traceroute 8.8.8.8'],
    failureExample: 'Ping to the LAN gateway works but ping to 8.8.8.8 fails: the local path is fine and the fault is on the WAN or default route (runbook 2).',
    interviewAnswer: 'ICMP carries Echo Request and Echo Reply for ping, plus Destination Unreachable and Time Exceeded. Each router hop decrements TTL; when TTL hits zero the packet is dropped and Time Exceeded is sent, which is how traceroute maps hops.',
    interviewQuestion: 'How does ping work, and what does TTL do?',
    osiLayer: 'Layer 3 (Network)',
    packetProcessing: 'The host builds an ICMP Echo Request, the gateway routes it hop by hop, each router decrements TTL, and the destination replies with an Echo Reply along the reverse path.',
    title: 'ICMP',
    what: 'Internet Control Message Protocol: Echo Request/Reply (ping), Destination Unreachable and Time Exceeded messages used to test reachability and report errors.',
  },
  arp: {
    commands: ['arp -a', 'show ip arp', 'show mac address-table'],
    failureExample: 'Two replies with different MACs for the same IP means a duplicate IP address; no reply means the host is down or in another VLAN with no route.',
    interviewAnswer: 'ARP maps an IPv4 address to a MAC address on the local link. A host broadcasts "who has this IP", the owner replies with its MAC, and the sender caches the pair. ARP never crosses a router, so a host ARPs for its gateway when the destination is remote.',
    interviewQuestion: 'What is ARP, and why does a host ARP for its gateway?',
    osiLayer: 'Layer 2 (Data Link, with Layer 3 addressing)',
    packetProcessing: 'The sender checks its ARP table, broadcasts an ARP request on its VLAN if the entry is missing, receives a unicast reply, updates the table, then sends the frame with the resolved destination MAC.',
    title: 'ARP',
    what: 'Address Resolution Protocol: resolves an IPv4 address to a MAC address on the local broadcast domain.',
  },
  dhcp: {
    commands: ['show ip dhcp pool', 'show ip dhcp binding', 'ipconfig /release', 'ipconfig /renew'],
    failureExample: 'Discover with no Offer means the DHCP server or relay is at fault; Offer with no Request means the client never received the Offer.',
    interviewAnswer: 'DORA: Discover (broadcast), Offer (server proposes an address), Request (client asks for it), Ack (server confirms with mask, gateway, DNS and lease). Excluded addresses, such as 192.168.10.1 to 192.168.10.10 in the Cisco lab, are never handed out.',
    interviewQuestion: 'Walk through DHCP DORA.',
    osiLayer: 'Layer 7 (Application, over UDP)',
    packetProcessing: 'The client broadcasts Discover, the server Offers an address from its pool, the client Requests it, and the server Acks with the address, mask, default gateway, DNS servers and lease time.',
    title: 'DHCP',
    what: 'Dynamic Host Configuration Protocol: hands out IP addresses, subnet masks, default gateways and DNS servers automatically.',
  },
  dns: {
    commands: ['nslookup google.com', 'nslookup google.com 8.8.8.8', 'ping 8.8.8.8'],
    failureExample: 'Ping to 8.8.8.8 works but no website resolves by name: the path works and DNS is the fault, so check which DNS server the machine uses and test 8.8.8.8 directly (runbook 5).',
    interviewAnswer: 'DNS resolves names to IPs. The client queries its configured resolver, the resolver answers from cache or by asking upstream, and the client then connects to the returned address. One query plus one response is normal; a query with no response means DNS is unreachable.',
    interviewQuestion: 'A user can ping 8.8.8.8 but cannot open google.com. What do you check?',
    osiLayer: 'Layer 7 (Application, over UDP/TCP 53)',
    packetProcessing: 'The host sends a DNS query to its resolver (8.8.8.8 in the lab pools), the resolver returns the A record, and the host opens a connection to that address.',
    title: 'DNS',
    what: 'Domain Name System: resolves hostnames such as google.com to IP addresses.',
  },
  tcp: {
    commands: ['ss -tulnp', 'tcpdump -i eth0 -n host 192.168.10.20', 'show ip nat translations'],
    failureExample: 'SYN with no SYN-ACK means the server never got the SYN or is not listening; a reset after SYN means the port is closed.',
    interviewAnswer: 'Three-way handshake: SYN (client, seq 1000), SYN-ACK (server, seq 5000, ack 1001), ACK (client, seq 1001, ack 5001). Sequence numbers track bytes so retransmissions and duplicate ACKs can be spotted in a capture.',
    interviewQuestion: 'Walk through the TCP three-way handshake.',
    osiLayer: 'Layer 4 (Transport)',
    packetProcessing: 'The client sends SYN, the server replies SYN-ACK, the client sends ACK, and data flows with sequence and acknowledgement numbers on every segment.',
    title: 'TCP',
    what: 'Transmission Control Protocol: reliable, ordered, connection-oriented delivery with a three-way handshake.',
  },
  ospf: {
    commands: ['show ip ospf neighbor', 'show ip route ospf', 'show ip ospf interface'],
    failureExample: 'A neighbour stuck in Init means Hellos are not returned; stuck in ExStart or Exchange usually means an MTU mismatch; stuck in Loading can mean duplicate router IDs (runbook 6).',
    interviewAnswer: 'OSPF is a link-state protocol. Routers exchange Hellos, form adjacencies through Down, Init, 2-Way, ExStart, Exchange, Loading and Full, flood LSAs, and run Dijkstra SPF to pick the lowest-cost path. Areas limit flooding; an ABR connects areas, here R2 connects Area 0 and Area 1.',
    interviewQuestion: 'Explain OSPF neighbour states and what it means to be stuck in ExStart.',
    osiLayer: 'Layer 3 (Network)',
    packetProcessing: 'Hellos form the adjacency, LSAs are exchanged and flooded, the link-state database is built, SPF computes the shortest path, and the route is installed with admin distance 110.',
    title: 'OSPF',
    what: 'Open Shortest Path First: a link-state routing protocol that builds a map of the network and runs SPF to choose paths.',
  },
  bgp: {
    commands: ['show ip bgp summary', 'aws ec2 describe-vpn-connections', 'aws ec2 describe-customer-gateways'],
    failureExample: 'The VPN is up but the on-premises route is missing: BGP withdrew the prefix, so check the customer gateway 203.0.113.10 and the ASN 65000 session.',
    interviewAnswer: 'BGP exchanges prefixes between autonomous systems. Neighbours form a session, advertise routes with an AS path, and withdraw them when they disappear. On the AWS VPN the customer gateway uses ASN 65000.',
    interviewQuestion: 'What happens when BGP withdraws a route?',
    osiLayer: 'Layer 3 (Network, over TCP 179)',
    packetProcessing: 'The BGP session is established, prefixes are advertised with their AS path, the route is installed, and a withdrawal removes it so traffic has no path.',
    title: 'BGP',
    what: 'Border Gateway Protocol: the path-vector protocol that exchanges routes between autonomous systems, used here on the AWS Site-to-Site VPN.',
  },
  stp: {
    commands: ['show spanning-tree vlan 10', 'show interfaces status', 'show spanning-tree'],
    failureExample: 'A loop forms and broadcasts multiply: check which port STP put into blocking state and confirm the root bridge priority is the lowest in the triangle.',
    interviewAnswer: 'STP blocks redundant links to prevent loops. Switches exchange BPDUs, elect the root bridge by lowest priority (SW1, 4096, in Lab 3), then assign root, designated and blocked port roles. Rapid PVST runs one instance per VLAN and converges faster than classic STP.',
    interviewQuestion: 'Why does STP block a link, and how is the root bridge chosen?',
    osiLayer: 'Layer 2 (Data Link)',
    packetProcessing: 'BPDUs are exchanged, the root is elected, port roles are assigned, the blocked port drops data frames, and the other ports forward.',
    title: 'STP / RSTP',
    what: 'Spanning Tree Protocol (rapid PVST here): prevents Layer 2 loops by blocking redundant links.',
  },
  vlan: {
    commands: ['show vlan brief', 'show interfaces switchport', 'show interfaces trunk'],
    failureExample: 'A user reaches nothing, or lands in the wrong VLAN and the wrong servers: check which VLAN the port sits in, whether the trunk allows it, and whether the native VLAN matches on both ends (runbook 8).',
    interviewAnswer: 'A VLAN is a broadcast domain on a switch. Access ports belong to one VLAN; trunks carry several, tagging frames with 802.1Q. Traffic between VLANs must go through a router or Layer 3 switch, either Router-on-a-Stick subinterfaces or SVIs.',
    interviewQuestion: 'How does traffic move between two VLANs?',
    osiLayer: 'Layer 2 (Data Link)',
    packetProcessing: 'A frame enters on an access port, is tagged 802.1Q on a trunk, reaches the router subinterface for its VLAN, is routed to the destination VLAN, retagged, and delivered untagged on the destination access port.',
    title: 'VLANs and 802.1Q',
    what: 'Virtual LANs split one switch into separate broadcast domains; 802.1Q tags frames on trunks.',
  },
  lacp: {
    commands: ['show etherchannel summary', 'show interfaces status', 'show spanning-tree vlan 10'],
    failureExample: 'Shut one member of Po1 and the channel stays up on the other member; if the whole channel drops, check that both ends are mode active and the member ports match.',
    interviewAnswer: 'LACP bundles several physical links into one logical Port-channel. Both ends negotiate with LACPDUs in mode active, traffic is spread across members by a hash, and losing one member does not drop the channel.',
    interviewQuestion: 'What happens when one member of an LACP bundle fails?',
    osiLayer: 'Layer 2 (Data Link)',
    packetProcessing: 'LACPDUs negotiate the bundle, the Port-channel is formed, frames are hashed across member links, and a failed member is removed while the rest keep forwarding.',
    title: 'LACP / EtherChannel',
    what: 'Link Aggregation Control Protocol: bundles multiple links into one EtherChannel for bandwidth and redundancy.',
  },
  hsrp: {
    commands: ['show standby brief', 'show vrrp brief'],
    failureExample: 'Both routers claim master at once, or the backup never takes over: check that the virtual IP matches on both routers and the master has the higher priority.',
    interviewAnswer: 'HSRP is Cisco gateway redundancy: routers share a virtual IP, the highest-priority router is active, and the standby takes over if the active fails. VRRP is the open standard used in this lab, with the same idea.',
    interviewQuestion: 'How does gateway redundancy work?',
    osiLayer: 'Layer 3 (Network)',
    packetProcessing: 'Hosts use the virtual IP as their gateway; the active router answers ARP for it and forwards, and the standby promotes itself if the active disappears.',
    title: 'HSRP / gateway redundancy',
    what: 'Hot Standby Router Protocol (and VRRP, the standard used here): routers share a virtual gateway IP so a router failure does not strand hosts.',
  },
  vrrp: {
    commands: ['show vrrp brief', 'ping 192.168.10.254', 'show interfaces trunk'],
    failureExample: 'The gateway is lost briefly then returns, or master and backup keep swapping: check priorities (R1 120, R2 100), that the virtual IP matches on both routers, and the tracked interface on the master (runbook 7).',
    interviewAnswer: 'VRRP shares a virtual IP between routers. R1 is master at priority 120 with preempt, R2 is backup at 100. Hosts use 192.168.10.254 as their gateway; if R1 fails, R2 takes over the virtual IP and keeps forwarding.',
    interviewQuestion: 'R1 is the VRRP master at priority 120 and R2 the backup at 100. What happens when R1 fails?',
    osiLayer: 'Layer 3 (Network)',
    packetProcessing: 'Hosts ARP for the virtual IP, the master answers and forwards, the backup listens for advertisements, and on master failure the backup promotes itself and takes over the virtual IP.',
    title: 'VRRP',
    what: 'Virtual Router Redundancy Protocol: two routers share a virtual gateway IP so hosts keep a gateway when one router fails.',
  },
  ipsec: {
    commands: ['show vpn ike-sa gateway HQ-GW', 'diagnose vpn tunnel list', 'show vpn ipsec-sa tunnel HQ-Tunnel'],
    failureExample: 'Phase 1 is up but no traffic flows: the proxy IDs do not match, or there is no security rule allowing the VPN traffic.',
    interviewAnswer: 'IPsec encrypts traffic between sites. IKE phase 1 authenticates the peers (pre-shared key, IKEv2), phase 2 negotiates the tunnel with proxy IDs for the local and remote subnets, and traffic matching those IDs is encrypted and sent through the tunnel.',
    interviewQuestion: 'Phase 1 is up but no traffic passes the tunnel. What do you check?',
    osiLayer: 'Layer 3 (Network)',
    packetProcessing: 'IKE phase 1 builds the secure channel, phase 2 agrees on the proxy IDs and proposals, matching traffic is encrypted, sent across the WAN, and decrypted at the far end.',
    title: 'IPsec VPN',
    what: 'IPsec VPN: encrypts traffic between two sites over the internet using IKE and an encrypted tunnel.',
  },
  firewall: {
    commands: ['show access-lists', 'test security-policy-match source 192.168.10.5 destination 203.0.113.50', 'diagnose firewall policy list'],
    failureExample: 'Ping works but browsing does not: NAT or the web-browsing App-ID rule is the problem, not just port 80. Or a policy change has no effect because an earlier rule matches first.',
    interviewAnswer: 'Firewalls check rules top to bottom and take the first match. Zones separate trust, untrust and guest; a rule names from and to zones, source and destination, and an application or service. Palo Alto checks App-ID, FortiGate policies are first match wins, and ACL 100 on EDGE-R1 denies Telnet and SMB inbound.',
    interviewQuestion: 'A policy change has no effect. What do you check first?',
    osiLayer: 'Layers 3-7 (Network to Application)',
    packetProcessing: 'The packet arrives in a zone, rules are checked in order, the first match decides allow or deny, NAT is applied for allowed outbound traffic, and denied traffic is dropped at the firewall.',
    title: 'Firewalls and ACLs',
    what: 'Firewalls and access lists: zone-based rules that allow or deny traffic, checked in order with the first match winning.',
  },
  aws: {
    commands: ['aws ec2 describe-route-tables', 'aws ec2 describe-security-groups', 'aws ec2 describe-nat-gateways'],
    failureExample: 'A private instance has no internet: check the private route table points 0.0.0.0/0 at the NAT Gateway, and the NAT Gateway sits in a public subnet with an Elastic IP.',
    interviewAnswer: 'A VPC is an isolated network. Public subnets route 0.0.0.0/0 to the Internet Gateway; private subnets route it to a NAT Gateway in a public subnet. Security Groups are stateful and attached to resources; NACLs are stateless and attached to subnets. A Transit Gateway connects VPCs, and a VPN Gateway connects to on-premises.',
    interviewQuestion: 'A private EC2 instance cannot reach the internet. What do you check?',
    osiLayer: 'Layers 3-4 (Network, Transport)',
    packetProcessing: 'The packet leaves the instance, the subnet route table sends it to the NAT Gateway or Internet Gateway, the Security Group allows it (stateful, so the reply is allowed back), and it reaches the ALB, the peer VPC or the VPN.',
    title: 'AWS Networking',
    what: 'AWS VPC networking: route tables, Internet and NAT Gateways, Security Groups, Transit Gateway and VPN.',
  },
}

const WHY: Record<string, string> = {
  'ent-lab1:ospf': 'Lab 1 runs OSPF in two areas with R2 as the ABR, and redistributes EIGRP 100 from R4 into OSPF on R2, so a packet to 192.168.40.0/24 crosses both protocols.',
  'ent-lab2:vrrp': 'Lab 2 uses VRRP groups 10, 20 and 30 so the VLAN gateways 192.168.10.254, 192.168.20.254 and 192.168.30.254 survive losing R1.',
  'ent-lab2:vlan': 'Lab 2 routes between VLANs 10 SALES, 20 HR and 30 GUEST, first with Router-on-a-Stick subinterfaces on R1 and R2, then with SVIs on SW-CORE.',
  'ent-lab3:stp': 'Lab 3 is a triangle of three switches where rapid-PVST must block one link, or broadcasts would loop forever.',
  'ent-lab3:lacp': 'Lab 3 bundles the other two sides of the triangle into LACP Port-channels Po1 and Po2, so one failed member link does not drop the channel.',
  'cisco-routing-switching:firewall': 'EDGE-R1 applies ACL 100 inbound on its WAN interface Gi0/0, denying Telnet and SMB, and NAT overload translates the inside LANs to 203.0.113.2.',
  'cisco-routing-switching:dhcp': 'EDGE-R1 runs DHCP pools LAN-10 and LAN-20 with 7-day leases, DNS 8.8.8.8 and 8.8.4.4, and exclusions for 192.168.10.1-10 and 192.168.20.1-10.',
  'palo-alto-firewall-labs:firewall': 'The PA-VM separates trust, untrust and guest zones; Block-Guest-to-Trust denies guest traffic into the trust LAN.',
  'palo-alto-firewall-labs:ipsec': 'The HQ-Tunnel IPsec VPN connects the trust LAN 192.168.10.0/24 to the branch LAN 192.168.20.0/24 through peer 203.0.113.10.',
  'fortigate-security-labs:firewall': 'FortiGate policy 1 allows LAN to WAN with NAT, and policy 2 denies guest to LAN; policies are first match wins.',
  'fortigate-security-labs:ipsec': 'The To-Branch IPsec tunnel uses phase 1 and phase 2 proposals aes256-sha256 between 192.168.10.0/24 and 192.168.20.0/24.',
  'aws-cloud-networking:aws': 'The lab VPC 10.0.0.0/16 has public and private subnets, an IGW, a NAT Gateway, an ALB, VPC peering, a Transit Gateway and a Site-to-Site VPN to 192.168.10.0/24.',
  'aws-cloud-networking:bgp': 'The Site-to-Site VPN customer gateway uses BGP ASN 65000 to exchange the on-premises route 192.168.10.0/24.',
  'linux-administration-labs:firewall': 'The Ubuntu Server allows only SSH (22) and HTTP (80) in UFW and iptables, with a default INPUT DROP policy.',
}

const CONFIG: Record<string, string> = {
  'ent-lab1:ospf': 'router ospf 1\n router-id 2.2.2.2\n network 10.0.12.0 0.0.0.3 area 0\n network 10.0.23.0 0.0.0.3 area 1\n redistribute eigrp 100 subnets',
  'ent-lab2:vrrp': 'interface GigabitEthernet0/0.10\n encapsulation dot1Q 10\n ip address 192.168.10.1 255.255.255.0\n vrrp 10 ip 192.168.10.254\n vrrp 10 priority 120\n vrrp 10 preempt',
  'ent-lab2:vlan': 'interface GigabitEthernet0/0.10\n encapsulation dot1Q 10\n ip address 192.168.10.1 255.255.255.0\ninterface Vlan10\n ip address 192.168.10.3 255.255.255.0',
  'ent-lab3:stp': 'spanning-tree mode rapid-pvst\nspanning-tree vlan 10,20,30 priority 4096 (SW1)\nspanning-tree vlan 10,20,30 priority 8192 (SW2)\nspanning-tree vlan 10,20,30 priority 12288 (SW3)',
  'ent-lab3:lacp': 'interface range GigabitEthernet0/0-1\n channel-group 1 mode active\n switchport mode trunk\n switchport trunk allowed vlan 10,20,30',
  'cisco-routing-switching:firewall': 'access-list 100 deny tcp any any eq 23\naccess-list 100 deny tcp any any eq 445\naccess-list 100 permit ip any any\nip nat inside source list 10 interface GigabitEthernet0/0 overload',
  'cisco-routing-switching:dhcp': 'ip dhcp pool LAN-10\n network 192.168.10.0 255.255.255.0\n default-router 192.168.10.1\n dns-server 8.8.8.8 8.8.4.4\n lease 7',
  'palo-alto-firewall-labs:ipsec': 'IKE gateway HQ-GW: IKEv2, DPD enable, peer 203.0.113.10, local 203.0.113.2\nIPsec tunnel HQ-Tunnel: proxy-id local 192.168.10.0/24, remote 192.168.20.0/24',
  'fortigate-security-labs:ipsec': 'config vpn ipsec phase1-interface\n edit To-Branch\n  set proposal aes256-sha256\n  set remote-gw 203.0.113.10\nconfig vpn ipsec phase2-interface\n edit To-Branch-P2\n  set proposal aes256-sha256\n  set src-subnet 192.168.10.0 255.255.255.0\n  set dst-subnet 192.168.20.0 255.255.255.0',
  'aws-cloud-networking:aws': 'Public route table lab-public-rt: 0.0.0.0/0 -> lab-igw\nPrivate route table lab-private-rt: 0.0.0.0/0 -> lab-nat\nlab-web-sg ingress: TCP 80 from 0.0.0.0/0, TCP 22 from 203.0.113.5/32',
}

export function eduTopics(topologyId: string): string[] {
  const topo = getTopology(topologyId)
  return topo ? [...topo.protocols] : []
}

export function eduFor(topologyId: string, topic: string): EduContent | undefined {
  const topo = getTopology(topologyId)
  if (!topo || !topo.protocols.includes(topic as Protocol)) return undefined
  const base = BASE[topic as Protocol]
  if (!base) return undefined
  const key = `${topologyId}:${topic}`
  const dev = topo.devices.find((d) => d.config && d.config.toLowerCase().includes(topic === 'vrrp' ? 'vrrp' : topic))
  return {
    ...base,
    config: CONFIG[key] ?? dev?.config ?? 'No config excerpt is stated for this protocol in the source.',
    whyHere: WHY[key] ?? `This topology models ${base.title} as part of the lab in ${topo.repo}.`,
  }
}
