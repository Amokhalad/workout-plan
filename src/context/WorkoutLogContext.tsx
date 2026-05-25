import { createContext, useContext, type ReactNode } from 'react'
import { useWorkoutLog } from '../hooks/useWorkoutLog'

type WorkoutLogContextValue = ReturnType<typeof useWorkoutLog>

const WorkoutLogContext = createContext<WorkoutLogContextValue | null>(null)

export function WorkoutLogProvider({ children }: { children: ReactNode }) {
  const value = useWorkoutLog()
  return <WorkoutLogContext.Provider value={value}>{children}</WorkoutLogContext.Provider>
}

export function useWorkoutLogContext() {
  const ctx = useContext(WorkoutLogContext)
  if (!ctx) throw new Error('useWorkoutLogContext must be used within WorkoutLogProvider')
  return ctx
}
