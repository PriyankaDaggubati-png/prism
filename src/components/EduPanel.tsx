import { useEffect, useState } from 'react'
import { eduFor, eduTopics } from '../engine'
import { useSim } from '../store/simStore'
import type { EduContent } from '../engine/types'

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="mt-4">
      <h3 className="text-sm font-semibold" style={{ color: 'var(--prism-cyan)' }}>
        {title}
      </h3>
      <div className="mt-1 text-sm">{children}</div>
    </section>
  )
}

export default function EduPanel() {
  const { topology, protocol } = useSim()
  const topics = eduTopics(topology.id)
  const [selectedTopic, setSelectedTopic] = useState<string>(protocol)

  // Default to, and stay synced with, the current protocol when it is a
  // topic for this topology; otherwise fall back to the first topic.
  useEffect(() => {
    if (topics.includes(protocol)) {
      setSelectedTopic(protocol)
    } else if (topics.length > 0) {
      setSelectedTopic(topics[0])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [protocol, topology.id])

  if (topics.length === 0) {
    return (
      <div className="prism-panel p-4">
        <h2 className="text-base font-semibold">Learn</h2>
        <p className="mt-2 text-sm" style={{ color: 'var(--prism-muted)' }}>
          No educational topics for this topology yet.
        </p>
      </div>
    )
  }

  const topic = topics.includes(selectedTopic) ? selectedTopic : topics[0]
  const content: EduContent | undefined = eduFor(topology.id, topic)

  return (
    <div className="prism-panel p-4">
      <h2 className="text-base font-semibold">Learn: {topology.title}</h2>
      <p className="mt-1 text-sm" style={{ color: 'var(--prism-muted)' }}>
        {topology.subtitle}
      </p>

      <div className="mt-3">
        <label htmlFor="prism-edu-topic" className="text-sm font-semibold">
          Topic
        </label>
        <select
          id="prism-edu-topic"
          className="prism-select mt-1 w-full"
          value={topic}
          onChange={(e) => setSelectedTopic(e.target.value)}
        >
          {topics.map((t: string) => (
            <option key={t} value={t}>
              {t.toUpperCase()}
            </option>
          ))}
        </select>
      </div>

      {!content ? (
        <p className="mt-4 text-sm" style={{ color: 'var(--prism-muted)' }}>
          No educational content for the topic {topic} in this topology yet.
        </p>
      ) : (
        <>
          <h3 className="mt-4 text-sm font-semibold">{content.title}</h3>

          <Section title="What it does">
            <p>{content.what}</p>
          </Section>

          <Section title="Why it is used in this topology">
            <p>{content.whyHere}</p>
          </Section>

          <Section title="OSI layer">
            <p>{content.osiLayer}</p>
          </Section>

          <Section title="Relevant configuration">
            <pre
              className="prism-scroll max-h-64 overflow-auto whitespace-pre-wrap rounded p-3 font-mono text-xs"
              style={{ background: 'var(--prism-bg-soft)' }}
            >
              {content.config}
            </pre>
          </Section>

          <Section title="How a packet is processed">
            <p>{content.packetProcessing}</p>
          </Section>

          <Section title="Troubleshooting commands">
            {content.commands.length === 0 ? (
              <p style={{ color: 'var(--prism-muted)' }}>
                No troubleshooting commands stated for this topic.
              </p>
            ) : (
              <ul className="list-disc pl-5 font-mono text-xs">
                {content.commands.map((cmd) => (
                  <li key={cmd}>{cmd}</li>
                ))}
              </ul>
            )}
          </Section>

          <Section title="Interview question">
            <p>{content.interviewQuestion}</p>
            <details className="mt-2">
              <summary className="cursor-pointer font-semibold" style={{ color: 'var(--prism-cyan)' }}>
                Show answer
              </summary>
              <p className="mt-1">{content.interviewAnswer}</p>
            </details>
          </Section>

          <Section title="Realistic failure example">
            <p>{content.failureExample}</p>
          </Section>
        </>
      )}
    </div>
  )
}
