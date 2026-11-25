import { useMemo, useState } from 'react'
import { useSim } from '../store/simStore'
import type { CapFrame } from '../engine/types'

function protocolColor(protocol: string): string {
  const p = protocol.toLowerCase()
  if (p.includes('arp')) return '#fbbf24'
  if (p.includes('dns')) return '#c4b5fd'
  if (p.includes('tcp')) return '#22d3ee'
  if (p.includes('icmp')) return '#34d399'
  if (p.includes('ospf')) return '#fb923c'
  if (p.includes('dhcp')) return '#60a5fa'
  if (p.includes('bgp')) return '#a78bfa'
  if (p.includes('stp')) return '#9ca3af'
  return 'var(--prism-text)'
}

export default function PacketPanel() {
  const { result, selectedFrame, setSelectedFrame } = useSim()
  const [filter, setFilter] = useState('')

  const frames = result?.frames ?? []

  const filteredFrames = useMemo(() => {
    const q = filter.trim().toLowerCase()
    if (!q) return frames
    return frames.filter(
      (f) =>
        f.protocol.toLowerCase().includes(q) ||
        f.src.toLowerCase().includes(q) ||
        f.dst.toLowerCase().includes(q) ||
        f.info.toLowerCase().includes(q),
    )
  }, [frames, filter])

  const detailFrame: CapFrame | null = selectedFrame ?? null

  return (
    <div className="prism-panel p-4">
      <h2 className="text-base font-semibold">Packet Capture</h2>
      <p className="mt-1 text-sm" style={{ color: 'var(--prism-muted)' }}>
        Simulated capture - educational simulation, not live production traffic.
      </p>

      {!result || frames.length === 0 ? (
        <p className="mt-4 text-sm" style={{ color: 'var(--prism-muted)' }}>
          Send a packet to capture frames (simulated capture)
        </p>
      ) : (
        <>
          {!result.ok && result.failureReason ? (
            <p className="mt-3 text-sm" style={{ color: 'var(--prism-red)' }}>
              Packet not delivered (simulated): {result.summary}
            </p>
          ) : (
            <p className="mt-3 text-sm" style={{ color: 'var(--prism-muted)' }}>
              {result.summary}
            </p>
          )}

          <div className="mt-4">
            <h3 className="text-sm font-semibold" style={{ color: 'var(--prism-cyan)' }}>
              Event timeline (simulated)
            </h3>
            <div className="prism-scroll mt-2 flex gap-2 overflow-x-auto pb-1">
              {result.steps.map((step) => (
                <div
                  key={step.seq}
                  className="shrink-0 rounded border px-2 py-1 text-xs"
                  style={{ borderColor: 'var(--prism-border)', background: 'var(--prism-panel-2)' }}
                  title={`${step.action}: ${step.detail}`}
                >
                  <span className="font-semibold">
                    {step.seq}. {step.timeMs} ms
                  </span>
                  <span className="block">{step.deviceName}</span>
                  <span className="block" style={{ color: 'var(--prism-muted)' }}>
                    {step.action}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <label htmlFor="prism-packet-filter" className="text-sm font-semibold">
              Display filter
            </label>
            <input
              id="prism-packet-filter"
              className="prism-input mt-1 w-full"
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder='Filter by protocol, source, destination or info, e.g. arp or tcp'
            />
            <p className="mt-1 text-xs" style={{ color: 'var(--prism-muted)' }}>
              Showing {filteredFrames.length} of {frames.length} frames (simulated).
            </p>
          </div>

          {filteredFrames.length === 0 ? (
            <p className="mt-4 text-sm" style={{ color: 'var(--prism-muted)' }}>
              No frames match the display filter.
            </p>
          ) : (
            <div className="prism-scroll mt-3 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr style={{ color: 'var(--prism-muted)' }}>
                    <th className="py-1 pr-3">No.</th>
                    <th className="py-1 pr-3">Time (ms)</th>
                    <th className="py-1 pr-3">Source</th>
                    <th className="py-1 pr-3">Destination</th>
                    <th className="py-1 pr-3">Protocol</th>
                    <th className="py-1 pr-3">Length</th>
                    <th className="py-1 pr-3">Info</th>
                    <th className="py-1 pr-3">VLAN</th>
                    <th className="py-1 pr-3">TTL</th>
                    <th className="py-1 pr-3">Ports</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFrames.map((frame) => {
                    const isSelected = detailFrame?.no === frame.no
                    return (
                      <tr
                        key={frame.no}
                        onClick={() => setSelectedFrame(frame)}
                        className="cursor-pointer border-t"
                        style={{
                          borderColor: 'var(--prism-border)',
                          background: isSelected ? 'var(--prism-panel-2)' : undefined,
                          color: protocolColor(frame.protocol),
                        }}
                        aria-selected={isSelected}
                      >
                        <td className="py-1 pr-3">{frame.no}</td>
                        <td className="py-1 pr-3">{frame.timeMs}</td>
                        <td className="py-1 pr-3 font-mono text-xs">{frame.src}</td>
                        <td className="py-1 pr-3 font-mono text-xs">{frame.dst}</td>
                        <td className="py-1 pr-3 font-semibold">{frame.protocol}</td>
                        <td className="py-1 pr-3">{frame.length}</td>
                        <td className="py-1 pr-3" style={{ color: 'var(--prism-text)' }}>
                          {frame.info}
                        </td>
                        <td className="py-1 pr-3">{frame.vlan !== undefined ? frame.vlan : ''}</td>
                        <td className="py-1 pr-3">{frame.ttl !== undefined ? frame.ttl : ''}</td>
                        <td className="py-1 pr-3 font-mono text-xs">
                          {frame.srcPort !== undefined || frame.dstPort !== undefined
                            ? `${frame.srcPort ?? ''} to ${frame.dstPort ?? ''}`
                            : ''}
                          {frame.flags ? ` ${frame.flags}` : ''}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {detailFrame ? (
            <div className="mt-4 rounded border p-3" style={{ borderColor: 'var(--prism-border)' }}>
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm font-semibold">
                  Frame {detailFrame.no} detail: {detailFrame.protocol} {detailFrame.src} to{' '}
                  {detailFrame.dst}
                </h3>
                <button
                  type="button"
                  className="prism-btn"
                  onClick={() => setSelectedFrame(null)}
                >
                  Close detail
                </button>
              </div>
              <p className="mt-1 text-sm" style={{ color: 'var(--prism-muted)' }}>
                {detailFrame.info}
              </p>
              <div className="mt-2 space-y-2">
                {Object.entries(detailFrame.layers).map(([layer, lines]) => (
                  <details key={layer} open>
                    <summary className="cursor-pointer text-sm font-semibold" style={{ color: 'var(--prism-cyan)' }}>
                      {layer}
                    </summary>
                    <ul className="mt-1 list-disc pl-5 font-mono text-xs">
                      {lines.map((line, i) => (
                        <li key={i}>{line}</li>
                      ))}
                    </ul>
                  </details>
                ))}
                {Object.keys(detailFrame.layers).length === 0 ? (
                  <p className="text-sm" style={{ color: 'var(--prism-muted)' }}>
                    No layer details for this frame.
                  </p>
                ) : null}
              </div>
            </div>
          ) : (
            <p className="mt-4 text-sm" style={{ color: 'var(--prism-muted)' }}>
              Click a frame to see its layers.
            </p>
          )}
        </>
      )}
    </div>
  )
}
