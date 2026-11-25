import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { getTopology, listTopologies, simulatePacket } from '../engine'
import {
  emptySimState,
  type CapFrame,
  type Device,
  type Protocol,
  type SimResult,
  type SimState,
  type Topology,
} from '../engine/types'

export interface LogEntry {
  timeMs: number
  text: string
  kind: 'info' | 'ok' | 'warn' | 'error'
}

export interface SimContextValue {
  topologies: Topology[]
  topology: Topology
  topologyId: string
  setTopologyId: (id: string) => void
  state: SimState
  toggleFailure: (id: string) => void
  restoreAll: () => void
  selectedDeviceId: string | null
  selectDevice: (id: string | null) => void
  selectedDevice: Device | null
  protocol: Protocol
  setProtocol: (p: Protocol) => void
  srcId: string
  dstId: string
  setSrcId: (id: string) => void
  setDstId: (id: string) => void
  result: SimResult | null
  sendPacket: () => void
  playing: boolean
  setPlaying: (b: boolean) => void
  speed: number
  setSpeed: (n: number) => void
  stepIndex: number
  setStepIndex: (n: number) => void
  theme: 'dark' | 'light'
  setTheme: (t: 'dark' | 'light') => void
  view: '3d' | '2d'
  setView: (v: '3d' | '2d') => void
  reducedMotion: boolean
  setReducedMotion: (b: boolean) => void
  eventLog: LogEntry[]
  selectedFrame: CapFrame | null
  setSelectedFrame: (f: CapFrame | null) => void
  stats: {
    sent: number
    delivered: number
    dropped: number
    denied: number
    frames: number
  }
}

const SimContext = createContext<SimContextValue | null>(null)

export function useSim(): SimContextValue {
  const ctx = useContext(SimContext)
  if (!ctx) throw new Error('useSim must be used inside SimProvider')
  return ctx
}

export function SimProvider({ children }: { children: ReactNode }) {
  const topologies = useMemo(() => listTopologies(), [])
  const [topologyId, setTopologyId] = useState(topologies[0]?.id ?? '')
  const topology = useMemo(
    () => getTopology(topologyId) ?? topologies[0],
    [topologyId, topologies],
  )
  const [state, setState] = useState<SimState>(() => emptySimState())
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null)
  const [protocol, setProtocol] = useState<Protocol>('icmp')
  const [srcId, setSrcId] = useState('')
  const [dstId, setDstId] = useState('')
  const [result, setResult] = useState<SimResult | null>(null)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [stepIndex, setStepIndex] = useState(0)
  const [theme, setThemeState] = useState<'dark' | 'light'>('dark')
  const [view, setView] = useState<'3d' | '2d'>('3d')
  const [reducedMotion, setReducedMotion] = useState(false)
  const [eventLog, setEventLog] = useState<LogEntry[]>([])
  const [selectedFrame, setSelectedFrame] = useState<CapFrame | null>(null)
  const [stats, setStats] = useState({
    denied: 0,
    delivered: 0,
    dropped: 0,
    frames: 0,
    sent: 0,
  })
  const logRef = useRef(0)

  const setTheme = (t: 'dark' | 'light') => {
    setThemeState(t)
    document.documentElement.dataset.theme = t
  }

  // Default endpoints when the topology changes.
  useEffect(() => {
    const eps = topology.endpoints
    if (eps.length >= 2) {
      setSrcId(eps[0].id)
      setDstId(eps[eps.length - 1].id)
    }
    setResult(null)
    setStepIndex(0)
    setPlaying(false)
    setState(emptySimState())
    setSelectedDeviceId(null)
    if (topology.protocols.length > 0) setProtocol(topology.protocols[0])
  }, [topology])

  const pushLog = (text: string, kind: LogEntry['kind'] = 'info') => {
    logRef.current += 1
    const entry: LogEntry = {
      kind,
      text,
      timeMs: Date.now(),
    }
    setEventLog((prev) => [...prev.slice(-199), entry])
  }

  const sendPacket = () => {
    if (!srcId || !dstId) return
    const res = simulatePacket(topology, state, {
      dst: dstId,
      protocol,
      src: srcId,
    })
    setResult(res)
    setStepIndex(0)
    setPlaying(true)
    setStats((s) => ({
      ...s,
      delivered: s.delivered + (res.ok ? 1 : 0),
      denied: s.denied + (res.failureReason === 'firewall-deny' ? 1 : 0),
      dropped: s.dropped + (!res.ok && res.failureReason !== 'firewall-deny' ? 1 : 0),
      frames: s.frames + res.frames.length,
      sent: s.sent + 1,
    }))
    pushLog(
      res.ok
        ? `Packet ${protocol.toUpperCase()} ${srcId} -> ${dstId}: delivered in ${res.steps.length} steps.`
        : `Packet ${protocol.toUpperCase()} ${srcId} -> ${dstId}: ${res.summary}`,
      res.ok ? 'ok' : 'error',
    )
  }

  const toggleFailure = (id: string) => {
    setState((prev) => {
      const has = prev.failures.includes(id)
      const failures = has
        ? prev.failures.filter((f) => f !== id)
        : [...prev.failures, id]
      return { ...prev, failures }
    })
    setResult(null)
    setPlaying(false)
  }

  const restoreAll = () => {
    setState(emptySimState())
    setResult(null)
    setPlaying(false)
    setStepIndex(0)
    pushLog('Network restored. All failure scenarios cleared.', 'ok')
  }

  // Advance the hop-by-hop animation while playing.
  useEffect(() => {
    if (!playing || !result) return
    if (reducedMotion) {
      setStepIndex(result.steps.length)
      setPlaying(false)
      return
    }
    if (stepIndex >= result.steps.length) {
      setPlaying(false)
      return
    }
    const delay = Math.max(120, 900 / speed)
    const t = window.setTimeout(() => setStepIndex((i) => i + 1), delay)
    return () => window.clearTimeout(t)
  }, [playing, stepIndex, result, speed, reducedMotion])

  const selectedDevice = useMemo(
    () => topology.devices.find((d) => d.id === selectedDeviceId) ?? null,
    [topology, selectedDeviceId],
  )

  const value: SimContextValue = {
    dstId,
    eventLog,
    playing,
    protocol,
    reducedMotion,
    result,
    restoreAll,
    selectedDevice,
    selectedDeviceId,
    selectedFrame,
    sendPacket,
    setDstId,
    setPlaying,
    setProtocol,
    setReducedMotion,
    setSelectedFrame,
    setSpeed,
    setSrcId,
    setStepIndex,
    setTheme,
    setTopologyId,
    setView,
    speed,
    srcId,
    state,
    stats,
    stepIndex,
    theme,
    toggleFailure,
    topologies,
    topology,
    topologyId,
    view,
    selectDevice: setSelectedDeviceId,
  }

  return <SimContext.Provider value={value}>{children}</SimContext.Provider>
}
