import type { PlanExercise } from '../types/plan'
import { useApp } from '../context/AppContext'
import { RestTimer } from './RestTimer'

interface ExerciseCardProps {
  workoutId: string
  week: number
  exercise: PlanExercise
  accent: string
}

export function ExerciseCard({ workoutId, week, exercise, accent }: ExerciseCardProps) {
  const { get, set, updateExercise } = useApp()
  const targetIdx = week - 1
  const target = exercise.targets[targetIdx] ?? exercise.targets[0] ?? ''
  const log = get(workoutId, week, exercise.id, exercise.name)

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-raised)]/40 p-3 sm:p-4">
      <h4 className="mb-3 pr-1 text-base font-medium leading-snug text-[#f5f3ef]">{exercise.name}</h4>

      <label className="mb-3 block">
        <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-[var(--color-muted)]">
          Target
        </span>
        <input
          type="text"
          value={target}
          onChange={(e) =>
            updateExercise(workoutId, exercise.id, {
              target: e.target.value,
              week,
            })
          }
          placeholder="e.g. 4 x 5–8"
          className="field-input w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 font-mono outline-none focus:border-[var(--color-gold)] focus:ring-2 focus:ring-[var(--color-gold)]/20"
          style={{ color: accent }}
        />
      </label>

      <div className="mb-3 grid gap-3">
        <label className="block">
          <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-[var(--color-muted)]">
            Actual
          </span>
          <input
            type="text"
            inputMode="text"
            enterKeyHint="next"
            value={log.actual}
            placeholder="135×5, 145×3…"
            onChange={(e) => set(workoutId, week, exercise.id, 'actual', e.target.value)}
            className="field-input w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-[var(--color-text)] outline-none focus:border-[var(--color-gold)] focus:ring-2 focus:ring-[var(--color-gold)]/20"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-[var(--color-muted)]">
            Notes
          </span>
          <textarea
            value={log.notes}
            placeholder="How did it feel?"
            rows={2}
            onChange={(e) => set(workoutId, week, exercise.id, 'notes', e.target.value)}
            className="field-input min-h-[4.5rem] w-full resize-y rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-[var(--color-text)] outline-none focus:border-[var(--color-gold)] focus:ring-2 focus:ring-[var(--color-gold)]/20"
          />
        </label>
      </div>

      <RestTimer
        restSeconds={exercise.restSeconds}
        accent={accent}
        onRestChange={(seconds) => updateExercise(workoutId, exercise.id, { restSeconds: seconds })}
      />
    </div>
  )
}
