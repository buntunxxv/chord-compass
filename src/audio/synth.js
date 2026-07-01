import * as Tone from 'tone'

// Single shared "keys" patch — an FM electric-piano style tone instead of a
// plain oscillator, so chords played by the app don't sound like an 8-bit blip.
export function createKeysSynth() {
  const reverb = new Tone.Freeverb({ roomSize: 0.6, dampening: 3000, wet: 0.18 }).toDestination()

  return new Tone.PolySynth(Tone.FMSynth, {
    harmonicity: 3,
    modulationIndex: 8,
    oscillator: { type: 'sine' },
    modulation: { type: 'square' },
    envelope: { attack: 0.006, decay: 1.0, sustain: 0.2, release: 1.4 },
    modulationEnvelope: { attack: 0.006, decay: 0.3, sustain: 0.05, release: 1.0 },
    volume: -12,
  }).connect(reverb)
}
