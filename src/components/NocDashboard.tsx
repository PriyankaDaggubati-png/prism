import { useMemo, useState } from 'react'
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Pause,
  Play,
  RotateCcw,
  Send,
  Shield,
  StepForward,
  Terminal,
} from 'lucide-react'
import { useSim } from '../store/simStore'
import { listFailures } from '../engine'
import type { FailureScenario, Protocol } from '../engine/types'

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function formatTime(timeMs: number): string {
  return new Date(timeMs).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div
      style={{
        background: 'var(--prism-panel-2)',
        border: '1px solid var(--prism-border)',
        borderRadius: 8,
        padding: '10px 12px',
      }}
    >
      <div style={{ color: 'var(--prism-muted)', fontSize: '0.75rem' }}>{label}</div>
      <div style={{ fontSize: '1.25rem', fontWeight: 700, lineHeight: 1.3 }}>{value}</div>
      {sub && <div style={{ color: 'var(--prism-muted)', fontSize: '0.72rem' }}>{sub}</div>}
    </div>
  )
}

export default function NocDashboard() {
  const {
    topology,
    state,
    result,
    playing,
    stepIndex,
    speed,
    protocol,
    srcId,
    dstId,
    sendPacket,
    setPlaying,
    setStepIndex,
    setSpeed,
    setSrcId,
    setDstId,
    setProtocol,
    toggleFailure,
    restoreAll,
    setSelectedFrame,
    selectDevice,
    stats,
    eventLog,
    reducedMotion,
  } = useSim()

  const [failureId, setFailureId] = useState('')

  const failures = useMemo(() => listFailures(topology.id), [topology.id])
  const activeFailures = useMemo(
    () => failures.filter((f: FailureScenario) => state.failures.includes(f.id)),
    [failures, state],
  )

  // Offline = explicitly down, or hit by an active failure scenario.
  const downFromFailures = useMemo(
    () => new Set(activeFailures.flatMap((f: FailureScenario) => f.downDevices ?? [])),
    [activeFailures],
  )
  const offlineDevices = useMemo(
    () =>
      topology.devices.filter(
        (d) => state.downDevices.includes(d.id) || downFromFailures.has(d.id),
      ),
    [topology, state.downDevices, downFromFailures],
  )
  const onlineDevices = topology.devices.length - offlineDevices.length
  const offlineIds = useMemo(() => new Set(offlineDevices.map((d) => d.id)), [offlineDevices])

  const activeInterfaces = useMemo(
    () =>
      topology.devices.reduce(
        (count, d) =>
          count +
          d.interfaces.filter(
            (i) =>
              i.status === 'up' &&
              !offlineIds.has(d.id) &&
              !state.downInterfaces.includes(i.id),
          ).length,
        0,
      ),
    [topology, offlineIds, state.downInterfaces],
  )

  const neighbors = useMemo(
    () =>
      topology.devices.reduce(
        (count, d) =>
          count + (d.ospfNeighbors?.length ?? 0) + (d.bgpNeighbors?.length ?? 0),
        0,
      ),
    [topology],
  )

  const firewallAllows = result?.steps.filter((s) => s.kind === 'allow').length ?? 0
  const firewallDenies = result?.steps.filter((s) => s.kind === 'deny').length ?? 0
  const errorSteps = result?.steps.filter((s) => s.kind === 'error').length ?? 0
  const securityAlerts = firewallDenies + errorSteps + activeFailures.length

  const vpnDown = activeFailures.some((f: FailureScenario) =>
    /ipsec|vpn|tunnel/i.test(`${f.id} ${f.title} ${f.category}`),
  )

  const packetLoss =
    result === null ? null : result.ok ? 0 : 100

  const convergence = useMemo(() => {
    if (topology.protocols.includes('ospf')) return '2-4 s'
    if (topology.protocols.includes('bgp')) return '30-60 s'
    if (topology.protocols.includes('hsrp') || topology.protocols.includes('vrrp')) return '1-3 s'
    return '1-2 s'
  }, [topology])

  const selectedFailure = failures.find((f: FailureScenario) => f.id === failureId)
  const selectedFailureActive = selectedFailure
    ? state.failures.includes(selectedFailure.id)
    : false

  const maxStep = result ? result.steps.length : 0
  const canStep = Boolean(result) && stepIndex < maxStep
  const firstRouterOrFirewall =
    topology.devices.find((d) => d.kind === 'router') ??
    topology.devices.find((d) => d.kind === 'firewall') ??
    topology.devices[0]
  const firstRouter =
    topology.devices.find((d) => d.kind === 'router') ?? topology.devices[0]

  const viewCli = () => {
    if (!firstRouterOrFirewall) return
    selectDevice(firstRouterOrFirewall.id)
    scrollToId('prism-cli')
  }
  const viewRoutingTable = () => {
    if (!firstRouter) return
    selectDevice(firstRouter.id)
    scrollToId('prism-inspector')
  }

  return (
    <section className="prism-panel" aria-label="Network operations center dashboard" style={{ padding: 16 }}>
      <div style={{ alignItems: 'center', display: 'flex', gap: 8, marginBottom: 12 }}>
        <Activity size={18} color="#22d3ee" aria-hidden />
        <h2 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>
          NOC Dashboard
        </h2>
        <span style={{ color: 'var(--prism-muted)', fontSize: '0.8rem' }}>
          {topology.title} · simulated
        </span>
      </div>

      <div
        style={{
          display: 'grid',
          gap: 10,
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        }}
      >
        <Stat label="Devices" value={`${topology.devices.length}`} sub={`${onlineDevices} online · ${offlineDevices.length} offline`} />
        <Stat label="Active interfaces" value={`${activeInterfaces}`} sub="up and not down (simulated)" />
        <Stat label="Packets sent" value={`${stats.sent}`} sub={`${stats.delivered} delivered · ${stats.dropped} dropped · ${stats.denied} denied`} />
        <Stat label="Frames captured" value={`${stats.frames}`} sub="simulated capture" />
        <Stat label="Routing neighbours" value={`${neighbors}`} sub="OSPF + BGP (simulated)" />
        <Stat
          label="Firewall events"
          value={`${firewallAllows} allow / ${firewallDenies} deny`}
          sub={result ? 'latest simulated packet' : 'send a packet to see events'}
        />
        <Stat
          label="VPN tunnel"
          value={vpnDown ? 'Down' : 'Up'}
          sub={vpnDown ? 'IPsec failure active (simulated)' : 'IPsec tunnel (simulated)'}
        />
        <Stat
          label="Security alerts"
          value={`${securityAlerts}`}
          sub="deny + error steps + active failures"
        />
        <Stat
          label="Packet loss (simulated)"
          value={packetLoss === null ? '—' : `${packetLoss}%`}
          sub={result ? (result.ok ? 'last packet delivered' : 'last packet failed') : 'send a packet first'}
        />
        <Stat
          label="Convergence (simulated)"
          value={convergence}
          sub="plausible simulated value, not measured"
        />
      </div>

      {securityAlerts > 0 && (
        <p style={{ alignItems: 'center', color: 'var(--prism-red)', display: 'flex', gap: 6, fontSize: '0.85rem', margin: '12px 0 0' }}>
          <AlertTriangle size={15} aria-hidden />
          {securityAlerts} security alert{securityAlerts === 1 ? '' : 's'} in the latest simulated run
          {activeFailures.length > 0 ? `, including ${activeFailures.length} active failure scenario${activeFailures.length === 1 ? '' : 's'}.` : '.'}
        </p>
      )}

      {/* Playback controls */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 16 }} role="group" aria-label="Packet playback controls">
        <button type="button" className="prism-btn prism-btn-primary" onClick={sendPacket}>
          <Send size={14} aria-hidden /> Send packet
        </button>
        <button
          type="button"
          className="prism-btn"
          onClick={() => setPlaying(true)}
          disabled={!result || playing || stepIndex >= maxStep}
        >
          <Play size={14} aria-hidden /> Play
        </button>
        <button type="button" className="prism-btn" onClick={() => setPlaying(false)} disabled={!playing}>
          <Pause size={14} aria-hidden /> Pause
        </button>
        <button
          type="button"
          className="prism-btn"
          onClick={() => setStepIndex(Math.min(stepIndex + 1, maxStep))}
          disabled={!canStep}
        >
          <StepForward size={14} aria-hidden /> Step forward
        </button>
        <button
          type="button"
          className="prism-btn"
          onClick={() => {
            setStepIndex(0)
            setPlaying(true)
          }}
          disabled={!result}
        >
          <RotateCcw size={14} aria-hidden /> Restart
        </button>
        <label style={{ alignItems: 'center', display: 'flex', gap: 6, fontSize: '0.85rem' }}>
          Speed
          <select
            className="prism-select"
            value={String(speed)}
            onChange={(e) => setSpeed(Number(e.target.value))}
            aria-label="Playback speed"
          >
            <option value="0.5">0.5x</option>
            <option value="1">1x</option>
            <option value="2">2x</option>
            <option value="4">4x</option>
          </select>
        </label>
      </div>

      {/* Packet setup */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }} role="group" aria-label="Packet setup">
        <label style={{ alignItems: 'center', display: 'flex', gap: 6, fontSize: '0.85rem' }}>
          Source
          <select className="prism-select" value={srcId} onChange={(e) => setSrcId(e.target.value)} aria-label="Source endpoint">
            {topology.endpoints.map((ep) => (
              <option key={ep.id} value={ep.id}>
                {ep.label} ({ep.ip})
              </option>
            ))}
          </select>
        </label>
        <label style={{ alignItems: 'center', display: 'flex', gap: 6, fontSize: '0.85rem' }}>
          Destination
          <select className="prism-select" value={dstId} onChange={(e) => setDstId(e.target.value)} aria-label="Destination endpoint">
            {topology.endpoints.map((ep) => (
              <option key={ep.id} value={ep.id}>
                {ep.label} ({ep.ip})
              </option>
            ))}
          </select>
        </label>
        <label style={{ alignItems: 'center', display: 'flex', gap: 6, fontSize: '0.85rem' }}>
          Protocol
          <select
            className="prism-select"
            value={protocol}
            onChange={(e) => setProtocol(e.target.value as Protocol)}
            aria-label="Protocol"
          >
            {topology.protocols.map((p) => (
              <option key={p} value={p}>
                {p.toUpperCase()}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Failure controls */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }} role="group" aria-label="Failure simulation controls">
        <label style={{ alignItems: 'center', display: 'flex', gap: 6, fontSize: '0.85rem' }}>
          Simulate failure
          <select
            className="prism-select"
            value={failureId}
            onChange={(e) => setFailureId(e.target.value)}
            aria-label="Failure scenario"
          >
            <option value="">Choose a failure…</option>
            {failures.map((f: FailureScenario) => (
              <option key={f.id} value={f.id}>
                {f.title}
                {state.failures.includes(f.id) ? ' (active)' : ''}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          className="prism-btn"
          onClick={() => {
            if (failureId) toggleFailure(failureId)
          }}
          disabled={!failureId}
        >
          {selectedFailureActive ? 'Clear failure' : 'Apply failure'}
        </button>
        <button type="button" className="prism-btn" onClick={restoreAll}>
          <Shield size={14} aria-hidden /> Restore network
        </button>
        {activeFailures.length > 0 && (
          <span style={{ alignSelf: 'center', color: 'var(--prism-red)', fontSize: '0.85rem' }}>
            Active: {activeFailures.map((f: FailureScenario) => f.title).join(', ')}
          </span>
        )}
      </div>

      {/* Inspect / jump controls */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }} role="group" aria-label="Inspect and navigate">
        <button
          type="button"
          className="prism-btn"
          onClick={() => setSelectedFrame(result?.frames[0] ?? null)}
          disabled={!result || result.frames.length === 0}
        >
          Inspect packet
        </button>
        <button type="button" className="prism-btn" onClick={viewCli}>
          <Terminal size={14} aria-hidden /> View CLI
        </button>
        <button type="button" className="prism-btn" onClick={viewRoutingTable}>
          View routing table
        </button>
        <button type="button" className="prism-btn" onClick={() => scrollToId('prism-scene')}>
          View topology <ArrowRight size={14} aria-hidden />
        </button>
      </div>

      {result && (
        <p style={{ color: 'var(--prism-muted)', fontSize: '0.85rem', margin: '12px 0 0' }}>
          {result.ok ? 'Delivered' : 'Failed'}: {result.summary} Step {Math.min(stepIndex, maxStep)} of {maxStep}
          {result.failureReason ? ` (${result.failureReason})` : ''} · simulated.
        </p>
      )}

      {/* Event log */}
      <div style={{ marginTop: 16 }}>
        <h3 style={{ fontSize: '0.9rem', fontWeight: 700, margin: '0 0 8px' }}>
          Event log (simulated)
        </h3>
        {eventLog.length === 0 ? (
          <p style={{ color: 'var(--prism-muted)', fontSize: '0.85rem', margin: 0 }}>
            No events yet. Send a packet or apply a failure to see events here.
          </p>
        ) : (
          <ol
            className="prism-scroll"
            style={{
              listStyle: 'none',
              margin: 0,
              maxHeight: 220,
              overflowY: 'auto',
              padding: 0,
            }}
          >
            {eventLog.slice(-8).reverse().map((entry, i) => (
              <li
                key={`${entry.timeMs}-${i}`}
                style={{
                  borderLeft: `3px solid ${
                    entry.kind === 'error'
                      ? 'var(--prism-red)'
                      : entry.kind === 'warn'
                        ? 'var(--prism-orange)'
                        : entry.kind === 'ok'
                          ? 'var(--prism-emerald)'
                          : 'var(--prism-cyan)'
                  }`,
                  fontSize: '0.85rem',
                  marginBottom: 6,
                  padding: '4px 0 4px 10px',
                }}
              >
                <span style={{ color: 'var(--prism-muted)' }}>{formatTime(entry.timeMs)}</span>{' '}
                {entry.text}
              </li>
            ))}
          </ol>
        )}
        <p style={{ color: 'var(--prism-muted)', fontSize: '0.75rem', margin: '8px 0 0' }}>
          {reducedMotion ? 'Reduced motion is on, packet animation jumps to the final step.' : ''}
        </p>
      </div>
    </section>
  )
}
