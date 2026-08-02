import { CHORD_DATA } from '../chordData'
import { DIATONIC_CHORDS } from '../diatonicChords'

// Resolve a progression template (a Roman-numeral degree sequence from
// progressionTemplates.js) into an actual { chord, notes } sequence for one
// key, by looking up each degree in DIATONIC_CHORDS. Returns null if the
// template's mode doesn't match the requested key mode, or if any degree
// fails to resolve.
export function resolveTemplate(template, root, mode) {
  if (!template || template.mode !== mode) return null

  const degreeTable = DIATONIC_CHORDS[`${root} ${mode}`]
  if (!degreeTable) return null

  const entries = []
  for (const degree of template.degrees) {
    let chordKey = degreeTable[degree]

    // Borrowed harmonic-minor dominant: "Minor ii-V-i" and "Andalusian
    // Cadence" use an uppercase "V" that DIATONIC_CHORDS doesn't store --
    // natural minor only has a lowercase "v" (minor 7). Its root always
    // matches that "v" degree; only the quality changes, m7 -> dominant 7.
    if (!chordKey && mode === 'minor' && degree === 'V') {
      const vChord = degreeTable['v']
      const rootMatch = vChord?.match(/^([A-G][#b]?)/)
      if (rootMatch) chordKey = `${rootMatch[1]}7`
    }

    const entry = chordKey ? CHORD_DATA[chordKey] : null
    if (!entry) return null
    entries.push({ chord: chordKey, notes: entry.notes })
  }

  return entries
}
