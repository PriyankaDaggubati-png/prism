import { describe, expect, it } from 'vitest'
import { eduTopics } from '../edu'
import { runCli } from '../cli'
import { emptySimState } from '../types'
import { simulatePacket } from '../simulate'
import { getTopology } from '../topologies'

function state(failures: string[] = []) {
  return { ...emptySimState(), failures }
}

describe('PRISM engine simulation', () => {
  it('OSPF routing picks the R2 path from R1 LAN to R3 LAN', () => {
    const topo = getTopology('ent-lab1')!
    const res = simulatePacket(topo, emptySimState(), { dst: 'lan30', protocol: 'icmp', src: 'lan10' })
    expect(res.ok).toBe(true)
    expect(res.path).toEqual(['r1', 'r2', 'r3'])
  })

  it('EIGRP redistribution reaches 192.168.40.0/24 from the Area 1 LAN', () => {
    const topo = getTopology('ent-lab1')!
    const res = simulatePacket(topo, emptySimState(), { dst: 'lan40', protocol: 'icmp', src: 'lan30' })
    expect(res.ok).toBe(true)
    expect(res.path).toContain('r2')
    expect(res.path).toContain('r4')
    expect(res.summary).toContain('192.168.40.1')
  })

  it('inter-VLAN traffic crosses the ROAS subinterfaces with the right tag', () => {
    const topo = getTopology('ent-lab2')!
    const res = simulatePacket(topo, emptySimState(), { dst: 'vlan20-host', protocol: 'vlan', src: 'vlan10-host' })
    expect(res.ok).toBe(true)
    expect(res.path).toContain('r1')
    expect(res.frames.some((f) => f.vlan === 10)).toBe(true)
    expect(res.steps.some((s) => s.detail.includes('802.1Q tag VLAN 10'))).toBe(true)
  })

  it('an ARP broadcast stays inside its VLAN', () => {
    const topo = getTopology('ent-lab3')!
    const res = simulatePacket(topo, emptySimState(), { dst: 'vlan10-host-sw3', protocol: 'arp', src: 'vlan10-host' })
    expect(res.ok).toBe(true)
    expect(res.steps.some((s) => s.action === 'ARP broadcast' && s.detail.includes('VLAN 10'))).toBe(true)
    expect(res.frames.every((f) => f.vlan === undefined || f.vlan === 10)).toBe(true)
  })

  it('TCP 23 through EDGE-R1 ACL 100 is denied at the firewall', () => {
    const topo = getTopology('cisco-routing-switching')!
    const res = simulatePacket(topo, emptySimState(), { dst: 'tftp-host', dstPort: 23, protocol: 'tcp', src: 'internet' })
    expect(res.ok).toBe(false)
    expect(res.failureReason).toBe('firewall-deny')
    expect(res.path[res.path.length - 1]).toBe('edge-r1')
    expect(res.summary).toContain('ACL 100')
  })

  it('TCP 445 through EDGE-R1 ACL 100 is denied at the firewall', () => {
    const topo = getTopology('cisco-routing-switching')!
    const res = simulatePacket(topo, emptySimState(), { dst: 'tftp-host', dstPort: 445, protocol: 'tcp', src: 'internet' })
    expect(res.ok).toBe(false)
    expect(res.failureReason).toBe('firewall-deny')
  })

  it('a packet through a down link fails with no silent reroute', () => {
    const topo = getTopology('ent-lab1')!
    const res = simulatePacket(topo, state(['lab1-r1-r2-link-down']), { dst: 'lan30', protocol: 'icmp', src: 'lan10' })
    expect(res.ok).toBe(false)
    expect(res.failureReason).toBe('link-down')
  })

  it('VRRP failover moves the gateway to R2 when R1 is down', () => {
    const topo = getTopology('ent-lab2')!
    const res = simulatePacket(topo, state(['lab2-r1-down']), { dst: 'vlan20-host', protocol: 'icmp', src: 'vlan10-host' })
    expect(res.ok).toBe(true)
    expect(res.path).toContain('r2')
    expect(res.path).not.toContain('r1')
  })

  it('an unreachable destination returns ok:false', () => {
    const topo = getTopology('ent-lab1')!
    const res = simulatePacket(topo, emptySimState(), { dst: 'no-such-endpoint', protocol: 'icmp', src: 'lan10' })
    expect(res.ok).toBe(false)
    expect(res.failureReason).toBe('unreachable')
  })

  it('the STP blocked SW1-SW3 link is not used', () => {
    const topo = getTopology('ent-lab3')!
    const res = simulatePacket(topo, emptySimState(), { dst: 'vlan10-host-sw3', protocol: 'icmp', src: 'vlan10-host' })
    expect(res.ok).toBe(true)
    expect(res.path).toEqual(['sw1', 'sw2', 'sw3'])
  })

  it('NAT translates the source to 203.0.113.2 on the WAN side', () => {
    const topo = getTopology('cisco-routing-switching')!
    const res = simulatePacket(topo, emptySimState(), { dst: 'internet', protocol: 'icmp', src: 'tftp-host' })
    expect(res.ok).toBe(true)
    expect(res.summary).toContain('203.0.113.2')
    expect(res.frames.some((f) => f.src === '203.0.113.2')).toBe(true)
  })

  it('DHCP DORA assigns an address from pool LAN-10', () => {
    const topo = getTopology('cisco-routing-switching')!
    const res = simulatePacket(topo, emptySimState(), { dst: 'internet', protocol: 'dhcp', src: 'tftp-host' })
    expect(res.ok).toBe(true)
    expect(res.summary).toContain('192.168.10.11')
    expect(res.summary).toContain('8.8.8.8')
  })

  it('CLI show ip route on R1 is derived from the topology', () => {
    const topo = getTopology('ent-lab1')!
    const out = runCli(topo, emptySimState(), 'r1', 'show ip route')
    expect(out).toContain('Simulated output')
    expect(out).toContain('192.168.40.0')
    expect(out).toContain('R1 (simulated)')
  })

  it('education topics match the protocols a topology supports', () => {
    expect(eduTopics('ent-lab1')).toContain('ospf')
    expect(eduTopics('ent-lab2')).toContain('vrrp')
    expect(eduTopics('ent-lab3')).toContain('stp')
  })
})
