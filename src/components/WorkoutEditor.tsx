import { useEffect, useState, type ReactNode } from 'react'
import { REST_PRESETS } from '../data/defaultPlan'
import type { PlanWorkout } from '../types/plan'
import { useApp } from '../context/AppContext'
import { formatDuration } from '../utils/formatTime'

interface WorkoutEditorProps {
  workout: PlanWorkout
  week: number
  onClose: () => void
}

export function WorkoutEditor({ workout, week, onClose }: WorkoutEditorProps) {
  const { updateWorkout, updateExercise, addExercise, removeExercise, moveExercise } = useApp()
  const [applyAllWeeks, setApplyAllWeeks] = useState(false)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  const weekIdx = week - 1

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        aria-label="Close editor"
        onClick={onClose}
      />
      <div
        className="safe-bottom relative flex max-h-[92dvh] w-full max-w-lg flex-col rounded-t-3xl border border-[var(--color-border)] bg-[var(--color-surface-card)] shadow-2xl sm:max-h-[85dvh] sm:rounded-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="workout-editor-title"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-[var(--color-border)] px-5 py-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-gold)]">Customize workout</p>
            <h2 id="workout-editor-title" className="font-[family-name:var(--font-display)] text-xl text-[#f5f3ef]">
              {workout.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="touch-target flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-border)] text-lg text-[var(--color-muted)]"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-4">
          <div className="mb-6 space-y-3">
            <label className="block">
              <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-[var(--color-muted)]">Title</span>
              <input
                type="text"
                value={workout.title}
                onChange={(e) => updateWorkout(workout.id, { title: e.target.value })}
                className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-[var(--color-text)] outline-none focus:border-[var(--color-gold)]"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-[var(--color-muted)]">Subtitle</span>
              <input
                type="text"
                value={workout.subtitle}
                onChange={(e) => updateWorkout(workout.id, { subtitle: e.target.value })}
                className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-[var(--color-text)] outline-none focus:border-[var(--color-gold)]"
              />
            </label>
          </div>

          <label className="mb-4 flex items-center gap-2 text-sm text-[var(--color-muted)]">
            <input
              type="checkbox"
              checked={applyAllWeeks}
              onChange={(e) => setApplyAllWeeks(e.target.checked)}
              className="h-4 w-4 rounded accent-[var(--color-gold)]"
            />
            Apply target changes to all 12 weeks
          </label>

          <div className="space-y-4">
            {workout.exercises.map((ex, index) => (
              <div
                key={ex.id}
                className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-raised)]/50 p-4"
              >
                <div className="mb-3 flex items-start justify-between gap-2">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-muted)]">
                    Exercise {index + 1}
                  </span>
                  <div className="flex gap-1">
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
                    className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-gold)]"
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
                      })
                    }
                    className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 font-mono text-sm outline-none focus:border-[var(--color-gold)]"
                  />
                </label>

                <div>
                  <span className="mb-1.5 block text-[10px] uppercase tracking-wider text-[var(--color-muted)]">Default rest</span>
                  <div className="flex flex-wrap gap-1.5">
                    {REST_PRESETS.map((sec) => (
                      <button
                        key={sec}
                        type="button"
                        onClick={() => updateExercise(workout.id, ex.id, { restSeconds: sec })}
                        className={`touch-target rounded-lg px-3 py-1.5 text-xs font-medium ${
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
            className="touch-target mt-4 w-full rounded-xl border border-dashed border-[var(--color-border)] py-3 text-sm font-medium text-[var(--color-gold)] transition active:bg-white/5"
          >
            + Add exercise
          </button>
        </div>

        <div className="shrink-0 border-t border-[var(--color-border)] p-4">
          <button
            type="button"
            onClick={onClose}
            className="touch-target w-full rounded-xl bg-[var(--color-gold)] py-3.5 text-sm font-semibold text-[#0c0c0e]"
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
      className="touch-target flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--color-border)] text-xs disabled:opacity-30"
    >
      {children}
    </button>
  )
}
