'use client'

import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { ClaudeCodeIcon } from './ClaudeCodeIcon'

const EFFORT_LEVELS = ['low', 'medium', 'high'] as const
type Effort = (typeof EFFORT_LEVELS)[number]

interface LogEntry {
  id: number
  role: 'user' | 'agent'
  text: string
}

// Canned replies so the mockup feels alive without a real backend.
const CANNED_REPLIES = [
  'Scanning the board for open tickets...',
  'Picked up AB-04 — building theme registry. Spawning a tmux pane now.',
  'Running `pnpm typecheck`... 3 errors found. Fixing types in src/lib/themes.ts.',
  'Done. Tests passing, pushing to agent/ab-04 branch.',
]

/** A Claude Code–style interactive session, standing in for the live agent
 *  pane AgentBoard would spawn. Type a prompt and hit enter; shift+tab
 *  toggles auto mode and the effort pill cycles on click, same shortcuts
 *  Claude Code itself uses. */
function AgentSessionView() {
  const [autoMode, setAutoMode] = useState(true)
  const [effort, setEffort] = useState<Effort>('medium')
  const [value, setValue] = useState('')
  const [log, setLog] = useState<LogEntry[]>([])
  const [thinking, setThinking] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const replyIndex = useRef(0)
  const idRef = useRef(0)
  const logEndRef = useRef<HTMLDivElement>(null)
  const agentCount = 3

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ block: 'nearest' })
  }, [log, thinking])

  const cycleEffort = () => {
    setEffort((current) => EFFORT_LEVELS[(EFFORT_LEVELS.indexOf(current) + 1) % EFFORT_LEVELS.length])
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Tab' && e.shiftKey) {
      e.preventDefault()
      setAutoMode((a) => !a)
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
      setLog((prev) => [...prev, { id: idRef.current++, role: 'agent', text: reply }])
      setThinking(false)
    }, 700)
  }

  return (
    <div className="flex h-full cursor-text flex-col gap-3" onClick={() => inputRef.current?.focus()}>
      <div className="flex items-start gap-3 px-1 pt-1">
        <ClaudeCodeIcon className="h-9 w-9 shrink-0" />
        <div className="min-w-0 text-sm leading-5">
          <div className="font-bold text-[var(--foreground)]">
            Claude Code <span className="font-normal text-[var(--muted)]">v2.1.310</span>
          </div>
          <div className="text-[var(--muted)]">Opus 5.5 · Claude Pro</div>
          <div className="text-[var(--muted)]">~/agent-board</div>
        </div>
      </div>

      <div className="border-t border-[var(--border)]" />

      {log.length > 0 && (
        <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-1 text-sm">
          {log.map((entry) => (
            <div key={entry.id} className={entry.role === 'user' ? 'text-[var(--foreground)]' : 'text-[var(--muted)]'}>
              <span className={entry.role === 'user' ? 'text-[var(--primary)]' : 'text-[var(--secondary)]'}>
                {entry.role === 'user' ? '❯' : '●'}
              </span>{' '}
              {entry.text}
            </div>
          ))}
          {thinking && <div className="animate-pulse text-[var(--secondary)]">● thinking…</div>}
          <div ref={logEndRef} />
        </div>
      )}

      <div className="flex items-center gap-2 border-t border-[var(--border)] px-1 pt-2 text-sm">
        <span className="text-[var(--primary)]">❯</span>
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder='Try "fix typecheck errors"'
          className="flex-1 bg-transparent text-[var(--foreground)] outline-none placeholder:text-[var(--muted)]"
        />
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-[var(--border)] px-1 pt-2 text-xs">
        <button onClick={() => setAutoMode((a) => !a)} className="flex items-center gap-2 text-[var(--secondary)] hover:opacity-80">
          <span>▸▸</span>
          <span>
            auto mode {autoMode ? 'on' : 'off'} <span className="text-[var(--muted)]">(shift+tab to cycle)</span>
          </span>
          <span className="text-[var(--border)]">·</span>
          <span className="text-[var(--muted)]">← {agentCount} agents</span>
        </button>
        <button onClick={cycleEffort} className="flex items-center gap-2 text-[var(--muted)] hover:opacity-80">
          <span>◐</span>
          <span>{effort}</span>
          <span>· /effort</span>
        </button>
      </div>
    </div>
  )
}

export { AgentSessionView }
