import { useMemo, type ReactNode } from 'react'
import { useApp } from '../../context/AppContext'
import { PLAN_WEEKS, computeInsights } from '../../utils/insights'
import { BarRow, Heatmap, MiniBars, ProgressChart, StatCard } from './charts'

/** Distinct, evenly-spread hues so each lift's line is distinguishable. */
const seriesColor = (i: number, n: number) => `hsl(${Math.round((i * 360) / Math.max(1, n))}, 58%, 62%)`

interface InsightsViewProps {
  week: number
}

export function InsightsView({ week }: InsightsViewProps) {
  const { plan, entries, sessionMeta } = useApp()
  const insights = useMemo(() => computeInsights(plan, entries, sessionMeta), [plan, entries, sessionMeta])

  const columns = plan.workouts.map((w) => ({ id: w.id, label: w.day.slice(0, 3) }))
  const weeks = Array.from({ length: PLAN_WEEKS }, (_, i) => i + 1)

  const strength = insights.trends.map((t, i) => ({
    key: t.key,
    name: t.name,
    color: seriesColor(i, insights.trends.length),
    points: t.points,
    trend: t,
  }))

  return (
    <div className="animate-fade-up">
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.35em] text-[var(--color-gold)]">Insights</p>
      <h2 className="mb-2 font-[family-name:var(--font-display)] text-2xl font-semibold text-[var(--color-heading)] sm:text-3xl md:text-4xl">
        Your Progress
      </h2>
      <p className="mb-8 max-w-2xl text-sm leading-relaxed text-[var(--color-muted)]">
        Everything you log in Train rolls up here — consistency, volume, and estimated strength over the 12-week block.
      </p>

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Sessions" value={`${insights.sessionsLogged}/${insights.totalSessions}`} sub="logged" />
        <StatCard label="Completion" value={`${insights.overallCompletion}%`} sub="across all sessions" />
        <StatCard label="Sets done" value={`${insights.setsCompleted}`} sub="checked off" />
        <StatCard label="Streak" value={`${insights.currentStreak} wk`} sub={`best ${insights.bestStreak} wk`} />
      </div>

      <Section title="Estimated 1RM" caption="Strength progress per lift, week over week (Epley)">
        {strength.length === 0 ? (
          <p className="text-sm leading-relaxed text-[var(--color-muted)]">
            Log your actual sets like <span className="font-mono text-[var(--color-text)]">135x5</span> in Train to
            chart your estimated 1RM over time.
          </p>
        ) : (
          <>
            <ProgressChart series={strength} weeks={PLAN_WEEKS} />
            <div className="mt-5 grid grid-cols-1 gap-x-6 gap-y-2.5 border-t border-[var(--color-border)] pt-4 sm:grid-cols-2">
              {strength.map((s) => (
                <div key={s.key} className="flex items-center gap-2 text-xs">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: s.color }} />
                  <span className="min-w-0 flex-1 truncate text-[var(--color-text)]" title={s.name}>
                    {s.name}
                  </span>
                  {s.trend.points.length >= 2 && (
                    <span
                      className="shrink-0 tabular-nums"
                      style={{ color: s.trend.delta >= 0 ? '#7eb8a4' : 'var(--color-muted)' }}
                    >
                      {s.trend.delta >= 0 ? '+' : ''}
                      {s.trend.delta}
                    </span>
                  )}
                  <span className="w-12 shrink-0 text-right font-semibold tabular-nums text-[var(--color-heading)]">
                    {s.trend.latest}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </Section>

      <Section title="Consistency" caption="Completion per session across the block">
        <Heatmap columns={columns} weeks={weeks} grid={insights.grid} currentWeek={week} />
      </Section>

      <Section title="Adherence" caption="Planned vs actual for every session due so far">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="On time" value={`${insights.adherence.onTime}`} />
          <StatCard
            label="Late"
            value={`${insights.adherence.late}`}
            sub={insights.adherence.late ? `avg +${insights.adherence.avgDaysLate}d` : undefined}
          />
          <StatCard label="Missed" value={`${insights.adherence.missed}`} />
          <StatCard label="Skipped" value={`${insights.adherence.skipped}`} />
        </div>
      </Section>

      <Section title="Weekly volume" caption="Sets checked off each week">
        <MiniBars
          data={insights.perWeek.map((w) => ({ label: String(w.week), value: w.setsDone }))}
          color="var(--color-gold)"
        />
      </Section>

      <Section title="Weeks trained" caption="How many of 12 weeks each day was started">
        <div className="space-y-3">
          {insights.perWorkout.map((w) => (
            <BarRow
              key={w.id}
              label={w.title}
              percent={Math.round((w.sessionsLogged / PLAN_WEEKS) * 100)}
              color={w.accent}
              sub={`${w.sessionsLogged}/${PLAN_WEEKS}`}
            />
          ))}
        </div>
      </Section>
    </div>
  )
}

function Section({ title, caption, children }: { title: string; caption: string; children: ReactNode }) {
  return (
    <section className="mb-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-card)]/60 p-5">
      <div className="mb-4">
        <h3 className="font-[family-name:var(--font-display)] text-lg text-[var(--color-heading)]">{title}</h3>
        <p className="text-xs text-[var(--color-muted)]">{caption}</p>
      </div>
      {children}
    </section>
  )
}
