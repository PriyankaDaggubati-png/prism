// PRISM engine public API. See docs/CONTRACT.md for the integration
// contract. All simulation output is labelled simulated.
export { eduFor, eduTopics } from './edu'
export { listFailures } from './failures'
export { runCli } from './cli'
export { simulatePacket } from './simulate'
export { getTopology, listTopologies } from './topologies'
export type { SimulateOpts } from './simulate'
export type {
  ArpEntry,
  BgpNeighbor,
  CapFrame,
  Device,
  DeviceKind,
  DhcpPool,
  EduContent,
  Endpoint,
  FailureScenario,
  FirewallRule,
  LabLevel,
  Link,
  MacEntry,
  OspfNeighbor,
  PacketStep,
  Protocol,
  RouteEntry,
  SimInterface,
  SimResult,
  SimState,
  StepKind,
  Topology,
  VlanDef,
  VrrpGroup,
} from './types'
export { emptySimState } from './types'
