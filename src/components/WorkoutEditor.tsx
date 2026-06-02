import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { REST_PRESETS } from '../data/defaultPlan'
import type { PlanWorkout } from '../types/plan'
import { useApp } from '../context/AppContext'
import { useBodyScrollLock } from '../hooks/useBodyScrollLock'
import { useSessions } from '../hooks/useSessions'
import { formatDuration } from '../utils/formatTime'
import { WEEKDAYS } from '../utils/sessionDates'

interface WorkoutEditorProps {
  workout: PlanWorkout
  week: number
  onClose: () => void
}

export function WorkoutEditor({ workout, week, onClose }: WorkoutEditorProps) {
  const { updateWorkout, updateExercise, addExercise, removeExercise, moveExercise, updateFooter } = useApp()
  const sessions = useSessions()
  const [applyAllWeeks, setApplyAllWeeks] = useState(false)

  // Weeks already logged or skipped: their prescription is history, so an all-weeks apply must not touch them.
  const lockedWeeks = useMemo(() => {
    const out: number[] = []
    for (let w = 1; w <= 12; w++) {
      const s = sessions.get(workout, w)
      if (s.logged || s.skipped) out.push(w)
    }
    return out
  }, [sessions, workout])
  const protectedCount = lockedWeeks.filter((w) => w !== week).length

  useBodyScrollLock(true)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const weekIdx = week - 1

  return (
    <div className="fixed inset-0 z-[100] flex flex-col justify-end sm:items-center sm:justify-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
        aria-label="Close editor"
        onClick={onClose}
      />

      <div
        className="sheet-panel safe-bottom relative flex max-h-[min(92dvh,900px)] w-full max-w-lg flex-col rounded-t-[1.25rem] border border-[var(--color-border)] bg-[var(--color-surface-card)] shadow-2xl sm:max-h-[85dvh] sm:rounded-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="workout-editor-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 flex-col items-center pt-2 sm:hidden">
          <div className="mb-2 h-1 w-10 rounded-full bg-[var(--color-border)]" aria-hidden />
        </div>

        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-[var(--color-border)] px-4 py-3 sm:px-5 sm:py-4">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-gold)]">Customize workout</p>
            <h2 id="workout-editor-title" className="truncate font-[family-name:var(--font-display)] text-xl text-[var(--color-heading)]">
              {workout.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="touch-target flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[var(--color-border)] text-xl text-[var(--color-muted)]"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="sheet-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-5">
          <div className="mb-5 space-y-3">
            <label className="block">
              <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-[var(--color-muted)]">Title</span>
              <input
                type="text"
                value={workout.title}
                onChange={(e) => updateWorkout(workout.id, { title: e.target.value })}
                className="field-input w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-[var(--color-text)] outline-none focus:border-[var(--color-gold)] focus:ring-2 focus:ring-[var(--color-gold)]/20"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-[var(--color-muted)]">Subtitle</span>
              <input
                type="text"
                value={workout.subtitle}
                onChange={(e) => updateWorkout(workout.id, { subtitle: e.target.value })}
                className="field-input w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-[var(--color-text)] outline-none focus:border-[var(--color-gold)] focus:ring-2 focus:ring-[var(--color-gold)]/20"
              />
            </label>
            <div>
              <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-[var(--color-muted)]">Day</span>
              <div className="preset-scroll -mx-1 px-1">
                {WEEKDAYS.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => updateWorkout(workout.id, { day: d })}
                    className={`touch-target shrink-0 rounded-xl px-4 py-2.5 text-sm font-medium ${
                      workout.day === d
                        ? 'bg-[var(--color-gold)] text-[#0c0c0e]'
                        : 'border border-[var(--color-border)] text-[var(--color-muted)]'
                    }`}
                  >
                    {d.slice(0, 3)}
                  </button>
                ))}
              </div>
              <span className="mt-1.5 block text-[11px] text-[var(--color-muted)]">
                Moves this workout to that weekday across all 12 weeks. Your logged sessions keep their actual dates.
              </span>
            </div>
          </div>

          <label className="touch-target mb-5 flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border border-[var(--color-border)] px-4 py-3">
            <input
              type="checkbox"
              checked={applyAllWeeks}
              onChange={(e) => setApplyAllWeeks(e.target.checked)}
              className="h-5 w-5 shrink-0 accent-[var(--color-gold)]"
            />
            <span className="text-sm leading-snug text-[var(--color-text)]">Apply target & note changes to all 12 weeks</span>
          </label>

          {applyAllWeeks && protectedCount > 0 && (
            <p className="-mt-3 mb-5 text-xs leading-relaxed text-[var(--color-gold-dim)]">
              {protectedCount} week{protectedCount === 1 ? '' : 's'} already logged or skipped will be left unchanged.
            </p>
          )}

          <div className="space-y-4 pb-2">
            {workout.exercises.map((ex, index) => (
              <div
                key={ex.id}
                className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-raised)]/50 p-4"
              >
                <div className="mb-3 flex items-center justify-between gap-2">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-muted)]">
                    Exercise {index + 1}
                  </span>
                  <div className="flex gap-1.5">
                    <IconBtn label="Move up" disabled={index === 0} onClick={() => moveExercise(workout.id, ex.id, -1)}>
                      ↑
                    </IconBtn>
                    <IconBtn
                      label="Move down"
                      disabled={index === workout.exercises.length - 1}
                      onClick={() => moveExercise(workout.id, ex.id, 1)}
                    >
                      ↓
                    </IconBtn>
                    <IconBtn
                      label="Remove"
                      onClick={() => {
                        if (workout.exercises.length > 1 && window.confirm(`Remove "${ex.name}"?`)) {
                          removeExercise(workout.id, ex.id)
                        }
                      }}
                    >
                      ✕
                    </IconBtn>
                  </div>
                </div>

                <label className="mb-3 block">
                  <span className="mb-1 block text-[10px] uppercase tracking-wider text-[var(--color-muted)]">Name</span>
                  <input
                    type="text"
                    value={ex.name}
                    onChange={(e) => updateExercise(workout.id, ex.id, { name: e.target.value })}
                    className="field-input w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 outline-none focus:border-[var(--color-gold)]"
                  />
                </label>

                <label className="mb-3 block">
                  <span className="mb-1 block text-[10px] uppercase tracking-wider text-[var(--color-muted)]">
                    Target · week {week}
                  </span>
                  <input
                    type="text"
                    value={ex.targets[weekIdx] ?? ''}
                    onChange={(e) =>
                      updateExercise(workout.id, ex.id, {
                        target: e.target.value,
                        week,
                        allWeeks: applyAllWeeks,
                        lockedWeeks,
                      })
                    }
                    className="field-input w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 font-mono outline-none focus:border-[var(--color-gold)]"
                  />
                </label>

                <div>
                  <span className="mb-2 block text-[10px] uppercase tracking-wider text-[var(--color-muted)]">Default rest</span>
                  <div className="preset-scroll -mx-1 px-1">
                    {REST_PRESETS.map((sec) => (
                      <button
                        key={sec}
                        type="button"
                        onClick={() => updateExercise(workout.id, ex.id, { restSeconds: sec })}
                        className={`touch-target shrink-0 rounded-xl px-4 py-2.5 text-sm font-medium ${
                          ex.restSeconds === sec
                            ? 'bg-[var(--color-gold)] text-[#0c0c0e]'
                            : 'border border-[var(--color-border)] text-[var(--color-muted)]'
                        }`}
                      >
                        {formatDuration(sec)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => addExercise(workout.id, week)}
            className="touch-target mb-2 w-full rounded-xl border border-dashed border-[var(--color-border)] py-3.5 text-sm font-medium text-[var(--color-gold)] active:bg-white/5"
          >
            + Add exercise
          </button>

          {workout.footers.length > 0 && (
            <div className="mt-6 space-y-4">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-muted)]">
                Notes (recovery, goals, finishers)
              </p>
              {workout.footers.map((f) => (
                <div
                  key={f.id}
                  className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-raised)]/50 p-4"
                >
                  <label className="mb-3 block">
                    <span className="mb-1 block text-[10px] uppercase tracking-wider text-[var(--color-muted)]">Label</span>
                    <input
                      type="text"
                      value={f.label}
                      onChange={(e) => updateFooter(workout.id, f.id, { label: e.target.value })}
                      className="field-input w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 outline-none focus:border-[var(--color-gold)]"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-[10px] uppercase tracking-wider text-[var(--color-muted)]">
                      Note · week {week}
                    </span>
                    <input
                      type="text"
                      value={f.targets[weekIdx] ?? ''}
                      onChange={(e) =>
                        updateFooter(workout.id, f.id, {
                          value: e.target.value,
                          week,
                          allWeeks: applyAllWeeks,
                          lockedWeeks,
                        })
                      }
                      className="field-input w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 outline-none focus:border-[var(--color-gold)]"
                    />
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="shrink-0 border-t border-[var(--color-border)] p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={onClose}
            className="touch-target w-full rounded-xl bg-[var(--color-gold)] py-3.5 text-sm font-semibold text-[#0c0c0e] active:scale-[0.99]"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}

function IconBtn({
  children,
  label,
  disabled,
  onClick,
}: {
  children: ReactNode
  label: string
  disabled?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="touch-target flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--color-border)] text-sm disabled:opacity-30"
    >
      {children}
    </button>
  )
}
