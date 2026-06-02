import type { WeekDates } from '../types/plan'
import { weekMeta } from './workoutPlan'

export function buildDefaultWeekDates(): WeekDates[] {
  return weekMeta.map((w) => ({
    week: w.week,
    dates: { ...w.dates } as WeekDates['dates'],
  }))
}
