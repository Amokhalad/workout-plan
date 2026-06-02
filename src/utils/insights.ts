import type { TrainingPlan } from '../types/plan'
import { logKey, setsDone, type LogEntry, type SessionMeta } from '../hooks/useWorkoutLog'
import { sessionReader } from '../domain/session'

export const PLAN_WEEKS = 12

export interface GridCell {
  week: number
  workoutId: string
  title: string
  accent: string
  completion: number
}

export interface WeekStat {
  week: number
  completion: number
  setsDone: number
}

export interface WorkoutStat {
  id: string
  title: string
  accent: string
  completion: number
  sessionsLogged: number
}

export interface TrendPoint {
  week: number
  value: number
}

export interface ExerciseTrend {
  key: string
  name: string
  accent: string
  points: TrendPoint[]
  best: number
  first: number
  latest: number
  delta: number
  startWeek: number
  latestWeek: number
}

export interface Adherence {
  onTime: number
  late: number
  missed: number
  skipped: number
  avgDaysLate: number
}

export interface Insights {
  totalSessions: number
  sessionsLogged: number
  overallCompletion: number
  setsCompleted: number
  currentStreak: number
  bestStreak: number
  grid: GridCell[]
  perWeek: WeekStat[]
  perWorkout: WorkoutStat[]
  trends: ExerciseTrend[]
  adherence: Adherence
}

const WEIGHT_REPS = /(\d+(?:\.\d+)?)\s*[x×]\s*(\d+)/g

/** Epley estimated 1RM; returns the best (highest) est-1RM across all weight x reps pairs in the text. */
function bestEpley(text: string): number {
  let best = 0
  for (const match of text.matchAll(WEIGHT_REPS)) {
    const weight = Number(match[1])
    const reps = Number(match[2])
    if (!weight || !reps) continue
    const est = weight * (1 + reps / 30)
    if (est > best) best = est
  }
  return best
}

/** Pulls every logged number-ish string for an exercise/week: top-level actual + per-set actuals. */
function sessionText(entry: LogEntry | undefined): string {
  if (!entry) return ''
  const setText = entry.sets?.map((s) => s.actual).join(', ') ?? ''
  return `${entry.actual ?? ''}, ${setText}`
}

function trailingStreak(active: boolean[]): number {
  let streak = 0
  for (let i = active.length - 1; i >= 0; i--) {
    if (!active[i]) {
      if (streak > 0) break
      continue
    }
    streak++
  }
  return streak
}

function longestStreak(active: boolean[]): number {
  let best = 0
  let run = 0
  for (const a of active) {
    run = a ? run + 1 : 0
    if (run > best) best = run
  }
  return best
}

export function computeInsights(
  plan: TrainingPlan,
  entries: Record<string, LogEntry>,
  sessionMeta: Record<string, SessionMeta> = {},
): Insights {
  const workouts = plan.workouts
  const reader = sessionReader(plan, entries, sessionMeta)
  const grid: GridCell[] = []
  const perWeek: WeekStat[] = []
  const weekActive: boolean[] = []

  let completionSum = 0
  let completionCount = 0
  let setsCompleted = 0

  for (let week = 1; week <= PLAN_WEEKS; week++) {
    let weekSets = 0
    let weekCompletionSum = 0
    let anyLogged = false

    for (const w of workouts) {
      const session = reader.get(w, week)
      for (const ex of w.exercises) {
        const done = setsDone(entries[logKey(w.id, week, ex.id)])
        weekSets += done
        setsCompleted += done
      }
      if (session.logged) anyLogged = true
      weekCompletionSum += session.completion
      completionSum += session.completion
      completionCount++
      grid.push({ week, workoutId: w.id, title: w.title, accent: w.accent, completion: session.completion })
    }

    perWeek.push({
      week,
      completion: workouts.length ? Math.round(weekCompletionSum / workouts.length) : 0,
      setsDone: weekSets,
    })
    weekActive.push(anyLogged)
  }

  const perWorkout: WorkoutStat[] = workouts.map((w) => {
    const cells = grid.filter((c) => c.workoutId === w.id)
    const sessionsLogged = cells.filter((c) => c.completion > 0).length
    const completion = cells.length ? Math.round(cells.reduce((a, c) => a + c.completion, 0) / cells.length) : 0
    return { id: w.id, title: w.title, accent: w.accent, completion, sessionsLogged }
  })

  const trends: ExerciseTrend[] = []
  for (const w of workouts) {
    for (const ex of w.exercises) {
      const points: TrendPoint[] = []
      for (let week = 1; week <= PLAN_WEEKS; week++) {
        const value = bestEpley(sessionText(entries[logKey(w.id, week, ex.id)]))
        if (value > 0) points.push({ week, value: Math.round(value) })
      }
      if (points.length >= 1) {
        const values = points.map((p) => p.value)
        const firstPt = points[0]
        const lastPt = points[points.length - 1]
        trends.push({
          key: `${w.id}:${ex.id}`,
          name: ex.name,
          accent: w.accent,
          points,
          best: Math.max(...values),
          first: firstPt.value,
          latest: lastPt.value,
          delta: lastPt.value - firstPt.value,
          startWeek: firstPt.week,
          latestWeek: lastPt.week,
        })
      }
    }
  }
  trends.sort((a, b) => b.latest - a.latest || b.points.length - a.points.length)

  const sessionsLogged = grid.filter((c) => c.completion > 0).length

  let onTime = 0
  let late = 0
  let missed = 0
  let skipped = 0
  let lateDaysSum = 0
  for (let week = 1; week <= PLAN_WEEKS; week++) {
    for (const w of workouts) {
      const st = reader.get(w, week).status
      if (st.kind === 'skipped') skipped++
      else if (st.kind === 'done') {
        if (st.daysLate > 0) {
          late++
          lateDaysSum += st.daysLate
        } else onTime++
      } else if (st.kind === 'missed') missed++
    }
  }

  return {
    totalSessions: workouts.length * PLAN_WEEKS,
    sessionsLogged,
    overallCompletion: completionCount ? Math.round(completionSum / completionCount) : 0,
    setsCompleted,
    currentStreak: trailingStreak(weekActive),
    bestStreak: longestStreak(weekActive),
    grid,
    perWeek,
    perWorkout,
    trends,
    adherence: { onTime, late, missed, skipped, avgDaysLate: late ? Math.round(lateDaysSum / late) : 0 },
  }
}
