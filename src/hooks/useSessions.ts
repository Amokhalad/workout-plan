import { useMemo } from 'react'
import { useApp } from '../context/AppContext'
import { sessionReader, type SessionReader } from '../domain/session'

/** React adapter over sessionReader: builds a reader from current Plan + Log state. */
export function useSessions(): SessionReader {
  const { plan, entries, sessionMeta } = useApp()
  return useMemo(() => sessionReader(plan, entries, sessionMeta), [plan, entries, sessionMeta])
}
