import { Component, useMemo, useRef, useState, type ReactNode } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Html, Line, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { useSim } from '../store/simStore'
import type { Device, DeviceKind } from '../engine/types'

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

const KIND_LABEL: Record<DeviceKind, string> = {
  alb: 'ALB',
  cloud: 'Cloud',
  ec2: 'EC2',
  firewall: 'Firewall',
  host: 'Host',
  ids: 'IDS',
  igw: 'IGW',
  natgw: 'NAT GW',
  router: 'Router',
  server: 'Server',
  siem: 'SIEM',
  switch: 'Switch',
  tgw: 'TGW',
  vpc: 'VPC',
}

function webglAvailable(): boolean {
  try {
    const canvas = document.createElement('canvas')
    return Boolean(
      canvas.getContext('webgl2') || canvas.getContext('webgl'),
    )
  } catch {
    return false
  }
}

class SceneErrorBoundary extends Component<
  { children: ReactNode; onError: () => void },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode; onError: () => void }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true }
  }

  componentDidCatch(): void {
    this.props.onError()
  }

  render(): ReactNode {
    if (this.state.hasError) return null
    return this.props.children
  }
}

function DeviceNode({ device }: { device: Device }) {
  const { selectedDeviceId, selectDevice, state } = useSim()
  const isSelected = selectedDeviceId === device.id
  const isDown = state.downDevices.includes(device.id)
  const baseColor = isDown ? '#f87171' : KIND_COLORS[device.kind]
  const [x, y, z] = device.position

  const handleClick = (e: { stopPropagation: () => void }) => {
    e.stopPropagation()
    selectDevice(device.id)
  }

  const body = (() => {
    switch (device.kind) {
      case 'router':
        return (
          <group>
            <mesh onClick={handleClick}>
              <boxGeometry args={[1.4, 0.7, 1]} />
              <meshStandardMaterial
                color={baseColor}
                transparent={isDown}
                opacity={isDown ? 0.55 : 1}
              />
            </mesh>
            <mesh position={[-0.45, 0.65, 0]}>
              <cylinderGeometry args={[0.03, 0.03, 0.7, 8]} />
              <meshStandardMaterial color={baseColor} />
            </mesh>
            <mesh position={[0.45, 0.65, 0]}>
              <cylinderGeometry args={[0.03, 0.03, 0.7, 8]} />
              <meshStandardMaterial color={baseColor} />
            </mesh>
            <mesh position={[-0.45, 1.05, 0]}>
              <sphereGeometry args={[0.07, 8, 8]} />
              <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" />
            </mesh>
            <mesh position={[0.45, 1.05, 0]}>
              <sphereGeometry args={[0.07, 8, 8]} />
              <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" />
            </mesh>
          </group>
        )
      case 'switch':
        return (
          <group>
            <mesh onClick={handleClick}>
              <boxGeometry args={[1.9, 0.35, 0.95]} />
              <meshStandardMaterial
                color={baseColor}
                transparent={isDown}
                opacity={isDown ? 0.55 : 1}
              />
            </mesh>
            {[-0.6, -0.2, 0.2, 0.6].map((px) => (
              <mesh key={px} position={[px, 0.2, 0.3]}>
                <boxGeometry args={[0.18, 0.06, 0.18]} />
                <meshStandardMaterial
                  color="#34d399"
                  emissive={isDown ? '#000000' : '#34d399'}
                />
              </mesh>
            ))}
          </group>
        )
      case 'firewall':
        return (
          <group>
            <mesh onClick={handleClick}>
              <boxGeometry args={[1.2, 0.95, 0.95]} />
              <meshStandardMaterial
                color={baseColor}
                transparent={isDown}
                opacity={isDown ? 0.55 : 1}
              />
            </mesh>
            <mesh position={[0, 0.75, 0]} rotation={[0, 0, Math.PI]}>
              <coneGeometry args={[0.32, 0.5, 4]} />
              <meshStandardMaterial color="#fb923c" emissive="#7c2d12" />
            </mesh>
          </group>
        )
      case 'server':
      case 'ec2':
        return (
          <group>
            <mesh onClick={handleClick}>
              <boxGeometry args={[0.85, 1.7, 0.85]} />
              <meshStandardMaterial
                color={baseColor}
                transparent={isDown}
                opacity={isDown ? 0.55 : 1}
              />
            </mesh>
            {[-0.5, 0, 0.5].map((py) => (
              <mesh key={py} position={[0, py, 0.44]}>
                <boxGeometry args={[0.6, 0.12, 0.04]} />
                <meshStandardMaterial
                  color="#0c1a36"
                  emissive={isDown ? '#000000' : '#22d3ee'}
                />
              </mesh>
            ))}
          </group>
        )
      case 'host':
        return (
          <mesh onClick={handleClick}>
            <sphereGeometry args={[0.45, 24, 24]} />
            <meshStandardMaterial
              color={baseColor}
              transparent={isDown}
              opacity={isDown ? 0.55 : 1}
            />
          </mesh>
        )
      default:
        return (
          <group>
            <mesh onClick={handleClick}>
              <sphereGeometry args={[0.9, 24, 24]} />
              <meshStandardMaterial
                color={baseColor}
                transparent
                opacity={isDown ? 0.35 : 0.55}
              />
            </mesh>
            <mesh onClick={handleClick}>
              <boxGeometry args={[1.1, 0.5, 0.7]} />
              <meshStandardMaterial
                color={baseColor}
                transparent
                opacity={isDown ? 0.4 : 0.8}
              />
            </mesh>
          </group>
        )
    }
  })()

  return (
    <group position={[x, y, z]}>
      {body}
      {isSelected && (
        <mesh>
          <boxGeometry args={[2.3, 2.3, 2.3]} />
          <meshBasicMaterial color="#22d3ee" wireframe transparent opacity={0.9} />
        </mesh>
      )}
      {isDown && (
        <mesh position={[0, 1.35, 0]}>
          <sphereGeometry args={[0.14, 12, 12]} />
          <meshBasicMaterial color="#f87171" />
        </mesh>
      )}
      <Html
        position={[0, 1.5, 0]}
        center
        distanceFactor={12}
        style={{ pointerEvents: 'none' }}
      >
        <div
          style={{
            background: 'rgba(6, 13, 31, 0.85)',
            border: `1px solid ${isDown ? '#f87171' : isSelected ? '#22d3ee' : '#1d335f'}`,
            borderRadius: 6,
            color: isDown ? '#f87171' : '#e6f0ff',
            fontSize: 11,
            padding: '2px 7px',
            whiteSpace: 'nowrap',
          }}
        >
          {device.hostname}
          <span style={{ color: '#8fa8cc' }}> · {KIND_LABEL[device.kind]}</span>
        </div>
      </Html>
    </group>
  )
}

function PacketDot() {
  const { result, stepIndex, playing, reducedMotion, topology } = useSim()
  const ref = useRef<THREE.Mesh>(null)
  const lastTarget = useRef<THREE.Vector3 | null>(null)

  const targetPos = useMemo(() => {
    if (!result || result.steps.length === 0) return null
    const idx = Math.min(Math.max(stepIndex, 0), result.steps.length - 1)
    const step = result.steps[idx]
    const device = topology.devices.find((d) => d.id === step.deviceId)
    if (!device) return null
    return new THREE.Vector3(
      device.position[0],
      device.position[1] + 0.9,
      device.position[2],
    )
  }, [result, stepIndex, topology])

  useFrame(() => {
    const mesh = ref.current
    if (!mesh || !targetPos) return
    if (reducedMotion || !playing) {
      mesh.position.copy(targetPos)
      lastTarget.current = targetPos.clone()
      return
    }
    // Glide toward the current step position; snap when the target
    // changes so the dot travels along the step polyline.
    if (!lastTarget.current || !lastTarget.current.equals(targetPos)) {
      lastTarget.current = targetPos.clone()
    }
    mesh.position.lerp(targetPos, 0.12)
    if (mesh.position.distanceTo(targetPos) < 0.05) {
      mesh.position.copy(targetPos)
    }
  })

  if (!targetPos) return null
  return (
    <mesh
      ref={ref}
      position={[targetPos.x, targetPos.y, targetPos.z]}
    >
      <sphereGeometry args={[0.22, 16, 16]} />
      <meshBasicMaterial color="#22d3ee" />
      <pointLight color="#22d3ee" intensity={6} distance={4} />
    </mesh>
  )
}

function SceneContent() {
  const { topology, state, theme, result } = useSim()
  const byId = useMemo(
    () => new Map(topology.devices.map((d) => [d.id, d])),
    [topology],
  )
  const dark = theme === 'dark'

  return (
    <>
      <color attach="background" args={[dark ? '#060d1f' : '#eef3fb']} />
      <ambientLight intensity={0.8} />
      <directionalLight position={[8, 12, 6]} intensity={1.1} />
      <pointLight position={[-8, 4, -6]} intensity={20} color="#22d3ee" />
      <pointLight position={[8, 2, 8]} intensity={12} color="#a78bfa" />
      <gridHelper
        args={[36, 36, dark ? '#1d335f' : '#c3d2ea', dark ? '#12224a' : '#dbe4f2']}
        position={[0, -2.2, 0]}
      />
      {topology.links.map((link) => {
        const from = byId.get(link.from)
        const to = byId.get(link.to)
        if (!from || !to) return null
        const isDown =
          link.status === 'down' || state.downLinks.includes(link.id)
        const isTrunk = (link.trunkVlans?.length ?? 0) > 0
        const color = isDown ? '#f87171' : isTrunk ? '#a78bfa' : '#22d3ee'
        return (
          <Line
            key={link.id}
            points={[from.position, to.position]}
            color={color}
            lineWidth={isDown ? 3 : 2}
            dashed={link.media === 'fiber' || isDown}
            dashSize={0.4}
            gapSize={0.25}
            transparent
            opacity={isDown ? 0.95 : 0.75}
          />
        )
      })}
      {result && result.path.length > 1 && (
        <Line
          points={result.path
            .map((id) => byId.get(id)?.position)
            .filter((p): p is [number, number, number] => Boolean(p))
            .map(([x, y, z]) => [x, y + 0.9, z] as [number, number, number])}
          color={result.ok ? '#34d399' : '#f87171'}
          lineWidth={2}
          dashed
          dashSize={0.3}
          gapSize={0.2}
          transparent
          opacity={0.9}
        />
      )}
      {topology.devices.map((device) => (
        <DeviceNode key={device.id} device={device} />
      ))}
      <PacketDot />
      <OrbitControls makeDefault enableDamping dampingFactor={0.1} />
    </>
  )
}

export default function Scene3D() {
  const { theme } = useSim()
  const [webglFailed, setWebglFailed] = useState(false)
  const [probeFailed] = useState(() => !webglAvailable())
  const failed = webglFailed || probeFailed
  const dark = theme === 'dark'

  if (failed) {
    return (
      <div
        className="prism-panel"
        role="alert"
        style={{
          alignItems: 'center',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          justifyContent: 'center',
          minHeight: 320,
          padding: 24,
          textAlign: 'center',
        }}
      >
        <p style={{ fontSize: '1.1rem', fontWeight: 700 }}>
          3D view unavailable
        </p>
        <p style={{ color: dark ? '#8fa8cc' : '#4c6488', maxWidth: 420 }}>
          WebGL could not be initialised in this browser, so the 3D scene
          cannot be rendered. Please use the 2D topology view instead, it
          shows the same devices, links and packet animation.
        </p>
      </div>
    )
  }

  return (
    <div
      style={{ height: 480, width: '100%' }}
      aria-label="3D network topology. Use the 2D view for a text alternative."
    >
      <SceneErrorBoundary onError={() => setWebglFailed(true)}>
        <Canvas
          camera={{ fov: 50, position: [0, 9, 16] }}
          dpr={[1, 2]}
          onCreated={({ gl }) => {
            const onLost = () => setWebglFailed(true)
            gl.domElement.addEventListener('webglcontextlost', onLost)
          }}
        >
          <SceneContent />
        </Canvas>
      </SceneErrorBoundary>
    </div>
  )
}
