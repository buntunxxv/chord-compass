import { Note } from 'tonal'

// PianoDisplay only ever renders C3-D5, and the same low-register reasoning
// from slashChord.js's MIN_BASS_OCTAVE applies here -- octave 3 is the real
// floor for a re-voiced bass note, not just a safety margin.
const MIN_BASS_OCTAVE = 3

function shiftOctaveUp(note) {
  const n = Note.get(note)
  return `${n.pc}${n.oct + 1}`
}

function shiftOctaveDown(note) {
  const n = Note.get(note)
  return `${n.pc}${n.oct - 1}`
}

function byHeight(a, b) {
  return Note.get(a).height - Note.get(b).height
}

// Drop-2: sort ascending, take the note 2nd-from-the-top, drop it an octave,
// re-sort. A pure function over whatever notes are currently active (already
// slash/inversion-aware), so it works identically on a triad, a 7th chord,
// or the 5-6 note extended/altered chords -- no per-chord data needed.
export function applyDrop2(notes) {
  if (!notes || notes.length < 3) return notes
  const sorted = [...notes].sort(byHeight)
  const idx = sorted.length - 2
  sorted[idx] = shiftOctaveDown(sorted[idx])
  return sorted.sort(byHeight)
}

// Lift `note` by whole octaves until it's at least a full octave (>=12
// semitones) above `bassHeight` -- almost always one lift, but the loop
// stays correct even in a pathological case that needs more than one.
function liftClearOfBass(note, bassHeight) {
  let current = note
  while (Note.get(current).height - bassHeight < 12) {
    current = shiftOctaveUp(current)
  }
  return current
}

// Left-hand/right-hand split: the current bass (index 0, by this app's own
// convention -- the root, or the selected slash/inversion bass) goes at
// least a full octave below the rest of the chord. Reuses the exact
// collision-avoidance shape from computeSlashNotes in slashChord.js: the
// bass is clamped to the C3 floor rather than ever pushed below it, and any
// upper note that would then land closer than an octave above it gets
// lifted instead -- never the other way around.
export function applyLeftHandSplit(notes) {
  if (!notes || notes.length < 2) return notes
  const [bassNote, ...upper] = notes
  const bass = Note.get(bassNote)
  const lowestUpperOct = Math.min(...upper.map(n => Note.get(n).oct))

  const naiveTargetOctave = lowestUpperOct - 1
  const targetOctave = Math.max(naiveTargetOctave, MIN_BASS_OCTAVE)
  const bassHeight = bass.chroma + (targetOctave + 1) * 12

  const newUpper = upper.map(note => liftClearOfBass(note, bassHeight))
  return [`${bass.pc}${targetOctave}`, ...newUpper]
}
