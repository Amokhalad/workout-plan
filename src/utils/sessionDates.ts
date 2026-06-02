import type { SessionDateKey } from '../types/plan'

export const WORKOUT_SESSION_KEY: Record<string, SessionDateKey> = {
  'upper-strength': 'upperStrength',
  'lower-strength': 'lowerStrength',
  'engine-mind': 'engineMind',
  'upper-hypertrophy': 'upperHypertrophy',
  'lower-hypertrophy': 'lowerHypertrophy',
  'aerobic-recovery': 'aerobicRecovery',
  rest: 'rest',
}

/** Plan calendar year for parsing labels without a year. */
export const PLAN_YEAR = 2026

export function formatSessionDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

export function parseSessionDate(label: string): Date | null {
  const trimmed = label.trim()
  if (!trimmed) return null
  const withYear = trimmed.includes(String(PLAN_YEAR)) ? trimmed : `${trimmed}, ${PLAN_YEAR}`
  const ms = Date.parse(withYear)
  if (Number.isNaN(ms)) return null
  return new Date(ms)
}

export function toDateInputValue(label: string): string {
  const d = parseSessionDate(label)
  if (!d) return ''
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function fromDateInputValue(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  if (!y || !m || !d) return ''
  return formatSessionDate(new Date(y, m - 1, d))
}

export function shiftSessionDate(label: string, days: number): string {
  const d = parseSessionDate(label)
  if (!d) return label
  d.setDate(d.getDate() + days)
  return formatSessionDate(d)
}
