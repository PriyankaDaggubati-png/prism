import { useSim } from '../store/simStore'

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="mt-4">
      <h3 className="text-sm font-semibold" style={{ color: 'var(--prism-cyan)' }}>
        {title}
      </h3>
      <div className="mt-2">{children}</div>
    </section>
  )
}

function Empty({ text }: { text: string }) {
  return (
    <p className="text-sm" style={{ color: 'var(--prism-muted)' }}>
      {text}
    </p>
  )
}

export default function Inspector() {
  const { selectedDevice, selectDevice } = useSim()
  const device = selectedDevice

  if (!device) {
    return (
      <div id="prism-inspector" className="prism-panel p-4">
        <h2 className="text-base font-semibold">Device Inspector</h2>
        <p className="mt-2 text-sm" style={{ color: 'var(--prism-muted)' }}>
          Click a device in the topology to inspect it.
        </p>
      </div>
    )
  }

  const interfaces = device.interfaces ?? []
  const upInterfaces = interfaces.filter((i) => i.status === 'up').length

  // Simulated event log lines, derived only from this device's own data.
  const eventLines: string[] = []
  eventLines.push(`Simulated event: ${device.hostname} inspected in the educational simulation.`)
  for (const iface of interfaces) {
    eventLines.push(
      `Simulated event: interface ${iface.name} is ${iface.status}` +
        (iface.ip ? ` with address ${iface.ip}` : '') +
        '.',
    )
  }
  for (const n of device.ospfNeighbors ?? []) {
    eventLines.push(
      `Simulated event: OSPF neighbor ${n.neighborId} (${n.address}) on ${n.interface} is ${n.state}.`,
    )
  }
  for (const n of device.bgpNeighbors ?? []) {
    eventLines.push(
      `Simulated event: BGP neighbor ${n.neighbor} (AS ${n.as}) is ${n.state}.`,
    )
  }
  for (const g of device.vrrpGroups ?? []) {
    eventLines.push(
      `Simulated event: VRRP group ${g.id} virtual IP ${g.virtualIp} is ${g.state} (priority ${g.priority}).`,
    )
  }
  for (const p of device.dhcpPools ?? []) {
    eventLines.push(
      `Simulated event: DHCP pool ${p.name} serves ${p.network} with gateway ${p.gateway}.`,
    )
  }

  return (
    <div id="prism-inspector" className="prism-panel p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold">Device Inspector</h2>
          <p className="text-sm" style={{ color: 'var(--prism-muted)' }}>
            {device.hostname} ({device.kind})
          </p>
        </div>
        <button
          type="button"
          className="prism-btn"
          onClick={() => selectDevice(null)}
          aria-label="Close inspector"
        >
          Close
        </button>
      </div>

      <Section title="Device">
        <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
          <dt style={{ color: 'var(--prism-muted)' }}>Hostname</dt>
          <dd>{device.hostname}</dd>
          <dt style={{ color: 'var(--prism-muted)' }}>Type</dt>
          <dd>{device.kind}</dd>
          <dt style={{ color: 'var(--prism-muted)' }}>Model</dt>
          <dd>{device.model ?? 'Not stated in source'}</dd>
          <dt style={{ color: 'var(--prism-muted)' }}>Role</dt>
          <dd>{device.role ?? 'Not stated in source'}</dd>
          <dt style={{ color: 'var(--prism-muted)' }}>Interfaces up</dt>
          <dd>
            {upInterfaces} of {interfaces.length}
          </dd>
        </dl>
        {device.notes ? (
          <p className="mt-2 text-sm" style={{ color: 'var(--prism-muted)' }}>
            {device.notes}
          </p>
        ) : null}
      </Section>

      <Section title="Interfaces">
        {interfaces.length === 0 ? (
          <Empty text="No interfaces stated for this device." />
        ) : (
          <div className="prism-scroll overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr style={{ color: 'var(--prism-muted)' }}>
                  <th className="py-1 pr-3">Interface</th>
                  <th className="py-1 pr-3">IP / Mask</th>
                  <th className="py-1 pr-3">MAC</th>
                  <th className="py-1 pr-3">VLAN / Mode</th>
                  <th className="py-1 pr-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {interfaces.map((iface) => (
                  <tr key={iface.id} className="border-t" style={{ borderColor: 'var(--prism-border)' }}>
                    <td className="py-1 pr-3">
                      {iface.name}
                      {iface.description ? (
                        <span className="block text-xs" style={{ color: 'var(--prism-muted)' }}>
                          {iface.description}
                        </span>
                      ) : null}
                    </td>
                    <td className="py-1 pr-3">
                      {iface.ip ? `${iface.ip}${iface.mask ? ` / ${iface.mask}` : ''}` : 'No IP stated'}
                    </td>
                    <td className="py-1 pr-3 font-mono text-xs">{iface.mac}</td>
                    <td className="py-1 pr-3">
                      {iface.vlan !== undefined ? `VLAN ${iface.vlan}` : ''}
                      {iface.mode ? ` ${iface.mode}` : ''}
                      {iface.allowedVlans && iface.allowedVlans.length > 0
                        ? ` (allowed ${iface.allowedVlans.join(', ')})`
                        : ''}
                      {iface.vlan === undefined && !iface.mode ? 'Not stated' : ''}
                    </td>
                    <td
                      className="py-1 pr-3 font-semibold"
                      style={{
                        color:
                          iface.status === 'up'
                            ? 'var(--prism-emerald)'
                            : 'var(--prism-red)',
                      }}
                    >
                      {iface.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      <Section title="VLANs">
        {!device.vlans || device.vlans.length === 0 ? (
          <Empty text="No VLANs stated for this device." />
        ) : (
          <ul className="text-sm">
            {device.vlans.map((v) => (
              <li key={v.id}>
                VLAN {v.id} ({v.name})
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="Routing table">
        {!device.routes || device.routes.length === 0 ? (
          <Empty text="No routes stated for this device." />
        ) : (
          <div className="prism-scroll overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr style={{ color: 'var(--prism-muted)' }}>
                  <th className="py-1 pr-3">Network</th>
                  <th className="py-1 pr-3">Mask</th>
                  <th className="py-1 pr-3">Next hop</th>
                  <th className="py-1 pr-3">Interface</th>
                  <th className="py-1 pr-3">Protocol</th>
                  <th className="py-1 pr-3">Admin distance</th>
                </tr>
              </thead>
              <tbody>
                {device.routes.map((r, i) => (
                  <tr key={`${r.network}-${r.outInterface}-${i}`} className="border-t" style={{ borderColor: 'var(--prism-border)' }}>
                    <td className="py-1 pr-3 font-mono text-xs">{r.network}</td>
                    <td className="py-1 pr-3 font-mono text-xs">{r.mask}</td>
                    <td className="py-1 pr-3 font-mono text-xs">{r.nextHop}</td>
                    <td className="py-1 pr-3">{r.outInterface}</td>
                    <td className="py-1 pr-3">{r.protocol}</td>
                    <td className="py-1 pr-3">{r.adminDistance}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      <Section title="MAC address table">
        {!device.macTable || device.macTable.length === 0 ? (
          <Empty text="No MAC address table entries stated for this device." />
        ) : (
          <div className="prism-scroll overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr style={{ color: 'var(--prism-muted)' }}>
                  <th className="py-1 pr-3">MAC</th>
                  <th className="py-1 pr-3">VLAN</th>
                  <th className="py-1 pr-3">Port</th>
                  <th className="py-1 pr-3">Type</th>
                </tr>
              </thead>
              <tbody>
                {device.macTable.map((m, i) => (
                  <tr key={`${m.mac}-${m.port}-${i}`} className="border-t" style={{ borderColor: 'var(--prism-border)' }}>
                    <td className="py-1 pr-3 font-mono text-xs">{m.mac}</td>
                    <td className="py-1 pr-3">{m.vlan}</td>
                    <td className="py-1 pr-3">{m.port}</td>
                    <td className="py-1 pr-3">{m.type}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      <Section title="ARP table">
        {!device.arp || device.arp.length === 0 ? (
          <Empty text="No ARP entries stated for this device." />
        ) : (
          <div className="prism-scroll overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr style={{ color: 'var(--prism-muted)' }}>
                  <th className="py-1 pr-3">IP</th>
                  <th className="py-1 pr-3">MAC</th>
                  <th className="py-1 pr-3">Interface</th>
                </tr>
              </thead>
              <tbody>
                {device.arp.map((a, i) => (
                  <tr key={`${a.ip}-${a.interface}-${i}`} className="border-t" style={{ borderColor: 'var(--prism-border)' }}>
                    <td className="py-1 pr-3 font-mono text-xs">{a.ip}</td>
                    <td className="py-1 pr-3 font-mono text-xs">{a.mac}</td>
                    <td className="py-1 pr-3">{a.interface}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      <Section title="OSPF neighbors">
        {!device.ospfNeighbors || device.ospfNeighbors.length === 0 ? (
          <Empty text="No OSPF neighbors stated for this device." />
        ) : (
          <div className="prism-scroll overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr style={{ color: 'var(--prism-muted)' }}>
                  <th className="py-1 pr-3">Neighbor ID</th>
                  <th className="py-1 pr-3">Address</th>
                  <th className="py-1 pr-3">Interface</th>
                  <th className="py-1 pr-3">State</th>
                  <th className="py-1 pr-3">Area</th>
                  <th className="py-1 pr-3">Dead time</th>
                </tr>
              </thead>
              <tbody>
                {device.ospfNeighbors.map((n, i) => (
                  <tr key={`${n.neighborId}-${n.interface}-${i}`} className="border-t" style={{ borderColor: 'var(--prism-border)' }}>
                    <td className="py-1 pr-3 font-mono text-xs">{n.neighborId}</td>
                    <td className="py-1 pr-3 font-mono text-xs">{n.address}</td>
                    <td className="py-1 pr-3">{n.interface}</td>
                    <td className="py-1 pr-3">{n.state}</td>
                    <td className="py-1 pr-3">{n.area}</td>
                    <td className="py-1 pr-3">{n.deadTime}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      <Section title="BGP neighbors">
        {!device.bgpNeighbors || device.bgpNeighbors.length === 0 ? (
          <Empty text="No BGP neighbors stated for this device." />
        ) : (
          <div className="prism-scroll overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr style={{ color: 'var(--prism-muted)' }}>
                  <th className="py-1 pr-3">Neighbor</th>
                  <th className="py-1 pr-3">AS</th>
                  <th className="py-1 pr-3">State</th>
                  <th className="py-1 pr-3">Uptime</th>
                  <th className="py-1 pr-3">Prefixes received</th>
                </tr>
              </thead>
              <tbody>
                {device.bgpNeighbors.map((n, i) => (
                  <tr key={`${n.neighbor}-${i}`} className="border-t" style={{ borderColor: 'var(--prism-border)' }}>
                    <td className="py-1 pr-3 font-mono text-xs">{n.neighbor}</td>
                    <td className="py-1 pr-3">{n.as}</td>
                    <td className="py-1 pr-3">{n.state}</td>
                    <td className="py-1 pr-3">{n.uptime}</td>
                    <td className="py-1 pr-3">{n.prefixesReceived}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      <Section title="VRRP groups">
        {!device.vrrpGroups || device.vrrpGroups.length === 0 ? (
          <Empty text="No VRRP groups stated for this device." />
        ) : (
          <ul className="text-sm">
            {device.vrrpGroups.map((g) => (
              <li key={g.id}>
                VRRP {g.id}: virtual IP {g.virtualIp}, {g.state}, priority {g.priority}, interface {g.interface}
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="DHCP pools">
        {!device.dhcpPools || device.dhcpPools.length === 0 ? (
          <Empty text="No DHCP pools stated for this device." />
        ) : (
          <div className="prism-scroll overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr style={{ color: 'var(--prism-muted)' }}>
                  <th className="py-1 pr-3">Pool</th>
                  <th className="py-1 pr-3">Network</th>
                  <th className="py-1 pr-3">Gateway</th>
                  <th className="py-1 pr-3">DNS</th>
                  <th className="py-1 pr-3">Lease (days)</th>
                  <th className="py-1 pr-3">Excluded</th>
                </tr>
              </thead>
              <tbody>
                {device.dhcpPools.map((p) => (
                  <tr key={p.name} className="border-t" style={{ borderColor: 'var(--prism-border)' }}>
                    <td className="py-1 pr-3">{p.name}</td>
                    <td className="py-1 pr-3 font-mono text-xs">
                      {p.network} / {p.mask}
                    </td>
                    <td className="py-1 pr-3 font-mono text-xs">{p.gateway}</td>
                    <td className="py-1 pr-3 font-mono text-xs">{p.dns.join(', ')}</td>
                    <td className="py-1 pr-3">{p.leaseDays}</td>
                    <td className="py-1 pr-3 font-mono text-xs">{p.excluded || 'None stated'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      <Section title="Firewall rules">
        {!device.firewallRules || device.firewallRules.length === 0 ? (
          <Empty text="No firewall rules stated for this device." />
        ) : (
          <div className="prism-scroll overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr style={{ color: 'var(--prism-muted)' }}>
                  <th className="py-1 pr-3">Rule</th>
                  <th className="py-1 pr-3">From / To</th>
                  <th className="py-1 pr-3">Source</th>
                  <th className="py-1 pr-3">Destination</th>
                  <th className="py-1 pr-3">Service</th>
                  <th className="py-1 pr-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {device.firewallRules.map((r) => (
                  <tr key={r.id} className="border-t" style={{ borderColor: 'var(--prism-border)' }}>
                    <td className="py-1 pr-3">
                      {r.id} {r.name}
                    </td>
                    <td className="py-1 pr-3">
                      {r.fromZone} to {r.toZone}
                    </td>
                    <td className="py-1 pr-3 font-mono text-xs">{r.source}</td>
                    <td className="py-1 pr-3 font-mono text-xs">{r.destination}</td>
                    <td className="py-1 pr-3">{r.service}</td>
                    <td
                      className="py-1 pr-3 font-semibold"
                      style={{
                        color:
                          r.action === 'allow'
                            ? 'var(--prism-emerald)'
                            : 'var(--prism-red)',
                      }}
                    >
                      {r.action}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      <Section title="Utilization (simulated)">
        <p className="text-sm" style={{ color: 'var(--prism-muted)' }}>
          Simulated values for this educational simulation, not live production metrics.
        </p>
        <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
          <dt style={{ color: 'var(--prism-muted)' }}>CPU (simulated)</dt>
          <dd>{device.cpuPct !== undefined ? `${device.cpuPct}%` : 'Not stated'}</dd>
          <dt style={{ color: 'var(--prism-muted)' }}>Memory (simulated)</dt>
          <dd>{device.memPct !== undefined ? `${device.memPct}%` : 'Not stated'}</dd>
        </dl>
      </Section>

      <Section title="Configuration">
        {device.config ? (
          <pre
            className="prism-scroll max-h-64 overflow-auto whitespace-pre-wrap rounded p-3 font-mono text-xs"
            style={{ background: 'var(--prism-bg-soft)' }}
          >
            {device.config}
          </pre>
        ) : (
          <Empty text="No configuration text stated for this device." />
        )}
      </Section>

      <Section title="Security policies">
        {!device.firewallRules || device.firewallRules.length === 0 ? (
          <Empty text="No security policies stated for this device." />
        ) : (
          <ul className="text-sm">
            {device.firewallRules.map((r) => (
              <li key={r.id}>
                {r.name}: {r.fromZone} to {r.toZone}, {r.source} to {r.destination},{' '}
                {r.service},{' '}
                <span
                  className="font-semibold"
                  style={{
                    color:
                      r.action === 'allow'
                        ? 'var(--prism-emerald)'
                        : 'var(--prism-red)',
                  }}
                >
                  {r.action}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="Event log (simulated)">
        <p className="text-sm" style={{ color: 'var(--prism-muted)' }}>
          Simulated event log lines derived from this device, not live production logs.
        </p>
        <ul className="mt-2 space-y-1 font-mono text-xs">
          {eventLines.map((line, i) => (
            <li key={i}>{line}</li>
          ))}
        </ul>
      </Section>
    </div>
  )
}
