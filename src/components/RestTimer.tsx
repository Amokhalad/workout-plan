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

  useEffect(() => {
    if (state === 'idle') setRemaining(restSeconds)
  }, [restSeconds, state])

  const tick = useCallback(() => {
    if (endAtRef.current == null) return
    const left = Math.max(0, (endAtRef.current - Date.now()) / 1000)
    setRemaining(left)
    if (left <= 0) {
      endAtRef.current = null
      setState('done')
      void playTripleBeep()
      return
    }
    rafRef.current = requestAnimationFrame(tick)
  }, [])

  useEffect(() => {
    if (state === 'running') {
      rafRef.current = requestAnimationFrame(tick)
      return () => cancelAnimationFrame(rafRef.current)
    }
  }, [state, tick])

  const start = () => {
    unlockAudio()
    endAtRef.current = Date.now() + restSeconds * 1000
    setRemaining(restSeconds)
    setState('running')
    setShowPresets(false)
  }

  const pause = () => {
    cancelAnimationFrame(rafRef.current)
    endAtRef.current = null
    setState('idle')
  }

  const reset = () => {
    cancelAnimationFrame(rafRef.current)
    endAtRef.current = null
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
      className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]/80 p-3"
      style={{ boxShadow: state === 'running' ? `0 0 0 1px ${accent}33` : undefined }}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-muted)]">Rest timer</span>
        <button
          type="button"
          onClick={() => setShowPresets((v) => !v)}
          className="touch-target rounded-lg px-2 py-1 text-xs font-medium text-[var(--color-gold)] transition active:opacity-70"
        >
          {formatDuration(restSeconds)} rest ▾
        </button>
      </div>

      {showPresets && (
        <div className="mb-3 flex flex-wrap gap-1.5">
          {REST_PRESETS.map((sec) => (
            <button
              key={sec}
              type="button"
              onClick={() => pickPreset(sec)}
              className={`touch-target rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                restSeconds === sec
                  ? 'text-[#0c0c0e]'
                  : 'border border-[var(--color-border)] text-[var(--color-muted)]'
              }`}
              style={restSeconds === sec ? { background: accent } : undefined}
            >
              {formatDuration(sec)}
            </button>
          ))}
        </div>
      )}

      <div className="flex items-center gap-3">
        <div className="relative flex h-14 w-14 shrink-0 items-center justify-center">
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
              className="transition-[stroke-dashoffset] duration-150"
            />
          </svg>
          <span className="font-mono text-sm font-semibold tabular-nums text-[#f5f3ef]">
            {state === 'done' ? '✓' : formatDuration(display)}
          </span>
        </div>

        <div className="flex min-w-0 flex-1 flex-wrap gap-2">
          {state === 'running' ? (
            <>
              <button
                type="button"
                onClick={pause}
                className="touch-target flex-1 rounded-xl border border-[var(--color-border)] px-4 py-2.5 text-sm font-medium text-[var(--color-text)]"
              >
                Pause
              </button>
              <button
                type="button"
                onClick={reset}
                className="touch-target rounded-xl border border-[var(--color-border)] px-4 py-2.5 text-sm text-[var(--color-muted)]"
              >
                Reset
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={start}
                className="touch-target flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold text-[#0c0c0e] transition active:scale-[0.98]"
                style={{ background: accent }}
              >
                {state === 'done' ? 'Start again' : 'Start rest'}
              </button>
              {state === 'done' && (
                <button
                  type="button"
                  onClick={reset}
                  className="touch-target rounded-xl border border-[var(--color-border)] px-4 py-2.5 text-sm text-[var(--color-muted)]"
                >
                  Reset
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
