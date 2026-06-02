import type { ReactNode } from 'react'
import { useApp } from '../context/AppContext'
import { restDay } from '../data/workoutPlan'
import { addDays, daysBetween, formatDateLabel, parseISO, snapToSunday, toISO, todayISO } from '../utils/sessionDates'

function relativeWeekLabel(weeks: number): string {
  if (weeks === 0) return 'This week'
  if (weeks === 1) return 'Next week'
  if (weeks === -1) return 'Last week'
  if (weeks > 1) return `In ${weeks} wks`
  return `${-weeks} wks ago`
}

/** Sundays around today (plus whatever is currently set), as plain-language start-date choices. */
function startSundays(current: string): { iso: string; relative: string; date: string }[] {
  const base = snapToSunday(todayISO())
  const isoSet = new Set<string>([current])
  for (let w = -2; w <= 10; w++) isoSet.add(toISO(addDays(parseISO(base), w * 7)))
  return [...isoSet]
    .sort()
    .map((iso) => ({
      iso,
      relative: relativeWeekLabel(Math.round(daysBetween(parseISO(base), parseISO(iso)) / 7)),
      date: formatDateLabel(parseISO(iso)),
    }))
}

export function ScheduleCard({ week }: { week: number }) {
  const { plan, setStartDate, shiftSchedule, getPlannedLabel } = useApp()
  const restWeeks = (plan.weekShiftDays?.[week] ?? 0) / 7
  const startOptions = startSundays(plan.startDate)

  return (
    <section className="animate-fade-up mb-8 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-card)]/60 p-5">
      <div className="mb-4">
        <h3 className="font-[family-name:var(--font-display)] text-lg text-[var(--color-heading)]">Schedule</h3>
        <p className="text-xs text-[var(--color-muted)]">Every session date derives from your start date.</p>
      </div>

      {week === 1 ? (
        <div className="mb-5">
          <span className="mb-2 block text-[10px] font-semibold uppercase tracking-wider text-[var(--color-muted)]">
            When does the plan start?
          </span>
          <div className="week-scroll -mx-1 px-1">
            {startOptions.map((o) => {
              const active = o.iso === plan.startDate
              return (
                <button
                  key={o.iso}
                  type="button"
                  onClick={() => setStartDate(o.iso)}
                  aria-pressed={active}
                  className={`touch-target flex shrink-0 flex-col items-center gap-0.5 rounded-xl px-4 py-2.5 transition active:scale-95 ${
                    active
                      ? 'bg-[var(--color-gold)] text-[#0c0c0e]'
                      : 'border border-[var(--color-border)] bg-[var(--color-surface-raised)] text-[var(--color-muted)]'
                  }`}
                >
                  <span className="text-[10px] font-semibold uppercase tracking-wider">{o.relative}</span>
                  <span className="text-sm font-medium">{o.date}</span>
                </button>
              )
            })}
          </div>
          <span className="mt-2 block text-[11px] text-[var(--color-muted)]">
            The plan always begins on a Sunday with Upper Strength.
          </span>
        </div>
      ) : (
        <div className="mb-5 flex items-baseline justify-between gap-3">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-muted)]">
            Plan starts
          </span>
          <span className="text-sm text-[var(--color-text)]">
            {getPlannedLabel('upper-strength', 1)}
            <span className="text-[var(--color-muted)]"> · change on Week 1</span>
          </span>
        </div>
      )}

      <div className="mb-5">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--color-muted)]">
          Week {week} dates
        </p>
        <div className="grid gap-1.5 sm:grid-cols-2">
          {plan.workouts.map((w) => (
            <div key={w.id} className="flex items-center justify-between gap-3 text-sm">
              <span className="min-w-0 truncate text-[var(--color-text)]">{w.title}</span>
              <span className="shrink-0 text-xs text-[var(--color-gold-dim)]">{getPlannedLabel(w.id, week)}</span>
            </div>
          ))}
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="text-[var(--color-muted)]">{restDay.title}</span>
            <span className="shrink-0 text-xs text-[var(--color-muted)]">{getPlannedLabel('rest', week)}</span>
          </div>
        </div>
      </div>

      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-muted)]">Running behind?</p>
        <p className="mb-2 text-xs text-[var(--color-muted)]">
          Insert rest weeks before week {week} to push the rest of the plan later. Whole weeks only, so every session
          keeps its weekday. (Did a single workout on a different day? Just log it in Train.)
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <ShiftBtn disabled={restWeeks === 0} onClick={() => shiftSchedule(week, -7)}>
            -1 week
          </ShiftBtn>
          <ShiftBtn onClick={() => shiftSchedule(week, 7)}>+1 week</ShiftBtn>
        </div>
        {restWeeks > 0 && (
          <p className="mt-2 text-xs text-[var(--color-gold-dim)]">
            {restWeeks} rest week{restWeeks === 1 ? '' : 's'} before week {week} (and everything after moves with it)
          </p>
        )}
      </div>
    </section>
  )
}

function ShiftBtn({ onClick, disabled, children }: { onClick: () => void; disabled?: boolean; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="touch-target rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-4 py-2.5 text-sm font-medium text-[var(--color-text)] transition active:scale-95 disabled:opacity-30"
    >
      {children}
    </button>
  )
}
