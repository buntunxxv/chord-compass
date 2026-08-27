import * as Tone from 'tone'

// Use the playback audio session on iOS so sound follows the device volume
// rather than the ringer/silent switch (requires iOS 16.4+; no-op elsewhere).
// Must be called from every place that starts audio, not just one -- iOS
// only applies this once a session type has been set at all.
export async function startAudioContext() {
  if (navigator.audioSession) {
    navigator.audioSession.type = 'playback'
  }
  await Tone.start()
}

// Single shared "keys" patch — an FM electric-piano style tone instead of a
// plain oscillator, so chords played by the app don't sound like an 8-bit blip.
//
// harmonicity 1.5 + a sine (rather than square) modulator keeps the tone
// bell-like without the harsh, metallic edge a higher ratio/square wave
// produces. A fast-decaying modulation envelope gives the classic
// Rhodes-style "tine" transient — bright pluck settling into a warm sustain.
// Chorus adds width/movement before the room reverb.
export function createKeysSynth() {
  const chorus = new Tone.Chorus({ frequency: 1.1, delayTime: 3.5, depth: 0.4, wet: 0.25 }).start()
  const filter = new Tone.Filter({ type: 'lowpass', frequency: 5200, rolloff: -12 })
  const reverb = new Tone.Freeverb({ roomSize: 0.6, dampening: 3000, wet: 0.18 }).toDestination()

  return new Tone.PolySynth(Tone.FMSynth, {
    harmonicity: 1.5,
    modulationIndex: 3.5,
    oscillator: { type: 'sine' },
    modulation: { type: 'sine' },
    envelope: { attack: 0.004, decay: 1.1, sustain: 0.18, release: 1.6 },
    modulationEnvelope: { attack: 0.002, decay: 0.35, sustain: 0.03, release: 1.0 },
    volume: -10,
  }).chain(filter, chorus, reverb)
}
