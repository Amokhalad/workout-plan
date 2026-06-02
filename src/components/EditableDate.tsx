import { useEffect, useRef, useState } from 'react'
import type { SessionDateKey } from '../types/plan'
import { useApp } from '../context/AppContext'
import {
  WORKOUT_SESSION_KEY,
  fromDateInputValue,
  shiftSessionDate,
  toDateInputValue,
} from '../utils/sessionDates'

interface EditableDateProps {
  workoutId: string
  week: number
  className?: string
}

export function EditableDate({ workoutId, week, className = '' }: EditableDateProps) {
  const { getWorkoutDate, updateSessionDate } = useApp()
  const sessionKey = (WORKOUT_SESSION_KEY[workoutId] ?? 'rest') as SessionDateKey
  const label = getWorkoutDate(workoutId, week)

  const [open, setOpen] = useState(false)
  const [customText, setCustomText] = useState(label)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setCustomText(label)
  }, [label])

  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  const apply = (value: string) => {
    updateSessionDate(week, sessionKey, value)
    setCustomText(value)
  }

  const dateInput = toDateInputValue(label)

  return (
    <div ref={rootRef} className={`relative inline-block ${className}`}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          setOpen((v) => !v)
        }}
        className="touch-target inline-flex min-h-8 items-center gap-1 rounded-lg border border-transparent px-2 py-1 text-xs font-medium text-[var(--color-gold-dim)] transition hover:border-[var(--color-border)] hover:bg-white/[0.04] active:bg-white/[0.06]"
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <span>{label || 'Set date'}</span>
        <span className="text-[10px] opacity-70" aria-hidden>
          ▾
        </span>
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Change session date"
          className="absolute left-0 top-full z-[60] mt-1.5 w-[min(calc(100vw-2.5rem),17.5rem)] rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-card)] p-3 shadow-xl"
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--color-muted)]">
            Session date
          </p>

          <label className="mb-3 block">
            <span className="mb-1 block text-[10px] text-[var(--color-muted)]">Calendar</span>
            <input
              type="date"
              value={dateInput}
              onChange={(e) => {
                if (!e.target.value) return
                apply(fromDateInputValue(e.target.value))
              }}
              className="field-input w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 outline-none focus:border-[var(--color-gold)]"
            />
          </label>

          <label className="mb-3 block">
            <span className="mb-1 block text-[10px] text-[var(--color-muted)]">Display text</span>
            <input
              type="text"
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              onBlur={() => {
                if (customText.trim()) apply(customText.trim())
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && customText.trim()) {
                  apply(customText.trim())
                  setOpen(false)
                }
              }}
              placeholder="Sun, May 24"
              className="field-input w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 outline-none focus:border-[var(--color-gold)]"
            />
          </label>

          <div className="mb-3 flex gap-2">
            <button
              type="button"
              onClick={() => apply(shiftSessionDate(label, -1))}
              className="touch-target flex-1 rounded-lg border border-[var(--color-border)] py-2 text-xs font-medium text-[var(--color-text)]"
            >
              −1 day
            </button>
            <button
              type="button"
              onClick={() => apply(shiftSessionDate(label, 1))}
              className="touch-target flex-1 rounded-lg border border-[var(--color-border)] py-2 text-xs font-medium text-[var(--color-text)]"
            >
              +1 day
            </button>
          </div>

          <button
            type="button"
            onClick={() => setOpen(false)}
            className="touch-target w-full rounded-lg bg-[var(--color-gold)] py-2.5 text-xs font-semibold text-[#0c0c0e]"
          >
            Done
          </button>
        </div>
      )}
    </div>
  )
}
