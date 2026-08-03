import { Note } from 'tonal'

// The 12 bass-note choices offered by the selector. Sharp-spelled since this
// list isn't tied to any one chord's own spelling -- symbol display and note
// matching both go through Note.chroma, which is enharmonic-aware.
export const BASS_NOTE_PITCH_CLASSES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

// Diminished, augmented, and fully-diminished-7th chords are built from
// evenly-stacked minor or major 3rds, so every "inversion" just relabels a
// note that's already the root of another CHORD_DATA entry -- a bass-note
// selector would be redundant for these three chord types.
export function isSlashEligible(quality, extension) {
  if (quality === 'augmented' && extension === 'none') return false
  if (quality === 'diminished' && (extension === 'none' || extension === 'dim7')) return false
  return true
}

const MIN_BASS_OCTAVE = 2

function isRootBass(bassPitchClass, rootPitchClass) {
  return rootPitchClass != null && Note.chroma(bassPitchClass) === Note.chroma(rootPitchClass)
}

// Re-voice `baseNotes` (as defined in CHORD_DATA, root position) so the
// given bass pitch class sounds lowest:
//  - if the bass is already one of the chord's tones, that specific note is
//    moved an octave below the chord's current lowest note; every other
//    note is left exactly as CHORD_DATA defines it
//  - if the bass is foreign to the chord, it's added an octave below the
//    chord's current lowest note, on top of every existing tone
// Returns baseNotes unchanged when bassPitchClass is 'none'/absent or is
// enharmonically the chord's own root -- root position needs no re-voicing.
export function computeSlashNotes(baseNotes, bassPitchClass, rootPitchClass) {
  if (!baseNotes || baseNotes.length === 0) return baseNotes
  if (!bassPitchClass || bassPitchClass === 'none') return baseNotes
  if (isRootBass(bassPitchClass, rootPitchClass)) return baseNotes

  const bassChroma = Note.chroma(bassPitchClass)
  const parsed = baseNotes.map(n => Note.get(n))
  const lowest = parsed.reduce((min, n) => (n.height < min.height ? n : min), parsed[0])
  const targetOctave = Math.max(lowest.oct - 1, MIN_BASS_OCTAVE)

  const matchIndex = parsed.findIndex(n => n.chroma === bassChroma)

  if (matchIndex !== -1) {
    const bassNote = `${parsed[matchIndex].pc}${targetOctave}`
    return [bassNote, ...baseNotes.filter((_, i) => i !== matchIndex)]
  }

  const bassNote = `${bassPitchClass}${targetOctave}`
  return [bassNote, ...baseNotes]
}

// Appends "/BassNote" to a chord symbol when the selected bass differs from
// the chord's own root; returns the symbol unchanged for root position.
export function appendSlashSymbol(symbol, bassPitchClass, rootPitchClass) {
  if (!symbol || !bassPitchClass || bassPitchClass === 'none') return symbol
  if (isRootBass(bassPitchClass, rootPitchClass)) return symbol
  return `${symbol}/${bassPitchClass}`
}
