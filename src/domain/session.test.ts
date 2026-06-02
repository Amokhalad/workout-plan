import { describe, expect, it } from 'vitest'
import { sessionReader } from './session'
import { buildDefaultPlan } from '../data/defaultPlan'
import { logKey, sessionKey, type LogEntry, type SessionMeta } from '../hooks/useWorkoutLog'
import { snapToSunday, toISO, weekdayOffset } from '../utils/sessionDates'

const plan = buildDefaultPlan() // startDate 2026-05-24 (Sunday); upper-strength falls on Sunday
const upper = plan.workouts[0]
const WEEK1_UPPER = new Date(2026, 4, 24) // Sun May 24 2026

function oneSetLogged(): Record<string, LogEntry> {
  return {
    [logKey(upper.id, 1, upper.exercises[0].id)]: { actual: '', notes: '', sets: [{ done: true, actual: '' }] },
  }
}

describe('sessionReader status', () => {
  it('is upcoming before the planned date', () => {
    const r = sessionReader(plan, {}, {}, new Date(2026, 4, 20))
    expect(r.get(upper, 1).status.kind).toBe('upcoming')
  })

  it('is today on the planned date', () => {
    const r = sessionReader(plan, {}, {}, WEEK1_UPPER)
    expect(r.get(upper, 1).status.kind).toBe('today')
  })

  it('is missed when the planned date has passed with nothing logged', () => {
    const r = sessionReader(plan, {}, {}, new Date(2026, 4, 27))
    expect(r.get(upper, 1).status).toEqual({ kind: 'missed', daysLate: 3 })
  })

  it('is done on-time when logged and completed by the planned date', () => {
    const meta: Record<string, SessionMeta> = { [sessionKey(upper.id, 1)]: { completedDate: toISO(WEEK1_UPPER) } }
    const s = sessionReader(plan, oneSetLogged(), meta, new Date(2026, 5, 1)).get(upper, 1)
    expect(s.logged).toBe(true)
    expect(s.status).toEqual({ kind: 'done', daysLate: 0 })
  })

  it('is done late when the actual date is after the planned date', () => {
    const meta: Record<string, SessionMeta> = {
      [sessionKey(upper.id, 1)]: { completedDate: toISO(new Date(2026, 4, 26)) },
    }
    const s = sessionReader(plan, oneSetLogged(), meta, new Date(2026, 5, 1)).get(upper, 1)
    expect(s.status).toEqual({ kind: 'done', daysLate: 2 })
  })

  it('is skipped regardless of date when marked skipped', () => {
    const meta: Record<string, SessionMeta> = { [sessionKey(upper.id, 1)]: { skipped: true } }
    const s = sessionReader(plan, {}, meta, new Date(2026, 4, 27)).get(upper, 1)
    expect(s.status.kind).toBe('skipped')
  })
})

describe('sessionReader derivation', () => {
  it('computes completion as the share of logged exercises', () => {
    const s = sessionReader(plan, oneSetLogged(), {}, WEEK1_UPPER).get(upper, 1)
    expect(s.completion).toBe(Math.round((1 / upper.exercises.length) * 100))
  })

  it('applies week shifts to the planned date', () => {
    const shifted = { ...plan, weekShiftDays: { 1: 7 } }
    const s = sessionReader(shifted, {}, {}, WEEK1_UPPER).get(upper, 1)
    expect(toISO(s.plannedDate)).toBe('2026-05-31')
    expect(s.status.kind).toBe('upcoming')
  })

  it('returns one Session per workout for a week', () => {
    expect(sessionReader(plan, {}, {}).forWeek(1)).toHaveLength(plan.workouts.length)
  })
})

describe('schedule integrity', () => {
  it('snaps any date back to its Sunday', () => {
    expect(snapToSunday('2026-05-24')).toBe('2026-05-24') // Sun -> Sun (default start)
    expect(snapToSunday('2026-06-01')).toBe('2026-05-31') // Mon -> Sun
    expect(snapToSunday('2026-06-06')).toBe('2026-05-31') // Sat -> Sun
  })

  it('derives the planned weekday from the workout day, so editing the day moves the date', () => {
    const moved = {
      ...plan,
      workouts: plan.workouts.map((w) => (w.id === upper.id ? { ...w, day: 'Wednesday' } : w)),
    }
    const s = sessionReader(moved, {}, {}, WEEK1_UPPER).get(moved.workouts[0], 1)
    expect(s.plannedDate.getDay()).toBe(3) // Wednesday
  })

  it('keeps every session on its weekday and strictly ordered, even with rest weeks inserted', () => {
    const reader = sessionReader({ ...plan, weekShiftDays: { 3: 7, 7: 14 } }, {}, {})
    for (const w of plan.workouts) {
      const offset = weekdayOffset(w.day)
      let prev = -Infinity
      for (let week = 1; week <= 12; week++) {
        const d = reader.get(w, week).plannedDate
        expect(d.getDay()).toBe(offset)
        expect(d.getTime()).toBeGreaterThan(prev)
        prev = d.getTime()
      }
    }
  })
})
