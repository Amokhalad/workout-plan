let audioCtx: AudioContext | null = null

function getAudioContext(): AudioContext {
  if (!audioCtx) audioCtx = new AudioContext()
  return audioCtx
}

/** Unlock audio on iOS — call from a user gesture before the first timer. */
export function unlockAudio(): void {
  const ctx = getAudioContext()
  if (ctx.state === 'suspended') void ctx.resume()
}

/** Three short beeps when rest ends — not a continuous alarm. */
export async function playTripleBeep(): Promise<void> {
  const ctx = getAudioContext()
  if (ctx.state === 'suspended') await ctx.resume()

  const now = ctx.currentTime
  const gap = 0.38
  const duration = 0.14

  for (let i = 0; i < 3; i++) {
    const t = now + i * gap
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.value = i === 2 ? 988 : 880
    gain.gain.setValueAtTime(0.0001, t)
    gain.gain.exponentialRampToValueAtTime(0.35, t + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, t + duration)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(t)
    osc.stop(t + duration + 0.02)
  }
}
