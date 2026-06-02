import { isLogged, logKey, sessionKey, type LogEntry, type SessionMeta } from '../hooks/useWorkoutLog'
import type { PlanWorkout, TrainingPlan } from '../types/plan'
import { formatDateLabel, plannedDateFor, sessionStatus, weekdayOffset, type SessionStatus } from '../utils/sessionDates'

/**
 * A Session is a Workout on a specific Week — the thing you actually do.
 * Everything here is derived from the Training Plan, the Log, and the session
 * metadata; nothing on a Session is stored directly.
 */
export interface Session {
  workoutId: string
  title: string
  accent: string
  day: string
  week: number
  plannedDate: Date
  plannedLabel: string
  /** Percentage of the Session's exercises with any logged activity (0-100). */
  completion: number
  logged: boolean
  /** Actual date the Session was trained, if logged. */
  completedDate?: string
  skipped: boolean
  status: SessionStatus
}

export interface SessionReader {
  get(workout: PlanWorkout, week: number): Session
  forWeek(week: number): Session[]
}

/**
 * The single place that turns the Training Plan + Log + session metadata into
 * Sessions. Pure and in-process: build one reader, query it many times.
 * Inject `today` to make Status deterministic in tests.
 */
export function sessionReader(
  plan: TrainingPlan,
  entries: Record<string, LogEntry>,
  sessionMeta: Record<string, SessionMeta>,
  today: Date = new Date(),
): SessionReader {
  const get = (workout: PlanWorkout, week: number): Session => {
    const total = workout.exercises.length
    const loggedCount = workout.exercises.filter((ex) => isLogged(entries[logKey(workout.id, week, ex.id)])).length
    const meta = sessionMeta[sessionKey(workout.id, week)] ?? {}
    const plannedDate = plannedDateFor(plan.startDate, week, weekdayOffset(workout.day), plan.weekShiftDays)
    const logged = loggedCount > 0

    return {
      workoutId: workout.id,
      title: workout.title,
      accent: workout.accent,
      day: workout.day,
      week,
      plannedDate,
      plannedLabel: formatDateLabel(plannedDate),
      completion: total ? Math.round((loggedCount / total) * 100) : 0,
      logged,
      completedDate: meta.completedDate,
      skipped: meta.skipped ?? false,
      status: sessionStatus({ plannedDate, completedDate: meta.completedDate, logged, skipped: meta.skipped, today }),
    }
  }

  return {
    get,
    forWeek: (week) => plan.workouts.map((w) => get(w, week)),
  }
}
