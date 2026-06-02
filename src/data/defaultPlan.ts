import type { PlanExercise, PlanWorkout, TrainingPlan } from '../types/plan'
import { workouts as templates, planTitle, planSubtitle } from './workoutPlan'

/** Week 1 Sunday (Upper Strength) of the seed program. */
export const DEFAULT_START_DATE = '2026-05-24'

export const REST_PRESETS = [30, 45, 60, 90, 120, 180] as const

export function defaultRestSeconds(exerciseName: string): number {
  const n = exerciseName.toLowerCase()
  if (
    n.includes('cardio') ||
    n.includes('mobility') ||
    n.includes('breath') ||
    n.includes('sauna') ||
    n.includes('steam') ||
    n.includes('plunge') ||
    n.includes('finisher') ||
    n.includes('goal')
  ) {
    return 30
  }
  if (
    n.includes('curl') ||
    n.includes('tricep') ||
    n.includes('lateral raise') ||
    n.includes('face pull') ||
    n.includes('rear delt') ||
    n.includes('leg extension') ||
    n.includes('calf')
  ) {
    return 60
  }
  if (
    n.includes('bench') ||
    n.includes('squat') ||
    n.includes('deadlift') ||
    n.includes('rdl') ||
    n.includes('romanian') ||
    n.includes('hip thrust') ||
    n.includes('overhead press') ||
    n.includes('incline') ||
    n.includes('pull-up') ||
    n.includes('pulldown') && !n.includes('face')
  ) {
    return 120
  }
  return 90
}

function toExercise(workoutId: string, index: number, name: string, targets: string[]): PlanExercise {
  return {
    id: `${workoutId}-ex-${index}`,
    name,
    targets: [...targets],
    restSeconds: defaultRestSeconds(name),
  }
}

export function buildDefaultPlan(): TrainingPlan {
  const planWorkouts: PlanWorkout[] = templates.map((w) => ({
    id: w.id,
    title: w.title,
    subtitle: w.subtitle,
    day: w.day,
    accent: w.accent,
    exercises: w.exercises.map((ex, i) => toExercise(w.id, i, ex.name, ex.targets)),
    footers: (w.footer ?? []).map((f, i) => ({
      id: `${w.id}-footer-${i}`,
      label: f.label,
      targets: [...f.targets],
    })),
  }))

  return {
    version: 3,
    title: planTitle,
    subtitle: planSubtitle,
    workouts: planWorkouts,
    startDate: DEFAULT_START_DATE,
    weekShiftDays: {},
  }
}
