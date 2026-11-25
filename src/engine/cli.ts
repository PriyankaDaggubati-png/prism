// Read-only educational CLI for PRISM. Every output is derived from the
// topology data for the requested device, and is labelled simulated.
// It never prints a real device prompt; the hostname carries a
// (simulated) marker.
import { resolveDown } from './failures'
import type { Device, SimState, Topology } from './types'

const HEADER = 'Simulated output from the PRISM lab topology. This is an educational simulation, not a live device.'

const COMMANDS = [
  'show ip route',
  'show ip interface brief',
  'show ip ospf neighbor',
  'show interfaces trunk',
  'show spanning-tree',
  'show mac address-table',
  'show etherchannel summary',
  'show ip bgp summary',
  'show ip arp',
  'show vrrp brief',
  'show ip dhcp pool',
  'show access-lists',
  'ip addr',
  'ip route',
  'ss -tulnp',
  'tcpdump',
  'ping <ip>',
  'traceroute <ip>',
  'help',
]

function notApplicable(dev: Device, what: string): string {
  return `${what} is not applicable on ${dev.hostname} (simulated).`
}

function routesTable(dev: Device): string {
  if (!dev.routes || dev.routes.length === 0) return notApplicable(dev, 'No routing table is modeled for this device')
  const lines = dev.routes.map(
    (r) => `${r.protocol === 'connected' ? 'C' : r.protocol === 'static' ? 'S' : r.protocol === 'ospf' ? 'O' : r.protocol === 'eigrp' ? 'D' : 'B'}    ${r.network}/${r.mask} [${r.adminDistance}/${r.metric ?? 0}] via ${r.nextHop}, ${r.outInterface}`,
  )
  return ['Codes: C - connected, S - static, O - OSPF, D - EIGRP, B - BGP', '', ...lines].join('\n')
}

export function runCli(topo: Topology, state: SimState, deviceId: string, command: string): string {
  const down = resolveDown(state)
  const dev = topo.devices.find((d) => d.id === deviceId)
  const cmd = command.trim()
  const lower = cmd.toLowerCase()
  const prompt = dev ? `${dev.hostname} (simulated)` : 'prism (simulated)'
  const head = `${HEADER}\n${prompt}# ${cmd}\n`
  if (!dev) return `${head}Unknown device ${deviceId} in topology ${topo.id}.`

  const downNote = down.downDevices.has(dev.id) ? `\n${dev.hostname} is down (simulated failure active).` : ''
  let body: string

  if (lower === 'help') {
    body = `Available simulated commands:\n${COMMANDS.map((c) => `  ${c}`).join('\n')}`
  } else if (lower === 'show ip route' || lower === 'ip route') {
    body = routesTable(dev)
  } else if (lower === 'show ip interface brief') {
    if (!dev.interfaces.length) body = notApplicable(dev, 'Interface list')
    else {
      body = ['Interface              IP-Address      OK? Method Status', ...dev.interfaces.map((i) => `${i.name.padEnd(22)} ${(i.ip ?? 'unassigned').padEnd(15)} YES manual ${down.downInterfaces.has(`${dev.id}:${i.name}`) || down.downDevices.has(dev.id) ? 'administratively down' : i.status}`)].join('\n')
    }
  } else if (lower === 'show ip ospf neighbor') {
    if (!dev.ospfNeighbors || dev.ospfNeighbors.length === 0) body = notApplicable(dev, 'OSPF neighbours')
    else body = ['Neighbor ID     Pri   State           Dead Time   Address         Interface', ...dev.ospfNeighbors.map((n) => `${n.neighborId.padEnd(15)} 1     ${n.state.padEnd(15)} ${n.deadTime}   ${n.address.padEnd(15)} ${n.interface} (area ${n.area})`)].join('\n')
  } else if (lower === 'show interfaces trunk') {
    const trunks = dev.interfaces.filter((i) => i.mode === 'trunk')
    if (!trunks.length) body = notApplicable(dev, 'Trunk interfaces')
    else body = ['Port        Mode         Encapsulation  Status        Native vlan', ...trunks.map((i) => `${i.name.padEnd(12)} trunk       802.1q         ${i.status.padEnd(13)} 1`), '', 'Port        Vlans allowed on trunk', ...trunks.map((i) => `${i.name.padEnd(12)} ${(i.allowedVlans ?? []).join(',')}`)].join('\n')
  } else if (lower.startsWith('show spanning-tree')) {
    const pri = dev.config?.match(/priority (\d+)/)?.[1]
    const root = dev.notes?.includes('Root bridge') ? 'This switch is the root bridge' : dev.notes?.includes('root primary') ? 'This switch is root primary' : 'Root bridge is SW1 (priority 4096) in Lab 3'
    body = dev.kind === 'switch'
      ? `Spanning tree mode rapid-pvst (simulated)\nVLAN 10, 20, 30${pri ? `, priority ${pri}` : ''}\n${root}\nPort roles: Port-channels forwarding; SW1 Gi0/2 to SW3 Gi0/2 is the STP-blocked link in Lab 3 (simulated).`
      : notApplicable(dev, 'Spanning tree')
  } else if (lower === 'show mac address-table') {
    if (!dev.macTable || dev.macTable.length === 0) body = notApplicable(dev, 'MAC address table')
    else body = ['Mac Address Table', '-------------------------------------------', 'Vlan    Mac Address       Type        Ports', ...dev.macTable.map((m) => `${String(m.vlan).padEnd(8)}${m.mac.padEnd(18)}${m.type.padEnd(12)}${m.port}`)].join('\n')
  } else if (lower === 'show etherchannel summary') {
    const chans = dev.interfaces.filter((i) => i.name.toLowerCase().startsWith('port-channel') || i.name.toLowerCase().startsWith('po'))
    const hasLacp = topo.links.some((l) => l.channelGroup && (l.from === dev.id || l.to === dev.id))
    body = hasLacp || chans.length
      ? `Flags:  D - down        P - bundled in port-channel\nGroup  Port-channel  Protocol    Ports\n1      Po1           LACP        ${topo.links.filter((l) => l.channelGroup === 'Po1').map((l) => `${l.from} ${l.fromIf}`).join(' + ') || 'see config'}\n2      Po2           LACP        ${topo.links.filter((l) => l.channelGroup === 'Po2').map((l) => `${l.from} ${l.fromIf}`).join(' + ') || 'see config'}`
      : notApplicable(dev, 'EtherChannel')
  } else if (lower === 'show ip bgp summary') {
    if (!dev.bgpNeighbors || dev.bgpNeighbors.length === 0) body = notApplicable(dev, 'BGP neighbours')
    else body = ['BGP router identifier, local AS 65000 (simulated)', 'Neighbor        V           AS MsgRcvd MsgSent   TblVer  InQ OutQ Up/Down  State/PfxRcd', ...dev.bgpNeighbors.map((n) => `${n.neighbor.padEnd(16)}4      ${String(n.as).padEnd(6)}      -       -        -    0   0  ${n.uptime}  ${n.state} (${n.prefixesReceived} prefixes)`)].join('\n')
  } else if (lower === 'show ip arp') {
    const arp = dev.arp ?? dev.interfaces.filter((i) => i.ip).map((i) => ({ interface: i.name, ip: i.ip!, mac: i.mac }))
    if (!arp.length) body = notApplicable(dev, 'ARP table')
    else body = ['Protocol  Address          Age (min)  Hardware Addr   Type   Interface', ...arp.map((a) => `Internet  ${a.ip.padEnd(15)} -        ${a.mac}  ARPA   ${a.interface}`)].join('\n')
  } else if (lower === 'show vrrp brief') {
    if (!dev.vrrpGroups || dev.vrrpGroups.length === 0) body = notApplicable(dev, 'VRRP groups')
    else body = ['Interface          Grp  Pri  Time  Own  Pre  State    Master addr     Group addr', ...dev.vrrpGroups.map((g) => `${g.interface.padEnd(18)} ${String(g.id).padEnd(4)} ${String(g.priority).padEnd(4)} -     -    Y    ${g.state.padEnd(8)} ${g.virtualIp.padEnd(15)} ${g.virtualIp}`)].join('\n')
  } else if (lower === 'show ip dhcp pool') {
    if (!dev.dhcpPools || dev.dhcpPools.length === 0) body = notApplicable(dev, 'DHCP pools')
    else body = dev.dhcpPools.map((p) => `Pool ${p.name}:\n  network ${p.network} ${p.mask}\n  default-router ${p.gateway}\n  dns-server ${p.dns.join(' ')}\n  lease ${p.leaseDays} days\n  excluded ${p.excluded}`).join('\n\n')
  } else if (lower === 'show access-lists') {
    if (!dev.firewallRules || dev.firewallRules.length === 0) body = notApplicable(dev, 'Access lists / firewall rules')
    else body = dev.firewallRules.map((r) => `${r.id} ${r.name}: ${r.fromZone} to ${r.toZone}, ${r.source} to ${r.destination}, ${r.service}, ${r.action}`).join('\n')
  } else if (lower === 'ip addr') {
    body = dev.interfaces.filter((i) => i.ip).map((i, idx) => `${idx + 1}: ${i.name}: <UP> mtu 1500\n    inet ${i.ip}/${i.mask} scope global ${i.name}`).join('\n') || notApplicable(dev, 'IP addresses')
  } else if (lower === 'ss -tulnp') {
    const services: Record<string, string[]> = {
      'ubuntu-server': ['tcp 0.0.0.0:22 SSH', 'tcp 0.0.0.0:80 nginx'],
      splunk: ['udp 0.0.0.0:514 syslog'],
    }
    body = services[dev.id] ? ['Netid State Recv-Q Send-Q Local Address', ...services[dev.id]].join('\n') : notApplicable(dev, 'Listening sockets')
  } else if (lower.startsWith('tcpdump')) {
    body = `tcpdump: listening on eth0 (simulated capture)\nCaptured frames are shown in the Packet panel. Example filter from this lab: tcpdump -i eth0 -n host 192.168.10.20`
  } else if (lower.startsWith('ping ')) {
    const target = cmd.split(/\s+/)[1] ?? ''
    const dstEp = topo.endpoints.find((e) => e.ip === target)
    body = dstEp
      ? `PING ${target} (${target}) 56(84) bytes of data.\n64 bytes from ${target}: icmp_seq=1 ttl=64 time=1.2 ms (simulated)\n64 bytes from ${target}: icmp_seq=2 ttl=64 time=0.9 ms (simulated)\n--- ${target} ping statistics ---\n2 packets transmitted, 2 received, 0% packet loss (simulated)`
      : `PING ${target}: no endpoint ${target} in this topology (simulated). Try one of: ${topo.endpoints.map((e) => e.ip).join(', ')}.`
  } else if (lower.startsWith('traceroute ')) {
    const target = cmd.split(/\s+/)[1] ?? ''
    const dstEp = topo.endpoints.find((e) => e.ip === target)
    if (!dstEp) body = `traceroute: unknown host ${target} in this topology (simulated).`
    else {
      const hops = topo.devices.filter((d) => d.interfaces.some((i) => i.ip === target) || d.id === dstEp.deviceId)
      body = `traceroute to ${target} (simulated)\n 1  ${dev.interfaces.find((i) => i.ip)?.ip ?? '192.168.10.1'}  1 ms\n 2  ${target}  2 ms`
      void hops
    }
  } else {
    body = `Unknown command: ${cmd}\nAvailable simulated commands:\n${COMMANDS.map((c) => `  ${c}`).join('\n')}`
  }
  return `${head}${body}${downNote}\n`
}
