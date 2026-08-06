#!/usr/bin/env node
// Read-only verification of formatChordName -- the single boundary that
// normalizes Tonal's Chord.detect output to this app's own chord-builder
// convention (see buildChordSymbol in src/components/ChordSelector.jsx)
// and converts ASCII accidentals to Unicode. Run: node scripts/verify-format-chord-name.mjs
import { Chord } from 'tonal'
import { formatChordName } from '../src/utils/formatChordName.js'

const failures = []

function check(label, actual, expected) {
  const pass = actual === expected
  console.log(`${pass ? '✓' : '✗'}  ${label}`)
  if (!pass) {
    failures.push(label)
    console.log(`    expected: ${JSON.stringify(expected)}`)
    console.log(`    actual:   ${JSON.stringify(actual)}`)
  }
}

// C major triad: Tonal detects a bare major as "CM" -- app convention is
// no suffix at all (matches buildChordSymbol('C','major','none') === 'C').
check('C major', formatChordName(Chord.detect(['C', 'E', 'G'])[0]), 'C')

// C/E slash (first inversion) -- simulated directly since Chord.detect on
// this pitch-class set actually prefers reading it as "Em#5/C" (a real
// alternate chord identity, not this app's "same chord, different bass"
// slash notation) -- formatChordName's slash handling is what's under test
// here, not tonal's own root-preference heuristics.
check('C/E slash', formatChordName('CM/E'), 'C/E')

// C13 -- already matches the app's own convention (buildChordSymbol
// returns root+'13' with no "M" tag), no accidentals to convert.
check('C13', formatChordName(Chord.get('C13').symbol), 'C13')

// C7#9 -- fully altered dominant; suffix already matches this app's own
// convention (buildChordSymbol returns root+'7#9'), only the accidental
// needs converting to Unicode.
check('C7#9 (fully altered)', formatChordName(Chord.get('C7#9').symbol), 'C7♯9')

// Undetected/fallback case: reverseVoicingLookup's detectChordName falls
// back to a plain, dot-joined note list (ASCII accidentals) when
// Chord.detect finds no match -- formatChordName still needs to convert
// those accidentals even though there's no chord suffix to normalize.
check('undetected fallback note list', formatChordName('C · C# · D'), 'C · C♯ · D')

// Falsy passthrough -- formatChordName is called at a display boundary,
// not a validation boundary; a falsy input should pass straight through.
check('falsy passthrough', formatChordName(''), '')

console.log()
if (failures.length === 0) {
  console.log('✓  All checks passed.')
} else {
  console.log(`⚠  ${failures.length} check(s) failed:`)
  failures.forEach(f => console.log(`   - ${f}`))
  process.exitCode = 1
}
