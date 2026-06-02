import { useCallback, useEffect, useState } from 'react'
import { todayISO } from '../utils/sessionDates'

export interface SetLog {
  done: boolean
  actual: string
}

export interface LogEntry {
  actual: string
  notes: string
  sets?: SetLog[]
}

type LogStore = Record<string, LogEntry>

const emptySet = (): SetLog => ({ done: false, actual: '' })

/** Materializes a set array at least `count` long, preserving existing entries. */
function ensureSets(entry: LogEntry | undefined, count: number): SetLog[] {
  const existing = entry?.sets ?? []
  const length = Math.max(count, existing.length)
  return Array.from({ length }, (_, i) => existing[i] ?? emptySet())
}

const STORAGE_KEY = 'legendary-workout-log'

export function logKey(workoutId: string, week: number, exerciseId: string) {
  return `${workoutId}:${week}:${exerciseId}`
}

/** An exercise counts as "logged" if it has free-text actual or any completed set. */
export function isLogged(entry: LogEntry | undefined): boolean {
  return Boolean(entry?.actual?.trim() || entry?.sets?.some((s) => s.done))
}

export function setsDone(entry: LogEntry | undefined): number {
  return entry?.sets?.filter((s) => s.done).length ?? 0
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

/** Per-session (workoutId + week) actual-completion metadata, separate from the per-exercise log. */
export interface SessionMeta {
  completedDate?: string
  skipped?: boolean
}

type SessionMetaStore = Record<string, SessionMeta>

const META_STORAGE_KEY = 'legendary-session-meta'

export function sessionKey(workoutId: string, week: number) {
  return `${workoutId}:${week}`
}

function loadMeta(): SessionMetaStore {
  try {
    const raw = localStorage.getItem(META_STORAGE_KEY)
    return raw ? (JSON.parse(raw) as SessionMetaStore) : {}
  } catch {
    return {}
  }
}

function saveMeta(store: SessionMetaStore) {
  localStorage.setItem(META_STORAGE_KEY, JSON.stringify(store))
}

export function useWorkoutLog() {
  const [store, setStore] = useState<LogStore>(load)
  const [meta, setMeta] = useState<SessionMetaStore>(loadMeta)

  useEffect(() => {
    save(store)
  }, [store])

  useEffect(() => {
    saveMeta(meta)
  }, [meta])

  /** Records the actual date (today) the first time a session gets any logged activity. */
  const stampSession = useCallback((workoutId: string, week: number) => {
    setMeta((prev) => {
      const k = sessionKey(workoutId, week)
      if (prev[k]?.completedDate) return prev
      return { ...prev, [k]: { ...prev[k], completedDate: todayISO() } }
    })
  }, [])

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
    (workoutId: string, week: number, exerciseId: string, field: 'actual' | 'notes', value: string) => {
      const key = logKey(workoutId, week, exerciseId)
      setStore((prev) => ({
        ...prev,
        [key]: {
          actual: prev[key]?.actual ?? '',
          notes: prev[key]?.notes ?? '',
          sets: prev[key]?.sets,
          [field]: value,
        },
      }))
      if (field === 'actual' && value.trim()) stampSession(workoutId, week)
    },
    [stampSession],
  )

  const getSets = useCallback(
    (workoutId: string, week: number, exerciseId: string, count: number): SetLog[] =>
      ensureSets(store[logKey(workoutId, week, exerciseId)], count),
    [store],
  )

  const writeSets = useCallback(
    (workoutId: string, week: number, exerciseId: string, update: (sets: SetLog[]) => SetLog[]) => {
      const key = logKey(workoutId, week, exerciseId)
      setStore((prev) => {
        const entry = prev[key]
        return {
          ...prev,
          [key]: {
            actual: entry?.actual ?? '',
            notes: entry?.notes ?? '',
            sets: update(entry?.sets ?? []),
          },
        }
      })
    },
    [],
  )

  const toggleSet = useCallback(
    (workoutId: string, week: number, exerciseId: string, index: number, count: number) => {
      writeSets(workoutId, week, exerciseId, (existing) => {
        const sets = ensureSets({ actual: '', notes: '', sets: existing }, Math.max(count, index + 1))
        sets[index] = { ...sets[index], done: !sets[index].done }
        return sets
      })
      stampSession(workoutId, week)
    },
    [writeSets, stampSession],
  )

  const setSetActual = useCallback(
    (workoutId: string, week: number, exerciseId: string, index: number, value: string, count: number) => {
      writeSets(workoutId, week, exerciseId, (existing) => {
        const sets = ensureSets({ actual: '', notes: '', sets: existing }, Math.max(count, index + 1))
        sets[index] = { ...sets[index], actual: value }
        return sets
      })
      if (value.trim()) stampSession(workoutId, week)
    },
    [writeSets, stampSession],
  )

  const addSet = useCallback(
    (workoutId: string, week: number, exerciseId: string, count: number) => {
      writeSets(workoutId, week, exerciseId, (existing) => [
        ...ensureSets({ actual: '', notes: '', sets: existing }, count),
        emptySet(),
      ])
    },
    [writeSets],
  )

  const removeSet = useCallback(
    (workoutId: string, week: number, exerciseId: string, index: number) => {
      writeSets(workoutId, week, exerciseId, (existing) => existing.filter((_, i) => i !== index))
    },
    [writeSets],
  )

  const getSessionMeta = useCallback(
    (workoutId: string, week: number): SessionMeta => meta[sessionKey(workoutId, week)] ?? {},
    [meta],
  )

  const setCompletedDate = useCallback((workoutId: string, week: number, iso: string) => {
    setMeta((prev) => {
      const k = sessionKey(workoutId, week)
      return { ...prev, [k]: { ...prev[k], completedDate: iso } }
    })
  }, [])

  const markSkipped = useCallback((workoutId: string, week: number, skipped: boolean) => {
    setMeta((prev) => {
      const k = sessionKey(workoutId, week)
      return { ...prev, [k]: { ...prev[k], skipped } }
    })
  }, [])

  return {
    entries: store,
    sessionMeta: meta,
    get,
    set,
    getSets,
    toggleSet,
    setSetActual,
    addSet,
    removeSet,
    getSessionMeta,
    setCompletedDate,
    markSkipped,
  }
}
