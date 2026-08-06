#!/usr/bin/env node
// Read-only verification of the MIDI-import chord-moment pipeline: builds a
// synthetic multi-chord MIDI file with @tonejs/midi's own write API (no
// real sample file needed), round-trips it through the same
// parse/segment/detect functions the app uses, and checks:
//   1. chord moments are segmented correctly (right count, right notes,
//      right boundaries -- including a passing tone/arpeggio case where the
//      sounding set changes mid-"chord"),
//   2. each moment's detected name matches Session 37 detectChordName-style
//      pitch-class chord detection,
//   3. single-moment selection yields the right pitch classes for the note
//      picker,
//   4. range selection builds an ordered progression via the same
//      insertAt/cap logic App.jsx's addProgressionSequence uses.
//
// Run: node scripts/verify-midi-import.mjs
// Same deep import as src/utils/midiChordMoments.js -- see that file's
// comment for why (@tonejs/midi's "main" entry is a UMD bundle whose named
// exports Node can't statically discover; the "module" entry it points to
// here works fine under both Node and Vite).
import { Midi } from '@tonejs/midi/dist/Midi.js'
import { segmentChordMoments } from '../src/utils/midiChordMoments.js'
import { detectChordNameFromPitchClasses } from '../src/utils/reverseVoicingLookup.js'

const failures = []

function check(label, actual, expected) {
  const pass = JSON.stringify(actual) === JSON.stringify(expected)
  console.log(`${pass ? '✓' : '✗'}  ${label}`)
  if (!pass) {
    failures.push(label)
    console.log(`    expected: ${JSON.stringify(expected)}`)
    console.log(`    actual:   ${JSON.stringify(actual)}`)
  }
}

// ── Build a synthetic multi-chord MIDI file ─────────────────────────────
// Cmaj (C4 E4 G4) -> Am (A3 C4 E4) -> F (F3 A3 C4) -> G7 (G3 B3 D4 F4),
// one bar each at 120bpm (2s/bar), block chords -- a plain I-vi-IV-V7
// progression, deliberately using the classic ambiguous-inversion-prone
// voicings (Am/F share two notes; C/Am share two notes) to make sure
// segmentation is keying off the exact note SET, not just "a change
// happened somewhere."
const midi = new Midi()
midi.header.setTempo(120)
const track = midi.addTrack()

const CHORDS = [
  { notes: ['C4', 'E4', 'G4'], name: 'CM' },
  { notes: ['A3', 'C4', 'E4'], name: 'Am' },
  { notes: ['F3', 'A3', 'C4'], name: 'FM' },
  { notes: ['G3', 'B3', 'D4', 'F4'], name: 'G7' },
]
const BAR_SECONDS = 2

CHORDS.forEach((c, i) => {
  const time = i * BAR_SECONDS
  c.notes.forEach(name => {
    track.addNote({ name, time, duration: BAR_SECONDS, velocity: 0.8 })
  })
})

// A 5th moment: a passing tone within what would otherwise be one bar --
// hold C4+E4 through the whole bar, but G4 drops out halfway and A4 comes
// in for the second half. This must segment into TWO moments (CEG, then
// CEA), not one, proving segmentation follows the actual sounding set
// rather than just chord-sized blocks.
const passingTime = CHORDS.length * BAR_SECONDS
track.addNote({ name: 'C4', time: passingTime, duration: BAR_SECONDS, velocity: 0.8 })
track.addNote({ name: 'E4', time: passingTime, duration: BAR_SECONDS, velocity: 0.8 })
track.addNote({ name: 'G4', time: passingTime, duration: BAR_SECONDS / 2, velocity: 0.8 })
track.addNote({ name: 'A4', time: passingTime + BAR_SECONDS / 2, duration: BAR_SECONDS / 2, velocity: 0.8 })

// ── Round-trip through the real binary format ───────────────────────────
// Not just reusing the in-memory `midi` object -- encode to bytes and
// re-parse, so this exercises the actual file-import path (what a real
// uploaded .mid file goes through), not just the write API's own state.
const bytes = midi.toArray()
const reparsed = new Midi(bytes)

console.log(`Built and re-parsed a ${bytes.length}-byte MIDI file with ${reparsed.tracks[0].notes.length} note events.\n`)

// ── 1. Segmentation ──────────────────────────────────────────────────────
const moments = segmentChordMoments(reparsed)

check('segments into 6 chord moments (4 chords + 2 halves of the passing-tone bar)', moments.length, 6)

const expectedPitchClassSets = [
  [0, 4, 7],    // C E G
  [9, 0, 4],    // A C E
  [5, 9, 0],    // F A C
  [7, 11, 2, 5], // G B D F
  [0, 4, 7],    // C E G (passing tone, first half)
  [0, 4, 9],    // C E A (passing tone, second half)
].map(pcs => [...pcs].sort((a, b) => a - b))

moments.forEach((m, i) => {
  check(`moment #${i + 1} pitch classes`, m.pitchClasses, expectedPitchClassSets[i])
})

// Boundaries: each of the first 4 moments should span exactly one 2s bar,
// and the passing-tone bar should split into two 1s halves.
const expectedSpans = [2, 2, 2, 2, 1, 1]
moments.forEach((m, i) => {
  const span = Math.round((m.endTime - m.startTime) * 100) / 100
  check(`moment #${i + 1} duration`, span, expectedSpans[i])
})

// notes[0] should be the bass note (lowest MIDI pitch), matching the
// low-to-high convention soundingNotes() uses for guitar shapes elsewhere
// in this app (ProgressionStrip reads entry.notes[0] as the playback root).
check('moment #2 (Am) bass note is A3, not insertion order', moments[1].notes[0].name, 'A3')

// ── 2. Chord-name detection on raw note sets ────────────────────────────
// tonal's detector names each cluster relative to detectChordNameFromPitchClasses'
// fixed pitch-class-ascending input order (same rule as the original
// detectChordName, and for the same reason -- see that function's own
// comment) -- e.g. A-C-E becomes "Am/C" (an Am triad read starting from its
// C) rather than bare "Am", and F-A-C / G-B-D-F read starting from their
// lowest pitch class (C, D) become "FM/C" / "G7/D". This is the fixed,
// deliberate behavior, not an artifact of this specific voicing.
const expectedNames = ['CM', 'Am/C', 'FM/C', 'G7/D', 'CM', 'Am/C']
moments.forEach((m, i) => {
  const detected = detectChordNameFromPitchClasses(m.pitchClasses)
  check(`moment #${i + 1} detected chord name`, detected.name, expectedNames[i])
})

// ── 3. Single-moment selection -> note picker pitch classes ────────────
// Simulates ReverseVoicingFinder's onLoadMoment(pitchClasses) handler: the
// tapped moment's pitchClasses array becomes NotePicker's `selected` state
// verbatim, feeding straight into findVoicings the same way manually-tapped
// notes would.
const tappedMoment = moments[1] // Am
check('single-moment selection yields Am pitch classes for the note picker', tappedMoment.pitchClasses, [0, 4, 9])

// ── 4. Range selection -> ordered progression import ───────────────────
// Simulates MidiImportPanel's handleImportSelected (checked indices sorted
// ascending, mapped to {chord, notes}) followed by App.jsx's
// addProgressionSequence (insertAt computed once, one setProgression call
// preserving order) -- reimplemented here as a plain function over a plain
// array so this script doesn't need React.
function simulateRangeImport(allMoments, checkedIndices, existingProgression, tappedIndex, isProUser, limit) {
  const ordered = [...checkedIndices].sort((a, b) => a - b).map(i => {
    const m = allMoments[i]
    const detected = detectChordNameFromPitchClasses(m.pitchClasses)
    return { chord: detected.name, notes: m.notes.map(n => n.name) }
  })
  const insertAt = (tappedIndex != null && tappedIndex < existingProgression.length)
    ? tappedIndex + 1
    : existingProgression.length
  const allowed = isProUser ? ordered : ordered.slice(0, Math.max(0, limit - existingProgression.length))
  return [
    ...existingProgression.slice(0, insertAt),
    ...allowed,
    ...existingProgression.slice(insertAt),
  ]
}

// Select moments out of order (2, 0, 1 -- i.e. Am, CM, Am-half-cluster is
// skipped) to prove the import re-sorts to chronological/file order rather
// than trusting click order.
const outOfOrderCheck = new Set([2, 0, 1]) // FM, CM, Am/C
const imported = simulateRangeImport(moments, outOfOrderCheck, [], null, true, 4)
check('range import re-orders checked moments chronologically, not by click order', imported.map(c => c.chord), ['CM', 'Am/C', 'FM/C'])
check('range import carries each moment\'s own notes through', imported[0].notes, ['C4', 'E4', 'G4'])

// Free-tier cap: importing 4 chords into a progression that already has 2,
// with a cap of 4 and isPro=false, should only admit 2 more.
const cappedImport = simulateRangeImport(moments.slice(0, 4), new Set([0, 1, 2, 3]), [{ chord: 'X' }, { chord: 'Y' }], null, false, 4)
check('free-tier cap truncates a range import to the remaining slots', cappedImport.map(c => c.chord), ['X', 'Y', 'CM', 'Am/C'])

// Pro bypass: same scenario but isPro=true should admit all 4.
const proImport = simulateRangeImport(moments.slice(0, 4), new Set([0, 1, 2, 3]), [{ chord: 'X' }, { chord: 'Y' }], null, true, 4)
check('Pro tier bypasses the cap entirely', proImport.map(c => c.chord), ['X', 'Y', 'CM', 'Am/C', 'FM/C', 'G7/D'])

// Insert-after-tapped-chip: mirrors addToProgression's own insertAt rule.
const midInsert = simulateRangeImport(moments.slice(0, 2), new Set([0, 1]), [{ chord: 'X' }, { chord: 'Y' }, { chord: 'Z' }], 0, true, 4)
check('range import inserts after the tapped chip, not always at the end', midInsert.map(c => c.chord), ['X', 'CM', 'Am/C', 'Y', 'Z'])

// ── Report ────────────────────────────────────────────────────────────
console.log()
if (failures.length === 0) {
  console.log('✓  All checks passed.')
} else {
  console.log(`⚠  ${failures.length} check(s) failed:`)
  failures.forEach(f => console.log(`   - ${f}`))
  process.exitCode = 1
}
