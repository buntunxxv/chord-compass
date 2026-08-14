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
//
// Each step carries its own explicit quality (`dominant7: false` for a
// plain diatonic triad, `true` for a dominant 7th) instead of being a bare
// numeral string -- a bare "V" was ambiguous about which chord family the
// predict picker should actually offer, which let a learner pick a
// dominant 7th (e.g. E7) on a step that only ever meant the plain triad
// (E), reading as a false "miss" for a musically-valid-but-wrong-family
// answer. See resolveChallengeChord below for how the flag changes what
// gets resolved, and LearnPath.jsx for how it filters the picker.
export const LEARN_CHALLENGES = [
  { id: 'I-IV-V-I', label: 'I – IV – V – I', why: `The foundational cadence of Western harmony — IV opens the sound away from home, V creates strong pull, and returning to I resolves it completely. You'll hear this shape everywhere from folk to rock.`, romanNumerals: [
    { numeral: 'I', dominant7: false },
    { numeral: 'IV', dominant7: false },
    { numeral: 'V', dominant7: false },
    { numeral: 'I', dominant7: false },
  ] },
  { id: 'I-V-vi-IV', label: 'I – V – vi – IV', why: `Pop's most-used four chords. V creates motion, but instead of resolving to I it deceptively lands on vi — the relative minor — before IV opens things out again. That deceptive move gives it an anthemic, uplifting feel rather than a simple resolution.`, romanNumerals: [
    { numeral: 'I', dominant7: false },
    { numeral: 'V', dominant7: false },
    { numeral: 'vi', dominant7: false },
    { numeral: 'IV', dominant7: false },
  ] },
  { id: 'ii-V-I', label: 'ii – V – I', why: `The backbone of jazz harmony. ii quietly sets up V, V creates strong dominant tension, and I resolves it — each chord mainly existing to prepare the next.`, romanNumerals: [
    { numeral: 'ii', dominant7: false },
    { numeral: 'V', dominant7: false },
    { numeral: 'I', dominant7: false },
  ] },
  { id: 'ii-V7-I', label: 'ii – V7 – I', why: `Same shape as ii-V-I, but V7's added seventh sharpens the pull toward I. This is the exact cadence most real jazz standards use, not just the theory-class version.`, romanNumerals: [
    { numeral: 'ii', dominant7: false },
    { numeral: 'V', dominant7: true },
    { numeral: 'I', dominant7: false },
  ] },
  { id: 'I-vi-IV-V', label: 'I – vi – IV – V', why: `The doo-wop/50s progression — I and vi share two notes, so the first move feels gentle, almost like a variation on home, before IV opens out and V pushes back to the top.`, romanNumerals: [
    { numeral: 'I', dominant7: false },
    { numeral: 'vi', dominant7: false },
    { numeral: 'IV', dominant7: false },
    { numeral: 'V', dominant7: false },
  ] },
  { id: 'vi-IV-I-V', label: 'vi – IV – I – V', why: `The same four chords as the pop progression above, but starting on vi instead of I — because it opens in the minor-feeling chord, the whole loop reads as more wistful, even though the chords haven't changed.`, romanNumerals: [
    { numeral: 'vi', dominant7: false },
    { numeral: 'IV', dominant7: false },
    { numeral: 'I', dominant7: false },
    { numeral: 'V', dominant7: false },
  ] },
  { id: 'I-IV-I-V', label: 'I – IV – I – V', why: `A simpler cousin of I-IV-V-I — IV lifts away from home, returns briefly, then V creates tension before the phrase repeats rather than fully resolving. Common in verses that want momentum without full closure.`, romanNumerals: [
    { numeral: 'I', dominant7: false },
    { numeral: 'IV', dominant7: false },
    { numeral: 'I', dominant7: false },
    { numeral: 'V', dominant7: false },
  ] },
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

// Resolves one challenge step -- { numeral, dominant7 } -- into a real
// chord for the given natural-root major key, using Tonal's own
// major-scale spelling for the degree root (so e.g. vi in A major
// correctly resolves to F#m, not some natural-only approximation) and
// Build mode's existing buildChordSymbol/CHORD_DATA lookup for the actual
// symbol + playable (octave-bearing) notes.
//
// dominant7 overrides the degree's own diatonic quality (major/minor) with
// a dominant 7th on the same scale-degree root -- e.g. V in the "ii-V7-I"
// challenge resolves to a 7th chord, not the plain major triad "V" alone
// would give. Only meaningful for the challenges that actually set it
// (today, just that one step); everywhere else this is a no-op.
//
// inSubset is checked against LEARN_CHORD_SUBSET's own symbols (rather than
// re-deriving the root/quality rules) so it can never drift out of sync
// with what the picker actually offers -- e.g. it correctly stays false for
// vii° (diminished isn't a picker quality) even now that every seed
// challenge's degree resolves to a pickable chord in every one of the 7
// keys (see ACCIDENTAL_CHORD_ROOTS above).
export function resolveChallengeChord(step, keyRoot) {
  const { numeral, dominant7 } = step
  const info = ROMAN_NUMERAL_DEGREES[numeral]
  if (!info) return null
  const scale = Scale.get(`${keyRoot} major`).notes
  const degreeRoot = scale[info.degree]
  if (!degreeRoot) return null
  const quality = dominant7 ? 'major' : info.quality
  const extension = dominant7 ? '7' : 'none'
  const symbol = buildChordSymbol(degreeRoot, quality, extension)
  const dataKey = toDataKey(degreeRoot, quality, extension)
  const entry = dataKey ? CHORD_DATA[dataKey] : null
  const tonalChord = symbol ? Chord.get(symbol) : null
  const resolvedSymbol = (tonalChord && tonalChord.symbol) || symbol
  return {
    root: degreeRoot,
    quality,
    extension,
    dominant7: !!dominant7,
    symbol: resolvedSymbol,
    notes: entry ? entry.notes : [],
    inSubset: LEARN_CHORD_SUBSET.some(c => c.symbol === resolvedSymbol),
  }
}
