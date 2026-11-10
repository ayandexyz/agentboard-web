import { useState } from 'react'
import { Check, Minus } from 'lucide-react'
import Container from '@/components/ui/Container'
import LineBorder from '@/components/ui/LineBorder'
import { benchmark } from '@/data/benchmark'

const tools = ['AgentBoard', 'herdr', 'Vibe Kanban', 'Agent Orchestrator'] as const

type Cell = string | boolean

const rows: { label: string; cells: [Cell, Cell, Cell, Cell] }[] = [
  { label: 'Download (Linux x86_64)', cells: ['13.8 MB', '30.2 MB', '23.9 MB + Node.js', '177–219 MB'] },
  { label: 'Runs as', cells: ['Terminal UI', 'Terminal UI', 'Browser app', 'Electron app'] },
  { label: 'Needs', cells: ['tmux', 'Nothing', 'Node.js 20+', 'Nothing'] },
  { label: 'Kanban board for tickets', cells: [true, false, true, true] },
  { label: 'Git worktree per task', cells: [true, true, true, true] },
  { label: 'Merge or PR from the board', cells: [true, false, true, true] },
  { label: 'Android (Termux) build', cells: [true, false, false, false] },
  { label: 'Native Windows', cells: ['WSL', true, true, true] },
  { label: 'No telemetry', cells: [true, true, false, false] },
]

function CellValue({ value }: { value: Cell }) {
  if (value === true) return <Check className="h-5 w-5 mx-auto text-[var(--foreground)]" aria-label="Yes" />
  if (value === false) return <Minus className="h-5 w-5 mx-auto text-[var(--muted)] opacity-50" aria-label="No" />
  return <span>{value}</span>
}

const lessBy = (ours: number, theirs: number) => Math.round((1 - ours / theirs) * 100)

const series = [
  { key: 'agentboard', name: 'AgentBoard', version: benchmark.agentboard, bar: 'bg-[var(--foreground)]' },
  { key: 'herdr', name: 'herdr', version: benchmark.herdr, bar: 'bg-[var(--muted)] opacity-50' },
] as const

export default function Comparison() {
  const { runs } = benchmark
  const [index, setIndex] = useState(runs.length - 1)
  const run = runs[index]
  const max = Math.max(...runs.map((r) => Math.max(r.agentboard.mb, r.herdr.mb)))
  const last = runs[runs.length - 1]
  const saved = lessBy(last.agentboard.mb, last.herdr.mb)
  const memDiff = lessBy(run.agentboard.mb, run.herdr.mb)

  return (
    <LineBorder>
      <section id="compare" className="py-20 sm:py-32 bg-[var(--background)]/50">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Stays light as you add agents
            </h2>
            <p className="mt-4 text-lg text-[var(--muted)]">
              AgentBoard and herdr running the same agents on the same machine. At 10 agents
              AgentBoard uses {saved}% less memory and almost half the CPU.
            </p>
          </div>

          <div className="mt-16 max-w-3xl mx-auto rounded-sm border border-[var(--foreground)]/10 bg-[var(--background-element)] p-4 sm:p-8">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="font-semibold text-xl">Memory used by the tool itself</h3>
              <span className="text-lg">
                {run.agents} {run.agents === 1 ? 'agent' : 'agents'} running
              </span>
            </div>

            <div className="mt-8 space-y-5">
              {series.map((s) => (
                <div key={s.key}>
                  <div className="flex items-baseline justify-between text-sm">
                    <span className={s.key === 'agentboard' ? '' : 'text-[var(--muted)]'}>
                      {s.name} {s.version}
                    </span>
                    <span className="font-mono tabular-nums text-lg">{run[s.key].mb.toFixed(1)} MB</span>
                  </div>
                  <div className="mt-2 h-8 rounded-sm bg-[var(--background)]/60">
                    <div
                      className={`h-full rounded-sm transition-[width] duration-500 ease-out ${s.bar}`}
                      style={{ width: `${(run[s.key].mb / max) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 grid gap-2 sm:grid-cols-2 text-lg">
              <p>
                <span className="font-mono">{Math.abs(memDiff)}%</span>{' '}
                {memDiff >= 0 ? 'less' : 'more'} memory than herdr
              </p>
              <p className="sm:text-right">
                CPU <span className="font-mono">{run.agentboard.cpu.toFixed(2)}%</span> vs{' '}
                <span className="font-mono text-[var(--muted)]">{run.herdr.cpu.toFixed(2)}%</span>
              </p>
            </div>

            <div className="mt-8">
              <label htmlFor="agents-slider" className="text-sm text-[var(--muted)]">
                Slide to change how many agents are running
              </label>
              <input
                id="agents-slider"
                type="range"
                min={0}
                max={runs.length - 1}
                step={1}
                value={index}
                onChange={(e) => setIndex(Number(e.target.value))}
                aria-valuetext={`${run.agents} agents`}
                className="mt-3 w-full cursor-pointer accent-[var(--foreground)]"
              />
              <div className="mt-1 flex justify-between">
                {runs.map((r, i) => (
                  <button
                    key={r.agents}
                    type="button"
                    onClick={() => setIndex(i)}
                    className={`font-mono text-sm px-1 ${i === index ? 'text-[var(--foreground)]' : 'text-[var(--muted)]'}`}
                  >
                    {r.agents}
                  </button>
                ))}
              </div>
            </div>
            <p className="mt-4 text-sm text-[var(--muted)]">
              Proportional set size of each tool&apos;s own processes (agentboard with its tmux server
              and client; herdr&apos;s client and server), agents excluded. Each agent prints 20 lines
              a second. Median of 3 runs, {benchmark.measuredOn}, {benchmark.host}. With{' '}
              {benchmark.realClaude.agents} real Claude Code sessions idle at their prompt:{' '}
              {benchmark.realClaude.agentboard} MB vs {benchmark.realClaude.herdr} MB.{' '}
              <a
                href="https://github.com/ayandexyz/agent-board/blob/main/scripts/bench-memory.py"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-[var(--foreground)]"
              >
                Run it yourself
              </a>
              .
            </p>
          </div>

          <div className="mt-16 max-w-4xl mx-auto overflow-x-auto rounded-sm border border-[var(--foreground)]/10">
            <table className="w-full min-w-[640px] text-left">
              <thead className="bg-[var(--background-element)]">
                <tr>
                  <th className="p-4 font-semibold" />
                  {tools.map((t) => (
                    <th
                      key={t}
                      className={`p-4 text-center font-semibold ${t === 'AgentBoard' ? 'text-[var(--foreground)]' : 'text-[var(--muted)]'}`}
                    >
                      {t}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.label} className="border-t border-[var(--foreground)]/10">
                    <td className="p-4 text-[var(--muted)]">{row.label}</td>
                    {row.cells.map((c, i) => (
                      <td key={i} className={`p-4 text-center ${i === 0 ? 'bg-[var(--foreground)]/5' : ''}`}>
                        <CellValue value={c} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 max-w-4xl mx-auto text-sm text-[var(--muted)]">
            Checked against each project&apos;s source and latest release in November 2026.
            Vibe Kanban has announced it is shutting down.
          </p>
        </Container>
      </section>
    </LineBorder>
  )
}
