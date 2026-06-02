import { createContext, useContext, type ReactNode } from 'react'
import { usePlanConfig } from '../hooks/usePlanConfig'
import { useWorkoutLog } from '../hooks/useWorkoutLog'

type AppContextValue = ReturnType<typeof usePlanConfig> & ReturnType<typeof useWorkoutLog>

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const plan = usePlanConfig()
  const log = useWorkoutLog()
  return <AppContext.Provider value={{ ...plan, ...log }}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
