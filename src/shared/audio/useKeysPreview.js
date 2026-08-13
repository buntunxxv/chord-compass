import { useCallback, useEffect, useRef } from 'react'
import * as Tone from 'tone'
import { startAudioContext } from '../../audio/synth'

export function useKeysPreview() {
  const synthRef = useRef(null)

  const getSynth = useCallback(async () => {
    await startAudioContext()
    if (!synthRef.current) {
      synthRef.current = new Tone.PolySynth(Tone.FMSynth, {
        harmonicity: 2.5,
        modulationIndex: 5,
        oscillator: { type: 'sine' },
        envelope: { attack: 0.008, decay: 0.45, sustain: 0.16, release: 0.8 },
        modulationEnvelope: { attack: 0.008, decay: 0.2, sustain: 0.05, release: 0.5 },
        volume: -12,
      }).toDestination()
    }
    return synthRef.current
  }, [])

  const playSequence = useCallback(async (notes, spacing = 0.58) => {
    const synth = await getSynth()
    synth.releaseAll()
    const now = Tone.now() + 0.04
    notes.forEach((note, index) => synth.triggerAttackRelease(note, 0.42, now + index * spacing))
  }, [getSynth])

  const playChord = useCallback(async notes => {
    const synth = await getSynth()
    synth.releaseAll()
    synth.triggerAttackRelease(notes, 0.9, Tone.now() + 0.04)
  }, [getSynth])

  useEffect(() => () => {
    synthRef.current?.releaseAll()
    synthRef.current?.dispose()
  }, [])

  return { playSequence, playChord }
}
