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

// Tonal-naming -> this app's own convention (see stripMajorTag), staying in
// plain ASCII. This is the form that has to be stored as a progression
// entry's "chord" field: chordNameToSelection (App.jsx) parses that field
// back into root/quality/extension whenever the entry is re-selected, and
// its regex only recognizes ASCII "#"/"b" -- a Unicode accidental would
// silently fail to parse, leaving the tapped chip highlighted but the
// builder/instrument stuck on whatever chord was showing before.
export function normalizeChordName(name) {
  if (!name) return name
  return name.split('/').map(stripMajorTag).join('/')
}

// Display boundary for any chord name reaching the user that didn't come
// from this app's own builder -- Chord.detect results in ReverseVoicingFinder
// and MIDI import, plus their plain-note-list fallback when detection finds
// nothing. Adds the Unicode accidental conversion formatNoteNames already
// uses for note lists on top of normalizeChordName -- so a slash chord like
// "CMadd9/E" becomes "Cadd9/E" and an altered dominant like "C7#9" becomes
// "C7♯9". Display-only: never pass this to onAddToProgression/
// onImportSequence, use normalizeChordName for that.
export function formatChordName(name) {
  return toUnicodeAccidentals(normalizeChordName(name))
}
