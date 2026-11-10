'use client'

import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { OpenCodeWordmark } from './OpenCodeWordmark'

const AGENTS = ['Build', 'Plan'] as const
type Agent = (typeof AGENTS)[number]

interface LogEntry {
  id: number
  role: 'user' | 'agent'
  text: string
  meta?: string
}

// Canned replies so the mockup feels alive without a real backend.
const CANNED_REPLIES: { text: string; meta: string }[] = [
  { text: 'Hey! What can I help you with today?', meta: '3.2s · 3.5 tok/s' },
  { text: 'Looking at the backlog — AB-02 needs Claude Code detection wired up. Want me to start there?', meta: '2.8s · 4.1 tok/s' },
  { text: 'Pushed the fix. `pnpm typecheck` is clean now.', meta: '5.1s · 3.9 tok/s' },
]

interface PromptBoxProps {
  value: string
  onChange: (value: string) => void
  onKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void
  inputRef: React.RefObject<HTMLInputElement>
  agent: Agent
  onCycleAgent: () => void
  hint: ReactNode
}

function PromptBox({ value, onChange, onKeyDown, inputRef, agent, onCycleAgent, hint }: PromptBoxProps) {
  return (
    <div className="mx-auto w-full max-w-xl">
      <div className="rounded-sm border-l-2 border-[var(--primary)] bg-[var(--primary)]/10 px-3 py-2 text-sm">
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder='Ask anything… "Fix broken tests"'
          className="w-full bg-transparent text-[var(--foreground)] outline-none placeholder:text-[var(--muted)]"
        />
        <div className="mt-2 text-xs text-[var(--muted)]">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onCycleAgent()
            }}
            className="font-bold text-[var(--primary)] hover:opacity-80"
          >
            {agent}
          </button>{' '}
          auto · <span className="font-bold text-[var(--foreground)]">MiniMax-M3</span> MiniMax (minimax.io)
        </div>
      </div>
      <div className="mt-1 flex items-center justify-between px-1 text-xs text-[var(--muted)]">
        <span>~</span>
        {hint}
      </div>
    </div>
  )
}

/** An OpenCode-style interactive session. Empty, it matches the idle screen:
 *  the wordmark centered above the prompt box, shift+tab agents / ctrl+p
 *  commands below it. The first message turns the wordmark into a
 *  "Greeting" session tab and fills the pane with the conversation, with
 *  the prompt box pinned under it, the way the real app behaves. */
function OpenCodeSessionView() {
  const [agent, setAgent] = useState<Agent>('Build')
  const [value, setValue] = useState('')
  const [log, setLog] = useState<LogEntry[]>([])
  const [thinking, setThinking] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const replyIndex = useRef(0)
  const idRef = useRef(0)
  const logEndRef = useRef<HTMLDivElement>(null)

  const started = log.length > 0

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ block: 'nearest' })
  }, [log, thinking])

  const cycleAgent = () => {
    setAgent((current) => AGENTS[(AGENTS.indexOf(current) + 1) % AGENTS.length])
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Tab' && e.shiftKey) {
      e.preventDefault()
      cycleAgent()
      return
    }
    if (e.key !== 'Enter') return
    const text = value.trim()
    if (!text || thinking) return

    setLog((prev) => [...prev, { id: idRef.current++, role: 'user', text }])
    setValue('')
    setThinking(true)
    window.setTimeout(() => {
      const reply = CANNED_REPLIES[replyIndex.current % CANNED_REPLIES.length]
      replyIndex.current += 1
      setLog((prev) => [...prev, { id: idRef.current++, role: 'agent', text: reply.text, meta: reply.meta }])
      setThinking(false)
    }, 700)
  }

  const tokens = (2.4 + log.length * 1.85).toFixed(1)
  const cost = (log.length * 0.008).toFixed(2)

  const hint = started ? (
    <span>
      {tokens}K (1%) · ${cost} · <span className="font-bold text-[var(--foreground)]">ctrl+p</span> commands
    </span>
  ) : (
    <span className="flex items-center gap-2">
      <span className="font-bold text-[var(--foreground)]">shift+tab</span> agents
      <span className="text-[var(--border)]">·</span>
      <span className="font-bold text-[var(--foreground)]">ctrl+p</span> commands
    </span>
  )

  const promptBox = (
    <PromptBox
      value={value}
      onChange={setValue}
      onKeyDown={handleKeyDown}
      inputRef={inputRef}
      agent={agent}
      onCycleAgent={cycleAgent}
      hint={hint}
    />
  )

  if (!started) {
    return (
      <div className="flex h-full cursor-text flex-col items-center justify-center gap-6" onClick={() => inputRef.current?.focus()}>
        <OpenCodeWordmark className="h-14 w-auto sm:h-16" />
        {promptBox}
      </div>
    )
  }

  return (
    <div className="flex h-full cursor-text flex-col gap-2" onClick={() => inputRef.current?.focus()}>
      <div className="flex items-center gap-2 px-1">
        <div className="rounded-sm border border-[var(--primary)]/40 bg-[var(--primary)]/15 px-3 py-1 text-xs font-bold text-[var(--foreground)]">
          Greeting
        </div>
        <span className="text-[var(--muted)]">+</span>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-1 text-sm">
        {log.map((entry) =>
          entry.role === 'user' ? (
            <div key={entry.id} className="rounded-sm border-l-2 border-[var(--primary)] bg-[var(--primary)]/10 px-3 py-2 text-[var(--foreground)]">
              {entry.text}
            </div>
          ) : (
            <div key={entry.id} className="px-1 text-[var(--foreground)]">
              <p>{entry.text}</p>
              {entry.meta && (
                <p className="mt-1 text-xs text-[var(--muted)]">
                  <span className="text-[var(--primary)]">{agent}</span> · {entry.meta}
                </p>
              )}
            </div>
          )
        )}
        {thinking && <div className="animate-pulse px-1 text-[var(--muted)]">● thinking…</div>}
        <div ref={logEndRef} />
      </div>

      {promptBox}
    </div>
  )
}

export { OpenCodeSessionView }
