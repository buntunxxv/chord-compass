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

// PianoDisplay only ever renders C3-D5, and low-register tones below C3 sit
// in the ~65-110Hz band most phone speakers reproduce poorly -- so octave 3
// is the actual floor for a re-voiced bass note, not just a safety margin.
const MIN_BASS_OCTAVE = 3

function isRootBass(bassPitchClass, rootPitchClass) {
  return rootPitchClass != null && Note.chroma(bassPitchClass) === Note.chroma(rootPitchClass)
}

function shiftOctaveUp(note) {
  const n = Note.get(note)
  return `${n.pc}${n.oct + 1}`
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
  const naiveTargetOctave = lowest.oct - 1
  const targetOctave = Math.max(naiveTargetOctave, MIN_BASS_OCTAVE)
  const bassHeight = bassChroma + (targetOctave + 1) * 12

  const matchIndex = parsed.findIndex(n => n.chroma === bassChroma)

  // Many CHORD_DATA entries have their root (the current lowest note) at
  // octave 3, so "one octave below" naively lands at octave 2 -- below the
  // keyboard's floor and in a register phone speakers barely reproduce.
  // Simply clamping the bass note up to the floor isn't enough on its own:
  // it can leave the bass no longer the lowest note (e.g. F major/A -- a
  // bass clamped to A3 sits *above* the root's F3). So when the floor is
  // hit, lift just the chord tones that would now sit at or below the
  // clamped bass, by a single octave: that's always enough to clear it
  // (octave number alone decides ordering, regardless of pitch class), and
  // it never pushes anything past the keyboard's D5 ceiling -- a tone at
  // or below the floor-octave bass has height <= 59, so +12 lands <= 71.
  const needsLift = naiveTargetOctave < MIN_BASS_OCTAVE
  const adjust = (note, index) => {
    if (!needsLift || index === matchIndex) return note
    return Note.get(note).height <= bassHeight ? shiftOctaveUp(note) : note
  }

  if (matchIndex !== -1) {
    const bassNote = `${parsed[matchIndex].pc}${targetOctave}`
    const rest = baseNotes.map(adjust).filter((_, i) => i !== matchIndex)
    return [bassNote, ...rest]
  }

  const bassNote = `${bassPitchClass}${targetOctave}`
  return [bassNote, ...baseNotes.map(adjust)]
}

// Appends "/BassNote" to a chord symbol when the selected bass differs from
// the chord's own root; returns the symbol unchanged for root position.
export function appendSlashSymbol(symbol, bassPitchClass, rootPitchClass) {
  if (!symbol || !bassPitchClass || bassPitchClass === 'none') return symbol
  if (isRootBass(bassPitchClass, rootPitchClass)) return symbol
  return `${symbol}/${bassPitchClass}`
}
