import type { PlanExercise } from '../types/plan'
import { useApp } from '../context/AppContext'
import { formatDuration } from '../utils/formatTime'

interface ExerciseCardProps {
  workoutId: string
  week: number
  exercise: PlanExercise
  accent: string
}

export function ExerciseCard({ workoutId, week, exercise, accent }: ExerciseCardProps) {
  const { updateExercise } = useApp()
  const targetIdx = week - 1
  const target = exercise.targets[targetIdx] ?? exercise.targets[0] ?? ''

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-raised)]/40 p-3 sm:p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <h4 className="pr-1 text-base font-medium leading-snug text-[var(--color-heading)]">{exercise.name}</h4>
        <span className="shrink-0 whitespace-nowrap text-[10px] font-medium uppercase tracking-wider text-[var(--color-muted)]">
          Rest {formatDuration(exercise.restSeconds)}
        </span>
      </div>

      <label className="block">
        <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-[var(--color-muted)]">
          Target · week {week}
        </span>
        <input
          type="text"
          value={target}
          onChange={(e) => updateExercise(workoutId, exercise.id, { target: e.target.value, week })}
          placeholder="e.g. 4 x 5–8"
          className="field-input w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 font-mono outline-none focus:border-[var(--color-gold)] focus:ring-2 focus:ring-[var(--color-gold)]/20"
          style={{ color: accent }}
        />
      </label>
    </div>
  )
}
