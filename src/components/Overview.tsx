import { weekMeta, workouts, planSubtitle, planTitle } from '../data/workoutPlan'

const phaseTimeline = [
  { weeks: '1–4', phase: 'Build' as const, desc: 'Learn rhythm, add reps & volume' },
  { weeks: '5', phase: 'Deload' as const, desc: 'Recover — reduce volume' },
  { weeks: '6–9', phase: 'Strength' as const, desc: 'Heavier loads & rep PRs' },
  { weeks: '10', phase: 'Deload' as const, desc: 'Recover before the finale' },
  { weeks: '11–12', phase: 'Power + Test' as const, desc: 'Explosive work & 3–5RM tests' },
]

export function Overview() {
  return (
    <section className="animate-fade-up mb-16">
      <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.35em] text-[var(--color-gold)]">
        12-Week Periodization
      </p>
      <h2 className="mb-2 font-[family-name:var(--font-display)] text-2xl font-semibold text-[#f5f3ef] sm:text-3xl md:text-4xl">
        Training Architecture
      </h2>
      <p className="mb-8 max-w-2xl text-sm leading-relaxed text-[var(--color-muted)] sm:mb-10 sm:text-base">
        Six sessions per week — strength, hypertrophy, engine, and recovery — structured across build, deload, strength, and test phases.
      </p>

      <div className="mb-10 grid grid-cols-1 gap-3 min-[400px]:grid-cols-2 sm:mb-12 lg:grid-cols-5">
        {phaseTimeline.map((block, i) => (
          <div
            key={block.weeks}
            className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-card)]/60 p-4 backdrop-blur-sm"
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            <p className="mb-2 font-mono text-xs text-[var(--color-gold)]">Wk {block.weeks}</p>
            <p className="mb-1 font-medium text-[#f5f3ef]">{block.phase}</p>
            <p className="text-xs leading-relaxed text-[var(--color-muted)]">{block.desc}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {workouts.map((w) => (
          <div
            key={w.id}
            className="group rounded-2xl border border-[var(--color-border)] p-5 transition hover:border-opacity-50"
            style={{ borderLeftColor: w.accent, borderLeftWidth: 2 }}
          >
            <p className="mb-1 text-[10px] uppercase tracking-wider text-[var(--color-muted)]">{w.day}</p>
            <h3 className="font-[family-name:var(--font-display)] text-lg text-[#f5f3ef]">{w.title}</h3>
            <p className="mt-1 text-xs text-[var(--color-muted)]">{w.exercises.length} exercises</p>
          </div>
        ))}
        <div className="rounded-2xl border border-dashed border-[var(--color-border)] p-5 opacity-70">
          <p className="mb-1 text-[10px] uppercase tracking-wider text-[var(--color-muted)]">Saturday</p>
          <h3 className="font-[family-name:var(--font-display)] text-lg text-[var(--color-muted)]">REST</h3>
          <p className="mt-1 text-xs text-[var(--color-muted)]">Non-negotiable recovery</p>
        </div>
      </div>

      <div className="mt-10 rounded-2xl border border-[var(--color-border)] bg-gradient-to-br from-[var(--color-surface-card)] to-[var(--color-surface-raised)] p-5 sm:mt-12 sm:p-6 md:p-8">
        <h3 className="font-[family-name:var(--font-display)] text-xl text-[#f5f3ef]">{planTitle}</h3>
        <p className="mt-2 text-sm text-[var(--color-muted)]">{planSubtitle}</p>
        <p className="mt-4 text-xs text-[var(--color-muted)]">
          Starts {weekMeta[0].dates.upperStrength} · Ends {weekMeta[11].dates.rest}
        </p>
      </div>
    </section>
  )
}
