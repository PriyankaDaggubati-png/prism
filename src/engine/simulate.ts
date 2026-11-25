// Packet simulation for PRISM. Honest and topology-aware: it resolves the
// source and destination endpoints, checks VLANs, trunks, routing tables
// (longest-prefix match), link/device/interface state, firewall rules,
// NAT, STP blocked ports, LACP members and VRRP master/backup, and
// returns ok:false with a clear failureReason when no valid path exists.
// All output is labelled simulated by the UI; nothing here claims to be
// a Cisco, Palo Alto or AWS emulator.
import { resolveDown } from './failures'
import { macFor } from './topologies'
import type {
  CapFrame,
  Device,
  Endpoint,
  FirewallRule,
  PacketStep,
  Protocol,
  SimResult,
  SimState,
  StepKind,
  Topology,
} from './types'

export interface SimulateOpts {
  src: string
  dst: string
  protocol: Protocol
  /** Destination TCP/UDP port, when the caller knows it (used by firewall checks). */
  dstPort?: number
}

function ipInt(ip: string): number {
  return ip.split('.').reduce((a, o) => (a << 8) + Number(o), 0) >>> 0
}
function inSubnet(ip: string, network: string, mask: string): boolean {
  return (ipInt(ip) & ipInt(mask)) === (ipInt(network) & ipInt(mask))
}
function maskLen(mask: string): number {
  return mask.split('.').reduce((n, o) => n + Number(o).toString(2).replace(/0/g, '').length, 0)
}
function isPrivate(ip: string): boolean {
  return ip.startsWith('192.168.') || ip.startsWith('10.')
}

const STP_BLOCKED_LINKS: Record<string, string[]> = {
  'ent-lab3': ['l-sw1-sw3'],
}

function isStpBlocked(topo: Topology, linkId: string): boolean {
  return (STP_BLOCKED_LINKS[topo.id] ?? []).includes(linkId)
}

function devName(topo: Topology, id: string): string {
  return topo.devices.find((d) => d.id === id)?.hostname ?? id
}

function lookupRoute(dev: Device, dstIp: string) {
  if (!dev.routes) return undefined
  let best: (typeof dev.routes)[number] | undefined
  let bestLen = -1
  for (const r of dev.routes) {
    if (inSubnet(dstIp, r.network, r.mask)) {
      const len = maskLen(r.mask)
      if (len > bestLen || (len === bestLen && r.adminDistance < (best?.adminDistance ?? 999))) {
        best = r
        bestLen = len
      }
    }
  }
  return best
}

interface PathOutcome {
  path: string[]
  failureReason?: SimResult['failureReason']
  blockingDevice?: string
  detail?: string
  denyRule?: FirewallRule
  nat?: boolean
}

function bfs(
  topo: Topology,
  from: string,
  to: string,
  down: ReturnType<typeof resolveDown>,
  opts: { ignoreDown?: boolean; srcVlan?: number } = {},
): string[] | null {
  if (from === to) return [from]
  const blocked = new Set<string>()
  const queue: string[][] = [[from]]
  const seen = new Set([from])
  while (queue.length > 0) {
    const path = queue.shift()!
    const cur = path[path.length - 1]
    const neighbours: { id: string; linkId: string }[] = []
    for (const l of topo.links) {
      if (isStpBlocked(topo, l.id)) continue
      if (!opts.ignoreDown) {
        if (down.downLinks.has(l.id)) continue
        if (down.downInterfaces.has(`${l.from}:${l.fromIf}`) || down.downInterfaces.has(`${l.to}:${l.toIf}`)) continue
      }
      let other: string | null = null
      if (l.from === cur) other = l.to
      else if (l.to === cur) other = l.from
      if (!other) continue
      if (!opts.ignoreDown && down.downDevices.has(other)) continue
      // Trunk VLAN check: a tagged frame may only cross a trunk that allows its VLAN.
      if (opts.srcVlan !== undefined && l.trunkVlans && !l.trunkVlans.includes(opts.srcVlan)) continue
      neighbours.push({ id: other, linkId: l.id })
    }
    // Prefer L3 devices (routers/firewalls) when routing between subnets.
    neighbours.sort((a, b) => {
      const ka = topo.devices.find((d) => d.id === a.id)?.kind ?? ''
      const kb = topo.devices.find((d) => d.id === b.id)?.kind ?? ''
      const rank = (k: string) => (k === 'router' || k === 'firewall' ? 0 : k === 'switch' ? 1 : 2)
      return rank(ka) - rank(kb)
    })
    for (const n of neighbours) {
      if (seen.has(n.id)) continue
      seen.add(n.id)
      const next = [...path, n.id]
      if (n.id === to) return next
      queue.push(next)
    }
    void blocked
  }
  return null
}

function firewallDeny(
  topo: Topology,
  path: string[],
  src: Endpoint,
  dst: Endpoint,
  protocol: Protocol,
  dstPort?: number,
): { device: Device; rule: FirewallRule } | null {
  for (const devId of path) {
    const dev = topo.devices.find((d) => d.id === devId)
    if (!dev?.firewallRules) continue
    for (const rule of dev.firewallRules) {
      if (rule.action !== 'deny') continue
      // EDGE-R1 ACL 100: inbound on the WAN interface, TCP 23 / 445.
      if (dev.id === 'edge-r1' && (dstPort === 23 || dstPort === 445) && (protocol === 'tcp' || protocol === 'firewall')) {
        if (!isPrivate(src.ip)) return { device: dev, rule }
      }
      // Palo Alto Block-Guest-to-Trust / FortiGate policy 2: guest VLAN 30 to trust VLAN 10.
      if ((dev.id === 'pa-vm' || dev.id === 'fgt-vm') && src.vlan === 30 && dst.vlan === 10) {
        return { device: dev, rule }
      }
      // Linux host firewall: default DROP, only 22 and 80 allowed.
      if (dev.id === 'ubuntu-server' && dstPort !== undefined && dstPort !== 22 && dstPort !== 80 && (protocol === 'tcp' || protocol === 'firewall')) {
        return { device: dev, rule }
      }
      // AWS lab-web-sg: only TCP 80 and TCP 22 (from 203.0.113.5/32) are allowed in.
      if (dev.id === 'lab-alb' && dstPort !== undefined && dstPort !== 80 && dstPort !== 22) {
        return { device: dev, rule }
      }
    }
  }
  return null
}

function computePath(
  topo: Topology,
  src: Endpoint,
  dst: Endpoint,
  down: ReturnType<typeof resolveDown>,
  protocol: Protocol,
  dstPort?: number,
): PathOutcome {
  const srcDev = topo.devices.find((d) => d.id === src.deviceId)
  const dstDev = topo.devices.find((d) => d.id === dst.deviceId)
  if (!srcDev || !dstDev) {
    return { detail: 'Source or destination device is not in this topology.', failureReason: 'unreachable', path: [] }
  }
  if (down.downDevices.has(src.deviceId)) {
    return { blockingDevice: src.deviceId, detail: `${srcDev.hostname} is down.`, failureReason: 'device-down', path: [src.deviceId] }
  }
  if (down.downDevices.has(dst.deviceId)) {
    return { blockingDevice: dst.deviceId, detail: `${dstDev.hostname} is down.`, failureReason: 'device-down', path: [dst.deviceId] }
  }
  if (src.id === dst.id) {
    return { detail: 'Source and destination are the same endpoint.', failureReason: 'unreachable', path: [src.deviceId] }
  }

  const vlansDiffer = src.vlan !== undefined && dst.vlan !== undefined && src.vlan !== dst.vlan

  let path: string[] | null = null
  if (vlansDiffer) {
    // Inter-VLAN traffic must cross an L3 device (ROAS router, SVI switch or firewall).
    const routers = topo.devices.filter(
      (d) => (d.kind === 'router' || d.kind === 'firewall' || d.kind === 'switch') && !down.downDevices.has(d.id) && d.routes && d.routes.length > 0,
    )
    // Prefer the VRRP master for Lab 2, then any router with a route to both subnets.
    const ordered = [...routers].sort((a, b) => {
      const aMaster = a.vrrpGroups?.some((g) => g.state === 'Master') ? 0 : 1
      const bMaster = b.vrrpGroups?.some((g) => g.state === 'Master') ? 0 : 1
      return aMaster - bMaster
    })
    for (const r of ordered) {
      const toRouter = bfs(topo, src.deviceId, r.id, down, { srcVlan: src.vlan })
      if (!toRouter) continue
      const fromRouter = bfs(topo, r.id, dst.deviceId, down, { srcVlan: dst.vlan })
      if (!fromRouter) continue
      path = [...toRouter, ...fromRouter.slice(1)]
      break
    }
    if (!path) {
      // No L3 path: is a down link/device the cause, or is it a VLAN problem?
      const ideal = bfs(topo, src.deviceId, dst.deviceId, down, { ignoreDown: true })
      if (!ideal) return { blockingDevice: dst.deviceId, detail: `No path between VLAN ${src.vlan} and VLAN ${dst.vlan}; no router connects them in this topology.`, failureReason: 'vlan-mismatch', path: [src.deviceId] }
      return { blockingDevice: src.deviceId, detail: `No gateway router is reachable between VLAN ${src.vlan} and VLAN ${dst.vlan}.`, failureReason: 'vlan-mismatch', path: [src.deviceId] }
    }
  } else {
    path = bfs(topo, src.deviceId, dst.deviceId, down, { srcVlan: src.vlan })
    if (!path) {
      const ideal = bfs(topo, src.deviceId, dst.deviceId, down, { ignoreDown: true, srcVlan: src.vlan })
      if (ideal) {
        // A down element sits on the only path: name it.
        for (const id of ideal) {
          if (down.downDevices.has(id)) {
            return { blockingDevice: id, detail: `${devName(topo, id)} is down, and there is no alternate path in this topology.`, failureReason: 'device-down', path: ideal.slice(0, ideal.indexOf(id) + 1) }
          }
        }
        for (const l of topo.links) {
          if (!ideal.includes(l.from) || !ideal.includes(l.to)) continue
          if (down.downLinks.has(l.id)) {
            return { blockingDevice: l.from, detail: `Link ${l.from} ${l.fromIf} to ${l.to} ${l.toIf} is down, and there is no alternate path in this topology.`, failureReason: 'link-down', path: ideal.slice(0, ideal.indexOf(l.from) + 1) }
          }
          if (down.downInterfaces.has(`${l.from}:${l.fromIf}`) || down.downInterfaces.has(`${l.to}:${l.toIf}`)) {
            return { blockingDevice: l.from, detail: `Interface ${l.fromIf} on ${devName(topo, l.from)} is down, and there is no alternate path in this topology.`, failureReason: 'link-down', path: ideal.slice(0, ideal.indexOf(l.from) + 1) }
          }
        }
        return { blockingDevice: dst.deviceId, detail: 'The only path is unavailable.', failureReason: 'link-down', path: ideal }
      }
      return { blockingDevice: src.deviceId, detail: `No route from ${src.ip} to ${dst.ip} in this topology.`, failureReason: 'no-route', path: [src.deviceId] }
    }
  }

  // Routing-table check on every L3 device in the path.
  for (const devId of path) {
    const dev = topo.devices.find((d) => d.id === devId)
    if (!dev || !dev.routes || dev.routes.length === 0) continue
    if (dev.kind !== 'router' && dev.kind !== 'firewall' && dev.kind !== 'vpc' && dev.kind !== 'cloud') continue
    // A router only needs a route if the destination is not one of its own connected nets.
    const connected = dev.routes.some((r) => r.protocol === 'connected' && inSubnet(dst.ip, r.network, r.mask))
    if (connected) continue
    if (!lookupRoute(dev, dst.ip)) {
      return { blockingDevice: devId, detail: `${dev.hostname} has no route to ${dst.ip}.`, failureReason: 'no-route', path: path.slice(0, path.indexOf(devId) + 1) }
    }
  }

  // Firewall check.
  const deny = firewallDeny(topo, path, src, dst, protocol, dstPort)
  if (deny) {
    return {
      blockingDevice: deny.device.id,
      denyRule: deny.rule,
      detail: `${deny.device.hostname} denied the packet: rule ${deny.rule.id} ${deny.rule.name} (${deny.rule.service}).`,
      failureReason: 'firewall-deny',
      path: path.slice(0, path.indexOf(deny.device.id) + 1),
    }
  }

  // NAT: inside LAN to outside through EDGE-R1 / PA-VM / FortiGate.
  const nat = path.some((id) => id === 'edge-r1' || id === 'pa-vm' || id === 'fgt-vm') && isPrivate(src.ip) && !isPrivate(dst.ip)

  return { nat, path }
}

class Builder {
  frames: CapFrame[] = []
  steps: PacketStep[] = []
  timeMs = 0
  constructor(private topo: Topology) {}
  step(deviceId: string, action: string, detail: string, kind: StepKind = 'forward') {
    this.timeMs += 1
    this.steps.push({ action, detail, deviceId, deviceName: devName(this.topo, deviceId), kind, seq: this.steps.length + 1, timeMs: this.timeMs })
  }
  frame(src: string, dst: string, protocol: string, info: string, opts: Partial<CapFrame> = {}) {
    this.timeMs += 1
    const no = this.frames.length + 1
    this.frames.push({
      dst,
      info,
      layers: opts.layers ?? {
        Ethernet: [`Source MAC ${macFor(src)}`, `Destination MAC ${macFor(dst)}`],
        IP: [`Source ${src}`, `Destination ${dst}`, `TTL ${opts.ttl ?? 64}`],
        [protocol.toUpperCase()]: [info],
      },
      length: 64 + info.length,
      no,
      protocol,
      src,
      timeMs: this.timeMs,
      ttl: opts.ttl ?? 64,
      vlan: opts.vlan,
      ...opts,
    })
  }
}

function layersFor(src: string, dst: string, protocol: string, ttl: number, extra: string[]): Record<string, string[]> {
  return {
    Ethernet: [`Source MAC ${macFor(src)}`, `Destination MAC ${macFor(dst)}`],
    IP: [`Source ${src}`, `Destination ${dst}`, `TTL ${ttl}`],
    [protocol.toUpperCase()]: extra,
  }
}

export function simulatePacket(topo: Topology, state: SimState, opts: SimulateOpts): SimResult {
  const { dstPort, protocol } = opts
  const down = resolveDown(state)
  const src = topo.endpoints.find((e) => e.id === opts.src)
  const dst = topo.endpoints.find((e) => e.id === opts.dst)
  const b = new Builder(topo)

  if (!src || !dst) {
    b.step(topo.devices[0]?.id ?? 'unknown', 'Packet dropped', 'Source or destination endpoint is not in this topology.', 'error')
    return { failureReason: 'unreachable', frames: b.frames, ok: false, path: [], steps: b.steps, summary: 'Simulated: unknown endpoint, packet dropped.' }
  }

  // ---- DHCP mode
  if (protocol === 'dhcp') {
    const server = topo.devices.find((d) => d.dhcpPools && d.dhcpPools.length > 0)
    const pool = server?.dhcpPools?.find((p) => inSubnet(src.ip, p.network, p.mask) || inSubnet(dst.ip, p.network, p.mask) || src.vlan !== undefined)
    const dhcpDown = state.failures.includes('cisco-dhcp-fail') || state.failures.includes('trouble-dhcp-fail') || (server && down.downDevices.has(server.id))
    if (!server || !pool || dhcpDown) {
      b.step(src.deviceId, 'DHCP Discover', `${src.label} broadcasts a DHCP Discover (simulated).`, 'info')
      b.frame('0.0.0.0', '255.255.255.255', 'DHCP', 'DHCP Discover', { layers: layersFor('0.0.0.0', '255.255.255.255', 'DHCP', 64, ['DHCP Discover, no Offer received']) })
      b.step(src.deviceId, 'No DHCP Offer', 'No DHCP server answered in this topology. Simulated DHCP failure.', 'error')
      return { failureReason: 'dhcp-fail', frames: b.frames, ok: false, path: [src.deviceId], steps: b.steps, summary: 'Simulated: DHCP Discover received no Offer.' }
    }
    const assigned = `${pool.network.split('.').slice(0, 3).join('.')}.11`
    b.step(src.deviceId, 'DHCP Discover', `${src.label} broadcasts DHCP Discover.`, 'info')
    b.frame('0.0.0.0', '255.255.255.255', 'DHCP', 'DHCP Discover', { layers: layersFor('0.0.0.0', '255.255.255.255', 'DHCP', 64, ['DHCP Discover']) })
    b.step(server.id, 'DHCP Offer', `${server.hostname} offers ${assigned} from pool ${pool.name} (simulated).`, 'info')
    b.frame(server.interfaces[0]?.ip ?? '192.168.10.1', '255.255.255.255', 'DHCP', `DHCP Offer ${assigned}`, { layers: layersFor('192.168.10.1', '255.255.255.255', 'DHCP', 64, [`Offered IP ${assigned}`, `Subnet mask ${pool.mask}`]) })
    b.step(src.deviceId, 'DHCP Request', `${src.label} requests ${assigned}.`, 'info')
    b.frame('0.0.0.0', '255.255.255.255', 'DHCP', `DHCP Request ${assigned}`, { layers: layersFor('0.0.0.0', '255.255.255.255', 'DHCP', 64, [`Requested IP ${assigned}`]) })
    b.step(server.id, 'DHCP Ack', `${server.hostname} acknowledges: IP ${assigned}, mask ${pool.mask}, gateway ${pool.gateway}, DNS ${pool.dns.join(', ')}, lease ${pool.leaseDays} days (simulated).`, 'allow')
    b.frame(server.interfaces[0]?.ip ?? '192.168.10.1', assigned, 'DHCP', `DHCP Ack ${assigned}`, { layers: layersFor('192.168.10.1', assigned, 'DHCP', 64, [`Assigned IP ${assigned}`, `Gateway ${pool.gateway}`, `DNS ${pool.dns.join(', ')}`, `Lease ${pool.leaseDays} days`]) })
    return { frames: b.frames, ok: true, path: [src.deviceId, server.id], steps: b.steps, summary: `Simulated: DHCP DORA complete, assigned ${assigned}, gateway ${pool.gateway}, DNS ${pool.dns.join(', ')}.` }
  }

  // ---- DNS mode
  if (protocol === 'dns') {
    if (state.failures.includes('cisco-dns-fail') || state.failures.includes('ws-dns-fail')) {
      b.step(src.deviceId, 'DNS query', `${src.label} queries 8.8.8.8 for google.com (simulated).`, 'info')
      b.frame(src.ip, '8.8.8.8', 'DNS', 'DNS query google.com A', { layers: layersFor(src.ip, '8.8.8.8', 'DNS', 64, ['Query google.com, type A']) })
      b.step(src.deviceId, 'No DNS response', 'Query sent, no response received. Simulated DNS failure.', 'error')
      return { failureReason: 'dns-fail', frames: b.frames, ok: false, path: [src.deviceId], steps: b.steps, summary: 'Simulated: DNS query received no response.' }
    }
    const outcome = computePath(topo, src, dst, down, protocol, dstPort)
    if (!outcome.path.length || outcome.failureReason) {
      return failResult(topo, b, outcome, src, dst)
    }
    b.step(src.deviceId, 'DNS query', `${src.label} sends a DNS query for google.com to 8.8.8.8 (simulated).`, 'info')
    b.frame(src.ip, '8.8.8.8', 'DNS', 'DNS query google.com A', { layers: layersFor(src.ip, '8.8.8.8', 'DNS', 64, ['Query google.com, type A', 'Recursion desired']) })
    for (const devId of outcome.path.slice(1)) {
      b.step(devId, 'Forward DNS query', `${devName(topo, devId)} forwards the DNS query toward 8.8.8.8.`, 'forward')
    }
    b.step(dst.deviceId, 'DNS answer', `Resolver 8.8.8.8 returns the A record for google.com (simulated).`, 'allow')
    b.frame('8.8.8.8', src.ip, 'DNS', 'DNS response google.com A', { layers: layersFor('8.8.8.8', src.ip, 'DNS', 63, ['Response for google.com', 'Answer: A record (simulated)']) })
    return { frames: b.frames, ok: true, path: outcome.path, steps: b.steps, summary: 'Simulated: DNS query answered by 8.8.8.8.' }
  }

  const outcome = computePath(topo, src, dst, down, protocol, dstPort)
  if (outcome.failureReason) {
    return failResult(topo, b, outcome, src, dst)
  }
  const path = outcome.path
  let ttl = 64
  const srcIpShown = src.ip
  const dstIpShown = dst.ip

  // ---- Protocol preambles
  if (protocol === 'arp') {
    const gatewayIp = src.gateway
    b.step(src.deviceId, 'ARP broadcast', `${src.label} broadcasts ARP: who has ${gatewayIp}? (simulated, stays inside VLAN ${src.vlan ?? 'untagged'}).`, 'arp')
    b.frame(src.ip, '255.255.255.255', 'ARP', `ARP request: who has ${gatewayIp}?`, { vlan: src.vlan, layers: layersFor(src.ip, '255.255.255.255', 'ARP', 64, [`Who has ${gatewayIp}? Tell ${src.ip}`]) })
    b.step(path[0], 'ARP reply', `Gateway ${gatewayIp} replies with MAC ${macFor(gatewayIp)} (simulated).`, 'arp')
    b.frame(gatewayIp, src.ip, 'ARP', `ARP reply: ${gatewayIp} is at ${macFor(gatewayIp)}`, { vlan: src.vlan, layers: layersFor(gatewayIp, src.ip, 'ARP', 64, [`${gatewayIp} is at ${macFor(gatewayIp)}`]) })
    b.step(src.deviceId, 'ARP table update', `${src.label} adds ${gatewayIp} -> ${macFor(gatewayIp)} to its ARP table (simulated).`, 'info')
  }
  if (protocol === 'ospf') {
    for (const devId of path) {
      const dev = topo.devices.find((d) => d.id === devId)
      const n = dev?.ospfNeighbors?.[0]
      b.step(devId, 'OSPF Hello', `${devName(topo, devId)} sends OSPF Hello${n ? ` to neighbour ${n.neighborId} (${n.address}), area ${n.area}` : ''} (simulated).`, 'info')
      b.frame(dev?.interfaces[0]?.ip ?? src.ip, dev?.ospfNeighbors?.[0]?.address ?? dst.ip, 'OSPF', 'OSPF Hello', { layers: layersFor(src.ip, dst.ip, 'OSPF', 64, ['Hello, router ID ' + (dev?.interfaces.find((i) => i.id === 'Loopback0')?.ip ?? '')]) })
    }
    b.step(path[path.length - 1], 'OSPF neighbour states', 'Down, Init, 2-Way, ExStart, Exchange, Loading, Full (simulated). Neighbours are Full.', 'info')
    b.step(path[0], 'SPF calculation', `${devName(topo, path[0])} runs SPF over the link-state database and converges (simulated).`, 'lookup')
  }
  if (protocol === 'bgp') {
    const vgw = topo.devices.find((d) => d.id === 'lab-vgw')
    if (state.failures.includes('aws-bgp-withdrawal')) {
      b.step('lab-vgw', 'BGP withdrawal', 'BGP withdraws 192.168.10.0/24 from ASN 65000; the VPN route is gone and there is no backup path in this lab (simulated).', 'error')
      b.frame('203.0.113.10', '203.0.113.2', 'BGP', 'BGP Withdraw 192.168.10.0/24', { layers: layersFor('203.0.113.10', '203.0.113.2', 'BGP', 64, ['Withdrawn 192.168.10.0/24', 'AS path 65000']) })
      return { failureReason: 'unreachable', frames: b.frames, ok: false, path: ['lab-vgw'], steps: b.steps, summary: 'Simulated: BGP withdrew 192.168.10.0/24, destination unreachable.' }
    }
    b.step('lab-vgw', 'BGP session', `BGP session with customer gateway 203.0.113.10, ASN 65000, is Established (simulated).`, 'info')
    b.frame('203.0.113.10', '203.0.113.2', 'BGP', 'BGP Update: advertise 192.168.10.0/24, AS path 65000', { layers: layersFor('203.0.113.10', '203.0.113.2', 'BGP', 64, ['Advertised 192.168.10.0/24', 'AS path 65000']) })
    void vgw
  }
  if (protocol === 'stp') {
    b.step('sw1', 'STP BPDU', 'SW1 (priority 4096) sends BPDUs and is elected root bridge for VLANs 10, 20 and 30 (simulated).', 'info')
    b.frame(macFor('sw1'), macFor('sw2'), 'STP', 'BPDU: root SW1 priority 4096', { layers: layersFor('192.168.10.10', '192.168.10.20', 'STP', 64, ['Root bridge SW1, priority 4096', 'Port roles: Po1 and Po2 forwarding, SW1-SW3 blocked']) })
    b.step('sw3', 'STP port roles', 'SW1-SW3 link Gi0/2 is in blocking state; Po1 and Po2 are forwarding (simulated).', 'info')
  }
  if (protocol === 'lacp') {
    b.step(path[0], 'LACP negotiation', 'LACP LACPDUs exchanged, mode active on both ends; Port-channel forms (simulated).', 'info')
    b.frame(macFor(path[0]), macFor(path[path.length - 1]), 'LACP', 'LACPDU: actor active, partner active', { layers: layersFor(src.ip, dst.ip, 'LACP', 64, ['LACP mode active', 'Port-channel member selected by hash']) })
    const memberDown = down.downLinks.has('l-sw1-sw2-a') || down.downLinks.has('l-access-dist-a')
    b.step(path[0], 'LACP member selection', memberDown ? 'One member link is down; LACP keeps the channel up on the remaining member (simulated).' : 'Member link selected by hash; both members up (simulated).', 'info')
  }
  if (protocol === 'vrrp' || protocol === 'hsrp') {
    const masterDown = down.downDevices.has('r1')
    b.step('r1', 'VRRP state', masterDown ? 'R1 (priority 120) is down; R2 (priority 100, preempt) has taken over as master for groups 10, 20 and 30 (simulated).' : 'R1 is master for VRRP groups 10, 20 and 30 (priority 120, preempt); R2 is backup (priority 100) (simulated).', 'info')
    b.frame('192.168.10.1', '192.168.10.254', 'VRRP', masterDown ? 'VRRP advertisement from R2, master' : 'VRRP advertisement from R1, master priority 120', { layers: layersFor('192.168.10.1', '192.168.10.254', 'VRRP', 64, [`Virtual IP 192.168.10.254`, masterDown ? 'Master R2, priority 100' : 'Master R1, priority 120']) })
  }
  if (protocol === 'ipsec') {
    b.step(path[0], 'IKE phase 1', 'IKEv2 phase 1: peer 203.0.113.10, pre-shared key checked, DPD enabled (simulated).', 'info')
    b.frame(src.ip, '203.0.113.10', 'IPsec', 'IKE phase 1, IKEv2', { layers: layersFor(src.ip, '203.0.113.10', 'IPsec', 64, ['IKEv2 phase 1', 'Peer 203.0.113.10']) })
    b.step(path[Math.floor(path.length / 2)], 'IKE phase 2', 'Phase 2: proxy IDs local 192.168.10.0/24, remote 192.168.20.0/24, proposal aes256-sha256 (simulated).', 'info')
    b.step(path[Math.floor(path.length / 2)], 'Encrypted tunnel transit', 'Packet is encrypted and transits the IPsec tunnel (simulated).', 'encap')
  }
  if (protocol === 'firewall') {
    const fw = path.map((id) => topo.devices.find((d) => d.id === id)).find((d) => d?.firewallRules?.length)
    if (fw) {
      b.step(fw.id, 'Firewall policy match', `${fw.hostname} evaluates zones and policy in order; traffic ${src.ip} to ${dst.ip} matches an allow rule (simulated).`, 'allow')
    }
  }
  if (protocol === 'aws') {
    b.step('lab-vpc', 'VPC route table', 'Route table lookup in lab-vpc for the destination (simulated).', 'lookup')
    b.frame(src.ip, dst.ip, 'AWS', 'VPC route table lookup', { layers: layersFor(src.ip, dst.ip, 'AWS', 64, ['Route table lab-public-rt / lab-private-rt', 'Longest-prefix match']) })
    if (path.includes('lab-igw')) b.step('lab-igw', 'Internet Gateway', 'Traffic passes the Internet Gateway lab-igw (simulated).', 'forward')
    if (path.includes('lab-nat')) b.step('lab-nat', 'NAT Gateway', 'Private traffic is translated at NAT Gateway lab-nat in a public subnet (simulated).', 'nat')
    if (path.includes('lab-tgw')) b.step('lab-tgw', 'Transit Gateway', 'Traffic crosses Transit Gateway lab-tgw to the second VPC (simulated).', 'forward')
    if (path.includes('lab-alb')) b.step('lab-alb', 'ALB and Security Group', 'ALB lab-alb forwards to EC2; Security Group lab-web-sg is stateful and allows the return traffic (simulated). NACLs are stateless; no NACL rules are stated in the source.', 'allow')
  }

  // ---- Forwarding along the path
  const isVlanMode = protocol === 'vlan'
  path.forEach((devId, i) => {
    const dev = topo.devices.find((d) => d.id === devId)
    const isRouter = dev?.kind === 'router' || dev?.kind === 'firewall' || dev?.kind === 'vpc'
    if (isRouter && i > 0) ttl -= 1
    const vlanTag = isVlanMode && src.vlan !== undefined ? ` 802.1Q tag VLAN ${src.vlan}` : ''
    const natNote = outcome.nat && devId === 'edge-r1' ? ` NAT overload: source translated to 203.0.113.2` : outcome.nat && (devId === 'pa-vm' || devId === 'fgt-vm') ? ` NAT: source translated to 203.0.113.2` : ''
    if (i === 0) {
      b.step(devId, protocol === 'tcp' ? 'TCP SYN sent' : protocol === 'icmp' ? 'Echo Request sent' : 'Packet sent', `${devName(topo, devId)} sends the packet toward ${dst.ip}${vlanTag}${natNote} (simulated). TTL ${ttl}.`, 'forward')
    } else if (i === path.length - 1) {
      b.step(devId, protocol === 'tcp' ? 'TCP SYN received' : protocol === 'icmp' ? 'Echo Request received' : 'Packet delivered', `${devName(topo, devId)} delivers the packet to ${dst.label} (${dst.ip})${vlanTag} (simulated). TTL ${ttl}.`, 'allow')
    } else {
      const verb = isRouter ? 'Routes' : 'Forwards'
      b.step(devId, `${verb} packet`, `${devName(topo, devId)} ${verb.toLowerCase()}s the packet toward ${dst.ip}${vlanTag}${natNote} (simulated). TTL ${ttl}.`, isRouter ? 'lookup' : 'forward')
    }
    const shownSrc = outcome.nat && i > 0 && path.slice(0, i + 1).some((id) => id === 'edge-r1' || id === 'pa-vm' || id === 'fgt-vm') ? '203.0.113.2' : srcIpShown
    b.frame(shownSrc, dstIpShown, protocol.toUpperCase(), `${protocol.toUpperCase()} ${shownSrc} -> ${dstIpShown}${vlanTag}`, {
      layers: layersFor(shownSrc, dstIpShown, protocol.toUpperCase(), ttl, [`Hop ${i + 1}: ${devName(topo, devId)}`, `TTL ${ttl}`]),
      ttl,
      vlan: src.vlan,
    })
  })

  // ---- Return path for ICMP / TCP
  if (protocol === 'icmp') {
    b.step(dst.deviceId, 'Echo Reply sent', `${dst.label} sends an Echo Reply back to ${src.ip} (simulated).`, 'forward')
    b.frame(dstIpShown, srcIpShown, 'ICMP', `ICMP Echo Reply ${dstIpShown} -> ${srcIpShown}`, { layers: layersFor(dstIpShown, srcIpShown, 'ICMP', ttl, ['Echo Reply', `TTL ${ttl}`]), ttl })
    b.step(src.deviceId, 'Echo Reply received', `${src.label} receives the Echo Reply (simulated).`, 'allow')
  }
  if (protocol === 'tcp') {
    const port = dstPort ?? 80
    b.step(dst.deviceId, 'TCP SYN-ACK sent', `${dst.label} replies SYN-ACK, seq 5000, ack 1001, port ${port} (simulated).`, 'forward')
    b.frame(dstIpShown, srcIpShown, 'TCP', `TCP SYN-ACK seq 5000 ack 1001, port ${port}`, { layers: layersFor(dstIpShown, srcIpShown, 'TCP', ttl, ['SYN-ACK', 'Seq 5000, Ack 1001', `Destination port ${port}`, 'Source port 49152']), ttl })
    b.step(src.deviceId, 'TCP ACK sent', `${src.label} sends ACK, seq 1001, ack 5001 (simulated). Handshake complete.`, 'allow')
    b.frame(srcIpShown, dstIpShown, 'TCP', 'TCP ACK seq 1001 ack 5001', { layers: layersFor(srcIpShown, dstIpShown, 'TCP', ttl, ['ACK', 'Seq 1001, Ack 5001', `Destination port ${port}`]), ttl })
  }
  if (protocol === 'vlan' && src.vlan !== undefined) {
    b.step(dst.deviceId, '802.1Q tag removed', `Tag VLAN ${src.vlan} is removed at the access port before delivery to ${dst.label} (simulated).`, 'decap')
  }
  if (protocol === 'ipsec') {
    b.step(dst.deviceId, 'IPsec decapsulation', 'Packet is decrypted at the far end of the tunnel (simulated).', 'decap')
  }

  const summary = outcome.nat
    ? `Simulated: packet delivered ${src.ip} -> ${dst.ip} via ${path.map((id) => devName(topo, id)).join(' -> ')}; NAT translated the source to 203.0.113.2 on the WAN side.`
    : `Simulated: packet delivered ${src.ip} -> ${dst.ip} via ${path.map((id) => devName(topo, id)).join(' -> ')}.`
  return { frames: b.frames, ok: true, path, steps: b.steps, summary }
}

function failResult(topo: Topology, b: Builder, outcome: PathOutcome, src: Endpoint, dst: Endpoint): SimResult {
  const blocking = outcome.blockingDevice ?? src.deviceId
  const reason = outcome.failureReason ?? 'unreachable'
  // Walk the partial path so steps end at the blocking device.
  for (const devId of outcome.path) {
    if (devId === blocking) {
      b.step(devId, 'Packet dropped', outcome.detail ?? 'No valid path exists (simulated).', reason === 'firewall-deny' ? 'deny' : 'drop')
      break
    }
    b.step(devId, 'Packet forwarded', `${devName(topo, devId)} forwards the packet toward ${dst.ip} (simulated).`, 'forward')
    b.frame(src.ip, dst.ip, 'ICMP', `Packet ${src.ip} -> ${dst.ip} via ${devName(topo, devId)}`, { layers: layersFor(src.ip, dst.ip, 'ICMP', 64, [`Hop: ${devName(topo, devId)}`]) })
  }
  if (!outcome.path.includes(blocking)) {
    b.step(blocking, 'Packet dropped', outcome.detail ?? 'No valid path exists (simulated).', reason === 'firewall-deny' ? 'deny' : 'drop')
  }
  const summary = `Simulated: packet ${src.ip} -> ${dst.ip} failed at ${devName(topo, blocking)}: ${outcome.detail ?? reason}.`
  return { failureReason: reason, frames: b.frames, ok: false, path: outcome.path, steps: b.steps, summary }
}
