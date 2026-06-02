import { useState } from 'react'
import { weekMeta } from '../../data/workoutPlan'
import { useApp } from '../../context/AppContext'
import { useSessions } from '../../hooks/useSessions'
import { todayISO, type SessionStatus, type SessionStatusKind } from '../../utils/sessionDates'
import { PhaseBadge } from '../PhaseBadge'
import { TrainExercise } from './TrainExercise'

interface TrainViewProps {
  week: number
}

const STATUS_COLOR: Record<SessionStatusKind, string> = {
  today: '#c9a962',
  upcoming: '#6b6b78',
  done: '#7eb8a4',
  missed: '#d98c7a',
  skipped: '#6b6b78',
}

function statusLabel(s: SessionStatus): string {
  switch (s.kind) {
    case 'today':
      return 'Today'
    case 'upcoming':
      return 'Upcoming'
    case 'done':
      return s.daysLate > 0 ? `Done +${s.daysLate}d late` : 'Done on time'
    case 'missed':
      return `Missed +${s.daysLate}d`
    case 'skipped':
      return 'Skipped'
  }
}

export function TrainView({ week }: TrainViewProps) {
  const { plan, setCompletedDate, markSkipped } = useApp()
  const sessions = useSessions()

  const pickDefault = () => {
    const byKind = (kind: SessionStatusKind) => plan.workouts.find((w) => sessions.get(w, week).status.kind === kind)?.id
    const firstOpen = plan.workouts.find((w) => {
      const k = sessions.get(w, week).status.kind
      return k !== 'done' && k !== 'skipped'
    })?.id
    return byKind('today') ?? byKind('missed') ?? firstOpen ?? plan.workouts[0]?.id ?? ''
  }

  const [selectedId, setSelectedId] = useState(pickDefault)
  const workout = plan.workouts.find((w) => w.id === selectedId) ?? plan.workouts[0]
  if (!workout) return null

  const meta = weekMeta[week - 1]
  const session = sessions.get(workout, week)
  // Only other missed days — the one you're viewing is already shown by the header, so listing it
  // here would just be a "Log it" that re-selects the current day and appears to do nothing.
  const missed = sessions.forWeek(week).filter((s) => s.status.kind === 'missed' && s.workoutId !== workout.id)

  return (
    <div className="animate-fade-up">
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.35em] text-[var(--color-gold)]">Train</p>

      <div className="week-scroll -mx-4 mb-6 px-4 sm:mx-0 sm:px-0">
        {plan.workouts.map((w) => {
          const active = w.id === workout.id
          const st = sessions.get(w, week).status
          const dot = st.kind === 'upcoming' ? null : STATUS_COLOR[st.kind]
          return (
            <button
              key={w.id}
              type="button"
              onClick={() => setSelectedId(w.id)}
              aria-label={`${w.title} - ${statusLabel(st)}`}
              aria-pressed={active}
              className={`touch-target relative flex shrink-0 flex-col items-center rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 active:scale-95 ${
                active
                  ? 'text-[#0c0c0e]'
                  : 'border border-[var(--color-border)] bg-[var(--color-surface-raised)] text-[var(--color-muted)]'
              }`}
              style={active ? { background: w.accent } : undefined}
            >
              {w.day.slice(0, 3)}
              {dot && (
                <span
                  className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full"
                  style={{ background: active ? '#0c0c0e' : dot }}
                  aria-hidden
                />
              )}
            </button>
          )
        })}
      </div>

      {missed.length > 0 && (
        <div
          className="mb-6 rounded-2xl border p-4"
          style={{ borderColor: `${STATUS_COLOR.missed}55`, background: `${STATUS_COLOR.missed}14` }}
        >
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider" style={{ color: STATUS_COLOR.missed }}>
            Missed this week
          </p>
          <div className="space-y-2">
            {missed.map((s) => (
              <div key={s.workoutId} className="flex items-center gap-2">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-[var(--color-text)]">{s.title}</p>
                  <p className="text-[11px] text-[var(--color-muted)]">Planned {s.plannedLabel}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedId(s.workoutId)}
                  className="touch-target shrink-0 rounded-lg px-3 py-2 text-xs font-semibold text-[#0c0c0e]"
                  style={{ background: STATUS_COLOR.missed }}
                >
                  Log it
                </button>
                <button
                  type="button"
                  onClick={() => markSkipped(s.workoutId, week, true)}
                  className="touch-target shrink-0 rounded-lg border border-[var(--color-border)] px-3 py-2 text-xs font-medium text-[var(--color-muted)]"
                >
                  Skip
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <header className="mb-6">
        <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">
            {workout.day}
          </span>
          <span className="text-xs text-[var(--color-gold-dim)]">Planned {session.plannedLabel}</span>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight text-[var(--color-heading)] sm:text-3xl">
              {workout.title}
            </h2>
            <p className="mt-1 text-sm text-[var(--color-muted)]">{workout.subtitle}</p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-[var(--color-muted)]">Week {week}</span>
            {meta && <PhaseBadge phase={meta.phase} />}
            <StatusPill status={session.status} />
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${session.completion}%`, background: workout.accent }}
            />
          </div>
          <span className="shrink-0 text-xs font-semibold tabular-nums text-[var(--color-muted)]">
            {session.completion}%
          </span>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-3">
          {session.status.kind === 'done' && (
            <label className="flex items-center gap-2 text-xs text-[var(--color-muted)]">
              <span className="uppercase tracking-wider">Done on</span>
              <input
                type="date"
                value={session.completedDate ?? todayISO()}
                onChange={(e) => setCompletedDate(workout.id, week, e.target.value)}
                className="field-input rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-[var(--color-text)] outline-none focus:border-[var(--color-gold)]"
              />
            </label>
          )}
          {session.skipped ? (
            <button
              type="button"
              onClick={() => markSkipped(workout.id, week, false)}
              className="touch-target rounded-lg border border-[var(--color-border)] px-3 py-2 text-xs font-medium text-[var(--color-gold)]"
            >
              Skipped - undo
            </button>
          ) : (
            session.status.kind !== 'done' && (
              <button
                type="button"
                onClick={() => markSkipped(workout.id, week, true)}
                className="touch-target rounded-lg border border-[var(--color-border)] px-3 py-2 text-xs font-medium text-[var(--color-muted)]"
              >
                Skip this day
              </button>
            )
          )}
        </div>
      </header>

      {session.skipped && (
        <p className="mb-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-raised)]/40 px-4 py-3 text-xs leading-relaxed text-[var(--color-muted)]">
          This session is skipped, so logging is locked. Anything you already entered is kept — tap{' '}
          <span className="font-medium text-[var(--color-gold)]">Skipped · undo</span> above to log again.
        </p>
      )}

      <section className="space-y-3">
        {workout.exercises.map((ex) => (
          <TrainExercise
            key={ex.id}
            workoutId={workout.id}
            week={week}
            exercise={ex}
            accent={workout.accent}
            disabled={session.skipped}
          />
        ))}
      </section>

      {workout.footers.length > 0 && (
        <section className="mt-4 space-y-2">
          {workout.footers.map((f) => (
            <div
              key={f.id}
              className="flex flex-col gap-1 rounded-xl border border-dashed border-[var(--color-border)] px-4 py-3"
            >
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-gold-dim)]">
                {f.label}
              </span>
              <span className="text-sm leading-snug text-[var(--color-text)]">{f.targets[week - 1] ?? ''}</span>
            </div>
          ))}
        </section>
      )}
    </div>
  )
}

function StatusPill({ status }: { status: SessionStatus }) {
  const color = STATUS_COLOR[status.kind]
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide"
      style={{ background: `${color}22`, color, border: `1px solid ${color}55` }}
    >
      {statusLabel(status)}
    </span>
  )
}
