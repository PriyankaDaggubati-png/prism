import { useMemo } from 'react'
import { useSim } from '../store/simStore'
import type { DeviceKind } from '../engine/types'

const WIDTH = 800
const HEIGHT = 500
const PAD_X = 70
const PAD_Y = 50

const KIND_COLORS: Record<DeviceKind, string> = {
  alb: '#fb923c',
  cloud: '#e6f0ff',
  ec2: '#a78bfa',
  firewall: '#fb923c',
  host: '#94a3b8',
  ids: '#f87171',
  igw: '#22d3ee',
  natgw: '#34d399',
  router: '#22d3ee',
  server: '#a78bfa',
  siem: '#f87171',
  switch: '#34d399',
  tgw: '#a78bfa',
  vpc: '#a78bfa',
}

const KIND_LETTER: Record<DeviceKind, string> = {
  alb: 'A',
  cloud: 'C',
  ec2: 'E',
  firewall: 'F',
  host: 'H',
  ids: 'I',
  igw: 'I',
  natgw: 'N',
  router: 'R',
  server: 'S',
  siem: 'S',
  switch: 'S',
  tgw: 'T',
  vpc: 'V',
}

export default function Topo2D() {
  const { topology, state, result, stepIndex, selectedDeviceId, selectDevice, srcId, dstId } =
    useSim()

  const srcEndpoint = topology.endpoints.find((e) => e.id === srcId)
  const dstEndpoint = topology.endpoints.find((e) => e.id === dstId)

  const layout = useMemo(() => {
    const xs = topology.devices.map((d) => d.position[0])
    const zs = topology.devices.map((d) => d.position[2])
    const minX = Math.min(...xs)
    const maxX = Math.max(...xs)
    const minZ = Math.min(...zs)
    const maxZ = Math.max(...zs)
    const rangeX = maxX - minX || 1
    const rangeZ = maxZ - minZ || 1
    const toSvg = (x: number, z: number): [number, number] => [
      PAD_X + ((x - minX) / rangeX) * (WIDTH - PAD_X * 2),
      PAD_Y + ((z - minZ) / rangeZ) * (HEIGHT - PAD_Y * 2),
    ]
    return {
      byId: new Map(topology.devices.map((d) => [d.id, toSvg(d.position[0], d.position[2])])),
      toSvg,
    }
  }, [topology])

  const packetPos = useMemo((): [number, number] | null => {
    if (!result || result.steps.length === 0) return null
    const idx = Math.min(Math.max(stepIndex, 0), result.steps.length - 1)
    const step = result.steps[idx]
    return layout.byId.get(step.deviceId) ?? null
  }, [result, stepIndex, layout])

  const pathPoints = useMemo(() => {
    if (!result) return ''
    return result.path
      .map((id) => layout.byId.get(id))
      .filter((p): p is [number, number] => Boolean(p))
      .map(([x, y]) => `${x},${y}`)
      .join(' ')
  }, [result, layout])

  return (
    <div className="prism-panel" style={{ padding: 12 }}>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        width="100%"
        height="auto"
        role="img"
        aria-label={`2D topology of ${topology.title}: ${topology.devices.length} devices, ${topology.links.length} links`}
        style={{ display: 'block', maxHeight: 520 }}
      >
        {/* Links */}
        {topology.links.map((link) => {
          const from = layout.byId.get(link.from)
          const to = layout.byId.get(link.to)
          if (!from || !to) return null
          const isDown =
            link.status === 'down' || state.downLinks.includes(link.id)
          const isTrunk = (link.trunkVlans?.length ?? 0) > 0
          const stroke = isDown ? '#f87171' : isTrunk ? '#a78bfa' : '#22d3ee'
          return (
            <line
              key={link.id}
              x1={from[0]}
              y1={from[1]}
              x2={to[0]}
              y2={to[1]}
              stroke={stroke}
              strokeWidth={isDown ? 3 : 2}
              strokeDasharray={link.media === 'fiber' || isDown ? '7 5' : undefined}
              opacity={isDown ? 0.95 : 0.7}
            >
              <title>
                {link.from} ({link.fromIf}) to {link.to} ({link.toIf})
                {isTrunk ? `, trunk VLANs ${link.trunkVlans?.join(', ')}` : ''}
                {isDown ? ', link down' : ''}
              </title>
            </line>
          )
        })}

        {/* Simulated packet path */}
        {pathPoints && (
          <polyline
            points={pathPoints}
            fill="none"
            stroke={result?.ok ? '#34d399' : '#f87171'}
            strokeWidth={2}
            strokeDasharray="4 6"
            opacity={0.9}
          />
        )}

        {/* Device nodes */}
        {topology.devices.map((device) => {
          const pos = layout.byId.get(device.id)
          if (!pos) return null
          const [cx, cy] = pos
          const isDown = state.downDevices.includes(device.id)
          const isSelected = selectedDeviceId === device.id
          const isSrc = srcEndpoint?.deviceId === device.id
          const isDst = dstEndpoint?.deviceId === device.id
          const color = isDown ? '#f87171' : KIND_COLORS[device.kind]
          const w = 104
          const h = 48
          return (
            <g
              key={device.id}
              role="button"
              tabIndex={0}
              aria-label={`${device.hostname}, ${device.kind}${isDown ? ', down' : ''}${isSelected ? ', selected' : ''}. Press Enter to select.`}
              aria-pressed={isSelected}
              onClick={() => selectDevice(device.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  selectDevice(device.id)
                }
              }}
              style={{ cursor: 'pointer', outline: 'none' }}
            >
              <rect
                x={cx - w / 2}
                y={cy - h / 2}
                width={w}
                height={h}
                rx={9}
                fill={isDown ? 'rgba(248,113,113,0.18)' : 'rgba(12,26,54,0.9)'}
                stroke={isSelected ? '#22d3ee' : color}
                strokeWidth={isSelected ? 3 : 2}
                opacity={isDown ? 0.75 : 1}
              />
              <circle cx={cx - w / 2 + 18} cy={cy} r={11} fill={color} opacity={isDown ? 0.6 : 1} />
              <text
                x={cx - w / 2 + 18}
                y={cy + 4}
                textAnchor="middle"
                fontSize={11}
                fontWeight={700}
                fill="#060d1f"
              >
                {KIND_LETTER[device.kind]}
              </text>
              <text
                x={cx + 6}
                y={cy - 2}
                fontSize={11}
                fontWeight={600}
                fill={isDown ? '#f87171' : '#e6f0ff'}
              >
                {device.hostname.length > 13
                  ? `${device.hostname.slice(0, 12)}…`
                  : device.hostname}
              </text>
              <text x={cx + 6} y={cy + 13} fontSize={9} fill="#8fa8cc">
                {device.kind}
              </text>
              {isDown && (
                <text x={cx} y={cy - h / 2 - 6} textAnchor="middle" fontSize={10} fontWeight={700} fill="#f87171">
                  DOWN
                </text>
              )}
              {(isSrc || isDst) && (
                <text x={cx} y={cy + h / 2 + 14} textAnchor="middle" fontSize={9} fontWeight={700} fill="#34d399">
                  {isSrc ? 'SRC' : 'DST'}
                </text>
              )}
              <title>
                {device.hostname} ({device.kind})
                {device.model ? `, ${device.model}` : ''}
                {isDown ? ' - down' : ''}
              </title>
            </g>
          )
        })}

        {/* Packet dot */}
        {packetPos && (
          <circle
            cx={packetPos[0]}
            cy={packetPos[1]}
            r={8}
            fill="#22d3ee"
            stroke="#e6f0ff"
            strokeWidth={2}
            style={{ transition: 'cx 0.7s ease, cy 0.7s ease' }}
          >
            <title>
              Simulated packet, step {Math.min(stepIndex + 1, result?.steps.length ?? 0)} of{' '}
              {result?.steps.length ?? 0}
            </title>
          </circle>
        )}
      </svg>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 16,
          marginTop: 8,
          fontSize: '0.8rem',
          color: '#8fa8cc',
        }}
        aria-label="Legend"
      >
        <span><span style={{ color: '#22d3ee' }}>━</span> Link</span>
        <span><span style={{ color: '#22d3ee' }}>┄</span> Fibre link (dashed)</span>
        <span><span style={{ color: '#a78bfa' }}>━</span> Trunk link</span>
        <span><span style={{ color: '#f87171' }}>━</span> Failed / down (red)</span>
        <span><span style={{ color: '#34d399' }}>━</span> Simulated packet path</span>
        <span><span style={{ color: '#22d3ee' }}>●</span> Simulated packet</span>
      </div>
      <p style={{ color: '#8fa8cc', fontSize: '0.8rem', marginTop: 6 }}>
        2D topology view (simulated). Click a node, or Tab to it and press Enter, to inspect a device.
      </p>
    </div>
  )
}
