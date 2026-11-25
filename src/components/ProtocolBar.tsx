import type { Protocol } from '../engine/types'
import { useSim } from '../store/simStore'

const PROTOCOL_LABELS: Record<Protocol, string> = {
  arp: 'ARP',
  aws: 'AWS',
  bgp: 'BGP',
  dhcp: 'DHCP',
  dns: 'DNS',
  firewall: 'Firewall',
  hsrp: 'HSRP',
  icmp: 'ICMP',
  ipsec: 'IPsec',
  lacp: 'LACP',
  ospf: 'OSPF',
  stp: 'STP',
  tcp: 'TCP',
  vlan: 'VLAN',
  vrrp: 'VRRP',
}

const PROTOCOL_DESCRIPTIONS: Record<Protocol, string> = {
  arp: 'ARP mode animates a broadcast request, the reply, and the ARP table update on this topology before the packet is forwarded.',
  aws: 'AWS mode animates traffic through the modeled AWS lab resources in this topology, such as the VPC, subnets, gateways and load balancer where they are modeled.',
  bgp: 'BGP mode animates BGP neighbour and prefix exchange on this topology where BGP is modeled.',
  dhcp: 'DHCP mode animates the DORA exchange (Discover, Offer, Request, Ack) between a client and the DHCP pool modeled on this topology.',
  dns: 'DNS mode animates a DNS query to the resolver modeled on this topology, followed by the answer returned to the client.',
  firewall: 'Firewall mode animates a packet against the firewall rules modeled on this topology, showing whether it is allowed or denied and by which rule.',
  hsrp: 'HSRP mode animates gateway redundancy on this topology, showing the active and standby gateway roles where HSRP is modeled.',
  icmp: 'ICMP mode animates an echo request and echo reply across this topology, with the TTL decreasing at each hop.',
  ipsec: 'IPsec mode animates tunnel setup and encrypted traffic across the VPN tunnel modeled on this topology, where one is modeled.',
  lacp: 'LACP mode animates traffic across the bundled EtherChannel links modeled on this topology, showing the channel staying up when a member link fails.',
  ospf: 'OSPF mode animates OSPF neighbour adjacency and route exchange across the OSPF areas modeled on this topology.',
  stp: 'STP mode animates spanning-tree port states on this topology, showing which links forward and which stay blocked to prevent a loop.',
  tcp: 'TCP mode animates the three-way handshake (SYN, SYN-ACK, ACK) with sequence and acknowledgement numbers across this topology.',
  vlan: 'VLAN mode animates traffic between VLANs on this topology, showing trunk and access ports and whether inter-VLAN routing is modeled.',
  vrrp: 'VRRP mode animates gateway redundancy on this topology, showing the master and backup routers and the virtual IP where VRRP is modeled.',
}

export default function ProtocolBar() {
  const { topology, protocol, setProtocol } = useSim()

  return (
    <section className="prism-panel" aria-label="Protocol selector">
      <h2>Protocol</h2>
      <div role="group" aria-label="Choose a protocol to simulate">
        {topology.protocols.map((p) => (
          <button
            key={p}
            type="button"
            className={
              p === protocol ? 'prism-btn prism-btn-primary' : 'prism-btn'
            }
            onClick={() => setProtocol(p)}
            aria-pressed={p === protocol}
          >
            {PROTOCOL_LABELS[p]}
          </button>
        ))}
      </div>
      {topology.protocols.length === 0 ? (
        <p>No protocols are modeled for this topology yet.</p>
      ) : (
        <p>{PROTOCOL_DESCRIPTIONS[protocol]}</p>
      )}
      <p>
        Only protocols modeled on the selected topology are shown. The
        simulation is educational and all traffic shown is simulated.
      </p>
    </section>
  )
}
