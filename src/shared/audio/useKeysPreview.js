import { useCallback, useEffect, useRef } from 'react'
import * as Tone from 'tone'
import { createKeysSynth, startAudioContext } from '../../audio/synth'

export function useKeysPreview() {
  const synthRef = useRef(null)

  const getSynth = useCallback(async () => {
    await startAudioContext()
    if (!synthRef.current) {
      synthRef.current = createKeysSynth()
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
