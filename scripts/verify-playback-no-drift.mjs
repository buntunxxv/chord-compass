#!/usr/bin/env node
// Read-only verification that progression playback no longer re-voices
// chords against their neighbors (removed -- see voiceLeading.js). Confirms:
//  1. A long (10+ chord), deliberately register-varied progression doesn't
//     drift -- each chord's playback notes exactly match its own stored
//     notes (register unchanged, no chaining against the previous chord).
//  2. Each chord in a progression sounds identical to single-chord preview
//     (ChordOutputPanel plays entry.notes directly, untouched) -- i.e.
//     computePlaybackProgression with Close voicing (activeKeysIndex 0) is
//     an identity transform over notes.
// Run: node scripts/verify-playback-no-drift.mjs
import { CHORD_DATA } from '../src/chordData.js'
import { computePlaybackProgression } from '../src/utils/voiceLeading.js'

const failures = []
function check(label, pass, detail) {
  console.log(`${pass ? '✓' : '✗'}  ${label}`)
  if (!pass) {
    failures.push(label)
    if (detail) console.log(`    ${detail}`)
  }
}

// A 12-chord progression built from real CHORD_DATA entries, deliberately
// spanning different registers (some entries store their root in octave 3,
// some in octave 4) so any register-chaining bug would show up clearly.
const CHORD_NAMES = [
  'C major', 'Am7', 'Fmaj7', 'G7', 'Dm7', 'Cmaj7',
  'F major', 'Bb major', 'Eb major', 'Ab major', 'D minor', 'A minor',
]
const progression = CHORD_NAMES.map(name => ({
  chord: CHORD_DATA[name] ? name.replace(' major', '').replace(' minor', 'm') : name,
  notes: CHORD_DATA[name].notes,
}))
check(`test setup: built a ${progression.length}-chord progression from real CHORD_DATA entries`, progression.length >= 10)

// ── 1. No register drift: playback notes == stored notes (Close voicing) ──
const voicedClose = computePlaybackProgression(progression, false)
let allMatch = true
const mismatches = []
voicedClose.forEach((entry, i) => {
  const original = progression[i].notes
  const same = entry.notes.length === original.length && entry.notes.every((n, j) => n === original[j])
  if (!same) {
    allMatch = false
    mismatches.push(`  chord ${i + 1} (${progression[i].chord}): stored ${JSON.stringify(original)} -> played ${JSON.stringify(entry.notes)}`)
  }
})
check(
  'no register drift: every chord\'s Close-voicing playback notes exactly match its own stored notes',
  allMatch,
  mismatches.join('\n'),
)

// Root note captured per chord must also match the chord's own stored root
// (not drifted/derived from a neighbor).
const rootsMatch = voicedClose.every((entry, i) => entry.rootNote === progression[i].notes[0])
check('every chord\'s captured rootNote matches its own stored root (not a neighbor\'s)', rootsMatch)

// ── 2. Progression playback matches single-chord preview ───────────────────
// ChordOutputPanel plays `notes` directly with zero transform -- Close
// voicing (activeKeysIndex 0) in computePlaybackProgression must therefore
// be a true identity over notes for every chord, regardless of its
// neighbors in the progression.
for (const [i, name] of CHORD_NAMES.entries()) {
  const singleChordPreviewNotes = CHORD_DATA[name].notes // what ChordOutputPanel would play standalone
  const inProgressionNotes = voicedClose[i].notes
  const identical = singleChordPreviewNotes.length === inProgressionNotes.length
    && singleChordPreviewNotes.every((n, j) => n === inProgressionNotes[j])
  check(`"${name}" sounds identical in-progression (position ${i + 1}) as it did in single-chord preview`, identical)
}

// Reordering the SAME chords must not change any individual chord's playback
// notes -- proof there's no dependency on chord position/neighbors at all,
// not just that this one ordering happens to pass.
const reversed = [...progression].reverse()
const voicedReversed = computePlaybackProgression(reversed, false)
const reversedMatchesOriginal = voicedReversed.every((entry, i) => {
  const orig = reversed[i].notes
  return entry.notes.length === orig.length && entry.notes.every((n, j) => n === orig[j])
})
check('reordering the progression doesn\'t change any chord\'s own playback notes (position-independent)', reversedMatchesOriginal)

// ── 3. Each entry's OWN stored keysPositionIndex still applies correctly,
// independently per chord (not one global setting) ─────────────────────
const drop2Progression = progression.map(entry => ({ ...entry, keysPositionIndex: 1 }))
const voicedDrop2 = computePlaybackProgression(drop2Progression, true) // Pro, so Drop-2 isn't clamped away
const drop2Differs = voicedDrop2.every((entry, i) => {
  const orig = progression[i].notes
  return entry.notes.length !== orig.length || !entry.notes.every((n, j) => n === orig[j])
})
check('every chord\'s own stored Drop-2 (keysPositionIndex 1) still transforms its notes (per-chord transform intact, not accidentally disabled)', drop2Differs)

// Mixed per-chord voicings within ONE progression -- not a single setting
// applied uniformly: chord 1 Close, chord 2 Drop-2, chord 3 Close again.
const mixedProgression = [
  { ...progression[0], keysPositionIndex: 0 },
  { ...progression[1], keysPositionIndex: 1 },
  { ...progression[2], keysPositionIndex: 0 },
]
const voicedMixed = computePlaybackProgression(mixedProgression, true)
const chord1Unchanged = voicedMixed[0].notes.length === progression[0].notes.length
  && voicedMixed[0].notes.every((n, j) => n === progression[0].notes[j])
const chord2Changed = voicedMixed[1].notes.length !== progression[1].notes.length
  || !voicedMixed[1].notes.every((n, j) => n === progression[1].notes[j])
const chord3Unchanged = voicedMixed[2].notes.length === progression[2].notes.length
  && voicedMixed[2].notes.every((n, j) => n === progression[2].notes[j])
check('mixed progression: chord 1 (keysPositionIndex 0) stays Close while chord 2 (keysPositionIndex 1) gets Drop-2', chord1Unchanged && chord2Changed)
check('mixed progression: chord 3 (keysPositionIndex 0) stays Close, unaffected by chord 2\'s Drop-2', chord3Unchanged)

// A free (non-Pro) account can't get a Pro-only voicing played back even if
// an entry still carries a Pro-tier keysPositionIndex.
const voicedDrop2Free = computePlaybackProgression(drop2Progression, false)
const clampedToClose = voicedDrop2Free.every((entry, i) => {
  const orig = progression[i].notes
  return entry.notes.length === orig.length && entry.notes.every((n, j) => n === orig[j])
})
check('a non-Pro account clamps every entry\'s stored Drop-2 back to Close', clampedToClose)

console.log('')
if (failures.length > 0) {
  console.log(`${failures.length} check(s) failed:`)
  failures.forEach(f => console.log(`  - ${f}`))
  process.exit(1)
} else {
  console.log('All checks passed.')
}
