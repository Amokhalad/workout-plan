export type Phase = 'Build' | 'Deload' | 'Strength' | 'Power + Test'

export interface PlanExercise {
  id: string
  name: string
  /** Index 0 = week 1 */
  targets: string[]
  restSeconds: number
}

export interface PlanFooter {
  id: string
  label: string
  targets: string[]
}

export interface PlanWorkout {
  id: string
  title: string
  subtitle: string
  day: string
  accent: string
  exercises: PlanExercise[]
  footers: PlanFooter[]
}

export interface TrainingPlan {
  version: number
  title: string
  subtitle: string
  workouts: PlanWorkout[]
}

export interface WeekMeta {
  week: number
  phase: Phase
  goal: string
  intensity: string
  progression: string
  dates: Record<string, string>
}
