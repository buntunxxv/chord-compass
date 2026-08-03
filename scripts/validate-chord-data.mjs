#!/usr/bin/env node
// Read-only validation: compares stored chord notes against Tonal.js pitch-class output.
// Run: node scripts/validate-chord-data.mjs

import { Chord, Note } from 'tonal'
import { CHORD_DATA } from '../src/chordData.js'

// ── Symbol mapping ──────────────────────────────────────────────────────────
// chordData keys use "C major" / "C minor" long form; everything else is
// already a Tonal symbol (Cmaj7, Cm7, Cadd9, Csus2, etc.)
function keyToSymbol(key) {
  if (key.endsWith(' major')) return key.slice(0, -6)
  if (key.endsWith(' minor')) return key.slice(0, -6) + 'm'
  return key
}

// ── Pitch-class helpers ─────────────────────────────────────────────────────
function pitchClass(noteWithOctave) {
  return noteWithOctave.replace(/\d+$/, '')
}

function chromaOf(pc) {
  return Note.get(pc).chroma ?? -1
}

// Sort by chroma so comparison is order-independent (handles voicings where
// the 9th appears above the octave but Tonal lists it after the 5th)
function sortByChroma(pcs) {
  return [...pcs].sort((a, b) => chromaOf(a) - chromaOf(b))
}

// ── Validate ────────────────────────────────────────────────────────────────
const mismatches = []

for (const [key, entry] of Object.entries(CHORD_DATA)) {
  const symbol = keyToSymbol(key)
  const tonalChord = Chord.get(symbol)

  if (!tonalChord.notes || tonalChord.notes.length === 0) {
    mismatches.push({
      Chord: key,
      Issue: 'Tonal could not resolve symbol "' + symbol + '"',
      Stored: entry.notes.join(' '),
      'Tonal.js': '—',
    })
    continue
  }

  const storedPCs = entry.notes.map(pitchClass)
  const tonalPCs = tonalChord.notes

  const storedSorted = sortByChroma(storedPCs)
  const tonalSorted = sortByChroma(tonalPCs)

  const sameLength = storedSorted.length === tonalSorted.length
  const chromaMismatch =
    !sameLength || storedSorted.some((pc, i) => chromaOf(pc) !== chromaOf(tonalSorted[i]))

  // Same set of notes but different accidental spelling (e.g. stored D# vs Tonal Eb)
  const spellingMismatch =
    !chromaMismatch && storedSorted.some((pc, i) => pc !== tonalSorted[i])

  if (chromaMismatch || spellingMismatch) {
    mismatches.push({
      Chord: key,
      Issue: chromaMismatch ? 'wrong/missing note' : 'enharmonic spelling',
      Stored: storedSorted.join(' '),
      'Tonal.js': tonalSorted.join(' '),
    })
  }
}

// ── Report ──────────────────────────────────────────────────────────────────
if (mismatches.length === 0) {
  console.log('✓  All', Object.keys(CHORD_DATA).length, 'chords match Tonal.js — no mismatches found.')
} else {
  console.log(`⚠  ${mismatches.length} mismatch(es) out of ${Object.keys(CHORD_DATA).length} chords:\n`)
  console.table(mismatches)
}
