// Explicit .js extension (unlike this codebase's usual extensionless local
// imports): this module is also imported directly by the Node-run
// verification script, and plain Node's ESM resolver -- unlike Vite's --
// requires it.
import { applySelectedVoicing } from './pianoVoicings.js'

const PITCH_CLASSES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
const ENHARMONIC = { Cb: 'B', Db: 'C#', Eb: 'D#', Fb: 'E', Gb: 'F#', Ab: 'G#', Bb: 'A#' }
const ENHARMONIC_OCTAVE_SHIFT = { Cb: -1 }

function noteToMidi(note) {
  const m = note.match(/^([A-G][#b]?)(-?\d+)$/)
  if (!m) return null
  const [, rawPitch, octaveStr] = m
  const pitch = ENHARMONIC[rawPitch] ?? rawPitch
  const octave = parseInt(octaveStr, 10) + (ENHARMONIC_OCTAVE_SHIFT[rawPitch] ?? 0)
  return PITCH_CLASSES.indexOf(pitch) + (octave + 1) * 12
}

function shiftOctave(note, offset) {
  if (offset === 0) return note
  const m = note.match(/^([A-G][#b]?)(-?\d+)$/)
  if (!m) return note
  const [, pitch, octaveStr] = m
  return `${pitch}${parseInt(octaveStr, 10) + offset}`
}

// Re-voice a chord's upper notes (everything but the root) to sit in
// whichever octave is closest to the reference chord, without moving the
// root — this stays true root position (root is always the bass note),
// it just smooths the register jump between consecutive chords.
function voiceLeadChord(notes, referenceNotes) {
  if (!referenceNotes || referenceNotes.length === 0) return notes
  const referenceMidis = referenceNotes.map(noteToMidi)
  const [root, ...rest] = notes

  const voicedRest = rest.map(note => {
    const baseMidi = noteToMidi(note)
    let bestOffset = 0
    let bestDistance = Infinity
    for (let offset = -2; offset <= 2; offset++) {
      const candidateMidi = baseMidi + offset * 12
      const distance = Math.min(...referenceMidis.map(r => Math.abs(candidateMidi - r)))
      if (distance < bestDistance) {
        bestDistance = distance
        bestOffset = offset
      }
    }
    return shiftOctave(note, bestOffset)
  })

  return [root, ...voicedRest]
}

// Voice-lead a whole progression for playback: each chord's root stays
// exactly as stored, and each chord's upper notes are voiced against the
// previous (already-voiced) chord, chaining smoothly through the sequence.
export function voiceLeadProgression(progression) {
  const voiced = []
  progression.forEach((entry, i) => {
    const reference = i === 0 ? null : voiced[i - 1].notes
    voiced.push({ ...entry, notes: voiceLeadChord(entry.notes, reference) })
  })
  return voiced
}

// Full playback pipeline for a progression: voice-lead each chord's upper
// notes against the previous one, then layer the selected Keys voicing
// (Close/Drop-2/Split) on top of each already-voice-led chord. This is
// exactly what ProgressionStrip's Play button builds per chord -- pulled
// out here as a pure function so MIDI export can reuse the identical
// computation and always agree with playback on what "the currently active
// voicing" actually sounds like, rather than risking a second, subtly
// different implementation. rootNote is captured before the voicing
// transform runs, since Drop-2 can re-sort notes so index 0 is no longer
// the true root.
export function computePlaybackProgression(progression, activeKeysIndex) {
  return voiceLeadProgression(progression).map(entry => ({
    ...entry,
    rootNote: entry.notes[0],
    notes: applySelectedVoicing(entry.notes, activeKeysIndex, entry.chord.includes('/')),
  }))
}
