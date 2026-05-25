import type { Phase } from '../data/workoutPlan'

const phaseStyles: Record<Phase, { bg: string; text: string; border: string }> = {
  Build: { bg: 'rgba(201, 169, 98, 0.15)', text: '#e8d5a3', border: 'rgba(201, 169, 98, 0.35)' },
  Deload: { bg: 'rgba(107, 159, 212, 0.15)', text: '#a8c8e8', border: 'rgba(107, 159, 212, 0.35)' },
  Strength: { bg: 'rgba(126, 184, 164, 0.15)', text: '#b8e0d0', border: 'rgba(126, 184, 164, 0.35)' },
  'Power + Test': { bg: 'rgba(168, 139, 201, 0.15)', text: '#d4c4e8', border: 'rgba(168, 139, 201, 0.35)' },
}

export function PhaseBadge({ phase }: { phase: Phase }) {
  const s = phaseStyles[phase]
  return (
    <span
      className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium tracking-wide uppercase"
      style={{ background: s.bg, color: s.text, border: `1px solid ${s.border}` }}
    >
      {phase}
    </span>
  )
}
