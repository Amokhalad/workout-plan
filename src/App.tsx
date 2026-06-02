import { useState } from 'react'
import { useApp } from './context/AppContext'
import { MobileNav } from './components/MobileNav'
import { Overview } from './components/Overview'
import { RestCard, WorkoutCard } from './components/WorkoutCard'
import { WeekSelector } from './components/WeekSelector'
import { TrainView } from './components/Train/TrainView'
import { InsightsView } from './components/Insights/InsightsView'
import { ScheduleCard } from './components/ScheduleCard'
import { ThemeToggle } from './components/ThemeToggle'
import { currentWeek } from './utils/sessionDates'

type View = 'train' | 'plan' | 'insights' | 'overview'

export default function App() {
  const { plan } = useApp()
  const [view, setView] = useState<View>('train')
  const [week, setWeek] = useState(() => currentWeek(plan.startDate))
  const [expanded, setExpanded] = useState<string | null>('upper-strength')

  const toggle = (id: string) => setExpanded((prev) => (prev === id ? null : id))

  return (
    <div className="relative min-h-dvh">
      <div className="grain" aria-hidden />
      <div className="glow-orb -left-32 top-0 h-96 w-96 bg-[#c9a962]/10" aria-hidden />
      <div className="glow-orb -right-32 top-1/3 h-80 w-80 bg-[#6b9fd4]/8" aria-hidden />

      <header className="safe-top relative z-10 border-b border-[var(--color-border)]">
        <div className="safe-x mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-4 sm:px-6 sm:py-5 md:px-8">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[var(--color-gold)] sm:tracking-[0.4em]">
              Your training plan
            </p>
            <h1 className="truncate font-[family-name:var(--font-display)] text-xl font-semibold tracking-tight text-[var(--color-heading)] sm:text-2xl md:text-3xl">
              {plan.title}
            </h1>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <nav
              className="hidden gap-1 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-1 sm:flex"
              aria-label="Desktop navigation"
            >
              {(['train', 'plan', 'insights', 'overview'] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setView(v)}
                  className={`touch-target rounded-lg px-4 py-2 text-xs font-medium capitalize transition ${
                    view === v
                      ? 'bg-[var(--color-gold)] text-[#0c0c0e]'
                      : 'text-[var(--color-muted)] hover:text-[var(--color-text)]'
                  }`}
                >
                  {v}
                </button>
              ))}
            </nav>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="main-pad-bottom relative z-10 mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-10 md:px-8 md:py-14">
        {view === 'overview' ? (
          <Overview />
        ) : view === 'train' ? (
          <TrainView week={week} />
        ) : view === 'insights' ? (
          <InsightsView week={week} />
        ) : (
          <>
            <section className="animate-fade-up mb-8 sm:mb-12">
              <p className="mb-4 text-sm leading-relaxed text-[var(--color-muted)]">{plan.subtitle}</p>
              <WeekSelector week={week} onChange={setWeek} />
            </section>

            <ScheduleCard week={week} />

            <section className="space-y-3 sm:space-y-4">
              {plan.workouts.map((w, i) => (
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

      <footer className="safe-bottom relative z-10 hidden border-t border-[var(--color-border)] py-8 text-center text-xs text-[var(--color-muted)] md:block">
        Saved on this device · Fully customizable
      </footer>

      <MobileNav view={view} onChange={setView} />
    </div>
  )
}
