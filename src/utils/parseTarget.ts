export type ParsedTarget =
  | { kind: 'sets'; count: number; maxCount?: number; reps: string }
  | { kind: 'rounds'; count: number; unit: 'rounds' | 'sets' }
  | { kind: 'single'; label: string }

/** "4 x 5–8", "2 x 10/leg", "1–2 x 8/leg", "2–3 x 10–15" -> N sets of reps */
const SETS_RE = /^(\d+)(?:\s*[–—-]\s*(\d+))?\s*[x×]\s*(.+)$/i
/** "3 rounds", "2 sets" -> N checkable rounds (no rep target) */
const ROUNDS_RE = /^(\d+)\s*(rounds?|sets?)$/i

/**
 * Turns a free-text weekly target into something the Train flow can render as
 * checkable work. Falls back to a single check-off item for anything timed or
 * qualitative ("40–50 min", "Optional 5–10 min", "> 3–5 reps", "Skip").
 */
export function parseTarget(raw: string): ParsedTarget {
  const text = (raw ?? '').trim()
  if (!text) return { kind: 'single', label: '' }

  const rounds = ROUNDS_RE.exec(text)
  if (rounds) {
    const count = Number(rounds[1])
    const unit = rounds[2].toLowerCase().startsWith('round') ? 'rounds' : 'sets'
    if (count > 0) return { kind: 'rounds', count, unit }
  }

  const sets = SETS_RE.exec(text)
  if (sets) {
    const count = Number(sets[1])
    const maxCount = sets[2] ? Number(sets[2]) : undefined
    const reps = sets[3].trim()
    if (count > 0 && reps) return { kind: 'sets', count, maxCount, reps }
  }

  return { kind: 'single', label: text }
}
