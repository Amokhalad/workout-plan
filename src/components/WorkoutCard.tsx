import { useEffect, useRef } from 'react'
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
  const articleRef = useRef<HTMLElement>(null)
  const date = getWorkoutDate(workout.id, week)
  const exerciseNames = workout.exercises.map((e) => e.name)
  const completion = completionForWeek(workout.id, week, exerciseNames)
  const targetIdx = week - 1

  useEffect(() => {
    if (expanded && articleRef.current) {
      const t = window.setTimeout(() => {
        articleRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
      return () => window.clearTimeout(t)
    }
  }, [expanded])

  return (
    <article
      ref={articleRef}
      className="animate-fade-up scroll-mt-20 overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-card)]/80 backdrop-blur-md sm:scroll-mt-24"
      style={{ borderLeftColor: workout.accent, borderLeftWidth: 3 }}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className="touch-target flex w-full items-start justify-between gap-3 p-4 text-left active:bg-white/[0.02] sm:gap-4 sm:p-5 md:p-6"
      >
        <div className="min-w-0 flex-1 pr-1">
          <div className="mb-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)] sm:tracking-[0.25em]">
              {workout.day}
            </span>
            <span className="text-[10px] text-[var(--color-muted)]">·</span>
            <span className="text-xs text-[var(--color-gold-dim)]">{date}</span>
          </div>
          <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold leading-tight text-[#f5f3ef] sm:text-xl md:text-2xl">
            {workout.title}
          </h3>
          <p className="mt-1 text-sm leading-snug text-[var(--color-muted)]">{workout.subtitle}</p>
        </div>
        <div className="flex shrink-0 flex-col items-center gap-1 pt-0.5">
          <CompletionRing percent={completion} color={workout.accent} />
          <span
            className="text-lg leading-none text-[var(--color-muted)] transition-transform duration-200"
            style={{ transform: expanded ? 'rotate(180deg)' : 'none' }}
            aria-hidden
          >
            ▾
          </span>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-[var(--color-border)] px-4 pb-5 pt-1 sm:px-5 sm:pb-6 md:px-6">
          <div className="space-y-3 sm:space-y-4">
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
                  className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-raised)]/50 p-3 sm:p-4"
                >
                  <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-baseline sm:justify-between">
                    <h4 className="text-base font-medium leading-snug text-[#f5f3ef]">{ex.name}</h4>
                    <span
                      className="inline-flex w-fit max-w-full rounded-lg px-2.5 py-1.5 font-mono text-xs leading-tight break-words"
                      style={{ background: `${workout.accent}18`, color: workout.accent }}
                    >
                      Target: {target}
                    </span>
                  </div>
                  <div className="grid gap-3">
                    <label className="block">
                      <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-[var(--color-muted)]">
                        Actual
                      </span>
                      <input
                        type="text"
                        inputMode="text"
                        enterKeyHint="next"
                        autoComplete="off"
                        autoCapitalize="off"
                        value={displayActual}
                        placeholder="e.g. 135×5, 145×3"
                        onChange={(e) => set(workout.id, week, ex.name, 'actual', e.target.value)}
                        className="min-h-12 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-[var(--color-text)] placeholder:text-[var(--color-muted)]/60 outline-none transition focus:border-[var(--color-gold)] focus:ring-2 focus:ring-[var(--color-gold)]/25 md:min-h-0 md:rounded-lg md:px-3 md:py-2.5 md:text-sm"
                      />
                    </label>
                    <label className="block">
                      <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-[var(--color-muted)]">
                        Notes
                      </span>
                      <textarea
                        value={displayNotes}
                        placeholder="How did it feel?"
                        rows={3}
                        onChange={(e) => set(workout.id, week, ex.name, 'notes', e.target.value)}
                        className="min-h-[5rem] w-full resize-y rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-[var(--color-text)] placeholder:text-[var(--color-muted)]/60 outline-none transition focus:border-[var(--color-gold)] focus:ring-2 focus:ring-[var(--color-gold)]/25 md:min-h-0 md:rounded-lg md:px-3 md:py-2.5 md:text-sm"
                      />
                    </label>
                  </div>
                </div>
              )
            })}

            {workout.footer?.map((item) => (
              <div
                key={item.label}
                className="flex flex-col gap-1 rounded-xl border border-dashed border-[var(--color-border)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3"
              >
                <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-gold-dim)]">{item.label}</span>
                <span className="text-sm leading-snug text-[var(--color-text)]">{item.targets[targetIdx]}</span>
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
    <div className="relative h-12 w-12 sm:h-11 sm:w-11" aria-label={`${percent}% logged`}>
      <svg className="h-full w-full -rotate-90" viewBox="0 0 44 44">
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
      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-semibold text-[var(--color-muted)] sm:text-[9px]">
        {percent}%
      </span>
    </div>
  )
}

export function RestCard({ week, expanded, onToggle }: { week: number; expanded: boolean; onToggle: () => void }) {
  const articleRef = useRef<HTMLElement>(null)
  const date = getWorkoutDate('rest', week)

  useEffect(() => {
    if (expanded && articleRef.current) {
      const t = window.setTimeout(() => {
        articleRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
      return () => window.clearTimeout(t)
    }
  }, [expanded])

  return (
    <article
      ref={articleRef}
      className="animate-fade-up scroll-mt-20 overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-raised)]/40 backdrop-blur-sm sm:scroll-mt-24"
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className="touch-target flex w-full items-center justify-between gap-3 p-4 text-left active:bg-white/[0.02] sm:p-5 md:p-6"
      >
        <div className="min-w-0">
          <div className="mb-1 flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">{restDay.day}</span>
            <span className="text-xs text-[var(--color-gold-dim)]">{date}</span>
          </div>
          <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold text-[var(--color-muted)] sm:text-xl">{restDay.title}</h3>
          <p className="mt-1 text-sm leading-snug text-[var(--color-muted)]/80">{restDay.subtitle}</p>
        </div>
        <span className="shrink-0 text-2xl opacity-40" aria-hidden>
          ◎
        </span>
      </button>
      {expanded && (
        <div className="border-t border-[var(--color-border)] px-4 pb-5 pt-2 sm:px-6 sm:pb-6">
          <p className="text-sm leading-relaxed text-[var(--color-muted)]">
            Walk, stretch lightly, or do nothing. Sleep 7–9 hours. Hydrate. This day is programmed — respect it.
          </p>
        </div>
      )}
    </article>
  )
}
