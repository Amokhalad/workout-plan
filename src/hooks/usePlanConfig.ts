import { useCallback, useEffect, useState } from 'react'
import { buildDefaultPlan } from '../data/defaultPlan'
import { buildDefaultWeekDates } from '../data/defaultWeekDates'
import type { PlanExercise, PlanFooter, PlanWorkout, SessionDateKey, TrainingPlan } from '../types/plan'
import { createId } from '../utils/id'
import { WORKOUT_SESSION_KEY } from '../utils/sessionDates'

const STORAGE_KEY = 'legendary-training-plan-v1'

function hydratePlan(parsed: Partial<TrainingPlan> | null): TrainingPlan {
  const defaults = buildDefaultPlan()
  if (!parsed?.workouts?.length) return defaults
  return {
    ...defaults,
    ...parsed,
    version: 2,
    workouts: parsed.workouts,
    weekDates: parsed.weekDates?.length === 12 ? parsed.weekDates : buildDefaultWeekDates(),
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

  const getWorkout = useCallback(
    (workoutId: string) => plan.workouts.find((w) => w.id === workoutId),
    [plan.workouts],
  )

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
                const weekIdx = (patch.week ?? 1) - 1
                if (patch.allWeeks) {
                  next.targets = Array(12).fill(patch.target)
                } else {
                  const targets = [...ex.targets]
                  while (targets.length < 12) targets.push('')
                  targets[weekIdx] = patch.target
                  next.targets = targets
                }
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

  const updateFooter = useCallback((workoutId: string, footerId: string, patch: Partial<PlanFooter> & { value?: string; week?: number }) => {
    updatePlan((p) => ({
      ...p,
      workouts: p.workouts.map((w) => {
        if (w.id !== workoutId) return w
        return {
          ...w,
          footers: w.footers.map((f) => {
            if (f.id !== footerId) return f
            if (patch.value !== undefined && patch.week !== undefined) {
              const targets = [...f.targets]
              while (targets.length < 12) targets.push('')
              targets[patch.week - 1] = patch.value
              return { ...f, ...patch, targets }
            }
            return { ...f, ...patch }
          }),
        }
      }),
    }))
  }, [updatePlan])

  const setPlanMeta = useCallback((title: string, subtitle: string) => {
    updatePlan((p) => ({ ...p, title, subtitle }))
  }, [updatePlan])

  const getWorkoutDate = useCallback(
    (workoutId: string, week: number): string => {
      const sessionKey = WORKOUT_SESSION_KEY[workoutId] ?? 'rest'
      const weekEntry = plan.weekDates.find((w) => w.week === week) ?? plan.weekDates[week - 1]
      return weekEntry?.dates[sessionKey] ?? ''
    },
    [plan.weekDates],
  )

  const updateSessionDate = useCallback(
    (week: number, sessionKey: SessionDateKey, value: string) => {
      updatePlan((p) => ({
        ...p,
        weekDates: p.weekDates.map((w) =>
          w.week === week ? { ...w, dates: { ...w.dates, [sessionKey]: value } } : w,
        ),
      }))
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
    getWorkout,
    getWorkoutDate,
    updateSessionDate,
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
