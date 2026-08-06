import { toUnicodeAccidentals } from './formatNotes.js'

// Tonal's Chord.detect/Chord.get hand back bare-major triads and their
// combos with a leading "M" quality tag ("CM", "CMadd9") that this app's
// own chord builder (buildChordSymbol in ChordSelector.jsx) never emits --
// it always leaves plain major with no suffix at all ("C", "Cadd9"). Since
// buildChordSymbol never produces a suffix starting with uppercase "M"
// (maj7/maj9/maj13 spell it out lowercase), stripping a leading M is safe
// and brings Tonal's naming in line with this app's own convention without
// touching any suffix the builder itself already produces correctly.
function stripMajorTag(part) {
  const m = part.match(/^([A-G][#b]*)(.*)$/)
  if (!m) return part
  const [, root, suffix] = m
  return suffix.startsWith('M') ? root + suffix.slice(1) : part
}

// Single formatting boundary for any chord name reaching the user that
// didn't come from this app's own builder -- Chord.detect results in
// ReverseVoicingFinder and MIDI import, plus their plain-note-list
// fallback when detection finds nothing. Normalizes Tonal's naming to this
// app's own convention (see stripMajorTag) and converts ASCII accidentals
// to Unicode, the same conversion formatNoteNames already uses for note
// lists -- so a slash chord like "CMadd9/E" becomes "Cadd9/E" and an
// altered dominant like "C7#9" becomes "C7♯9".
export function formatChordName(name) {
  if (!name) return name
  const normalized = name.split('/').map(stripMajorTag).join('/')
  return toUnicodeAccidentals(normalized)
}
