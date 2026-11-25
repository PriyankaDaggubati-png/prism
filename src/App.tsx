import { lazy, Suspense } from 'react'
import { SimProvider, useSim } from './store/simStore'
import Topo2D from './components/Topo2D'
import NocDashboard from './components/NocDashboard'
import Inspector from './components/Inspector'
import CliTerminal from './components/CliTerminal'
import PacketPanel from './components/PacketPanel'
import EduPanel from './components/EduPanel'
import FailureLab from './components/FailureLab'
import ProtocolBar from './components/ProtocolBar'

// The 3D scene (three.js) is lazy-loaded so the first paint stays light
// and visitors on the 2D view never download the WebGL bundle.
const Scene3D = lazy(() => import('./components/Scene3D'))

const REPOS = [
  'enterprise-networking-labs',
  'cisco-routing-switching',
  'palo-alto-firewall-labs',
  'fortigate-security-labs',
  'cybersecurity-home-lab',
  'linux-administration-labs',
  'aws-cloud-networking',
  'aws-cloud-security',
  'wireshark-packet-analysis',
  'siem-threat-detection',
  'network-automation-python',
  'network-troubleshooting-playbook',
]

function Shell() {
  const {
    topologies,
    topology,
    topologyId,
    setTopologyId,
    theme,
    setTheme,
    view,
    setView,
    reducedMotion,
    setReducedMotion,
    selectedDevice,
  } = useSim()

  const cliDeviceId =
    selectedDevice?.id ??
    topology.devices.find((d) => d.kind === 'router' || d.kind === 'firewall')
      ?.id ??
    topology.devices[0]?.id ??
    ''

  return (
    <div className="min-h-full flex flex-col">
      <header className="px-4 py-3 flex flex-wrap items-center gap-3 border-b"
        style={{ borderColor: 'var(--prism-border)', background: 'var(--prism-bg-soft)' }}>
        <div>
          <h1 className="text-xl font-bold tracking-wide">
            PRISM{' '}
            <span style={{ color: 'var(--prism-cyan)' }}>
              Interactive Network &amp; Cybersecurity Digital Twin
            </span>
          </h1>
          <p className="text-xs" style={{ color: 'var(--prism-muted)' }}>
            Priyanka Daggubati, Network Engineer. Educational simulation of her
            GitHub lab topologies. No live traffic, no production network, not
            a Cisco, Palo Alto or AWS emulator.
          </p>
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <button
            className="prism-btn"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label="Toggle dark and light theme"
          >
            {theme === 'dark' ? 'Light theme' : 'Dark theme'}
          </button>
          <button
            className="prism-btn"
            onClick={() => setView(view === '3d' ? '2d' : '3d')}
            aria-label="Toggle 2D and 3D view"
          >
            {view === '3d' ? '2D view' : '3D view'}
          </button>
          <button
            className="prism-btn"
            onClick={() => setReducedMotion(!reducedMotion)}
            aria-pressed={reducedMotion}
            aria-label="Toggle reduced motion"
          >
            {reducedMotion ? 'Motion: reduced' : 'Motion: full'}
          </button>
        </div>
      </header>

      <div className="px-4 py-3 flex flex-wrap items-center gap-3">
        <label htmlFor="topology-picker" className="text-sm font-semibold">
          Topology
        </label>
        <select
          id="topology-picker"
          className="prism-select"
          value={topologyId}
          onChange={(e) => setTopologyId(e.target.value)}
        >
          {topologies.map((t) => (
            <option key={t.id} value={t.id}>
              {t.title} ({t.labLevel === 'lab' ? 'Lab work' : 'Currently learning'})
            </option>
          ))}
        </select>
        <span
          className="text-xs px-2 py-1 rounded-full"
          style={{
            background: 'var(--prism-panel-2)',
            color: 'var(--prism-cyan)',
          }}
        >
          {topology.labLevel === 'lab'
            ? 'Lab work based on professional experience'
            : 'Lab template, currently learning'}
        </span>
        <span className="text-xs" style={{ color: 'var(--prism-muted)' }}>
          {topology.description}
        </span>
      </div>

      <main className="flex-1 px-4 pb-6 flex flex-col gap-4">
        <div id="prism-scene" className="prism-panel overflow-hidden">
          <div className="h-[420px] md:h-[520px]">
            {view === '3d' ? (
              <Suspense
                fallback={
                  <div className="h-full flex items-center justify-center text-sm">
                    Loading 3D scene...
                  </div>
                }
              >
                <Scene3D />
              </Suspense>
            ) : (
              <Topo2D />
            )}
          </div>
        </div>

        <ProtocolBar />
        <NocDashboard />

        <div className="grid gap-4 lg:grid-cols-2">
          <Inspector />
          <CliTerminal deviceId={cliDeviceId} />
        </div>

        <PacketPanel />

        <div className="grid gap-4 lg:grid-cols-2">
          <EduPanel />
          <FailureLab />
        </div>
      </main>

      <footer
        className="px-4 py-4 text-xs flex flex-col gap-2"
        style={{ borderTop: '1px solid var(--prism-border)', color: 'var(--prism-muted)' }}
      >
        <p>
          PRISM is an educational simulation built from Priyanka Daggubati's
          GitHub labs. All packets, CLI output, captures and metrics are
          simulated. Production experience: Provin Tech (Dec 2025-Jun 2026)
          and TeamLease (May 2022-Jul 2025). Cybersecurity, Linux, AWS and
          automation content is lab work or currently learning.
        </p>
        <p>
          Source repos:{' '}
          {REPOS.map((r, i) => (
            <span key={r}>
              {i > 0 ? ', ' : ''}
              <a
                className="underline"
                style={{ color: 'var(--prism-cyan)' }}
                href={`https://github.com/PriyankaDaggubati-png/${r}`}
                target="_blank"
                rel="noreferrer"
              >
                {r}
              </a>
            </span>
          ))}
        </p>
        <p>
          Contact:{' '}
          <a
            className="underline"
            style={{ color: 'var(--prism-cyan)' }}
            href="mailto:srisaipriyankad@gmail.com"
          >
            srisaipriyankad@gmail.com
          </a>{' '}
          |{' '}
          <a
            className="underline"
            style={{ color: 'var(--prism-cyan)' }}
            href="https://www.linkedin.com/in/sri-sai-priyanka-daggubati-54ab45216"
            target="_blank"
            rel="noreferrer"
          >
            LinkedIn
          </a>
        </p>
      </footer>
    </div>
  )
}

export default function App() {
  return (
    <SimProvider>
      <Shell />
    </SimProvider>
  )
}
