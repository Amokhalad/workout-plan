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
      <h4 className="mb-3 text-base font-medium leading-snug text-[#f5f3ef]">{exercise.name}</h4>

      <label className="mb-3 block">
        <span className="mb-1.5 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--color-muted)]">
          Target
          <span className="font-normal normal-case tracking-normal text-[var(--color-gold-dim)]">tap to edit</span>
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
          className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 font-mono text-sm outline-none transition focus:border-[var(--color-gold)] focus:ring-2 focus:ring-[var(--color-gold)]/20"
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
            value={log.actual}
            placeholder="Log sets, weight, reps…"
            onChange={(e) => set(workoutId, week, exercise.id, 'actual', e.target.value)}
            className="min-h-12 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-[var(--color-text)] outline-none transition focus:border-[var(--color-gold)] focus:ring-2 focus:ring-[var(--color-gold)]/20 md:min-h-0 md:py-2.5 md:text-sm"
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
            className="w-full resize-y rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-[var(--color-text)] outline-none transition focus:border-[var(--color-gold)] focus:ring-2 focus:ring-[var(--color-gold)]/20 md:py-2.5 md:text-sm"
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
