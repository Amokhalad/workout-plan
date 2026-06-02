import { useCallback, useEffect, useRef, useState } from 'react'
import { REST_PRESETS } from '../data/defaultPlan'
import { playTripleBeep, unlockAudio } from '../utils/beep'
import { formatDuration } from '../utils/formatTime'

interface RestTimerProps {
  restSeconds: number
  accent: string
  onRestChange: (seconds: number) => void
  /** Bump this number to auto-start the countdown (e.g. when a set is completed). */
  startSignal?: number
  /** Fired when the countdown starts/stops, so the parent can highlight the active exercise. */
  onRunningChange?: (running: boolean) => void
}

type TimerState = 'idle' | 'running' | 'paused' | 'done'

export function RestTimer({ restSeconds, accent, onRestChange, startSignal, onRunningChange }: RestTimerProps) {
  const [state, setState] = useState<TimerState>('idle')
  const [remaining, setRemaining] = useState(restSeconds)
  const [showPresets, setShowPresets] = useState(false)
  const endAtRef = useRef<number | null>(null)
  const rafRef = useRef<number>(0)
  const beepedRef = useRef(false)
  const lastSignalRef = useRef(startSignal)
  const runningRef = useRef(false)

  useEffect(() => {
    if (state === 'idle') setRemaining(restSeconds)
  }, [restSeconds, state])

  // Notify the parent only on actual running transitions (so an inline callback won't spam it).
  useEffect(() => {
    const running = state === 'running'
    if (running !== runningRef.current) {
      runningRef.current = running
      onRunningChange?.(running)
    }
  }, [state, onRunningChange])

  const finishTimer = useCallback(() => {
    if (beepedRef.current) return
    beepedRef.current = true
    endAtRef.current = null
    setState('done')
    setRemaining(0)
    void playTripleBeep()
    navigator.vibrate?.([180, 90, 180])
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

  const startFrom = useCallback((seconds: number) => {
    unlockAudio()
    beepedRef.current = false
    endAtRef.current = Date.now() + seconds * 1000
    setRemaining(seconds)
    setState('running')
    setShowPresets(false)
  }, [])

  const start = useCallback(() => startFrom(restSeconds), [startFrom, restSeconds])

  useEffect(() => {
    if (startSignal === undefined || startSignal === lastSignalRef.current) return
    lastSignalRef.current = startSignal
    start()
  }, [startSignal, start])

  const pause = () => {
    cancelAnimationFrame(rafRef.current)
    if (endAtRef.current != null) {
      setRemaining(Math.max(0, (endAtRef.current - Date.now()) / 1000))
    }
    endAtRef.current = null
    setState('paused')
  }

  const resume = () => {
    if (remaining <= 0) return start()
    unlockAudio()
    endAtRef.current = Date.now() + remaining * 1000
    setState('running')
  }

  const reset = () => {
    cancelAnimationFrame(rafRef.current)
    endAtRef.current = null
    beepedRef.current = false
    setState('idle')
    setRemaining(restSeconds)
  }

  /** Add or remove time on the fly while resting. */
  const adjust = (delta: number) => {
    setRemaining((prev) => {
      const next = Math.max(0, prev + delta)
      if (state === 'running') endAtRef.current = Date.now() + next * 1000
      return next
    })
  }

  const ringTap = () => {
    if (state === 'running') pause()
    else if (state === 'paused') resume()
    else start()
  }

  const pickPreset = (sec: number) => {
    onRestChange(sec)
    setShowPresets(false)
    if (state === 'running' || state === 'paused') startFrom(sec)
    else setRemaining(sec)
  }

  const active = state === 'running' || state === 'paused'
  const display = active ? remaining : state === 'done' ? 0 : restSeconds
  const progress = restSeconds > 0 ? Math.min(1, Math.max(0, 1 - display / restSeconds)) : 0
  const ringLabel =
    state === 'running' ? 'Pause rest' : state === 'paused' ? 'Resume rest' : state === 'done' ? 'Restart rest' : 'Start rest'

  return (
    <div
      className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]/80 p-3"
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

      <div className="flex items-center gap-3 sm:gap-4">
        <button
          type="button"
          onClick={ringTap}
          aria-label={ringLabel}
          className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-full transition active:scale-95"
        >
          <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 56 56">
            <circle cx="28" cy="28" r="24" fill="none" stroke="rgba(127,127,127,0.18)" strokeWidth="4" />
            <circle
              cx="28"
              cy="28"
              r="24"
              fill="none"
              stroke={accent}
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 24}
              strokeDashoffset={2 * Math.PI * 24 * (1 - progress)}
              style={{ opacity: state === 'paused' ? 0.5 : 1, transition: 'stroke-dashoffset 0.25s linear' }}
            />
          </svg>
          <span
            className="font-mono text-lg font-semibold tabular-nums text-[var(--color-heading)]"
            style={{ opacity: state === 'paused' ? 0.6 : 1 }}
          >
            {state === 'done' ? '✓' : formatDuration(display)}
          </span>
        </button>

        <div className="flex w-full min-w-0 flex-1 flex-col gap-2">
          {state === 'idle' && (
            <button
              type="button"
              onClick={start}
              className="touch-target w-full rounded-xl py-3.5 text-sm font-semibold text-[#0c0c0e] active:scale-[0.99]"
              style={{ background: accent }}
            >
              Start rest
            </button>
          )}

          {state === 'done' && (
            <button
              type="button"
              onClick={start}
              className="touch-target w-full rounded-xl border border-[var(--color-border)] py-3.5 text-sm font-semibold text-[var(--color-gold)] active:scale-[0.99]"
            >
              Rest complete · start again
            </button>
          )}

          {active && (
            <>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => adjust(-15)}
                  className="touch-target rounded-xl border border-[var(--color-border)] py-3 text-sm font-medium text-[var(--color-text)] active:scale-95"
                >
                  −15s
                </button>
                {state === 'running' ? (
                  <button
                    type="button"
                    onClick={pause}
                    className="touch-target rounded-xl border border-[var(--color-border)] py-3 text-sm font-medium text-[var(--color-text)] active:scale-95"
                  >
                    Pause
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={resume}
                    className="touch-target rounded-xl py-3 text-sm font-semibold text-[#0c0c0e] active:scale-95"
                    style={{ background: accent }}
                  >
                    Resume
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => adjust(15)}
                  className="touch-target rounded-xl border border-[var(--color-border)] py-3 text-sm font-medium text-[var(--color-text)] active:scale-95"
                >
                  +15s
                </button>
              </div>
              <button
                type="button"
                onClick={reset}
                className="touch-target rounded-xl py-2 text-xs font-medium text-[var(--color-muted)] active:opacity-70"
              >
                Reset
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
