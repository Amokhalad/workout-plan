import { weekMeta } from '../data/workoutPlan'
import { PhaseBadge } from './PhaseBadge'

interface WeekSelectorProps {
  week: number
  onChange: (week: number) => void
}

export function WeekSelector({ week, onChange }: WeekSelectorProps) {
  const meta = weekMeta[week - 1]

  return (
    <div className="animate-fade-up">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight text-[#f5f3ef] md:text-3xl">
          Week {week}
        </h2>
        <PhaseBadge phase={meta.phase} />
      </div>

      <div className="mb-6 grid gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-card)]/60 p-4 backdrop-blur-sm sm:grid-cols-3">
        <MetaItem label="Goal" value={meta.goal} />
        <MetaItem label="Intensity" value={meta.intensity} />
        <MetaItem label="Progression" value={meta.progression} className="sm:col-span-1" />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {weekMeta.map((w) => (
          <button
            key={w.week}
            type="button"
            onClick={() => onChange(w.week)}
            className={`shrink-0 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
              week === w.week
                ? 'bg-[var(--color-gold)] text-[#0c0c0e] shadow-lg shadow-[rgba(201,169,98,0.25)]'
                : 'border border-[var(--color-border)] bg-[var(--color-surface-raised)] text-[var(--color-muted)] hover:border-[rgba(201,169,98,0.3)] hover:text-[var(--color-text)]'
            }`}
          >
            {w.week}
          </button>
        ))}
      </div>
    </div>
  )
}

function MetaItem({ label, value, className = '' }: { label: string; value: string; className?: string }) {
  return (
    <div className={className}>
      <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--color-gold-dim)]">{label}</p>
      <p className="text-sm leading-snug text-[var(--color-text)]">{value}</p>
    </div>
  )
}
