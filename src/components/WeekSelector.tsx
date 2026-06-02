import { useEffect, useRef } from 'react'
import { weekMeta } from '../data/workoutPlan'
import { PhaseBadge } from './PhaseBadge'

interface WeekSelectorProps {
  week: number
  onChange: (week: number) => void
}

export function WeekSelector({ week, onChange }: WeekSelectorProps) {
  const meta = weekMeta[week - 1]
  const activeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    activeRef.current?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
  }, [week])

  return (
    <div className="animate-fade-up">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight text-[var(--color-heading)] md:text-3xl">
          Week {week}
        </h2>
        <PhaseBadge phase={meta.phase} />
      </div>

      <div className="mb-6 grid gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-card)]/60 p-4 backdrop-blur-sm sm:grid-cols-3">
        <MetaItem label="Goal" value={meta.goal} />
        <MetaItem label="Intensity" value={meta.intensity} />
        <MetaItem label="Progression" value={meta.progression} />
      </div>

      <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-[var(--color-muted)] md:hidden">
        Swipe to change week
      </p>
      <div className="week-scroll -mx-4 px-4 sm:mx-0 sm:px-0">
        {weekMeta.map((w) => (
          <button
            key={w.week}
            ref={week === w.week ? activeRef : undefined}
            type="button"
            onClick={() => onChange(w.week)}
            className={`touch-target shrink-0 rounded-xl px-5 py-3 text-sm font-semibold transition-all duration-200 active:scale-95 ${
              week === w.week
                ? 'bg-[var(--color-gold)] text-[#0c0c0e] shadow-lg shadow-[rgba(201,169,98,0.25)]'
                : 'border border-[var(--color-border)] bg-[var(--color-surface-raised)] text-[var(--color-muted)]'
            }`}
          >
            Week {w.week}
          </button>
        ))}
      </div>
    </div>
  )
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--color-gold-dim)]">{label}</p>
      <p className="text-sm leading-snug text-[var(--color-text)]">{value}</p>
    </div>
  )
}
