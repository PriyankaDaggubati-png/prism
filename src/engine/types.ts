// PRISM engine contract types.
// Every topology in this site is built ONLY from data in
// ~/workspace/your_files/priyanka-github-v2/ (see docs/topology-digest.md).
// Nothing here may invent devices, IPs, VLANs or protocols.

export type DeviceKind =
  | 'router'
  | 'switch'
  | 'firewall'
  | 'server'
  | 'host'
  | 'cloud' // AWS region / VPC container
  | 'vpc'
  | 'igw'
  | 'natgw'
  | 'tgw'
  | 'alb'
  | 'ec2'
  | 'siem'
  | 'ids'

export type IfaceStatus = 'up' | 'down'
export type LinkStatus = 'up' | 'down'

export interface SimInterface {
  id: string // e.g. "Gi0/0"
  name: string
  ip?: string // dotted quad, no mask
  mask?: string // dotted quad mask
  mac: string
  vlan?: number // access VLAN
  mode?: 'access' | 'trunk' | 'routed'
  allowedVlans?: number[]
  status: IfaceStatus
  speedMbps: number
  description?: string
}

export interface VlanDef {
  id: number
  name: string
}

export interface RouteEntry {
  network: string // e.g. "192.168.30.0"
  mask: string
  nextHop: string // next-hop IP, or "connected" / "direct"
  outInterface: string
  protocol: 'connected' | 'static' | 'ospf' | 'eigrp' | 'bgp'
  metric?: number
  adminDistance: number
}

export interface ArpEntry {
  ip: string
  mac: string
  interface: string
}

export interface MacEntry {
  mac: string
  vlan: number
  port: string
  type: 'dynamic' | 'static' | 'sticky'
}

export interface OspfNeighbor {
  neighborId: string
  address: string
  interface: string
  state: string // e.g. "Full/DR"
  area: number
  deadTime: string
}

export interface BgpNeighbor {
  neighbor: string
  as: number
  state: string // e.g. "Established"
  uptime: string
  prefixesReceived: number
}

export interface FirewallRule {
  id: number
  name: string
  fromZone: string
  toZone: string
  source: string
  destination: string
  service: string
  action: 'allow' | 'deny'
}

export interface DhcpPool {
  name: string
  network: string
  mask: string
  gateway: string
  dns: string[]
  leaseDays: number
  excluded: string
}

export interface VrrpGroup {
  id: number
  virtualIp: string
  priority: number
  state: 'Master' | 'Backup'
  interface: string
}

export interface Device {
  id: string
  hostname: string
  kind: DeviceKind
  model?: string
  role?: string
  // 3D position in the scene, x right, y up, z toward viewer.
  position: [number, number, number]
  interfaces: SimInterface[]
  vlans?: VlanDef[]
  routes?: RouteEntry[]
  arp?: ArpEntry[]
  macTable?: MacEntry[]
  ospfNeighbors?: OspfNeighbor[]
  bgpNeighbors?: BgpNeighbor[]
  firewallRules?: FirewallRule[]
  dhcpPools?: DhcpPool[]
  vrrpGroups?: VrrpGroup[]
  // Full config text from the source repo, shown in the inspector.
  config?: string
  notes?: string
  // Simulated utilisation, always labelled simulated in the UI.
  cpuPct?: number
  memPct?: number
}

export interface Link {
  id: string
  from: string // device id
  fromIf: string // interface name
  to: string
  toIf: string
  media: 'fiber' | 'copper'
  status: LinkStatus
  trunkVlans?: number[]
  channelGroup?: string // e.g. "Po1" when part of an EtherChannel
}

export interface Endpoint {
  id: string
  label: string
  deviceId: string // device the endpoint hangs off
  ip: string
  mac: string
  vlan?: number
  gateway: string
}

export type LabLevel = 'production' | 'lab' | 'learning'

export interface Topology {
  id: string
  repo: string // GitHub repo slug
  repoUrl: string
  title: string
  subtitle: string
  description: string
  labLevel: LabLevel
  // Protocols this topology can simulate, subset of Protocol.
  protocols: Protocol[]
  devices: Device[]
  links: Link[]
  endpoints: Endpoint[]
  // Short educational blurb shown in the education panel.
  learn?: string
}

export type Protocol =
  | 'icmp'
  | 'arp'
  | 'dhcp'
  | 'dns'
  | 'tcp'
  | 'ospf'
  | 'bgp'
  | 'stp'
  | 'vlan'
  | 'lacp'
  | 'hsrp'
  | 'vrrp'
  | 'ipsec'
  | 'firewall'
  | 'aws'

export interface SimState {
  downDevices: string[]
  downLinks: string[]
  downInterfaces: string[]
  failures: string[] // active failure scenario ids
}

export function emptySimState(): SimState {
  return { downDevices: [], downLinks: [], downInterfaces: [], failures: [] }
}

export type StepKind =
  | 'forward'
  | 'lookup'
  | 'arp'
  | 'drop'
  | 'nat'
  | 'encap'
  | 'decap'
  | 'allow'
  | 'deny'
  | 'info'
  | 'error'

export interface PacketStep {
  seq: number
  timeMs: number
  deviceId: string
  deviceName: string
  action: string
  detail: string
  kind: StepKind
}

export interface CapFrame {
  no: number
  timeMs: number
  src: string
  dst: string
  protocol: string
  length: number
  info: string
  vlan?: number
  ttl?: number
  srcPort?: number
  dstPort?: number
  flags?: string
  // Layer detail lines, shown when a frame is clicked.
  layers: Record<string, string[]>
}

export interface SimResult {
  ok: boolean
  steps: PacketStep[]
  // Ordered device ids the packet visited.
  path: string[]
  frames: CapFrame[]
  summary: string
  failureReason?: string
}

export interface FailureScenario {
  id: string
  title: string
  category: string
  description: string
  // What the engine disables when this failure is active.
  downDevices?: string[]
  downLinks?: string[]
  downInterfaces?: string[]
  rootCause: string
  verifyCommands: string[]
  resolution: string
  // Topology ids this failure applies to.
  topologies: string[]
}

export interface EduContent {
  title: string
  what: string
  whyHere: string
  osiLayer: string
  config: string
  packetProcessing: string
  commands: string[]
  interviewQuestion: string
  interviewAnswer: string
  failureExample: string
}
