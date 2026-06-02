import { useState } from 'react'
import type { PlanExercise } from '../../types/plan'
import { useApp } from '../../context/AppContext'
import { parseTarget } from '../../utils/parseTarget'
import { RestTimer } from '../RestTimer'

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

  const sets = getSets(workoutId, week, exercise.id, prescribed)
  const doneCount = sets.filter((s) => s.done).length
  const total = sets.length
  const allDone = total > 0 && doneCount === total

  const log = get(workoutId, week, exercise.id, exercise.name)

  const [restSignal, setRestSignal] = useState(0)
  const [open, setOpen] = useState(true)

  const handleToggle = (index: number) => {
    if (disabled) return
    const willComplete = !sets[index]?.done
    toggleSet(workoutId, week, exercise.id, index, prescribed)
    if (willComplete) {
      setRestSignal((s) => s + 1)
      // Tapping the final set's check tidies the exercise away. Typing never collapses (see below).
      if (doneCount + 1 === total) setOpen(false)
    } else {
      setOpen(true)
    }
  }

  const handleActualChange = (index: number, value: string) => {
    if (disabled) return
    setSetActual(workoutId, week, exercise.id, index, value, prescribed)
    // Logging a set's weight x reps means you did it: auto-complete it (and start rest).
    // Deliberately does NOT collapse the exercise, so you can keep typing into the last set.
    if (value.trim() && !sets[index]?.done) {
      toggleSet(workoutId, week, exercise.id, index, prescribed)
      setRestSignal((s) => s + 1)
    }
  }

  const showReps = parsed.kind === 'sets'
  const showActual = parsed.kind !== 'rounds'
  const rowNoun = parsed.kind === 'rounds' ? (parsed.unit === 'sets' ? 'Set' : 'Round') : 'Set'
  const canAdd = parsed.kind === 'sets' || parsed.kind === 'rounds'

  return (
    <article
      className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-card)]/80 backdrop-blur-sm"
      style={{ borderLeftColor: allDone ? accent : 'var(--color-border)', borderLeftWidth: 3 }}
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
              return (
                <div key={i} className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleToggle(i)}
                    disabled={disabled}
                    aria-pressed={s.done}
                    aria-label={`${rowNoun} ${i + 1} ${s.done ? 'done' : 'not done'}`}
                    className="touch-target flex h-11 min-w-0 flex-1 items-center gap-3 rounded-xl border px-3 text-left transition active:scale-[0.99] disabled:cursor-not-allowed"
                    style={{
                      borderColor: s.done ? accent : 'var(--color-border)',
                      background: s.done ? `${accent}1a` : 'var(--color-surface-raised)',
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
                      type="text"
                      inputMode="text"
                      value={s.actual}
                      placeholder="135x5"
                      disabled={disabled}
                      onChange={(e) => handleActualChange(i, e.target.value)}
                      className="field-input h-11 w-24 shrink-0 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-gold)] disabled:cursor-not-allowed disabled:opacity-50"
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
