import { settings } from '../stores/settings-store.svelte'

export type Sfx = 'pickup' | 'drop' | 'snap' | 'rotate' | 'hint' | 'win' | 'click'

interface Tone {
  wave: OscillatorType
  volume: number
  /** [frequency Hz, start s, duration s] */
  notes: [number, number, number][]
}

// Synthesized, so there are no audio files to license, download or decode.
const SOUNDS: Record<Sfx, Tone> = {
  pickup: { wave: 'sine', volume: 0.12, notes: [[660, 0, 0.06]] },
  drop: { wave: 'sine', volume: 0.1, notes: [[330, 0, 0.08]] },
  snap: { wave: 'triangle', volume: 0.18, notes: [[523, 0, 0.07], [784, 0.06, 0.12]] },
  rotate: { wave: 'triangle', volume: 0.08, notes: [[440, 0, 0.05]] },
  hint: { wave: 'sine', volume: 0.12, notes: [[988, 0, 0.08], [1319, 0.08, 0.12]] },
  win: { wave: 'triangle', volume: 0.18, notes: [[523, 0, 0.12], [659, 0.1, 0.12], [784, 0.2, 0.12], [1047, 0.3, 0.35]] },
  click: { wave: 'sine', volume: 0.06, notes: [[880, 0, 0.03]] },
}

let context: AudioContext | null = null

/** Created lazily. Also resumes after iOS 'interrupted' (calls, backgrounding), not just 'suspended'. */
function audio(): AudioContext | null {
  if (!context && typeof AudioContext !== 'undefined') context = new AudioContext()
  if (context && context.state !== 'running') context.resume().catch(() => {})
  return context
}

// WebKit only grants audio on pointerup/click/keydown, not pointerdown (where pickup sounds play),
// so unlock on those gestures up front.
if (typeof window !== 'undefined') {
  for (const type of ['pointerup', 'click', 'keydown'] as const) {
    window.addEventListener(type, () => settings.current.sound && audio(), { capture: true, passive: true })
  }
}

export function playSfx(name: Sfx): void {
  if (!settings.current.sound) return
  try {
    const ac = audio()
    if (!ac) return
    const { wave, volume, notes } = SOUNDS[name]
    const t0 = ac.currentTime
    for (const [frequency, start, duration] of notes) {
      const osc = ac.createOscillator()
      const gain = ac.createGain()
      osc.type = wave
      osc.frequency.value = frequency
      gain.gain.setValueAtTime(volume, t0 + start)
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + start + duration)
      osc.connect(gain).connect(ac.destination)
      osc.start(t0 + start)
      osc.stop(t0 + start + duration)
    }
  } catch {
    // Sound is decoration; never let it break the game.
  }
}
