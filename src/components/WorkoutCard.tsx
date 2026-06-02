import { useEffect, useRef, useState } from 'react'
import { getWorkoutDate, restDay } from '../data/workoutPlan'
import type { PlanWorkout } from '../types/plan'
import { useApp } from '../context/AppContext'
import { ExerciseCard } from './ExerciseCard'
import { WorkoutEditor } from './WorkoutEditor'

interface WorkoutCardProps {
  workout: PlanWorkout
  week: number
  expanded: boolean
  onToggle: () => void
}

export function WorkoutCard({ workout, week, expanded, onToggle }: WorkoutCardProps) {
  const { completionForWeek } = useApp()
  const [editing, setEditing] = useState(false)
  const articleRef = useRef<HTMLElement>(null)
  const date = getWorkoutDate(workout.id, week)
  const exerciseIds = workout.exercises.map((e) => e.id)
  const completion = completionForWeek(workout.id, week, exerciseIds)
  const weekIdx = week - 1

  useEffect(() => {
    if (expanded && articleRef.current) {
      const t = window.setTimeout(() => {
        articleRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
      return () => window.clearTimeout(t)
    }
  }, [expanded])

  return (
    <>
      <article
        ref={articleRef}
        className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-card)]/80 backdrop-blur-md scroll-mt-24"
        style={{ borderLeftColor: workout.accent, borderLeftWidth: 3 }}
      >
        <div className="flex items-stretch">
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={expanded}
            className="touch-target flex min-w-0 flex-1 items-start justify-between gap-3 p-4 text-left active:bg-white/[0.02] sm:p-5"
          >
            <div className="min-w-0 flex-1">
              <div className="mb-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">
                  {workout.day}
                </span>
                <span className="text-[10px] text-[var(--color-muted)]">·</span>
                <span className="text-xs text-[var(--color-gold-dim)]">{date}</span>
              </div>
              <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold leading-tight text-[#f5f3ef] sm:text-xl">
                {workout.title}
              </h3>
              <p className="mt-1 text-sm text-[var(--color-muted)]">{workout.subtitle}</p>
              <p className="mt-2 text-xs text-[var(--color-muted)]">
                {workout.exercises.length} exercises · tap customize to edit plan
              </p>
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
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="touch-target shrink-0 border-l border-[var(--color-border)] px-4 text-xs font-semibold uppercase tracking-wider text-[var(--color-gold)] transition active:bg-white/[0.03] sm:px-5"
            aria-label={`Customize ${workout.title}`}
          >
            Edit
          </button>
        </div>

        {expanded && (
          <div className="border-t border-[var(--color-border)] px-4 pb-5 pt-3 sm:px-5 sm:pb-6">
            <div className="space-y-3">
              {workout.exercises.map((ex) => (
                <ExerciseCard
                  key={ex.id}
                  workoutId={workout.id}
                  week={week}
                  exercise={ex}
                  accent={workout.accent}
                />
              ))}

              {workout.footers.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-1 rounded-xl border border-dashed border-[var(--color-border)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-gold-dim)]">
                    {item.label}
                  </span>
                  <span className="text-sm text-[var(--color-text)]">{item.targets[weekIdx] ?? ''}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </article>

      {editing && <WorkoutEditor workout={workout} week={week} onClose={() => setEditing(false)} />}
    </>
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
      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-semibold text-[var(--color-muted)]">
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
      className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-raised)]/40 scroll-mt-24"
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className="touch-target flex w-full items-center justify-between gap-3 p-4 text-left sm:p-5"
      >
        <div className="min-w-0">
          <div className="mb-1 flex flex-wrap items-center gap-x-2">
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">{restDay.day}</span>
            <span className="text-xs text-[var(--color-gold-dim)]">{date}</span>
          </div>
          <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold text-[var(--color-muted)]">{restDay.title}</h3>
          <p className="mt-1 text-sm text-[var(--color-muted)]/80">{restDay.subtitle}</p>
        </div>
        <span className="shrink-0 text-2xl opacity-40" aria-hidden>
          ◎
        </span>
      </button>
      {expanded && (
        <div className="border-t border-[var(--color-border)] px-4 pb-5 pt-2 sm:px-6">
          <p className="text-sm leading-relaxed text-[var(--color-muted)]">
            Walk, stretch lightly, or do nothing. Sleep 7–9 hours. Hydrate. This day is programmed — respect it.
          </p>
        </div>
      )}
    </article>
  )
}
