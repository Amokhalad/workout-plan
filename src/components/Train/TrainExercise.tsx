import { useRef, useState, type KeyboardEvent } from 'react'
import type { PlanExercise } from '../../types/plan'
import { useApp } from '../../context/AppContext'
import { parseTarget } from '../../utils/parseTarget'
import { RestTimer } from '../RestTimer'

/** A logged set must read as weight x reps, e.g. "125 x 5". */
const WEIGHT_REPS_RE = /^\d+(?:\.\d+)?\s*[x×]\s*\d+$/i

/** Normalizes the weight x reps separator to " x " as the user types (e.g. "125x5" -> "125 x 5", "125x" -> "125 x "). */
function formatSetActual(value: string): string {
  return value.replace(/^\s*(\d+(?:\.\d+)?)\s*[x×]\s*/i, '$1 x ')
}

interface TrainExerciseProps {
  workoutId: string
  week: number
  exercise: PlanExercise
  accent: string
  /** When the session is skipped, logging is locked (but existing entries are preserved). */
  disabled?: boolean
}

export function TrainExercise({ workoutId, week, exercise, accent, disabled = false }: TrainExerciseProps) {
  const { getSets, toggleSet, setSetActual, addSet, removeSet, get, set, updateExercise } = useApp()

  const rawTarget = exercise.targets[week - 1] ?? exercise.targets[0] ?? ''
  const parsed = parseTarget(rawTarget)
  const prescribed = parsed.kind === 'single' ? 1 : parsed.count
  const requireWeightReps = parsed.kind === 'sets'

  const sets = getSets(workoutId, week, exercise.id, prescribed)
  const doneCount = sets.filter((s) => s.done).length
  const total = sets.length
  const allDone = total > 0 && doneCount === total

  const log = get(workoutId, week, exercise.id, exercise.name)

  const [restSignal, setRestSignal] = useState(0)
  const [open, setOpen] = useState(true)
  const [resting, setResting] = useState(false)
  const [errorRows, setErrorRows] = useState<Set<number>>(() => new Set())
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Highlight the card only while the rest timer is actively counting down (and the card is open).
  const isActive = resting && open

  const isInvalidActual = (value: string) =>
    requireWeightReps && value.trim() !== '' && !WEIGHT_REPS_RE.test(value.trim())

  const setRowError = (index: number, hasError: boolean) =>
    setErrorRows((prev) => {
      if (hasError === prev.has(index)) return prev
      const next = new Set(prev)
      if (hasError) next.add(index)
      else next.delete(index)
      return next
    })

  const handleToggle = (index: number) => {
    if (disabled) return
    const willComplete = !sets[index]?.done
    if (willComplete && isInvalidActual(sets[index]?.actual ?? '')) {
      setRowError(index, true)
      inputRefs.current[index]?.focus()
      return
    }
    setRowError(index, false)
    toggleSet(workoutId, week, exercise.id, index, prescribed)
    if (willComplete) {
      setRestSignal((s) => s + 1)
      // Tapping the final set's check tidies the exercise away. Typing never collapses (see below).
      if (doneCount + 1 === total) setOpen(false)
    } else {
      setOpen(true)
    }
  }

  const handleActualChange = (index: number, raw: string, el: HTMLInputElement) => {
    if (disabled) return
    const value = requireWeightReps ? formatSetActual(raw) : raw
    setSetActual(workoutId, week, exercise.id, index, value, prescribed)
    // Keep the caret at the end whenever auto-formatting rewrote the value.
    if (value !== raw) {
      requestAnimationFrame(() => el.setSelectionRange(el.value.length, el.value.length))
    }
    setRowError(index, false) // editing clears any error; it's re-checked on a done attempt
    // Logging a valid weight x reps means you did it: auto-complete it (and start rest).
    // Deliberately does NOT collapse the exercise, so you can keep typing into the last set.
    const valid = !requireWeightReps || WEIGHT_REPS_RE.test(value.trim())
    if (valid && value.trim() && !sets[index]?.done) {
      toggleSet(workoutId, week, exercise.id, index, prescribed)
      setRestSignal((s) => s + 1)
    }
  }

  // Tab / Shift+Tab jumps straight between the weight x reps inputs, skipping the checkboxes between them.
  const handleInputKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key !== 'Tab' || e.metaKey || e.ctrlKey || e.altKey) return
    const target = index + (e.shiftKey ? -1 : 1)
    const next = target >= 0 && target < sets.length ? inputRefs.current[target] : null
    if (next) {
      e.preventDefault()
      next.focus()
      next.select()
    }
  }

  const showReps = parsed.kind === 'sets'
  const showActual = parsed.kind !== 'rounds'
  const rowNoun = parsed.kind === 'rounds' ? (parsed.unit === 'sets' ? 'Set' : 'Round') : 'Set'
  const canAdd = parsed.kind === 'sets' || parsed.kind === 'rounds'

  return (
    <article
      className="overflow-hidden rounded-2xl border bg-[var(--color-surface-card)]/80 backdrop-blur-sm"
      style={{
        borderColor: isActive ? accent : 'var(--color-border)',
        borderLeftColor: isActive || allDone ? accent : 'var(--color-border)',
        borderLeftWidth: 3,
        boxShadow: isActive ? `0 0 0 1px ${accent}55, 0 12px 32px -14px ${accent}` : undefined,
        transition: 'box-shadow 0.3s ease, border-color 0.3s ease',
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="touch-target flex w-full items-center gap-3 p-4 text-left active:bg-white/[0.02] sm:p-5"
      >
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold leading-snug text-[var(--color-heading)] sm:text-lg">{exercise.name}</h3>
          <p className="mt-0.5 font-mono text-xs text-[var(--color-muted)]">{rawTarget || 'No target set'}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {isActive && (
            <span
              className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider"
              style={{ color: accent }}
            >
              <span className="h-1.5 w-1.5 animate-pulse rounded-full" style={{ background: accent }} aria-hidden />
              Resting
            </span>
          )}
          <span
            className="text-xs font-semibold tabular-nums"
            style={{ color: allDone ? accent : 'var(--color-muted)' }}
          >
            {allDone ? 'Done' : `${doneCount}/${total}`}
          </span>
          <span
            className="text-base leading-none text-[var(--color-muted)] transition-transform duration-200"
            style={{ transform: open ? 'rotate(180deg)' : 'none' }}
            aria-hidden
          >
            ▾
          </span>
        </div>
      </button>

      {open && (
        <div className="border-t border-[var(--color-border)] px-3 pb-4 pt-3 sm:px-5">
          <div className="space-y-2">
            {sets.map((s, i) => {
              const isExtra = i >= prescribed
              const hasError = errorRows.has(i)
              return (
                <div key={i} className="space-y-1">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleToggle(i)}
                      disabled={disabled}
                      aria-pressed={s.done}
                      aria-label={`${rowNoun} ${i + 1} ${s.done ? 'done' : 'not done'}`}
                      className="touch-target flex h-11 min-w-0 flex-1 items-center gap-3 rounded-xl border px-3 text-left transition active:scale-[0.99] disabled:cursor-not-allowed"
                      style={{
                        borderColor: hasError ? '#d98c7a' : s.done ? accent : 'var(--color-border)',
                        background: hasError ? '#d98c7a14' : s.done ? `${accent}1a` : 'var(--color-surface-raised)',
                      }}
                    >
                      <span
                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[11px] font-bold"
                        style={{
                          borderColor: s.done ? accent : 'var(--color-border)',
                          background: s.done ? accent : 'transparent',
                          color: s.done ? '#0c0c0e' : 'var(--color-muted)',
                        }}
                        aria-hidden
                      >
                        {s.done ? '✓' : i + 1}
                      </span>
                      <span className="min-w-0 truncate">
                        <span className="text-sm font-medium text-[var(--color-text)]">
                          {parsed.kind === 'single' ? (parsed.label || 'Mark complete') : `${rowNoun} ${i + 1}`}
                        </span>
                        {showReps && (
                          <span className="ml-2 font-mono text-xs text-[var(--color-muted)]">{parsed.reps}</span>
                        )}
                      </span>
                    </button>

                    {showActual && (
                      <input
                        ref={(el) => {
                          inputRefs.current[i] = el
                        }}
                        type="text"
                        inputMode="text"
                        value={s.actual}
                        placeholder={requireWeightReps ? '125 x 5' : 'log result'}
                        disabled={disabled}
                        aria-invalid={hasError}
                        aria-label={`${rowNoun} ${i + 1} weight and reps`}
                        onChange={(e) => handleActualChange(i, e.target.value, e.currentTarget)}
                        onKeyDown={(e) => handleInputKeyDown(e, i)}
                        className={`field-input h-11 w-24 shrink-0 rounded-xl border bg-[var(--color-surface)] px-3 text-sm text-[var(--color-text)] outline-none disabled:cursor-not-allowed disabled:opacity-50 ${
                          hasError ? 'border-[#d98c7a] focus:border-[#d98c7a]' : 'border-[var(--color-border)] focus:border-[var(--color-gold)]'
                        }`}
                      />
                    )}

                    {isExtra && (
                      <button
                        type="button"
                        onClick={() => removeSet(workoutId, week, exercise.id, i)}
                        disabled={disabled}
                        aria-label={`Remove ${rowNoun.toLowerCase()} ${i + 1}`}
                        className="touch-target flex h-11 w-9 shrink-0 items-center justify-center rounded-xl border border-[var(--color-border)] text-sm text-[var(--color-muted)] disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                  {hasError && (
                    <p className="pl-1 text-[11px]" style={{ color: '#d98c7a' }}>
                      Enter weight × reps, e.g. <span className="font-mono">125 x 5</span>
                    </p>
                  )}
                </div>
              )
            })}
          </div>

          {canAdd && !disabled && (
            <button
              type="button"
              onClick={() => addSet(workoutId, week, exercise.id, prescribed)}
              className="touch-target mt-2 w-full rounded-xl border border-dashed border-[var(--color-border)] py-2.5 text-xs font-medium text-[var(--color-gold)] active:bg-white/5"
            >
              + Add {rowNoun.toLowerCase()}
            </button>
          )}

          <div className="mt-3">
            <RestTimer
              restSeconds={exercise.restSeconds}
              accent={accent}
              startSignal={restSignal}
              onRunningChange={setResting}
              onRestChange={(seconds) => updateExercise(workoutId, exercise.id, { restSeconds: seconds })}
            />
          </div>

          <label className="mt-3 block">
            <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-[var(--color-muted)]">
              Notes
            </span>
            <textarea
              value={log.notes}
              placeholder="How did it feel?"
              rows={2}
              disabled={disabled}
              onChange={(e) => set(workoutId, week, exercise.id, 'notes', e.target.value)}
              className="field-input min-h-[3.5rem] w-full resize-y rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-[var(--color-text)] outline-none focus:border-[var(--color-gold)] focus:ring-2 focus:ring-[var(--color-gold)]/20 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </label>
        </div>
      )}
    </article>
  )
}
