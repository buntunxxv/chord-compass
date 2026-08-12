// Learn mode's chord/pattern data (Phase 2). Kept separate from chordData.js
// (Build mode's much larger seed set) since Learn deliberately works with a
// small, fixed pool -- see Decision Log 2026-08-12.
import { Chord, Scale } from 'tonal'
import { CHORD_DATA } from './chordData'
import { toDataKey } from './utils/chordSelectionLookup'
import { buildChordSymbol } from './components/ChordSelector'

export const LEARN_ROOTS = ['A', 'B', 'C', 'D', 'E', 'F', 'G']

// The three qualities the curated subset covers, expressed the same way
// ChordSelector's own selector state does (quality + extension) so
// buildChordSymbol/toDataKey -- Build mode's existing chord-construction and
// CHORD_DATA-lookup logic -- can be reused as-is instead of hand-rolling a
// second way to turn a root into a chord symbol/voicing.
const SUBSET_TYPES = [
  { quality: 'major', extension: 'none' },
  { quality: 'minor', extension: 'none' },
  { quality: 'major', extension: '7' }, // dominant 7th
]

function buildLearnChord(root, quality, extension) {
  const symbol = buildChordSymbol(root, quality, extension)
  const dataKey = toDataKey(root, quality, extension)
  const entry = CHORD_DATA[dataKey]
  const tonalChord = symbol ? Chord.get(symbol) : null
  return {
    root,
    quality,
    extension,
    symbol: (tonalChord && tonalChord.symbol) || symbol,
    notes: entry ? entry.notes : [],
  }
}

// The curated 21-chord subset: 7 natural roots x {major, minor, dominant7}.
// No accidentals, no other qualities/extensions -- verified against Tonal's
// own Chord.get() output for every one of the 21 symbols (pitch classes
// match exactly; see scripts/ for the one-off check run during
// development), not assumed.
export const LEARN_CHORD_SUBSET = LEARN_ROOTS.flatMap(root =>
  SUBSET_TYPES.map(({ quality, extension }) => buildLearnChord(root, quality, extension))
)

// Key-agnostic Roman-numeral progression patterns. Seed set only -- flagged
// to the founder as editable, not final (Decision Log 2026-08-12).
export const LEARN_CHALLENGES = [
  { id: 'I-IV-V-I', romanNumerals: ['I', 'IV', 'V', 'I'], label: 'I – IV – V – I' },
  { id: 'I-V-vi-IV', romanNumerals: ['I', 'V', 'vi', 'IV'], label: 'I – V – vi – IV' },
  { id: 'ii-V-I', romanNumerals: ['ii', 'V', 'I'], label: 'ii – V – I' },
  { id: 'I-vi-IV-V', romanNumerals: ['I', 'vi', 'IV', 'V'], label: 'I – vi – IV – V' },
  { id: 'vi-IV-I-V', romanNumerals: ['vi', 'IV', 'I', 'V'], label: 'vi – IV – I – V' },
  { id: 'I-IV-I-V', romanNumerals: ['I', 'IV', 'I', 'V'], label: 'I – IV – I – V' },
]

// Standard major-key diatonic scale degree -> triad quality, used to resolve
// a Roman numeral into a real chord once a starting key is picked. Degree
// index is 0-based into Tonal's own Scale.get(`${key} major`).notes.
const ROMAN_NUMERAL_DEGREES = {
  'I': { degree: 0, quality: 'major' },
  'ii': { degree: 1, quality: 'minor' },
  'iii': { degree: 2, quality: 'minor' },
  'IV': { degree: 3, quality: 'major' },
  'V': { degree: 4, quality: 'major' },
  'vi': { degree: 5, quality: 'minor' },
  'vii°': { degree: 6, quality: 'diminished' },
}

// Resolves a Roman numeral into a real chord for the given natural-root
// major key, using Tonal's own major-scale spelling for the degree root
// (so e.g. vi in A major correctly resolves to F#m, not some natural-only
// approximation) and Build mode's existing buildChordSymbol/CHORD_DATA
// lookup for the actual symbol + playable (octave-bearing) notes.
//
// NOTE (flagged to founder, Decision Log 2026-08-12): the key picker is
// restricted to the 7 natural roots and the 21-chord subset has no
// accidentals, but several seed challenges resolve to an accidental-root
// chord in 4 of those 7 keys (e.g. "vi" in A major = F#m). That chord is
// real and correctly resolved here (`inSubset: false`), but it can never be
// the learner's own pick, since it isn't offered in the picker. Only C, D,
// and G major keep every seed challenge's degrees inside the 21-chord
// subset. This is a scope conflict between "key picker = 7 naturals" and
// "chords = no accidentals" that wasn't resolved by the brief -- left as-is
// rather than silently narrowing either one.
export function resolveChallengeChord(numeral, keyRoot) {
  const info = ROMAN_NUMERAL_DEGREES[numeral]
  if (!info) return null
  const scale = Scale.get(`${keyRoot} major`).notes
  const degreeRoot = scale[info.degree]
  if (!degreeRoot) return null
  const symbol = buildChordSymbol(degreeRoot, info.quality, 'none')
  const dataKey = toDataKey(degreeRoot, info.quality, 'none')
  const entry = dataKey ? CHORD_DATA[dataKey] : null
  const tonalChord = symbol ? Chord.get(symbol) : null
  return {
    root: degreeRoot,
    quality: info.quality,
    symbol: (tonalChord && tonalChord.symbol) || symbol,
    notes: entry ? entry.notes : [],
    inSubset: LEARN_ROOTS.includes(degreeRoot) && info.quality !== 'diminished',
  }
}
