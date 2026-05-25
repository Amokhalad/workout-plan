import { getWorkoutDate, restDay, type WorkoutTemplate } from '../data/workoutPlan'
import { useWorkoutLogContext } from '../context/WorkoutLogContext'

interface WorkoutCardProps {
  workout: WorkoutTemplate
  week: number
  expanded: boolean
  onToggle: () => void
}

export function WorkoutCard({ workout, week, expanded, onToggle }: WorkoutCardProps) {
  const { get, set, completionForWeek } = useWorkoutLogContext()
  const date = getWorkoutDate(workout.id, week)
  const exerciseNames = workout.exercises.map((e) => e.name)
  const completion = completionForWeek(workout.id, week, exerciseNames)
  const targetIdx = week - 1

  return (
    <article
      className="animate-fade-up overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-card)]/80 backdrop-blur-md transition-shadow duration-300 hover:shadow-[0_8px_40px_rgba(0,0,0,0.4)]"
      style={{ borderLeftColor: workout.accent, borderLeftWidth: 3 }}
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-start justify-between gap-4 p-5 text-left md:p-6"
      >
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[var(--color-muted)]">
              {workout.day}
            </span>
            <span className="text-[10px] text-[var(--color-muted)]">·</span>
            <span className="text-xs text-[var(--color-gold-dim)]">{date}</span>
          </div>
          <h3 className="font-[family-name:var(--font-display)] text-xl font-semibold text-[#f5f3ef] md:text-2xl">
            {workout.title}
          </h3>
          <p className="mt-1 text-sm text-[var(--color-muted)]">{workout.subtitle}</p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <CompletionRing percent={completion} color={workout.accent} />
          <span className="text-[var(--color-muted)] transition-transform duration-200" style={{ transform: expanded ? 'rotate(180deg)' : 'none' }}>
            ▾
          </span>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-[var(--color-border)] px-5 pb-6 pt-2 md:px-6">
          <div className="space-y-4">
            {workout.exercises.map((ex) => {
              const target = ex.targets[targetIdx]
              const log = get(workout.id, week, ex.name)
              const seedActual = ex.seedActual?.[week]
              const seedNotes = ex.seedNotes?.[week]
              const displayActual = log.actual || seedActual || ''
              const displayNotes = log.notes || seedNotes || ''

              return (
                <div
                  key={ex.name}
                  className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-raised)]/50 p-4"
                >
                  <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
                    <h4 className="font-medium text-[#f5f3ef]">{ex.name}</h4>
                    <span
                      className="rounded-lg px-2.5 py-1 font-mono text-xs"
                      style={{ background: `${workout.accent}18`, color: workout.accent }}
                    >
                      Target: {target}
                    </span>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="block">
                      <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-[var(--color-muted)]">
                        Actual
                      </span>
                      <input
                        type="text"
                        value={displayActual}
                        placeholder="Log sets, weight, reps…"
                        onChange={(e) => set(workout.id, week, ex.name, 'actual', e.target.value)}
                        className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm text-[var(--color-text)] placeholder:text-[var(--color-muted)]/60 outline-none transition focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/30"
                      />
                    </label>
                    <label className="block sm:col-span-2">
                      <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-[var(--color-muted)]">
                        Notes
                      </span>
                      <textarea
                        value={displayNotes}
                        placeholder="How did it feel?"
                        rows={2}
                        onChange={(e) => set(workout.id, week, ex.name, 'notes', e.target.value)}
                        className="w-full resize-y rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm text-[var(--color-text)] placeholder:text-[var(--color-muted)]/60 outline-none transition focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/30"
                      />
                    </label>
                  </div>
                </div>
              )
            })}

            {workout.footer?.map((item) => (
              <div
                key={item.label}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-dashed border-[var(--color-border)] px-4 py-3"
              >
                <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-gold-dim)]">{item.label}</span>
                <span className="text-sm text-[var(--color-text)]">{item.targets[targetIdx]}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </article>
  )
}

function CompletionRing({ percent, color }: { percent: number; color: string }) {
  const r = 18
  const c = 2 * Math.PI * r
  const offset = c - (percent / 100) * c

  return (
    <div className="relative h-11 w-11">
      <svg className="h-11 w-11 -rotate-90" viewBox="0 0 44 44">
        <circle cx="22" cy="22" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
        <circle
          cx="22"
          cy="22"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[9px] font-semibold text-[var(--color-muted)]">
        {percent}%
      </span>
    </div>
  )
}

export function RestCard({ week, expanded, onToggle }: { week: number; expanded: boolean; onToggle: () => void }) {
  const date = getWorkoutDate('rest', week)

  return (
    <article className="animate-fade-up overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-raised)]/40 backdrop-blur-sm">
      <button type="button" onClick={onToggle} className="flex w-full items-center justify-between p-5 text-left md:p-6">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[var(--color-muted)]">{restDay.day}</span>
            <span className="text-xs text-[var(--color-gold-dim)]">{date}</span>
          </div>
          <h3 className="font-[family-name:var(--font-display)] text-xl font-semibold text-[var(--color-muted)]">{restDay.title}</h3>
          <p className="mt-1 text-sm text-[var(--color-muted)]/80">{restDay.subtitle}</p>
        </div>
        <span className="text-2xl opacity-40">◎</span>
      </button>
      {expanded && (
        <div className="border-t border-[var(--color-border)] px-6 pb-6 pt-2">
          <p className="text-sm leading-relaxed text-[var(--color-muted)]">
            Walk, stretch lightly, or do nothing. Sleep 7–9 hours. Hydrate. This day is programmed — respect it.
          </p>
        </div>
      )}
    </article>
  )
}
