// Learn mode's chord/pattern data (Phase 2). Kept separate from chordData.js
// (Build mode's much larger seed set) since Learn deliberately works with a
// small, fixed pool -- see Decision Log 2026-08-12.
import { Chord, Scale } from 'tonal'
import { CHORD_DATA } from './chordData'
import { toDataKey } from './utils/chordSelectionLookup'
import { buildChordSymbol } from './components/ChordSelector'

// The 7 natural roots -- used for the KEY PICKER only (learners always
// start a challenge on a natural-root major key). Kept separate from the
// chord picker's own root list below, which is wider.
export const LEARN_ROOTS = ['A', 'B', 'C', 'D', 'E', 'F', 'G']

// Roots required so every seed challenge's correct answer, in every one of
// the 7 natural keys, is actually selectable in the predict picker.
// Decision Log 2026-08-12: originally the chord picker only covered the 7
// natural roots ("no accidentals"), which meant a handful of seed-challenge
// steps (e.g. "vi" in the key of A major = F#m) resolved to a chord the
// learner could never pick -- flagged to the founder, now resolved by
// adding these specific roots rather than narrowing the key picker or
// which challenges can be attempted in which key.
//
// Each of F#, C#, G#, Bb is the diatonic resolution of at least one seed
// challenge's degree (ii/IV/V/vi) in at least one of the 7 natural keys --
// verified against Tonal's own Scale.get() output, not assumed (every other
// natural-key/degree combination those 6 challenges use already lands on a
// natural root). Given full major/minor/dominant7 coverage, same as the
// natural roots, for a uniform picker -- even though not every quality is
// exercised by a seed challenge today (challenges are explicitly editable,
// not final).
const ACCIDENTAL_CHORD_ROOTS = ['F#', 'C#', 'G#', 'Bb']

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

// The curated chord subset the predict picker offers: the 7 natural roots
// plus the 4 accidental roots above, x {major, minor, dominant7} -- 33
// chords total. Verified against Tonal's own Chord.get() output for every
// symbol (pitch classes match exactly; see scripts/ for the one-off check
// run during development), not assumed.
export const LEARN_CHORD_SUBSET = [...LEARN_ROOTS, ...ACCIDENTAL_CHORD_ROOTS].flatMap(root =>
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
// inSubset is checked against LEARN_CHORD_SUBSET's own symbols (rather than
// re-deriving the root/quality rules) so it can never drift out of sync
// with what the picker actually offers -- e.g. it correctly stays false for
// vii° (diminished isn't a picker quality) even now that every seed
// challenge's degree resolves to a pickable chord in every one of the 7
// keys (see ACCIDENTAL_CHORD_ROOTS above).
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
  const resolvedSymbol = (tonalChord && tonalChord.symbol) || symbol
  return {
    root: degreeRoot,
    quality: info.quality,
    symbol: resolvedSymbol,
    notes: entry ? entry.notes : [],
    inSubset: LEARN_CHORD_SUBSET.some(c => c.symbol === resolvedSymbol),
  }
}
