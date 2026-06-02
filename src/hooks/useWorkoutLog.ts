import { useCallback, useEffect, useState } from 'react'

export interface LogEntry {
  actual: string
  notes: string
}

type LogStore = Record<string, LogEntry>

const STORAGE_KEY = 'legendary-workout-log'

function logKey(workoutId: string, week: number, exerciseId: string) {
  return `${workoutId}:${week}:${exerciseId}`
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
    (workoutId: string, week: number, exerciseId: string, legacyName?: string): LogEntry => {
      const byId = store[logKey(workoutId, week, exerciseId)]
      if (byId) return byId
      if (legacyName) {
        const byName = store[`${workoutId}:${week}:${legacyName}`]
        if (byName) return byName
      }
      return { actual: '', notes: '' }
    },
    [store],
  )

  const set = useCallback(
    (workoutId: string, week: number, exerciseId: string, field: keyof LogEntry, value: string) => {
      const key = logKey(workoutId, week, exerciseId)
      setStore((prev) => ({
        ...prev,
        [key]: {
          actual: prev[key]?.actual ?? '',
          notes: prev[key]?.notes ?? '',
          [field]: value,
        },
      }))
    },
    [],
  )

  const completionForWeek = useCallback(
    (workoutId: string, week: number, exerciseIds: string[]) => {
      const filled = exerciseIds.filter((id) => {
        const e = store[logKey(workoutId, week, id)]
        return e?.actual?.trim()
      }).length
      return exerciseIds.length ? Math.round((filled / exerciseIds.length) * 100) : 0
    },
    [store],
  )

  return { get, set, completionForWeek }
}
