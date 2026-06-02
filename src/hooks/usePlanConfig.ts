import { useCallback, useEffect, useState } from 'react'
import { buildDefaultPlan } from '../data/defaultPlan'
import type { PlanExercise, PlanFooter, PlanWorkout, TrainingPlan } from '../types/plan'
import { createId } from '../utils/id'
import { formatDateLabel, plannedDateFor, snapToSunday, weekdayOffset } from '../utils/sessionDates'
import { restDay } from '../data/workoutPlan'

const STORAGE_KEY = 'legendary-training-plan-v1'

/** Keep shifts to whole weeks and non-negative, so the schedule stays weekday-aligned and never overlaps. */
function normalizeShifts(shifts?: Record<number, number>): Record<number, number> {
  const out: Record<number, number> = {}
  for (const [week, days] of Object.entries(shifts ?? {})) {
    const weeks = Math.max(0, Math.round(Number(days) / 7))
    if (weeks > 0) out[Number(week)] = weeks * 7
  }
  return out
}

function hydratePlan(parsed: Partial<TrainingPlan> | null): TrainingPlan {
  const defaults = buildDefaultPlan()
  if (!parsed?.workouts?.length) return defaults
  return {
    version: 3,
    title: parsed.title ?? defaults.title,
    subtitle: parsed.subtitle ?? defaults.subtitle,
    workouts: parsed.workouts,
    startDate: snapToSunday(parsed.startDate ?? defaults.startDate),
    weekShiftDays: normalizeShifts(parsed.weekShiftDays),
  }
}

function loadPlan(): TrainingPlan {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return buildDefaultPlan()
    return hydratePlan(JSON.parse(raw) as TrainingPlan)
  } catch {
    return buildDefaultPlan()
  }
}

function savePlan(plan: TrainingPlan) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(plan))
}

export function usePlanConfig() {
  const [plan, setPlan] = useState<TrainingPlan>(loadPlan)

  useEffect(() => {
    savePlan(plan)
  }, [plan])

  const updatePlan = useCallback((fn: (p: TrainingPlan) => TrainingPlan) => {
    setPlan((prev) => fn(prev))
  }, [])

  const updateWorkout = useCallback((workoutId: string, patch: Partial<Pick<PlanWorkout, 'title' | 'subtitle' | 'day' | 'accent'>>) => {
    updatePlan((p) => ({
      ...p,
      workouts: p.workouts.map((w) => (w.id === workoutId ? { ...w, ...patch } : w)),
    }))
  }, [updatePlan])

  const updateExercise = useCallback(
    (
      workoutId: string,
      exerciseId: string,
      patch: Partial<Pick<PlanExercise, 'name' | 'restSeconds'>> & {
        target?: string
        week?: number
        allWeeks?: boolean
        /** Weeks whose prescription is protected from the all-weeks apply (already logged/skipped). */
        lockedWeeks?: number[]
      },
    ) => {
      updatePlan((p) => ({
        ...p,
        workouts: p.workouts.map((w) => {
          if (w.id !== workoutId) return w
          return {
            ...w,
            exercises: w.exercises.map((ex) => {
              if (ex.id !== exerciseId) return ex
              const next: PlanExercise = { ...ex }
              if (patch.name !== undefined) next.name = patch.name
              if (patch.restSeconds !== undefined) next.restSeconds = patch.restSeconds
              if (patch.target !== undefined) {
                const week = patch.week ?? 1
                const targets = [...ex.targets]
                while (targets.length < 12) targets.push('')
                if (patch.allWeeks) {
                  const locked = new Set(patch.lockedWeeks ?? [])
                  for (let w0 = 1; w0 <= 12; w0++) {
                    // Always write the week being edited; protect already logged/skipped weeks.
                    if (w0 === week || !locked.has(w0)) targets[w0 - 1] = patch.target
                  }
                } else {
                  targets[week - 1] = patch.target
                }
                next.targets = targets
              }
              return next
            }),
          }
        }),
      }))
    },
    [updatePlan],
  )

  const addExercise = useCallback((workoutId: string, week: number) => {
    const weekIdx = week - 1
    updatePlan((p) => ({
      ...p,
      workouts: p.workouts.map((w) => {
        if (w.id !== workoutId) return w
        const targets = Array(12).fill('')
        targets[weekIdx] = '3 x 10'
        const ex: PlanExercise = {
          id: createId(`${workoutId}-ex`),
          name: 'New exercise',
          targets,
          restSeconds: 90,
        }
        return { ...w, exercises: [...w.exercises, ex] }
      }),
    }))
  }, [updatePlan])

  const removeExercise = useCallback((workoutId: string, exerciseId: string) => {
    updatePlan((p) => ({
      ...p,
      workouts: p.workouts.map((w) =>
        w.id === workoutId ? { ...w, exercises: w.exercises.filter((e) => e.id !== exerciseId) } : w,
      ),
    }))
  }, [updatePlan])

  const moveExercise = useCallback((workoutId: string, exerciseId: string, direction: -1 | 1) => {
    updatePlan((p) => ({
      ...p,
      workouts: p.workouts.map((w) => {
        if (w.id !== workoutId) return w
        const idx = w.exercises.findIndex((e) => e.id === exerciseId)
        if (idx < 0) return w
        const next = idx + direction
        if (next < 0 || next >= w.exercises.length) return w
        const exercises = [...w.exercises]
        ;[exercises[idx], exercises[next]] = [exercises[next], exercises[idx]]
        return { ...w, exercises }
      }),
    }))
  }, [updatePlan])

  const updateFooter = useCallback(
    (
      workoutId: string,
      footerId: string,
      patch: { label?: string; value?: string; week?: number; allWeeks?: boolean; lockedWeeks?: number[] },
    ) => {
      updatePlan((p) => ({
        ...p,
        workouts: p.workouts.map((w) => {
          if (w.id !== workoutId) return w
          return {
            ...w,
            footers: w.footers.map((f) => {
              if (f.id !== footerId) return f
              const next: PlanFooter = { ...f }
              if (patch.label !== undefined) next.label = patch.label
              if (patch.value !== undefined) {
                const week = patch.week ?? 1
                const targets = [...f.targets]
                while (targets.length < 12) targets.push('')
                if (patch.allWeeks) {
                  const locked = new Set(patch.lockedWeeks ?? [])
                  for (let w0 = 1; w0 <= 12; w0++) {
                    if (w0 === week || !locked.has(w0)) targets[w0 - 1] = patch.value
                  }
                } else {
                  targets[week - 1] = patch.value
                }
                next.targets = targets
              }
              return next
            }),
          }
        }),
      }))
    },
    [updatePlan],
  )

  const setPlanMeta = useCallback((title: string, subtitle: string) => {
    updatePlan((p) => ({ ...p, title, subtitle }))
  }, [updatePlan])

  const getPlannedDate = useCallback(
    (workoutId: string, week: number): Date => {
      const dayName = plan.workouts.find((w) => w.id === workoutId)?.day ?? restDay.day
      return plannedDateFor(plan.startDate, week, weekdayOffset(dayName), plan.weekShiftDays)
    },
    [plan.startDate, plan.weekShiftDays, plan.workouts],
  )

  const getPlannedLabel = useCallback(
    (workoutId: string, week: number): string => formatDateLabel(getPlannedDate(workoutId, week)),
    [getPlannedDate],
  )

  const setStartDate = useCallback(
    (iso: string) => {
      if (iso) updatePlan((p) => ({ ...p, startDate: snapToSunday(iso) }))
    },
    [updatePlan],
  )

  /**
   * Inserts (or removes) whole rest-weeks before `fromWeek`, pushing that week
   * and everything after it later. Clamped non-negative so weeks can never
   * overlap or reorder, and kept to whole weeks so weekdays stay aligned.
   */
  const shiftSchedule = useCallback(
    (fromWeek: number, days: number) => {
      updatePlan((p) => {
        const next = { ...(p.weekShiftDays ?? {}) }
        const value = Math.max(0, (next[fromWeek] ?? 0) + days)
        if (value === 0) delete next[fromWeek]
        else next[fromWeek] = value
        return { ...p, weekShiftDays: next }
      })
    },
    [updatePlan],
  )

  const resetPlan = useCallback(() => {
    if (window.confirm('Reset all workouts, dates, and customizations to defaults?')) {
      setPlan(buildDefaultPlan())
    }
  }, [])

  return {
    plan,
    getPlannedDate,
    getPlannedLabel,
    setStartDate,
    shiftSchedule,
    updateWorkout,
    updateExercise,
    addExercise,
    removeExercise,
    moveExercise,
    updateFooter,
    setPlanMeta,
    resetPlan,
  }
}
