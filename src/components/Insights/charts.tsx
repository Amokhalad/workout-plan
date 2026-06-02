import type { ReactNode } from 'react'
import type { GridCell, TrendPoint } from '../../utils/insights'

/** Appends an alpha byte to a #rrggbb hex color. */
function withAlpha(hex: string, alpha: number): string {
  const a = Math.round(Math.max(0, Math.min(1, alpha)) * 255)
    .toString(16)
    .padStart(2, '0')
  return `${hex}${a}`
}

export function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-card)]/60 p-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">{label}</p>
      <p className="mt-1.5 font-[family-name:var(--font-display)] text-3xl leading-none text-[var(--color-heading)]">{value}</p>
      {sub && <p className="mt-1 text-xs text-[var(--color-muted)]">{sub}</p>}
    </div>
  )
}

interface HeatmapColumn {
  id: string
  label: string
}

export function Heatmap({
  columns,
  weeks,
  grid,
  currentWeek,
}: {
  columns: HeatmapColumn[]
  weeks: number[]
  grid: GridCell[]
  currentWeek: number
}) {
  const at = (week: number, workoutId: string) =>
    grid.find((c) => c.week === week && c.workoutId === workoutId)
  const template = `1.75rem repeat(${columns.length}, minmax(0, 1fr))`

  return (
    <div>
      <div className="grid gap-1" style={{ gridTemplateColumns: template }}>
        <span />
        {columns.map((c) => (
          <span key={c.id} className="text-center text-[9px] font-semibold uppercase tracking-wide text-[var(--color-muted)]">
            {c.label}
          </span>
        ))}

        {weeks.map((week) => (
          <FragmentRow key={week} week={week} highlight={week === currentWeek}>
            {columns.map((c) => {
              const cell = at(week, c.id)
              const completion = cell?.completion ?? 0
              const background =
                completion > 0 ? withAlpha(cell!.accent, 0.12 + (completion / 100) * 0.83) : 'rgba(255,255,255,0.04)'
              return (
                <div
                  key={c.id}
                  className="aspect-square rounded-[5px]"
                  style={{ background }}
                  title={`Week ${week} · ${cell?.title ?? ''} · ${completion}%`}
                  aria-label={`Week ${week} ${cell?.title ?? ''} ${completion}%`}
                />
              )
            })}
          </FragmentRow>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-end gap-1.5 text-[10px] text-[var(--color-muted)]">
        <span>Less</span>
        {[0.1, 0.35, 0.6, 0.85].map((a) => (
          <span key={a} className="h-3 w-3 rounded-[3px]" style={{ background: withAlpha('#c9a962', a) }} />
        ))}
        <span>More</span>
      </div>
    </div>
  )
}

function FragmentRow({ week, highlight, children }: { week: number; highlight: boolean; children: ReactNode }) {
  return (
    <>
      <span
        className="flex items-center text-[9px] font-medium tabular-nums"
        style={{ color: highlight ? 'var(--color-gold)' : 'var(--color-muted)' }}
      >
        {week}
      </span>
      {children}
    </>
  )
}

export function MiniBars({
  data,
  color,
}: {
  data: { label: string; value: number }[]
  color: string
}) {
  const max = Math.max(1, ...data.map((d) => d.value))
  return (
    <div className="flex h-28 items-end gap-1.5">
      {data.map((d) => (
        <div key={d.label} className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
          <div className="flex w-full flex-1 items-end" title={`${d.label}: ${d.value}`}>
            <div
              className="w-full rounded-t-[3px] transition-all duration-500"
              style={{
                height: `${Math.max(d.value === 0 ? 2 : 6, (d.value / max) * 100)}%`,
                background: d.value > 0 ? color : 'rgba(255,255,255,0.06)',
              }}
            />
          </div>
          <span className="text-[9px] tabular-nums text-[var(--color-muted)]">{d.label}</span>
        </div>
      ))}
    </div>
  )
}

export function BarRow({
  label,
  percent,
  color,
  sub,
}: {
  label: string
  percent: number
  color: string
  sub?: string
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-28 shrink-0 truncate text-xs font-medium text-[var(--color-text)]" title={label}>
        {label}
      </span>
      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${percent}%`, background: color }}
        />
      </div>
      <span className="w-16 shrink-0 text-right text-xs tabular-nums text-[var(--color-muted)]">
        {sub ?? `${percent}%`}
      </span>
    </div>
  )
}

export interface ProgressSeries {
  key: string
  name: string
  color: string
  points: TrendPoint[]
}

/** Multi-line chart of est. 1RM over the plan's weeks, with value gridlines and week ticks. */
export function ProgressChart({ series, weeks }: { series: ProgressSeries[]; weeks: number }) {
  const all = series.flatMap((s) => s.points.map((p) => p.value))
  if (all.length === 0) return null

  let lo = Math.min(...all)
  let hi = Math.max(...all)
  if (hi === lo) {
    lo -= 10
    hi += 10
  }
  const pad = (hi - lo) * 0.12
  const yMin = Math.max(0, Math.floor((lo - pad) / 5) * 5)
  const yMax = Math.ceil((hi + pad) / 5) * 5

  const ticks = [0, 1, 2, 3, 4]
  const x = (week: number) => ((week - 1) / (weeks - 1)) * 100
  const y = (value: number) => 100 - ((value - yMin) / (yMax - yMin)) * 100
  const yLabel = (i: number) => Math.round(yMax - (i / 4) * (yMax - yMin))

  return (
    <div>
      <div className="flex">
        <div className="relative mr-2 h-56 w-9 shrink-0">
          {ticks.map((i) => (
            <span
              key={i}
              className="absolute right-0 -translate-y-1/2 text-[9px] tabular-nums text-[var(--color-muted)]"
              style={{ top: `${(i / 4) * 100}%` }}
            >
              {yLabel(i)}
            </span>
          ))}
        </div>
        <div className="relative h-56 flex-1">
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" role="img">
            {ticks.map((i) => (
              <line
                key={i}
                x1={0}
                x2={100}
                y1={(i / 4) * 100}
                y2={(i / 4) * 100}
                stroke="rgba(255,255,255,0.06)"
                strokeWidth={1}
                vectorEffect="non-scaling-stroke"
              />
            ))}
            {series.map((s) =>
              s.points.length === 1 ? (
                <line
                  key={s.key}
                  x1={x(s.points[0].week) - 1.5}
                  x2={x(s.points[0].week) + 1.5}
                  y1={y(s.points[0].value)}
                  y2={y(s.points[0].value)}
                  stroke={s.color}
                  strokeWidth={3}
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                />
              ) : (
                <polyline
                  key={s.key}
                  points={s.points.map((p) => `${x(p.week)},${y(p.value)}`).join(' ')}
                  fill="none"
                  stroke={s.color}
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                />
              ),
            )}
          </svg>
        </div>
      </div>
      <div className="ml-11 flex justify-between text-[9px] tabular-nums text-[var(--color-muted)]">
        {Array.from({ length: weeks }, (_, i) => i + 1).map((w) => (
          <span key={w}>{w}</span>
        ))}
      </div>
    </div>
  )
}
