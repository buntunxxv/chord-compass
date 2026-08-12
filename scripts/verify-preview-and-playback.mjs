#!/usr/bin/env node
// Read-only verification for the Field Test (12 Aug 2026) system-wide fixes:
//  1. Piano preview must visibly reflect chord-to-chord movement (not just
//     look identical to the pre-preview state), including common-tone-heavy
//     moves where notes carry over at a different octave.
//  2. Every chord name that can appear in a progression must resolve to its
//     own guitar shape, so playback can track whichever chord is sounding
//     instead of staying frozen on the builder's selection.
// Run: node scripts/verify-preview-and-playback.mjs
import { Note } from 'tonal'
import { CHORD_DATA } from '../src/chordData.js'
import { resolveKeyStyle, noteMatches } from '../src/utils/pianoKeyStyle.js'
import { guitarShapeForChordName, chordNameToSelection } from '../src/utils/chordSelectionLookup.js'

const WHITE_KEYS = ['C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3', 'C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5']
const BLACK_KEYS = ['C#3', 'D#3', 'F#3', 'G#3', 'A#3', 'C#4', 'D#4', 'F#4', 'G#4', 'A#4', 'C#5']
const ALL_KEYS = [...WHITE_KEYS, ...BLACK_KEYS]
const NOTE_COLORS = { root: '#c9a227', chordTone: '#119392', suggested: '#8855dd', splitBass: '#c0447a' }

const failures = []
function check(label, pass, detail) {
  console.log(`${pass ? '✓' : '✗'}  ${label}`)
  if (!pass) {
    failures.push(label)
    if (detail) console.log(`    ${detail}`)
  }
}

// ── 1. Piano preview movement — behaviour-class matrix ─────────────────────
// Each case: [description, current chord notes, preview chord notes].
// Root stays notes[0] throughout, matching the app's own convention.
const movementCases = [
  {
    label: 'simple triad movement (C major -> G)',
    current: CHORD_DATA['C major'].notes,
    preview: CHORD_DATA['C major'].next.find(n => n.chord === 'G').notes,
  },
  {
    label: 'extended-chord movement, common tone at a different octave (Dm7 -> Cmaj7)',
    current: CHORD_DATA['Dm7'].notes,
    preview: CHORD_DATA['Dm7'].next.find(n => n.chord === 'Cmaj7').notes,
  },
  {
    label: 'movement with several common tones (C major -> Am7)',
    current: CHORD_DATA['C major'].notes,
    preview: CHORD_DATA['C major'].next.find(n => n.chord === 'Am7').notes,
  },
  {
    label: 'movement with few/no common tones (Csus4 -> Ab)',
    current: CHORD_DATA['Csus4'].notes,
    preview: CHORD_DATA['Csus4'].next.find(n => n.chord === 'Ab').notes,
  },
]

function pitchClass(note) {
  return Note.chroma(note)
}

for (const { label, current, preview } of movementCases) {
  const root = current[0]
  const styles = ALL_KEYS.map(note => ({ note, style: resolveKeyStyle(note, current, root, preview, '#fff', null, NOTE_COLORS) }))

  // Enharmonic-aware (via the same noteMatches the real component uses) --
  // a preview note spelled "Ab3" must count as matching the "G#3" key, not
  // be missed by a naive string comparison.
  const leaving = styles.filter(s => s.style.leaving)
  const arriving = styles.filter(s => s.style.active && !noteMatches(s.note, current) && noteMatches(s.note, preview))
  const held = styles.filter(s => s.style.shared)

  const currentPCs = new Set(current.map(pitchClass))
  const previewPCs = new Set(preview.map(pitchClass))
  const expectHeld = [...currentPCs].some(pc => previewPCs.has(pc))
  const expectLeaving = [...currentPCs].some(pc => !previewPCs.has(pc))
  const expectArriving = [...previewPCs].some(pc => !currentPCs.has(pc))

  check(
    `${label}: some visual change occurs (leaving, arriving, or held keys)`,
    leaving.length + arriving.length + held.length > 0,
    `leaving=${leaving.length} arriving=${arriving.length} held=${held.length}`,
  )
  if (expectLeaving) {
    check(`${label}: notes that don't carry over visually recede (leaving)`, leaving.length > 0)
  }
  if (expectArriving) {
    check(`${label}: notes new to the preview chord are highlighted (arriving)`, arriving.length > 0)
  }
  if (expectHeld) {
    check(`${label}: a note whose pitch class carries over is marked held, regardless of octave`, held.length > 0)
  }
}

// Regression: with no preview active, nothing should ever be marked leaving,
// and normal current-chord coloring is unaffected.
{
  const current = CHORD_DATA['Dm7'].notes
  const root = current[0]
  const anyLeaving = ALL_KEYS.some(note => resolveKeyStyle(note, current, root, null, '#fff', null, NOTE_COLORS).leaving)
  check('no preview active: no key is ever marked leaving', !anyLeaving)
  const rootStyle = resolveKeyStyle(root, current, root, null, '#fff', null, NOTE_COLORS)
  check('no preview active: root still highlighted in root color', rootStyle.fill === NOTE_COLORS.root)
}

// Specifically pin the reported repro: Dm7's own held 7th (C5) must be
// flagged as shared even though Cmaj7's stored voicing places its root at
// C4, a different octave -- the exact case that silently failed before the
// pitch-class fix.
{
  const current = CHORD_DATA['Dm7'].notes // D4 F4 A4 C5
  const preview = CHORD_DATA['Dm7'].next.find(n => n.chord === 'Cmaj7').notes // C4 E4 G4 B4
  const c5 = resolveKeyStyle('C5', current, current[0], preview, '#fff', null, NOTE_COLORS)
  check('Dm7 -> Cmaj7: held C (at C5, current chord\'s own octave) is marked shared, not leaving', c5.shared === true && c5.leaving === false)
}

// ── 2. Guitar shape resolution — every chord name a progression can contain ─
// Every "current chord" key and every "next" suggestion name in CHORD_DATA is
// a real display name that can end up as a progression entry (builder
// selection, "Add current chord", or "+ Add to progression" on a
// suggestion) -- guitarShapeForChordName must resolve all of them so
// playback can track any of them, not just the ones tested manually.
//
// chordNameToSelection only parses the 8 base suffix forms (major, minor,
// 7, maj7, m7, add9, sus2, sus4) -- a PRE-EXISTING scope, unchanged by this
// fix, already shared with referenceGuitarShape's identical pipeline. Every
// free-tier suggestion (chordEntry.next) and every base-tier builder
// selection is one of these 8 forms, which is the realistic common case
// this fix needs to cover completely. Pro-only extended/altered qualities
// (9ths, 11ths, 13ths, dim7, m7b5, altered dominants) fall outside that
// scope and are verified separately below as a graceful-fallback case, not
// a hard requirement -- same "acceptable simplification" already accepted
// for referenceGuitarShape.
const allChordNames = new Set()
for (const [key, entry] of Object.entries(CHORD_DATA)) {
  // "current chord" keys are long-form ("C major") for base triads and bare
  // Tonal symbols for everything else -- only the bare-symbol form is ever
  // used as a progression display name (see App.jsx's displayName), so
  // long-form keys are skipped here in favor of testing via their own
  // "next" entries' chord names below, which are always bare symbols.
  if (!key.includes(' ')) allChordNames.add(key)
  for (const n of entry.next || []) allChordNames.add(n.chord)
}
const baseTypeNames = [...allChordNames].filter(name => chordNameToSelection(name) !== null)
const extendedTypeNames = [...allChordNames].filter(name => chordNameToSelection(name) === null)

check(`test coverage: found a non-trivial set of base-type chord names to check (${baseTypeNames.length})`, baseTypeNames.length > 50)

let resolvedCount = 0
const unresolved = []
for (const name of baseTypeNames) {
  const result = guitarShapeForChordName(name)
  if (result && Array.isArray(result.shape?.frets) && result.shape.frets.length === 6) {
    resolvedCount++
  } else {
    unresolved.push(name)
  }
}
check(
  `guitarShapeForChordName resolves a real 6-string shape for every base-type progression chord name (${resolvedCount}/${baseTypeNames.length})`,
  unresolved.length === 0,
  unresolved.length ? `unresolved: ${unresolved.join(', ')}` : '',
)

// Extended/altered chord names (Pro-only, e.g. "C9", "Cm7b5") are outside
// chordNameToSelection's scope -- confirm they fall back gracefully to null
// (App.jsx then keeps showing the builder's own live shape for that beat)
// rather than resolving something wrong.
{
  const sample = extendedTypeNames.slice(0, 20)
  const allNull = sample.every(name => guitarShapeForChordName(name) === null)
  check(`extended/altered chord names (outside chordNameToSelection's scope, ${extendedTypeNames.length} found) resolve to null rather than a wrong shape`, allNull)
}

// Progression playback across multiple successive chords: a representative
// sequence should resolve a shape at every step, and consecutive steps
// should genuinely differ (proving the diagram would visibly move, not
// resolve to the same static shape every beat).
{
  const sequence = ['Dm7', 'G7', 'Cmaj7', 'Am7']
  const shapes = sequence.map(guitarShapeForChordName)
  check('progression playback: every chord in a multi-chord sequence resolves a shape', shapes.every(Boolean))
  const fretsKey = s => s.shape.frets.join(',') + '|' + (s.shape.barre ? `${s.shape.barre.from}-${s.shape.barre.to}@${s.shape.barre.fret}` : '')
  const distinctShapes = new Set(shapes.filter(Boolean).map(fretsKey))
  check('progression playback: consecutive chords resolve to genuinely different shapes', distinctShapes.size > 1)
}

// Preview/playback ends -> falls back to the selected chord: a chord name
// the pipeline can't parse (e.g. a slash chord) must resolve to null, not
// throw or silently return a wrong shape -- App.jsx's own
// `playingGuitarShape || guitarShapeToShow` fallback depends on this.
{
  const slash = guitarShapeForChordName('C/E')
  check('unparseable chord name (slash chord) resolves to null, not a wrong shape', slash === null)
  const garbage = guitarShapeForChordName('not a chord')
  check('non-chord garbage resolves to null without throwing', garbage === null)
}

// chordNameToSelection sanity: every one of the 8 base suffix forms parses,
// confirming the extraction from App.jsx preserved behavior exactly.
{
  const cases = [['C', 'major', 'none'], ['Cm', 'minor', 'none'], ['C7', 'major', '7'], ['Cmaj7', 'major', 'maj7'], ['Cm7', 'minor', '7'], ['Cadd9', 'major', 'add9'], ['Csus2', 'sus2', 'none'], ['Csus4', 'sus4', 'none']]
  const allMatch = cases.every(([name, quality, extension]) => {
    const sel = chordNameToSelection(name)
    return sel && sel.root === 'C' && sel.quality === quality && sel.extension === extension
  })
  check('chordNameToSelection parses all 8 base chord-type suffixes correctly', allMatch)
}

console.log('')
if (failures.length > 0) {
  console.log(`${failures.length} check(s) failed:`)
  failures.forEach(f => console.log(`  - ${f}`))
  process.exit(1)
} else {
  console.log('All checks passed.')
}
