import { useCallback, useEffect, useRef, useState } from 'react'
import { REST_PRESETS } from '../data/defaultPlan'
import { playTripleBeep, unlockAudio } from '../utils/beep'
import { formatDuration } from '../utils/formatTime'

interface RestTimerProps {
  restSeconds: number
  accent: string
  onRestChange: (seconds: number) => void
}

type TimerState = 'idle' | 'running' | 'done'

export function RestTimer({ restSeconds, accent, onRestChange }: RestTimerProps) {
  const [state, setState] = useState<TimerState>('idle')
  const [remaining, setRemaining] = useState(restSeconds)
  const [showPresets, setShowPresets] = useState(false)
  const endAtRef = useRef<number | null>(null)
  const rafRef = useRef<number>(0)
  const beepedRef = useRef(false)

  useEffect(() => {
    if (state === 'idle') setRemaining(restSeconds)
  }, [restSeconds, state])

  const finishTimer = useCallback(() => {
    if (beepedRef.current) return
    beepedRef.current = true
    endAtRef.current = null
    setState('done')
    setRemaining(0)
    void playTripleBeep()
  }, [])

  const tick = useCallback(() => {
    if (endAtRef.current == null) return
    const left = Math.max(0, (endAtRef.current - Date.now()) / 1000)
    setRemaining(left)
    if (left <= 0) {
      finishTimer()
      return
    }
    rafRef.current = requestAnimationFrame(tick)
  }, [finishTimer])

  useEffect(() => {
    if (state !== 'running') return

    beepedRef.current = false
    rafRef.current = requestAnimationFrame(tick)

    const interval = window.setInterval(() => {
      if (endAtRef.current == null) return
      const left = Math.max(0, (endAtRef.current - Date.now()) / 1000)
      setRemaining(left)
      if (left <= 0) finishTimer()
    }, 250)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.clearInterval(interval)
    }
  }, [state, tick, finishTimer])

  const start = () => {
    unlockAudio()
    beepedRef.current = false
    endAtRef.current = Date.now() + restSeconds * 1000
    setRemaining(restSeconds)
    setState('running')
    setShowPresets(false)
  }

  const pause = () => {
    cancelAnimationFrame(rafRef.current)
    if (endAtRef.current != null) {
      setRemaining(Math.max(0, (endAtRef.current - Date.now()) / 1000))
    }
    endAtRef.current = null
    setState('idle')
  }

  const reset = () => {
    cancelAnimationFrame(rafRef.current)
    endAtRef.current = null
    beepedRef.current = false
    setState('idle')
    setRemaining(restSeconds)
  }

  const pickPreset = (sec: number) => {
    onRestChange(sec)
    setShowPresets(false)
    if (state === 'idle') setRemaining(sec)
  }

  const display = state === 'running' ? remaining : state === 'done' ? 0 : restSeconds
  const progress = restSeconds > 0 ? 1 - display / restSeconds : 0

  return (
    <div
      className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]/80 p-3 sm:p-3"
      style={{ boxShadow: state === 'running' ? `0 0 0 1px ${accent}33` : undefined }}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-muted)]">Rest timer</span>
        <button
          type="button"
          onClick={() => setShowPresets((v) => !v)}
          className="touch-target -mr-1 rounded-xl px-3 py-2 text-xs font-semibold text-[var(--color-gold)] active:opacity-70"
        >
          {formatDuration(restSeconds)} ▾
        </button>
      </div>

      {showPresets && (
        <div className="preset-scroll mb-3 -mx-0.5 px-0.5">
          {REST_PRESETS.map((sec) => (
            <button
              key={sec}
              type="button"
              onClick={() => pickPreset(sec)}
              className={`touch-target shrink-0 rounded-xl px-4 py-2.5 text-sm font-medium ${
                restSeconds === sec ? 'text-[#0c0c0e]' : 'border border-[var(--color-border)] text-[var(--color-muted)]'
              }`}
              style={restSeconds === sec ? { background: accent } : undefined}
            >
              {formatDuration(sec)}
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex items-center justify-center gap-4 sm:justify-start">
          <div className="relative flex h-16 w-16 shrink-0 items-center justify-center sm:h-14 sm:w-14">
            <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 56 56">
              <circle cx="28" cy="28" r="24" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
              <circle
                cx="28"
                cy="28"
                r="24"
                fill="none"
                stroke={accent}
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 24}
                strokeDashoffset={(2 * Math.PI * 24) * (1 - progress)}
              />
            </svg>
            <span className="font-mono text-lg font-semibold tabular-nums text-[#f5f3ef] sm:text-base">
              {state === 'done' ? '✓' : formatDuration(display)}
            </span>
          </div>
          {state === 'done' && (
            <p className="text-sm font-medium text-[var(--color-gold)]">Rest complete</p>
          )}
        </div>

        <div className="flex w-full flex-col gap-2 sm:min-w-0 sm:flex-1">
          {state === 'running' ? (
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={pause}
                className="touch-target rounded-xl border border-[var(--color-border)] py-3.5 text-sm font-medium text-[var(--color-text)]"
              >
                Pause
              </button>
              <button
                type="button"
                onClick={reset}
                className="touch-target rounded-xl border border-[var(--color-border)] py-3.5 text-sm text-[var(--color-muted)]"
              >
                Reset
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={start}
              className="touch-target w-full rounded-xl py-3.5 text-sm font-semibold text-[#0c0c0e] active:scale-[0.99]"
              style={{ background: accent }}
            >
              {state === 'done' ? 'Start again' : 'Start rest'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
