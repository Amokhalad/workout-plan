import { useState } from 'react'
import { Overview } from './components/Overview'
import { RestCard, WorkoutCard } from './components/WorkoutCard'
import { WeekSelector } from './components/WeekSelector'
import { planSubtitle, planTitle, workouts } from './data/workoutPlan'

type View = 'overview' | 'workouts'

function getCurrentWeek(): number {
  const start = new Date(2026, 4, 24)
  const now = new Date()
  const diff = Math.floor((now.getTime() - start.getTime()) / (7 * 24 * 60 * 60 * 1000))
  return Math.min(12, Math.max(1, diff + 1))
}

export default function App() {
  const [view, setView] = useState<View>('workouts')
  const [week, setWeek] = useState(getCurrentWeek)
  const [expanded, setExpanded] = useState<string | null>('upper-strength')

  const toggle = (id: string) => setExpanded((prev) => (prev === id ? null : id))

  return (
    <div className="relative min-h-dvh">
      <div className="grain" aria-hidden />
      <div className="glow-orb -left-32 top-0 h-96 w-96 bg-[#c9a962]/10" aria-hidden />
      <div className="glow-orb -right-32 top-1/3 h-80 w-80 bg-[#6b9fd4]/8" aria-hidden />

      <header className="relative z-10 border-b border-[var(--color-border)]">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-5 py-5 md:px-8">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.4em] text-[var(--color-gold)]">Premium Training</p>
            <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight text-[#f5f3ef] md:text-3xl">
              {planTitle}
            </h1>
          </div>
          <nav className="flex gap-1 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-1">
            {(['overview', 'workouts'] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setView(v)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition ${
                  view === v
                    ? 'bg-[var(--color-gold)] text-[#0c0c0e]'
                    : 'text-[var(--color-muted)] hover:text-[var(--color-text)]'
                }`}
              >
                {v}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-4xl px-5 py-10 md:px-8 md:py-14">
        {view === 'overview' ? (
          <Overview />
        ) : (
          <>
            <section className="animate-fade-up mb-12">
              <p className="mb-4 max-w-xl text-sm leading-relaxed text-[var(--color-muted)]">{planSubtitle}</p>
              <WeekSelector week={week} onChange={setWeek} />
            </section>

            <section className="space-y-4">
              {workouts.map((w, i) => (
                <div key={w.id} className={`stagger-${Math.min(i + 1, 4)}`}>
                  <WorkoutCard
                    workout={w}
                    week={week}
                    expanded={expanded === w.id}
                    onToggle={() => toggle(w.id)}
                  />
                </div>
              ))}
              <RestCard week={week} expanded={expanded === 'rest'} onToggle={() => toggle('rest')} />
            </section>
          </>
        )}
      </main>

      <footer className="relative z-10 border-t border-[var(--color-border)] py-8 text-center text-xs text-[var(--color-muted)]">
        Logged locally in your browser · Syncs with your spreadsheet workflow
      </footer>
    </div>
  )
}
