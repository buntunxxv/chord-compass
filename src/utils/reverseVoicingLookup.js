// Reverse voicing lookup (Phase 1): given a set of target pitch classes,
// search standard tuning for playable 6-string fret combinations whose
// sounding pitch classes are a superset of the target -- the inverse of
// every other guitar-shape file in this app, which start from a known
// chord and produce one shape. Ranking here is ease/playability only
// (fewer muted strings, smaller fret span, lower average fret); ranking
// against a progression's voice-leading is Phase 2, not this module.
import { Note, Interval } from 'tonal'

// Standard tuning, low string to high: E A D G B e -- same open-string
// pitch classes and (open + fret) % 12 formula GuitarDisplay.jsx already
// uses to place its dots, not a new music-theory approach.
const OPEN_PITCH_CLASS = [4, 9, 2, 7, 11, 4]
// Same strings, but as real note names + octave -- standard guitar tuning's
// actual sounding pitches, needed to add a found shape to the progression
// (which plays/displays real notes, not bare pitch classes).
const OPEN_STRING_NOTE = ['E2', 'A2', 'D3', 'G3', 'B3', 'E4']
const STRING_COUNT = 6
const MAX_FRET = 15

export const PITCH_CLASS_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

// Every fret in [0, MAX_FRET] on `stringIndex` that sounds `pitchClass`.
// The range spans more than an octave, so this is 1 or 2 frets per string.
function fretsForPitchClass(stringIndex, pitchClass) {
  const open = OPEN_PITCH_CLASS[stringIndex]
  const frets = []
  for (let fret = 0; fret <= MAX_FRET; fret++) {
    if ((open + fret) % 12 === pitchClass) frets.push(fret)
  }
  return frets
}

function scoreShape(frets) {
  const played = frets.filter(f => f !== 'x').map(Number)
  const muted = STRING_COUNT - played.length
  const nonOpen = played.filter(f => f > 0)
  const span = nonOpen.length ? Math.max(...nonOpen) - Math.min(...nonOpen) : 0
  const avgFret = played.length ? played.reduce((a, b) => a + b, 0) / played.length : 0
  return { muted, span, avgFret }
}

function compareShapes(a, b) {
  return a.muted - b.muted || a.span - b.span || a.avgFret - b.avgFret
}

// The pitch classes a fret array actually sounds (muted strings excluded).
export function soundingPitchClasses(frets) {
  const set = new Set()
  frets.forEach((f, i) => {
    if (f !== 'x') set.add((OPEN_PITCH_CLASS[i] + Number(f)) % 12)
  })
  return [...set].sort((a, b) => a - b)
}

// Ranked candidate shapes whose sounding pitch classes are a superset of
// `targetPitchClasses` (0-11 integers, duplicates/order ignored). Each
// string is either muted or plays one of the target classes -- doubling a
// target class is fine (and common: e.g. an open chord's repeated root),
// but a string is never used to sneak in some unrelated pitch class just
// because "extra" notes are technically allowed; that would make results
// like a plain triad search come back full of unrelated open strings.
// Returns [] if there are no target notes, or more distinct target classes
// than there are strings to sound them on (max 6).
export function findVoicings(targetPitchClasses, { maxResults = 3 } = {}) {
  const target = [...new Set(targetPitchClasses)].filter(pc => Number.isInteger(pc) && pc >= 0 && pc <= 11)
  if (target.length === 0 || target.length > STRING_COUNT) return []

  // Per string, every (pitch class, fret) pair achievable for a target class.
  const options = []
  for (let s = 0; s < STRING_COUNT; s++) {
    const opts = []
    for (const pc of target) {
      for (const fret of fretsForPitchClass(s, pc)) opts.push({ pc, fret })
    }
    options.push(opts)
  }

  const results = []
  const frets = new Array(STRING_COUNT).fill('x')
  const coveredCount = new Array(12).fill(0)
  let distinctCovered = 0

  function backtrack(stringIdx) {
    if (stringIdx === STRING_COUNT) {
      if (distinctCovered === target.length) results.push(frets.slice())
      return
    }
    // Feasibility prune: even if every remaining string (including this
    // one) covers a still-missing class, can we still reach full coverage?
    const remaining = STRING_COUNT - stringIdx
    if (target.length - distinctCovered > remaining) return

    frets[stringIdx] = 'x'
    backtrack(stringIdx + 1)

    for (const { pc, fret } of options[stringIdx]) {
      frets[stringIdx] = fret
      const wasNew = coveredCount[pc] === 0
      coveredCount[pc]++
      if (wasNew) distinctCovered++
      backtrack(stringIdx + 1)
      coveredCount[pc]--
      if (wasNew) distinctCovered--
    }
  }
  backtrack(0)

  return results
    .map(f => ({ frets: f, ...scoreShape(f) }))
    .sort(compareShapes)
    .slice(0, maxResults)
}

// The real note+octave a fret array sounds, low string to high, for adding
// a found shape to the progression -- muted strings simply don't contribute
// a note, same convention as everywhere else notes are collected.
export function soundingNotes(frets) {
  return frets
    .map((f, i) => (f === 'x' ? null : Note.transpose(OPEN_STRING_NOTE[i], Interval.fromSemitones(Number(f)))))
    .filter(Boolean)
}

// A plain, honest label for a found shape -- the pitch classes it actually
// sounds, bass to treble, deduped by first occurrence. Deliberately not a
// guessed chord name (tonal's Chord.detect is ambiguous/order-sensitive and
// a wrong guess would be worse than no guess) -- just what's really there.
export function voicingLabel(frets) {
  const seen = new Set()
  const names = []
  frets.forEach((f, i) => {
    if (f === 'x') return
    const pc = (OPEN_PITCH_CLASS[i] + Number(f)) % 12
    if (seen.has(pc)) return
    seen.add(pc)
    names.push(PITCH_CLASS_NAMES[pc])
  })
  return names.join(' · ')
}
