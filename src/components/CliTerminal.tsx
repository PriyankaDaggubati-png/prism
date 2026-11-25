import { useEffect, useRef, useState } from 'react'
import { runCli } from '../engine'
import { useSim } from '../store/simStore'

const AVAILABLE_COMMANDS = [
  'show ip route',
  'show ip interface brief',
  'show ip ospf neighbor',
  'show interfaces trunk',
  'show spanning-tree',
  'show mac address-table',
  'show etherchannel summary',
  'show ip bgp summary',
  'ip addr',
  'ip route',
  'ss -tulnp',
  'tcpdump',
  'help',
]

interface HistoryLine {
  id: number
  kind: 'command' | 'output' | 'info'
  text: string
}

export default function CliTerminal({ deviceId }: { deviceId: string }) {
  const { topology, state } = useSim()
  const device = topology.devices.find((d) => d.id === deviceId)
  const hostname = device?.hostname ?? deviceId

  const [history, setHistory] = useState<HistoryLine[]>([
    {
      id: 0,
      kind: 'info',
      text: `Simulated educational CLI for ${hostname}. This is a simulated CLI for learning, not a live device. Type "help" to list commands.`,
    },
  ])
  const [input, setInput] = useState('')
  const [commandHistory, setCommandHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const nextId = useRef(1)
  const outputRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = outputRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [history])

  // Reset the welcome line when the selected device changes.
  useEffect(() => {
    setHistory([
      {
        id: 0,
        kind: 'info',
        text: `Simulated educational CLI for ${hostname}. This is a simulated CLI for learning, not a live device. Type "help" to list commands.`,
      },
    ])
    setCommandHistory([])
    setHistoryIndex(-1)
    nextId.current = 1
    // Intentionally keyed on deviceId only; hostname follows the device.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deviceId])

  const appendLines = (lines: HistoryLine[]) => {
    setHistory((prev) => {
      const next = [...prev, ...lines]
      // Keep the last ~100 lines.
      return next.slice(-100)
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const command = input.trim()
    if (!command) return

    const cmdId = nextId.current
    nextId.current += 1
    const outId = nextId.current
    nextId.current += 1

    let output: string
    if (command.toLowerCase() === 'help') {
      output = `Available commands (simulated):\n${AVAILABLE_COMMANDS.join('\n')}`
    } else {
      try {
        output = runCli(topology, state, deviceId, command)
      } catch (err) {
        output = `Error running simulated command: ${err instanceof Error ? err.message : 'unknown error'}`
      }
    }

    appendLines([
      { id: cmdId, kind: 'command', text: `${hostname}> ${command}` },
      { id: outId, kind: 'output', text: output },
    ])
    setCommandHistory((prev) => [...prev, command])
    setHistoryIndex(-1)
    setInput('')
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (commandHistory.length === 0) return
      const nextIndex =
        historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1)
      setHistoryIndex(nextIndex)
      setInput(commandHistory[nextIndex])
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (historyIndex === -1) return
      const nextIndex = historyIndex + 1
      if (nextIndex >= commandHistory.length) {
        setHistoryIndex(-1)
        setInput('')
      } else {
        setHistoryIndex(nextIndex)
        setInput(commandHistory[nextIndex])
      }
    }
  }

  return (
    <div id="prism-cli" className="prism-panel p-4">
      <h2 className="text-base font-semibold">CLI Terminal</h2>
      <p className="mt-1 text-sm" style={{ color: 'var(--prism-muted)' }}>
        Simulated educational CLI for {hostname}. Not a live device.
      </p>

      <div
        ref={outputRef}
        className="prism-scroll mt-3 h-72 overflow-y-auto rounded p-3 font-mono text-sm"
        style={{ background: '#020617', color: '#d1fae5' }}
        aria-label="Simulated CLI output"
        aria-live="polite"
      >
        {history.map((line) => (
          <div
            key={line.id}
            className="whitespace-pre-wrap break-words"
            style={
              line.kind === 'command'
                ? { color: '#22d3ee', fontWeight: 600 }
                : line.kind === 'info'
                  ? { color: '#8fa8cc' }
                  : undefined
            }
          >
            {line.text}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="mt-3 flex items-center gap-2">
        <label htmlFor="prism-cli-input" className="font-mono text-sm" style={{ color: 'var(--prism-cyan)' }}>
          {hostname}&gt;
        </label>
        <input
          id="prism-cli-input"
          className="prism-input flex-1 font-mono"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a command, e.g. show ip route"
          autoComplete="off"
          spellCheck={false}
        />
        <button type="submit" className="prism-btn prism-btn-primary">
          Run
        </button>
      </form>

      <p className="mt-3 text-xs" style={{ color: 'var(--prism-muted)' }}>
        Available commands: {AVAILABLE_COMMANDS.join(', ')}. Use the Up arrow to
        recall the previous command.
      </p>
    </div>
  )
}
