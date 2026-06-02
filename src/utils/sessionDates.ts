export const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const

export type Weekday = (typeof WEEKDAYS)[number]

/** Days after Week-1 Sunday a weekday name falls on (Sunday = 0 ... Saturday = 6). */
export function weekdayOffset(day: string): number {
  const i = WEEKDAYS.indexOf(day as Weekday)
  return i < 0 ? 0 : i
}

export function parseISO(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y || 2026, (m || 1) - 1, d || 1)
}

export function toISO(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function todayISO(): string {
  return toISO(new Date())
}

/** Snaps a date to the Sunday on or before it, so Week 1 always begins on a Sunday. */
export function snapToSunday(iso: string): string {
  const d = parseISO(iso)
  return toISO(addDays(d, -d.getDay()))
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

/** Whole calendar days from a to b (positive if b is later). */
export function daysBetween(a: Date, b: Date): number {
  return Math.round((startOfDay(b).getTime() - startOfDay(a).getTime()) / 86_400_000)
}

export function formatDateLabel(date: Date): string {
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

/** Planned calendar date for a session, derived from the start date, its weekday offset, and any catch-up shifts. */
export function plannedDateFor(
  startDate: string,
  week: number,
  offsetDays: number,
  weekShiftDays?: Record<number, number>,
): Date {
  let shift = 0
  if (weekShiftDays) {
    for (let w = 1; w <= week; w++) shift += weekShiftDays[w] ?? 0
  }
  return addDays(parseISO(startDate), (week - 1) * 7 + offsetDays + shift)
}

/** Which 1-12 week "today" falls in, given the start date. */
export function currentWeek(startDate: string, today: Date = new Date()): number {
  const diff = daysBetween(parseISO(startDate), today)
  return Math.min(12, Math.max(1, Math.floor(diff / 7) + 1))
}

export type SessionStatusKind = 'upcoming' | 'today' | 'done' | 'missed' | 'skipped'

export interface SessionStatus {
  kind: SessionStatusKind
  /** done: completed minus planned (positive = late). missed: today minus planned. */
  daysLate: number
}

export function sessionStatus(args: {
  plannedDate: Date
  completedDate?: string
  logged: boolean
  skipped?: boolean
  today?: Date
}): SessionStatus {
  const today = args.today ?? new Date()
  const planned = args.plannedDate

  if (args.skipped) return { kind: 'skipped', daysLate: 0 }
  if (args.logged) {
    const done = args.completedDate ? parseISO(args.completedDate) : planned
    return { kind: 'done', daysLate: daysBetween(planned, done) }
  }

  const diff = daysBetween(planned, today)
  if (diff > 0) return { kind: 'missed', daysLate: diff }
  if (diff === 0) return { kind: 'today', daysLate: 0 }
  return { kind: 'upcoming', daysLate: 0 }
}
