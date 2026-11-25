# PRISM Builder Contract

Read this before writing any code. It is the only integration contract.
The scaffold already exists: package.json, vite.config.ts (base './'),
src/main.tsx, src/index.css, src/engine/types.ts, src/store/simStore.tsx.

## Accuracy rules (non-negotiable)

- All topology data comes ONLY from `docs/topology-digest.md` and the source
  package `~/workspace/your_files/priyanka-github-v2/`. Never invent devices,
  IPs, VLANs, protocols, rules or results.
- Professional production experience is ONLY Provin Tech (Dec 2025-Jun 2026)
  and TeamLease (May 2022 onward). All cybersecurity, Linux, AWS and
  automation content is LAB or CURRENTLY LEARNING. Label it so everywhere.
- The whole site is an EDUCATIONAL SIMULATION. Never claim live production
  traffic, never claim to be a Cisco, Palo Alto or AWS emulator. Every
  simulated metric, CLI output and capture frame is labelled simulated.
- NEVER include her phone number anywhere in the site, docs or code.
- Contact only: srisaipriyankad@gmail.com and
  www.linkedin.com/in/sri-sai-priyanka-daggubati-54ab45216.
- The site must build with `npm run build` and `npm test` must pass.

## Engine API (src/engine/index.ts must export exactly these)

```ts
export function listTopologies(): Topology[]
export function getTopology(id: string): Topology | undefined
export function simulatePacket(
  topo: Topology,
  state: SimState,
  opts: { src: string; dst: string; protocol: Protocol },
): SimResult
export function runCli(
  topo: Topology,
  state: SimState,
  deviceId: string,
  command: string,
): string
export function listFailures(topologyId: string): FailureScenario[]
export function eduFor(topologyId: string, topic: string): EduContent | undefined
export function eduTopics(topologyId: string): string[]
```

- `src/engine/topologies.ts` holds the topology data.
- `src/engine/simulate.ts` holds `simulatePacket`.
- `src/engine/cli.ts` holds `runCli`.
- `src/engine/failures.ts` holds `listFailures` plus failure definitions.
- `src/engine/edu.ts` holds `eduFor` / `eduTopics`.
- `src/engine/__tests__/*.test.ts` holds vitest tests.
- Types live in `src/engine/types.ts` (already written, do not change its
  exported names; you may add optional fields only).
- `SimState.downDevices/downLinks/downInterfaces` are derived by the engine
  from `state.failures` via the failure definitions: `simulatePacket` and
  `runCli` must resolve failures to down devices/links/interfaces internally.
  The store only toggles failure ids.
- `simulatePacket` must be honest: if no valid path exists (device/link/
  interface down, firewall deny, VLAN mismatch, no route), return `ok: false`
  with steps ending at the blocking device and a clear `failureReason`
  ('no-route' | 'link-down' | 'device-down' | 'firewall-deny' |
  'vlan-mismatch' | 'unreachable' | 'dns-fail' | 'dhcp-fail' | ...).
- Protocol modes change the step sequence, not just the label: ARP shows
  broadcast + reply + table update; DHCP shows Discover/Offer/Request/Ack;
  DNS shows query + resolver + answer; TCP shows SYN/SYN-ACK/ACK with seq
  and ack numbers; ICMP shows Echo Request/Reply with TTL decrement;
  OSPF/BGP/STP/VLAN/LACP/HSRP/VRRP/IPsec/firewall/AWS each produce their
  own realistic step flow over the modeled topology.
- Frames in `SimResult.frames` must match the steps (one frame per hop or
  per protocol message) with real IPs/MACs/VLANs/TTLs from the topology.

## Store (src/store/simStore.tsx, already written)

- `useSim()` gives topology, state, result, playing, stepIndex, speed,
  theme, view, reducedMotion, selectedDevice, protocol, srcId, dstId,
  sendPacket, toggleFailure, restoreAll, stats, eventLog, selectedFrame.
- Do not create a second store. Do not bypass it with local state for
  anything the NOC dashboard or other panels need to see.
- Theme is applied via `document.documentElement.dataset.theme`.

## Components (exact file names and exports)

- `src/components/Scene3D.tsx` — default export `Scene3D`. R3F Canvas,
  devices as clickable 3D nodes (router/switch/firewall/server/cloud shapes),
  links as glowing lines, packet dot animated along the current result path
  up to `stepIndex`, failed devices/links red, device click calls
  `selectDevice(id)`. Must render a 2D fallback message when WebGL fails.
- `src/components/Topo2D.tsx` — default export `Topo2D`. SVG topology,
  same clicks and packet animation (dot moves along link lines), same red
  failure highlighting. Used when view is '2d' or WebGL is unavailable.
- `src/components/NocDashboard.tsx` — default export `NocDashboard`.
  Stats from `useSim().stats` plus live counts computed from the topology
  and state (devices online/offline, active interfaces, neighbors, firewall
  events from the latest result, VPN status, packet loss, convergence time
  as simulated values). Controls: send packet, play, pause, step, restart,
  speed, source, destination, protocol, simulate failure, restore, inspect
  packet, CLI, routing table, topology. All controls must work.
- `src/components/Inspector.tsx` — default export `Inspector`. Panel for
  `selectedDevice`: hostname, type, IPs, interfaces + status, VLANs,
  routing table, MAC table, ARP table, neighbors, simulated CPU/memory/
  bandwidth, config text, security policies, event log lines. Close button.
- `src/components/CliTerminal.tsx` — default export `CliTerminal`. Props:
  `{ deviceId: string }`. Input line, history, calls `runCli(topology,
  state, deviceId, command)` and prints the output. Supports the commands
  in the spec; unknown commands print a helpful error with the command list.
- `src/components/PacketPanel.tsx` — default export `PacketPanel`.
  Wireshark-style table from `result.frames` (or a "send a packet first"
  empty state), display filter input, protocol highlight, click a frame to
  show its `layers`, event timeline from `result.steps`. Label: simulated.
- `src/components/EduPanel.tsx` — default export `EduPanel`. Uses
  `eduTopics(topology.id)` and `eduFor(topology.id, topic)`: what, why here,
  OSI layer, config, packet processing, commands, interview question with
  expandable answer, failure example. Syncs with the current protocol.
- `src/components/FailureLab.tsx` — default export `FailureLab`. Lists
  `listFailures(topology.id)`; each row has Apply/Clear via `toggleFailure`,
  and shows root cause, verify commands, resolution when active.
- `src/components/ProtocolBar.tsx` — default export `ProtocolBar`. Buttons
  for each protocol in `topology.protocols`; clicking sets the protocol in
  the store and shows a one-line description of that mode.

## App shell (src/App.tsx, written by the coordinator at integration)

- Builders do NOT write App.tsx. It composes: header (PRISM title,
  simulation disclaimer, theme toggle, view toggle, reduced-motion toggle),
  topology picker, Scene3D/Topo2D, NocDashboard, Inspector, CliTerminal,
  PacketPanel, EduPanel, FailureLab, ProtocolBar, footer with repo links
  and contact (email + LinkedIn only).

## File ownership (no two builders touch the same file)

- Engine builder: `src/engine/*` (except types.ts), `src/data/*` if needed.
- Scene builder: `Scene3D.tsx`, `Topo2D.tsx`, `NocDashboard.tsx`.
- Panels builder: `Inspector.tsx`, `CliTerminal.tsx`, `PacketPanel.tsx`,
  `EduPanel.tsx`.
- Lab/docs builder: `FailureLab.tsx`, `ProtocolBar.tsx`, `README.md`,
  `.github/workflows/deploy.yml`, `public/404.html`.
- Everyone may read `docs/topology-digest.md` and `docs/CONTRACT.md`.
- Do not edit `package.json`, `vite.config.ts`, `src/main.tsx`,
  `src/index.css`, `src/store/simStore.tsx`, `src/engine/types.ts`
  without asking the coordinator.

## Visual rules

- Dark navy `#060d1f` base, cyan `#22d3ee`, emerald `#34d399`, violet
  `#a78bfa`, orange `#fb923c` accents. Light theme via CSS variables in
  index.css (already defined). Use the `.prism-panel`, `.prism-btn`,
  `.prism-btn-primary`, `.prism-input`, `.prism-select` classes.
- Responsive: panels stack on mobile. Keyboard accessible: buttons are
  real `<button>`s, inputs labelled, canvas container focusable with a
  text alternative (the 2D view + tables).
- No em-dashes, semicolons or colons in user-visible resume-style text is
  NOT a rule here (that rule is for resumes). Normal punctuation is fine.
