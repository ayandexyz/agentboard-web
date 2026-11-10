// Output of scripts/bench-memory.py in the agent-board repo (stream workload,
// median of 3 runs). Replace the whole object when re-measuring.
export const benchmark = {
  measuredOn: '2026-11-10',
  agentboard: 'v0.2.1',
  herdr: '0.9.5',
  host: 'Linux x86_64 · Intel i5-11320H · 8 cores · 16 GB',
  runs: [
    { agents: 0, agentboard: { mb: 21.8, cpu: 0.59 }, herdr: { mb: 30.2, cpu: 0.63 } },
    { agents: 1, agentboard: { mb: 24.3, cpu: 0.86 }, herdr: { mb: 32.0, cpu: 0.73 } },
    { agents: 5, agentboard: { mb: 29.3, cpu: 1.55 }, herdr: { mb: 36.4, cpu: 2.31 } },
    { agents: 10, agentboard: { mb: 29.1, cpu: 1.98 }, herdr: { mb: 39.4, cpu: 3.53 } },
  ],
  // claude workload: real Claude Code sessions idle at their prompt, median of 2 runs.
  realClaude: { agents: 10, agentboard: 27.3, herdr: 35.7 },
}
