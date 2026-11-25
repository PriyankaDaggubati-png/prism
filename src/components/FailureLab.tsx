import { useMemo } from 'react'
import { listFailures } from '../engine'
import type { FailureScenario } from '../engine/types'
import { useSim } from '../store/simStore'

export default function FailureLab() {
  const { topology, state, toggleFailure, restoreAll } = useSim()

  const failures = useMemo(() => listFailures(topology.id), [topology.id])

  const grouped = useMemo(() => {
    const groups = new Map<string, FailureScenario[]>()
    for (const failure of failures) {
      const category = failure.category || 'General'
      const existing = groups.get(category)
      if (existing) {
        existing.push(failure)
      } else {
        groups.set(category, [failure])
      }
    }
    return [...groups.entries()]
  }, [failures])

  const activeCount = state.failures.length

  return (
    <section className="prism-panel" aria-label="Failure laboratory">
      <h2>Failure Lab</h2>
      <p>
        Apply a failure to this simulated topology, then send a packet to see
        what breaks. This is a troubleshooting laboratory for learning. All
        traffic, devices and results here are simulated.
      </p>
      <p>
        Traffic only reroutes when the modeled topology has a redundant path.
        If no alternate path exists in the model, traffic stops at the failed
        device or link instead.
      </p>

      <div>
        <span>
          {activeCount === 0
            ? 'No failures active.'
            : `${activeCount} failure${activeCount === 1 ? '' : 's'} active.`}
        </span>{' '}
        <button
          type="button"
          className="prism-btn prism-btn-danger"
          onClick={restoreAll}
          disabled={activeCount === 0}
        >
          Restore network
        </button>
      </div>

      {failures.length === 0 ? (
        <p>No failure scenarios are modeled for this topology yet.</p>
      ) : (
        grouped.map(([category, items]) => (
          <div key={category}>
            <h3>{category}</h3>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {items.map((failure: FailureScenario) => {
                const active = state.failures.includes(failure.id)
                return (
                  <li
                    key={failure.id}
                    className="prism-panel"
                    style={
                      active
                        ? { borderColor: 'var(--prism-red)' }
                        : undefined
                    }
                  >
                    <div>
                      <strong>{failure.title}</strong>{' '}
                      {active && (
                        <span
                          style={{
                            background: 'var(--prism-red)',
                            borderRadius: '4px',
                            color: '#ffffff',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            padding: '2px 6px',
                          }}
                        >
                          ACTIVE
                        </span>
                      )}
                    </div>
                    <p>{failure.description}</p>
                    <button
                      type="button"
                      className={
                        active ? 'prism-btn prism-btn-danger' : 'prism-btn'
                      }
                      onClick={() => toggleFailure(failure.id)}
                      aria-pressed={active}
                    >
                      {active ? 'Clear' : 'Apply'}
                    </button>
                    {active && (
                      <div>
                        <h4>Root cause</h4>
                        <p>{failure.rootCause}</p>
                        <h4>Verify</h4>
                        <pre>{failure.verifyCommands.join('\n')}</pre>
                        <h4>Recommended resolution</h4>
                        <p>{failure.resolution}</p>
                      </div>
                    )}
                  </li>
                )
              })}
            </ul>
          </div>
        ))
      )}
    </section>
  )
}
