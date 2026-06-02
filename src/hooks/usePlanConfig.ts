import { useCallback, useEffect, useState } from 'react'
import { buildDefaultPlan } from '../data/defaultPlan'
import type { PlanExercise, PlanFooter, PlanWorkout, TrainingPlan } from '../types/plan'
import { createId } from '../utils/id'

const STORAGE_KEY = 'legendary-training-plan-v1'

function loadPlan(): TrainingPlan {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return buildDefaultPlan()
    const parsed = JSON.parse(raw) as TrainingPlan
    if (!parsed?.workouts?.length) return buildDefaultPlan()
    return parsed
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

  const resetPlan = useCallback(() => {
    if (window.confirm('Reset all workouts to the original plan? Your customizations will be lost.')) {
      setPlan(buildDefaultPlan())
    }
  }, [])

  return {
    plan,
    getWorkout,
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
