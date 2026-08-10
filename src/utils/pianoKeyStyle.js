// Shared note-matching + key-color-resolution logic for anything that
// renders piano keys highlighted by chord/preview/root/split-bass state --
// currently PianoDisplay (the full interactive keyboard) and MiniKeyboard
// (the compact, non-interactive strip in the collapsed bottom sheet). Kept
// here so both read the exact same rules for "what color is this key,"
// rather than one drifting out of sync with the other over time.

// Resolve enharmonic equivalents to sharp form, keeping the octave correct
// (Cb sits in the octave below the C it borrows its number from)
const ENHARMONIC = { Cb: 'B', Db: 'C#', Eb: 'D#', Fb: 'E', Gb: 'F#', Ab: 'G#', Bb: 'A#' }
const ENHARMONIC_OCTAVE_SHIFT = { Cb: -1 }

export function normalizeNote(note) {
  const m = note.replace('♯', '#').replace('♭', 'b').match(/^([A-G][#b]?)(\d)$/)
  if (!m) return note
  const [, pitch, octaveStr] = m
  const mappedPitch = ENHARMONIC[pitch] ?? pitch
  const octave = parseInt(octaveStr, 10) + (ENHARMONIC_OCTAVE_SHIFT[pitch] ?? 0)
  return `${mappedPitch}${octave}`
}

export function noteMatches(keyNote, chordNotes) {
  const normalizedKey = normalizeNote(keyNote)
  return chordNotes.some(n => normalizeNote(n) === normalizedKey)
}

export function isRoot(keyNote, rootNote) {
  return !!rootNote && normalizeNote(keyNote) === normalizeNote(rootNote)
}

// Find how a note is actually spelled (flat or sharp) within a chord's note
// list, e.g. for keyNote "D#4" this returns "E♭" if the chord spells it that
// way, so the piano matches how the chord is actually written, not a fixed
// sharp-only convention
export function findSpelling(keyNote, chordNotes) {
  const normalizedKey = normalizeNote(keyNote)
  const match = chordNotes.find(n => normalizeNote(n) === normalizedKey)
  if (!match) return null
  return match.replace(/\d+$/, '').replace('#', '♯').replace('b', '♭')
}

// Work out fill + whether the key gets a "shared" ring for a single key.
// The four highlight colors (root gold, chord-tone teal, suggested purple,
// split-bass rose) all come from noteColors -- see src/utils/noteColors.js
// and index.css's --note-color-* custom properties, the single source of
// truth every display reading this reads from.
export function resolveKeyStyle(note, notes, root, previewNotes, defaultFill, bassHighlightNote, noteColors) {
  const inCurrent = noteMatches(note, notes)
  const inPreview = previewNotes && previewNotes.length > 0 && noteMatches(note, previewNotes)
  const isCurrentRoot = isRoot(note, root)
  const isBassSplit = !!bassHighlightNote && isRoot(note, bassHighlightNote)

  if (inCurrent) {
    return {
      fill: isBassSplit ? noteColors.splitBass : isCurrentRoot ? noteColors.root : noteColors.chordTone,
      active: true,
      shared: inPreview,
      textFill: isBassSplit ? '#ffffff' : isCurrentRoot ? '#7a5500' : '#ffffff',
      spelling: findSpelling(note, notes),
    }
  }
  if (inPreview) {
    return { fill: noteColors.suggested, active: true, shared: false, textFill: '#ffffff', spelling: findSpelling(note, previewNotes) }
  }
  return { fill: defaultFill, active: false, shared: false, textFill: '#aaaaaa', spelling: null }
}
