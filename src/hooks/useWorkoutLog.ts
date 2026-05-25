import { useCallback, useEffect, useState } from 'react'

export interface LogEntry {
  actual: string
  notes: string
}

type LogStore = Record<string, LogEntry>

const STORAGE_KEY = 'legendary-workout-log'

function logKey(workoutId: string, week: number, exercise: string) {
  return `${workoutId}:${week}:${exercise}`
}

function load(): LogStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as LogStore) : {}
  } catch {
    return {}
  }
}

function save(store: LogStore) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
}

export function useWorkoutLog() {
  const [store, setStore] = useState<LogStore>(load)

  useEffect(() => {
    save(store)
  }, [store])

  const get = useCallback(
    (workoutId: string, week: number, exercise: string): LogEntry => {
      return store[logKey(workoutId, week, exercise)] ?? { actual: '', notes: '' }
    },
    [store],
  )

  const set = useCallback(
    (workoutId: string, week: number, exercise: string, field: keyof LogEntry, value: string) => {
      const key = logKey(workoutId, week, exercise)
      setStore((prev) => ({
        ...prev,
        [key]: { ...prev[key], actual: prev[key]?.actual ?? '', notes: prev[key]?.notes ?? '', [field]: value },
      }))
    },
    [],
  )

  const completionForWeek = useCallback(
    (workoutId: string, week: number, exerciseNames: string[]) => {
      const filled = exerciseNames.filter((name) => {
        const e = store[logKey(workoutId, week, name)]
        return e?.actual?.trim()
      }).length
      return exerciseNames.length ? Math.round((filled / exerciseNames.length) * 100) : 0
    },
    [store],
  )

  return { get, set, completionForWeek }
}
