// Two alternate CAGED-style neck positions for every TRUE inversion shape
// in guitarInversions.js (bass = an existing chord tone, never a foreign-
// bass slash chord), on top of whatever position is already there
// (position 1, unchanged). Same methodology as guitarPositions.js's
// root-position pass, except the constraint being preserved at every
// position is "the SELECTED BASS TONE (3rd/5th/7th/9th, not necessarily
// the root) is the lowest sounding pitch" -- guitarInversions.js's own
// invariant -- rather than "the root is lowest."
//
// For each of the 23 distinct (chord type, which-tone-is-in-the-bass)
// categories guitarInversions.js already established, a search found every
// moveable family (fret span <= 4) feasible across all 12 possible bass
// pitch classes, ranked by where it sits when the bass is C. Two defaults
// are picked per category the same way as the root-position pass -- a
// lower-sitting family and one several frets higher -- then EVERY
// individual chord+bass combination independently re-solves its position
// 2/3 from the full ranked pool (trying the category default first,
// falling back through the rest) to guarantee position 2 is genuinely
// BELOW and position 3 genuinely ABOVE that specific combination's own
// position-1 fret.
//
// Constraining a specific chord TONE (not the root) to be the lowest note
// removes options a plain root-position chord doesn't have to worry about,
// so the skip rate here is real and meaningfully different in shape from
// the root-position pass: it's not just the "low" slot that runs out of
// room -- many inversions' position-1 fingerings already sit fairly high
// up the neck (since the bass note itself can be far from the root), so
// the "high" slot runs into the fret-15 ceiling too. 173 of 776
// attempted (chord+bass x new position) combinations were skipped -- 126
// position-2 (low) and 47 position-3 (high), every one a verified
// structural floor/ceiling for that specific chord+bass combination (see
// the session notes for the full per-entry list). Only chord+bass
// combinations that already have a position-1 shape in guitarInversions.js
// are considered here -- the 3 combinations Session 26 itself couldn't
// find any fingering for (C#maj7/F, Dbmaj7/F, Amaj7/E) have no entry below
// and no position selector at all.
//
// Format: GUITAR_INVERSION_ALT_POSITIONS[dataKey][bassPitchClass] =
// [position2 | null, position3 | null]. Every one of the 603 generated
// shapes was verified programmatically: its sounded pitch classes exactly
// match the chord's real CHORD_DATA tones (no omissions, no extras), and
// its lowest-pitched played string is genuinely the selected bass note --
// not the root.

export const GUITAR_INVERSION_ALT_POSITIONS = {
  // ---- major ----
  "C major": { "E": [null, { frets: ['x', 'x', 'x', 9, 8, 8] }], "G": [{ frets: ['x', 'x', 'x', 0, 1, 0] }, { frets: ['x', 10, 10, 9, 'x', 'x'] }] },
  "C# major": { "F": [null, { frets: ['x', 'x', 'x', 10, 9, 9] }], "G#": [{ frets: ['x', 'x', 'x', 1, 2, 1] }, { frets: ['x', 11, 11, 10, 'x', 'x'] }] },
  "Db major": { "F": [null, { frets: ['x', 'x', 'x', 10, 9, 9] }], "G#": [{ frets: ['x', 'x', 'x', 1, 2, 1] }, { frets: ['x', 11, 11, 10, 'x', 'x'] }] },
  "D major": { "F#": [null, { frets: ['x', 'x', 'x', 11, 10, 10] }], "A": [{ frets: ['x', 0, 0, 'x', 'x', 2] }, { frets: ['x', 12, 12, 11, 'x', 'x'] }] },
  "D# major": { "G": [null, { frets: ['x', 'x', 'x', 12, 11, 11] }], "A#": [{ frets: ['x', 1, 1, 0, 'x', 'x'] }, { frets: ['x', 13, 'x', 12, 'x', 11] }] },
  "Eb major": { "G": [null, { frets: ['x', 'x', 'x', 12, 11, 11] }], "A#": [{ frets: ['x', 1, 1, 0, 'x', 'x'] }, { frets: ['x', 13, 'x', 12, 'x', 11] }] },
  "E major": { "G#": [{ frets: ['x', 'x', 'x', 1, 0, 0] }, { frets: ['x', 11, 9, 9, 'x', 'x'] }], "B": [{ frets: ['x', 2, 2, 1, 'x', 'x'] }, null] },
  "F major": { "A": [{ frets: ['x', 0, 'x', 'x', 1, 1] }, { frets: ['x', 12, 10, 10, 'x', 'x'] }], "C": [{ frets: ['x', 3, 3, 2, 'x', 'x'] }, null] },
  "F# major": { "A#": [{ frets: ['x', 1, 'x', 'x', 2, 2] }, { frets: ['x', 13, 11, 11, 'x', 'x'] }], "C#": [{ frets: ['x', 4, 4, 3, 'x', 'x'] }, null] },
  "Gb major": { "A#": [{ frets: ['x', 1, 'x', 'x', 2, 2] }, { frets: ['x', 13, 11, 11, 'x', 'x'] }], "C#": [{ frets: ['x', 4, 4, 3, 'x', 'x'] }, null] },
  "G major": { "B": [{ frets: ['x', 2, 0, 0, 'x', 'x'] }, { frets: ['x', 14, 'x', 12, 'x', 10] }], "D": [null, { frets: ['x', 'x', 'x', 7, 8, 7] }] },
  "G# major": { "C": [{ frets: ['x', 3, 1, 1, 'x', 'x'] }, { frets: ['x', 15, 'x', 13, 'x', 11] }], "D#": [null, { frets: ['x', 'x', 'x', 8, 9, 8] }] },
  "Ab major": { "C": [{ frets: ['x', 3, 1, 1, 'x', 'x'] }, { frets: ['x', 15, 'x', 13, 'x', 11] }], "D#": [null, { frets: ['x', 'x', 'x', 8, 9, 8] }] },
  "A major": { "C#": [{ frets: ['x', 4, 2, 2, 'x', 'x'] }, { frets: ['x', 'x', 11, 9, 10, 'x'] }], "E": [{ frets: [0, 0, 'x', 'x', 2, 'x'] }, { frets: ['x', 'x', 'x', 9, 10, 9] }] },
  "A# major": { "D": [{ frets: ['x', 5, 3, 3, 'x', 'x'] }, { frets: ['x', 'x', 12, 10, 11, 'x'] }], "F": [{ frets: [1, 1, 0, 'x', 'x', 'x'] }, { frets: ['x', 'x', 'x', 10, 11, 10] }] },
  "Bb major": { "D": [{ frets: ['x', 5, 3, 3, 'x', 'x'] }, { frets: ['x', 'x', 12, 10, 11, 'x'] }], "F": [{ frets: [1, 1, 0, 'x', 'x', 'x'] }, { frets: ['x', 'x', 'x', 10, 11, 10] }] },
  "B major": { "D#": [{ frets: ['x', 6, 4, 4, 'x', 'x'] }, { frets: ['x', 'x', 13, 11, 12, 'x'] }], "F#": [{ frets: [2, 2, 1, 'x', 'x', 'x'] }, { frets: ['x', 'x', 'x', 11, 12, 11] }] },
  // ---- minor ----
  "C minor": { "D#": [{ frets: ['x', 6, 5, 5, 'x', 'x'] }, { frets: [11, 'x', 10, 12, 'x', 'x'] }], "G": [null, { frets: ['x', 'x', 'x', 12, 13, 11] }] },
  "C# minor": { "E": [{ frets: ['x', 7, 6, 6, 'x', 'x'] }, { frets: [12, 'x', 11, 13, 'x', 'x'] }], "G#": [{ frets: ['x', 'x', 'x', 1, 2, 0] }, { frets: ['x', 11, 11, 9, 'x', 'x'] }] },
  "Db minor": { "E": [{ frets: ['x', 7, 6, 6, 'x', 'x'] }, { frets: [12, 'x', 11, 13, 'x', 'x'] }], "G#": [{ frets: ['x', 'x', 'x', 1, 2, 0] }, { frets: ['x', 11, 11, 9, 'x', 'x'] }] },
  "D minor": { "F": [{ frets: ['x', 8, 7, 7, 'x', 'x'] }, { frets: [13, 12, 'x', 'x', 'x', 10] }], "A": [{ frets: ['x', 0, 0, 'x', 'x', 1] }, { frets: ['x', 12, 12, 10, 'x', 'x'] }] },
  "D# minor": { "F#": [{ frets: ['x', 9, 8, 8, 'x', 'x'] }, { frets: [14, 13, 'x', 'x', 'x', 11] }], "A#": [{ frets: ['x', 1, 1, 'x', 'x', 2] }, { frets: ['x', 13, 13, 11, 'x', 'x'] }] },
  "Eb minor": { "F#": [{ frets: ['x', 9, 8, 8, 'x', 'x'] }, { frets: [14, 13, 'x', 'x', 'x', 11] }], "A#": [{ frets: ['x', 1, 1, 'x', 'x', 2] }, { frets: ['x', 13, 13, 11, 'x', 'x'] }] },
  "E minor": { "G": [null, { frets: ['x', 10, 9, 9, 'x', 'x'] }], "B": [{ frets: ['x', 2, 2, 0, 'x', 'x'] }, { frets: ['x', 'x', 9, 9, 8, 'x'] }] },
  "F minor": { "G#": [null, { frets: ['x', 11, 10, 10, 'x', 'x'] }], "C": [{ frets: ['x', 3, 3, 1, 'x', 'x'] }, { frets: ['x', 'x', 10, 10, 9, 'x'] }] },
  "F# minor": { "A": [{ frets: ['x', 0, 'x', 'x', 2, 2] }, { frets: ['x', 12, 11, 11, 'x', 'x'] }], "C#": [{ frets: ['x', 4, 4, 2, 'x', 'x'] }, { frets: ['x', 'x', 11, 11, 10, 'x'] }] },
  "Gb minor": { "A": [{ frets: ['x', 0, 'x', 'x', 2, 2] }, { frets: ['x', 12, 11, 11, 'x', 'x'] }], "C#": [{ frets: ['x', 4, 4, 2, 'x', 'x'] }, { frets: ['x', 'x', 11, 11, 10, 'x'] }] },
  "G minor": { "A#": [{ frets: ['x', 1, 0, 0, 'x', 'x'] }, { frets: ['x', 13, 'x', 12, 'x', 10] }], "D": [{ frets: ['x', 5, 5, 3, 'x', 'x'] }, { frets: ['x', 'x', 12, 12, 11, 'x'] }] },
  "G# minor": { "B": [{ frets: ['x', 2, 1, 1, 'x', 'x'] }, { frets: ['x', 14, 'x', 13, 'x', 11] }], "D#": [{ frets: ['x', 6, 6, 4, 'x', 'x'] }, null] },
  "Ab minor": { "B": [{ frets: ['x', 2, 1, 1, 'x', 'x'] }, { frets: ['x', 14, 'x', 13, 'x', 11] }], "D#": [{ frets: ['x', 6, 6, 4, 'x', 'x'] }, null] },
  "A minor": { "C": [{ frets: ['x', 3, 2, 2, 'x', 'x'] }, { frets: [8, 'x', 7, 9, 'x', 'x'] }], "E": [null, { frets: ['x', 'x', 'x', 9, 10, 8] }] },
  "A# minor": { "C#": [{ frets: ['x', 4, 3, 3, 'x', 'x'] }, { frets: [9, 'x', 8, 10, 'x', 'x'] }], "F": [null, { frets: ['x', 'x', 'x', 10, 11, 9] }] },
  "Bb minor": { "C#": [{ frets: ['x', 4, 3, 3, 'x', 'x'] }, { frets: [9, 'x', 8, 10, 'x', 'x'] }], "F": [null, { frets: ['x', 'x', 'x', 10, 11, 9] }] },
  "B minor": { "D": [{ frets: ['x', 5, 4, 4, 'x', 'x'] }, { frets: [10, 'x', 9, 11, 'x', 'x'] }], "F#": [null, { frets: ['x', 'x', 'x', 11, 12, 10] }] },
  // ---- sus2 ----
  "Csus2": { "D": [{ frets: ['x', 5, 5, 5, 'x', 'x'], barre: { fret: 5, from: 1, to: 3 } }, { frets: ['x', 'x', 12, 12, 'x', 8] }], "G": [null, { frets: ['x', 10, 10, 'x', 'x', 10], barre: { fret: 10, from: 1, to: 5 } }] },
  "C#sus2": { "D#": [{ frets: ['x', 6, 6, 6, 'x', 'x'], barre: { fret: 6, from: 1, to: 3 } }, { frets: ['x', 'x', 13, 13, 'x', 9] }], "G#": [null, { frets: ['x', 11, 11, 'x', 'x', 11], barre: { fret: 11, from: 1, to: 5 } }] },
  "Dbsus2": { "D#": [{ frets: ['x', 6, 6, 6, 'x', 'x'], barre: { fret: 6, from: 1, to: 3 } }, { frets: ['x', 'x', 13, 13, 'x', 9] }], "G#": [null, { frets: ['x', 11, 11, 'x', 'x', 11], barre: { fret: 11, from: 1, to: 5 } }] },
  "Dsus2": { "E": [null, { frets: ['x', 'x', 'x', 9, 10, 10] }], "A": [{ frets: ['x', 0, 0, 'x', 'x', 0] }, { frets: ['x', 12, 12, 9, 'x', 'x'] }] },
  "D#sus2": { "F": [null, { frets: ['x', 'x', 'x', 10, 11, 11] }], "A#": [{ frets: ['x', 1, 1, 'x', 'x', 1], barre: { fret: 1, from: 1, to: 5 } }, { frets: ['x', 13, 13, 10, 'x', 'x'] }] },
  "Ebsus2": { "F": [null, { frets: ['x', 'x', 'x', 10, 11, 11] }], "A#": [{ frets: ['x', 1, 1, 'x', 'x', 1], barre: { fret: 1, from: 1, to: 5 } }, { frets: ['x', 13, 13, 10, 'x', 'x'] }] },
  "Esus2": { "F#": [null, { frets: ['x', 'x', 'x', 11, 12, 12] }], "B": [{ frets: ['x', 2, 2, 'x', 'x', 2], barre: { fret: 2, from: 1, to: 5 } }, { frets: ['x', 14, 14, 11, 'x', 'x'] }] },
  "Fsus2": { "G": [{ frets: ['x', 'x', 'x', 0, 1, 1] }, { frets: ['x', 10, 10, 10, 'x', 'x'], barre: { fret: 10, from: 1, to: 3 } }], "C": [{ frets: ['x', 3, 3, 'x', 'x', 3], barre: { fret: 3, from: 1, to: 5 } }, { frets: ['x', 'x', 10, 10, 8, 'x'] }] },
  "F#sus2": { "G#": [{ frets: ['x', 'x', 'x', 1, 2, 2] }, { frets: ['x', 11, 11, 11, 'x', 'x'], barre: { fret: 11, from: 1, to: 3 } }], "C#": [{ frets: ['x', 4, 4, 'x', 'x', 4], barre: { fret: 4, from: 1, to: 5 } }, { frets: ['x', 'x', 11, 11, 9, 'x'] }] },
  "Gbsus2": { "G#": [{ frets: ['x', 'x', 'x', 1, 2, 2] }, { frets: ['x', 11, 11, 11, 'x', 'x'], barre: { fret: 11, from: 1, to: 3 } }], "C#": [{ frets: ['x', 4, 4, 'x', 'x', 4], barre: { fret: 4, from: 1, to: 5 } }, { frets: ['x', 'x', 11, 11, 9, 'x'] }] },
  "Gsus2": { "A": [{ frets: ['x', 0, 0, 0, 'x', 'x'] }, { frets: ['x', 12, 'x', 12, 'x', 10] }], "D": [{ frets: ['x', 5, 5, 'x', 'x', 5], barre: { fret: 5, from: 1, to: 5 } }, { frets: ['x', 'x', 12, 12, 10, 'x'] }] },
  "G#sus2": { "A#": [{ frets: ['x', 1, 1, 1, 'x', 'x'], barre: { fret: 1, from: 1, to: 3 } }, { frets: ['x', 13, 'x', 13, 'x', 11] }], "D#": [{ frets: ['x', 6, 6, 'x', 'x', 6], barre: { fret: 6, from: 1, to: 5 } }, { frets: ['x', 'x', 13, 13, 11, 'x'] }] },
  "Absus2": { "A#": [{ frets: ['x', 1, 1, 1, 'x', 'x'], barre: { fret: 1, from: 1, to: 3 } }, { frets: ['x', 13, 'x', 13, 'x', 11] }], "D#": [{ frets: ['x', 6, 6, 'x', 'x', 6], barre: { fret: 6, from: 1, to: 5 } }, { frets: ['x', 'x', 13, 13, 11, 'x'] }] },
  "Asus2": { "B": [{ frets: ['x', 2, 2, 2, 'x', 'x'], barre: { fret: 2, from: 1, to: 3 } }, { frets: ['x', 14, 14, 'x', 10, 'x'] }], "E": [null, { frets: ['x', 7, 7, 'x', 'x', 7], barre: { fret: 7, from: 1, to: 5 } }] },
  "A#sus2": { "C": [{ frets: ['x', 3, 3, 3, 'x', 'x'], barre: { fret: 3, from: 1, to: 3 } }, { frets: ['x', 15, 15, 'x', 11, 'x'] }], "F": [null, { frets: ['x', 8, 8, 'x', 'x', 8], barre: { fret: 8, from: 1, to: 5 } }] },
  "Bbsus2": { "C": [{ frets: ['x', 3, 3, 3, 'x', 'x'], barre: { fret: 3, from: 1, to: 3 } }, { frets: ['x', 15, 15, 'x', 11, 'x'] }], "F": [null, { frets: ['x', 8, 8, 'x', 'x', 8], barre: { fret: 8, from: 1, to: 5 } }] },
  "Bsus2": { "C#": [{ frets: ['x', 4, 4, 4, 'x', 'x'], barre: { fret: 4, from: 1, to: 3 } }, { frets: ['x', 'x', 11, 11, 'x', 7] }], "F#": [null, { frets: ['x', 9, 9, 'x', 'x', 9], barre: { fret: 9, from: 1, to: 5 } }] },
  // ---- sus4 ----
  "Csus4": { "F": [{ frets: [1, 'x', 'x', 0, 1, 'x'] }, { frets: [13, 10, 10, 'x', 'x', 'x'] }], "G": [{ frets: ['x', 'x', 'x', 0, 1, 1] }, { frets: ['x', 10, 10, 10, 'x', 'x'], barre: { fret: 10, from: 1, to: 3 } }] },
  "C#sus4": { "F#": [{ frets: [2, 'x', 'x', 1, 2, 'x'] }, { frets: [14, 11, 11, 'x', 'x', 'x'] }], "G#": [{ frets: ['x', 'x', 'x', 1, 2, 2] }, { frets: ['x', 11, 11, 11, 'x', 'x'], barre: { fret: 11, from: 1, to: 3 } }] },
  "Dbsus4": { "F#": [{ frets: [2, 'x', 'x', 1, 2, 'x'] }, { frets: [14, 11, 11, 'x', 'x', 'x'] }], "G#": [{ frets: ['x', 'x', 'x', 1, 2, 2] }, { frets: ['x', 11, 11, 11, 'x', 'x'], barre: { fret: 11, from: 1, to: 3 } }] },
  "Dsus4": { "G": [{ frets: [3, 'x', 'x', 2, 3, 'x'] }, { frets: ['x', 'x', 'x', 12, 10, 10] }], "A": [{ frets: ['x', 0, 0, 0, 'x', 'x'] }, { frets: ['x', 12, 'x', 12, 'x', 10] }] },
  "D#sus4": { "G#": [{ frets: [4, 'x', 'x', 3, 4, 'x'] }, { frets: ['x', 'x', 'x', 13, 11, 11] }], "A#": [{ frets: ['x', 1, 1, 1, 'x', 'x'], barre: { fret: 1, from: 1, to: 3 } }, { frets: ['x', 13, 'x', 13, 'x', 11] }] },
  "Ebsus4": { "G#": [{ frets: [4, 'x', 'x', 3, 4, 'x'] }, { frets: ['x', 'x', 'x', 13, 11, 11] }], "A#": [{ frets: ['x', 1, 1, 1, 'x', 'x'], barre: { fret: 1, from: 1, to: 3 } }, { frets: ['x', 13, 'x', 13, 'x', 11] }] },
  "Esus4": { "A": [null, { frets: ['x', 12, 9, 9, 'x', 'x'] }], "B": [{ frets: ['x', 2, 2, 2, 'x', 'x'], barre: { fret: 2, from: 1, to: 3 } }, { frets: ['x', 14, 14, 'x', 10, 'x'] }] },
  "Fsus4": { "A#": [null, { frets: ['x', 13, 10, 10, 'x', 'x'] }], "C": [{ frets: ['x', 3, 3, 3, 'x', 'x'], barre: { fret: 3, from: 1, to: 3 } }, { frets: ['x', 15, 15, 'x', 11, 'x'] }] },
  "F#sus4": { "B": [null, { frets: ['x', 14, 11, 11, 'x', 'x'] }], "C#": [{ frets: ['x', 4, 4, 4, 'x', 'x'], barre: { fret: 4, from: 1, to: 3 } }, { frets: ['x', 'x', 11, 11, 'x', 7] }] },
  "Gbsus4": { "B": [null, { frets: ['x', 14, 11, 11, 'x', 'x'] }], "C#": [{ frets: ['x', 4, 4, 4, 'x', 'x'], barre: { fret: 4, from: 1, to: 3 } }, { frets: ['x', 'x', 11, 11, 'x', 7] }] },
  "Gsus4": { "C": [null, { frets: [8, 10, 'x', 'x', 'x', 10] }], "D": [{ frets: ['x', 5, 5, 5, 'x', 'x'], barre: { fret: 5, from: 1, to: 3 } }, { frets: ['x', 'x', 12, 12, 'x', 8] }] },
  "G#sus4": { "C#": [null, { frets: [9, 11, 'x', 'x', 'x', 11] }], "D#": [{ frets: ['x', 6, 6, 6, 'x', 'x'], barre: { fret: 6, from: 1, to: 3 } }, { frets: ['x', 'x', 13, 13, 'x', 9] }] },
  "Absus4": { "C#": [null, { frets: [9, 11, 'x', 'x', 'x', 11] }], "D#": [{ frets: ['x', 6, 6, 6, 'x', 'x'], barre: { fret: 6, from: 1, to: 3 } }, { frets: ['x', 'x', 13, 13, 'x', 9] }] },
  "Asus4": { "D": [{ frets: ['x', 'x', 0, 2, 'x', 0] }, { frets: [10, 12, 'x', 'x', 'x', 12] }], "E": [null, { frets: ['x', 'x', 'x', 9, 10, 10] }] },
  "A#sus4": { "D#": [{ frets: ['x', 'x', 1, 3, 'x', 1] }, { frets: [11, 13, 'x', 'x', 'x', 13] }], "F": [null, { frets: ['x', 'x', 'x', 10, 11, 11] }] },
  "Bbsus4": { "D#": [{ frets: ['x', 'x', 1, 3, 'x', 1] }, { frets: [11, 13, 'x', 'x', 'x', 13] }], "F": [null, { frets: ['x', 'x', 'x', 10, 11, 11] }] },
  "Bsus4": { "E": [{ frets: [0, 2, 'x', 'x', 'x', 2] }, { frets: [12, 'x', 'x', 11, 12, 'x'] }], "F#": [null, { frets: ['x', 'x', 'x', 11, 12, 12] }] },
  // ---- dom7 ----
  "C7": { "E": [null, { frets: [12, 10, 10, 'x', 11, 'x'] }], "G": [null, { frets: [15, 15, 14, 'x', 11, 'x'] }], "A#": [{ frets: ['x', 1, 'x', 0, 1, 0] }, { frets: ['x', 13, 10, 12, 'x', 12] }] },
  "C#7": { "F": [null, { frets: [13, 11, 11, 'x', 12, 'x'] }], "G#": [null, { frets: ['x', 11, 9, 10, 'x', 9] }], "B": [{ frets: ['x', 2, 'x', 1, 2, 1] }, { frets: ['x', 14, 11, 13, 'x', 13] }] },
  "Db7": { "F": [null, { frets: [13, 11, 11, 'x', 12, 'x'] }], "G#": [null, { frets: ['x', 11, 9, 10, 'x', 9] }], "B": [{ frets: ['x', 2, 'x', 1, 2, 1] }, { frets: ['x', 14, 11, 13, 'x', 13] }] },
  "D7": { "F#": [null, { frets: [14, 12, 10, 'x', 'x', 10] }], "A": [{ frets: ['x', 0, 0, 'x', 1, 2] }, { frets: ['x', 12, 10, 11, 'x', 10] }], "C": [{ frets: ['x', 3, 'x', 2, 3, 2] }, { frets: ['x', 'x', 10, 11, 10, 10] }] },
  "D#7": { "G": [null, { frets: [15, 13, 11, 'x', 'x', 11] }], "A#": [{ frets: ['x', 1, 1, 0, 2, 'x'] }, { frets: ['x', 13, 11, 12, 'x', 11] }], "C#": [{ frets: ['x', 4, 'x', 3, 4, 3] }, { frets: ['x', 'x', 11, 12, 11, 11] }] },
  "Eb7": { "G": [null, { frets: [15, 13, 11, 'x', 'x', 11] }], "A#": [{ frets: ['x', 1, 1, 0, 2, 'x'] }, { frets: ['x', 13, 11, 12, 'x', 11] }], "C#": [{ frets: ['x', 4, 'x', 3, 4, 3] }, { frets: ['x', 'x', 11, 12, 11, 11] }] },
  "E7": { "G#": [null, { frets: ['x', 11, 9, 9, 'x', 10] }], "B": [{ frets: ['x', 2, 0, 1, 'x', 0] }, { frets: ['x', 14, 14, 13, 'x', 10] }], "D": [{ frets: ['x', 5, 'x', 4, 5, 4] }, null] },
  "F7": { "A": [{ frets: ['x', 0, 1, 'x', 1, 1] }, { frets: ['x', 12, 10, 10, 'x', 11] }], "C": [{ frets: ['x', 3, 1, 2, 'x', 1] }, { frets: ['x', 15, 15, 14, 'x', 11] }], "D#": [{ frets: ['x', 6, 'x', 5, 6, 5] }, null] },
  "F#7": { "A#": [{ frets: ['x', 1, 2, 'x', 2, 2] }, { frets: ['x', 13, 11, 11, 'x', 12] }], "C#": [{ frets: ['x', 4, 2, 3, 'x', 2] }, { frets: ['x', 'x', 11, 11, 11, 12] }], "E": [{ frets: ['x', 7, 'x', 6, 7, 6] }, null] },
  "Gb7": { "A#": [{ frets: ['x', 1, 2, 'x', 2, 2] }, { frets: ['x', 13, 11, 11, 'x', 12] }], "C#": [{ frets: ['x', 4, 2, 3, 'x', 2] }, { frets: ['x', 'x', 11, 11, 11, 12] }], "E": [{ frets: ['x', 7, 'x', 6, 7, 6] }, null] },
  "G7": { "B": [{ frets: ['x', 2, 0, 0, 'x', 1] }, { frets: ['x', 'x', 9, 10, 8, 10] }], "D": [{ frets: ['x', 'x', 0, 0, 0, 1] }, null], "F": [null, { frets: ['x', 8, 'x', 7, 8, 7] }] },
  "G#7": { "C": [{ frets: ['x', 3, 1, 1, 'x', 2] }, { frets: ['x', 'x', 10, 11, 9, 11] }], "D#": [{ frets: ['x', 'x', 1, 1, 1, 2] }, null], "F#": [null, { frets: ['x', 9, 'x', 8, 9, 8] }] },
  "Ab7": { "C": [{ frets: ['x', 3, 1, 1, 'x', 2] }, { frets: ['x', 'x', 10, 11, 9, 11] }], "D#": [{ frets: ['x', 'x', 1, 1, 1, 2] }, null], "F#": [null, { frets: ['x', 9, 'x', 8, 9, 8] }] },
  "A7": { "C#": [{ frets: ['x', 4, 2, 2, 'x', 3] }, { frets: ['x', 'x', 11, 12, 10, 12] }], "E": [{ frets: [0, 0, 'x', 0, 2, 'x'] }, null], "G": [null, { frets: ['x', 10, 'x', 9, 10, 9] }] },
  "A#7": { "D": [{ frets: ['x', 5, 3, 3, 'x', 4] }, { frets: ['x', 'x', 12, 13, 11, 13] }], "F": [null, { frets: [13, 11, 12, 'x', 11, 'x'] }], "G#": [null, { frets: ['x', 11, 'x', 10, 11, 10] }] },
  "Bb7": { "D": [{ frets: ['x', 5, 3, 3, 'x', 4] }, { frets: ['x', 'x', 12, 13, 11, 13] }], "F": [null, { frets: [13, 11, 12, 'x', 11, 'x'] }], "G#": [null, { frets: ['x', 11, 'x', 10, 11, 10] }] },
  "B7": { "D#": [{ frets: ['x', 'x', 1, 2, 0, 2] }, null], "F#": [null, { frets: [14, 14, 'x', 14, 'x', 11] }], "A": [{ frets: ['x', 0, 1, 'x', 0, 2] }, { frets: ['x', 12, 'x', 11, 12, 11] }] },
  // ---- maj7 ----
  "Cmaj7": { "E": [{ frets: ['x', 7, 5, 5, 'x', 7] }, null], "G": [null, { frets: ['x', 10, 9, 9, 'x', 8] }], "B": [{ frets: ['x', 2, 2, 0, 1, 'x'] }, { frets: ['x', 14, 10, 12, 'x', 12] }] },
  "C#maj7": { "G#": [null, { frets: ['x', 11, 10, 10, 'x', 9] }], "C": [{ frets: ['x', 3, 3, 1, 2, 'x'] }, { frets: ['x', 15, 11, 13, 'x', 13] }] },
  "Dbmaj7": { "G#": [null, { frets: ['x', 11, 10, 10, 'x', 9] }], "C": [{ frets: ['x', 3, 3, 1, 2, 'x'] }, { frets: ['x', 15, 11, 13, 'x', 13] }] },
  "Dmaj7": { "F#": [null, { frets: [14, 12, 11, 'x', 15, 'x'] }], "A": [{ frets: ['x', 0, 0, 'x', 2, 2] }, { frets: ['x', 12, 11, 11, 'x', 10] }], "C#": [{ frets: ['x', 4, 4, 2, 3, 'x'] }, { frets: ['x', 'x', 11, 11, 10, 10] }] },
  "D#maj7": { "G": [null, { frets: ['x', 10, 8, 8, 'x', 10] }], "A#": [{ frets: ['x', 1, 1, 'x', 3, 3] }, { frets: ['x', 13, 12, 12, 'x', 11] }], "D": [{ frets: ['x', 5, 5, 3, 4, 'x'] }, { frets: ['x', 'x', 12, 12, 11, 11] }] },
  "Ebmaj7": { "G": [null, { frets: ['x', 10, 8, 8, 'x', 10] }], "A#": [{ frets: ['x', 1, 1, 'x', 3, 3] }, { frets: ['x', 13, 12, 12, 'x', 11] }], "D": [{ frets: ['x', 5, 5, 3, 4, 'x'] }, { frets: ['x', 'x', 12, 12, 11, 11] }] },
  "Emaj7": { "G#": [null, { frets: ['x', 11, 9, 9, 'x', 11] }], "B": [{ frets: ['x', 2, 1, 1, 'x', 0] }, { frets: ['x', 14, 14, 13, 'x', 11] }], "D#": [{ frets: ['x', 6, 6, 4, 5, 'x'] }, null] },
  "Fmaj7": { "A": [{ frets: ['x', 0, 2, 'x', 1, 1] }, { frets: ['x', 12, 10, 10, 'x', 12] }], "C": [{ frets: ['x', 3, 2, 2, 'x', 1] }, { frets: ['x', 'x', 10, 10, 10, 12] }], "E": [null, { frets: ['x', 7, 7, 5, 6, 'x'] }] },
  "F#maj7": { "A#": [{ frets: ['x', 1, 3, 'x', 2, 2] }, { frets: ['x', 13, 11, 11, 'x', 13] }], "C#": [{ frets: ['x', 4, 3, 3, 'x', 2] }, { frets: ['x', 'x', 11, 11, 11, 13] }], "F": [null, { frets: ['x', 8, 8, 6, 7, 'x'] }] },
  "Gbmaj7": { "A#": [{ frets: ['x', 1, 3, 'x', 2, 2] }, { frets: ['x', 13, 11, 11, 'x', 13] }], "C#": [{ frets: ['x', 4, 3, 3, 'x', 2] }, { frets: ['x', 'x', 11, 11, 11, 13] }], "F": [null, { frets: ['x', 8, 8, 6, 7, 'x'] }] },
  "Gmaj7": { "B": [{ frets: ['x', 2, 0, 0, 'x', 2] }, { frets: ['x', 14, 12, 11, 'x', 15] }], "D": [{ frets: ['x', 5, 4, 4, 'x', 3] }, { frets: ['x', 'x', 12, 11, 12, 15] }], "F#": [null, { frets: ['x', 9, 9, 7, 8, 'x'] }] },
  "G#maj7": { "C": [{ frets: ['x', 3, 1, 1, 'x', 3] }, { frets: ['x', 'x', 10, 12, 9, 11] }], "D#": [{ frets: ['x', 6, 5, 5, 'x', 4] }, null], "G": [null, { frets: ['x', 10, 10, 8, 9, 'x'] }] },
  "Abmaj7": { "C": [{ frets: ['x', 3, 1, 1, 'x', 3] }, { frets: ['x', 'x', 10, 12, 9, 11] }], "D#": [{ frets: ['x', 6, 5, 5, 'x', 4] }, null], "G": [null, { frets: ['x', 10, 10, 8, 9, 'x'] }] },
  "Amaj7": { "C#": [{ frets: ['x', 4, 2, 2, 'x', 4] }, { frets: ['x', 'x', 11, 13, 10, 12] }], "G#": [null, { frets: ['x', 11, 11, 9, 10, 'x'] }] },
  "A#maj7": { "D": [{ frets: ['x', 5, 3, 3, 'x', 5] }, { frets: ['x', 'x', 12, 14, 11, 13] }], "F": [null, { frets: ['x', 8, 7, 7, 'x', 6] }], "A": [{ frets: ['x', 0, 3, 3, 3, 'x'] }, { frets: ['x', 12, 12, 10, 11, 'x'] }] },
  "Bbmaj7": { "D": [{ frets: ['x', 5, 3, 3, 'x', 5] }, { frets: ['x', 'x', 12, 14, 11, 13] }], "F": [null, { frets: ['x', 8, 7, 7, 'x', 6] }], "A": [{ frets: ['x', 0, 3, 3, 3, 'x'] }, { frets: ['x', 12, 12, 10, 11, 'x'] }] },
  "Bmaj7": { "D#": [{ frets: ['x', 6, 4, 4, 'x', 6] }, null], "F#": [null, { frets: ['x', 9, 8, 8, 'x', 7] }], "A#": [{ frets: ['x', 1, 1, 'x', 0, 2] }, { frets: ['x', 13, 13, 11, 12, 'x'] }] },
  // ---- m7 ----
  "Cm7": { "D#": [{ frets: ['x', 'x', 1, 3, 1, 3] }, null], "G": [null, { frets: [15, 15, 13, 'x', 11, 'x'] }], "A#": [{ frets: ['x', 1, 1, 0, 1, 'x'] }, { frets: ['x', 13, 'x', 12, 13, 11] }] },
  "C#m7": { "E": [{ frets: [0, 2, 'x', 1, 2, 'x'] }, null], "G#": [null, { frets: ['x', 11, 9, 9, 'x', 9] }], "B": [{ frets: ['x', 2, 2, 1, 2, 'x'] }, { frets: ['x', 14, 11, 13, 'x', 12] }] },
  "Dbm7": { "E": [{ frets: [0, 2, 'x', 1, 2, 'x'] }, null], "G#": [null, { frets: ['x', 11, 9, 9, 'x', 9] }], "B": [{ frets: ['x', 2, 2, 1, 2, 'x'] }, { frets: ['x', 14, 11, 13, 'x', 12] }] },
  "Dm7": { "F": [null, { frets: [13, 12, 10, 'x', 'x', 10] }], "A": [{ frets: ['x', 0, 0, 'x', 1, 1] }, { frets: ['x', 12, 10, 10, 'x', 10] }], "C": [{ frets: ['x', 3, 3, 2, 3, 'x'] }, null] },
  "D#m7": { "F#": [null, { frets: [14, 13, 11, 'x', 'x', 11] }], "A#": [{ frets: ['x', 1, 1, 'x', 2, 2] }, { frets: ['x', 13, 11, 11, 'x', 11] }], "C#": [{ frets: ['x', 4, 4, 3, 4, 'x'] }, null] },
  "Ebm7": { "F#": [null, { frets: [14, 13, 11, 'x', 'x', 11] }], "A#": [{ frets: ['x', 1, 1, 'x', 2, 2] }, { frets: ['x', 13, 11, 11, 'x', 11] }], "C#": [{ frets: ['x', 4, 4, 3, 4, 'x'] }, null] },
  "Em7": { "G": [null, { frets: ['x', 10, 9, 9, 'x', 10] }], "B": [{ frets: ['x', 2, 0, 0, 'x', 0] }, { frets: ['x', 14, 14, 12, 'x', 10] }], "D": [null, { frets: ['x', 5, 5, 4, 5, 'x'] }] },
  "Fm7": { "G#": [null, { frets: ['x', 11, 10, 10, 'x', 11] }], "C": [{ frets: ['x', 3, 1, 1, 'x', 1] }, { frets: ['x', 15, 15, 13, 'x', 11] }], "D#": [null, { frets: ['x', 6, 6, 5, 6, 'x'] }] },
  "F#m7": { "A": [{ frets: ['x', 0, 2, 'x', 2, 2] }, { frets: ['x', 12, 11, 11, 'x', 12] }], "C#": [{ frets: ['x', 4, 2, 2, 'x', 2] }, { frets: ['x', 'x', 11, 11, 10, 12] }], "E": [{ frets: [0, 0, 'x', 'x', 2, 2] }, { frets: ['x', 7, 7, 6, 7, 'x'] }] },
  "Gbm7": { "A": [{ frets: ['x', 0, 2, 'x', 2, 2] }, { frets: ['x', 12, 11, 11, 'x', 12] }], "C#": [{ frets: ['x', 4, 2, 2, 'x', 2] }, { frets: ['x', 'x', 11, 11, 10, 12] }], "E": [{ frets: [0, 0, 'x', 'x', 2, 2] }, { frets: ['x', 7, 7, 6, 7, 'x'] }] },
  "Gm7": { "A#": [{ frets: ['x', 1, 0, 0, 'x', 1] }, { frets: ['x', 'x', 8, 10, 8, 10] }], "D": [{ frets: ['x', 5, 3, 3, 'x', 3] }, { frets: ['x', 'x', 12, 12, 11, 13] }], "F": [{ frets: [1, 1, 0, 0, 'x', 'x'] }, { frets: ['x', 8, 8, 7, 8, 'x'] }] },
  "G#m7": { "B": [{ frets: ['x', 2, 1, 1, 'x', 2] }, { frets: ['x', 'x', 9, 11, 9, 11] }], "D#": [{ frets: ['x', 'x', 1, 1, 0, 2] }, null], "F#": [{ frets: [2, 2, 1, 1, 'x', 'x'] }, { frets: ['x', 9, 9, 8, 9, 'x'] }] },
  "Abm7": { "B": [{ frets: ['x', 2, 1, 1, 'x', 2] }, { frets: ['x', 'x', 9, 11, 9, 11] }], "D#": [{ frets: ['x', 'x', 1, 1, 0, 2] }, null], "F#": [{ frets: [2, 2, 1, 1, 'x', 'x'] }, { frets: ['x', 9, 9, 8, 9, 'x'] }] },
  "Am7": { "C": [{ frets: ['x', 3, 2, 2, 'x', 3] }, { frets: ['x', 'x', 10, 12, 10, 12] }], "E": [null, { frets: [12, 12, 10, 12, 'x', 'x'] }], "G": [{ frets: [3, 3, 2, 2, 'x', 'x'] }, { frets: ['x', 10, 10, 9, 10, 'x'] }] },
  "A#m7": { "C#": [{ frets: ['x', 4, 3, 3, 'x', 4] }, { frets: ['x', 'x', 11, 13, 11, 13] }], "F": [null, { frets: [13, 13, 11, 13, 'x', 'x'] }], "G#": [{ frets: [4, 4, 3, 3, 'x', 'x'] }, { frets: ['x', 11, 11, 10, 11, 'x'] }] },
  "Bbm7": { "C#": [{ frets: ['x', 4, 3, 3, 'x', 4] }, { frets: ['x', 'x', 11, 13, 11, 13] }], "F": [null, { frets: [13, 13, 11, 13, 'x', 'x'] }], "G#": [{ frets: [4, 4, 3, 3, 'x', 'x'] }, { frets: ['x', 11, 11, 10, 11, 'x'] }] },
  "Bm7": { "D": [{ frets: ['x', 'x', 0, 2, 0, 2] }, null], "F#": [null, { frets: [14, 14, 12, 'x', 10, 'x'] }], "A": [{ frets: ['x', 0, 0, 'x', 0, 2] }, { frets: ['x', 12, 12, 11, 12, 'x'] }] },
  // ---- m7b5 ----
  "Cm7b5": { "D#": [{ frets: ['x', 'x', 1, 3, 1, 2] }, null], "F#": [null, { frets: [14, 13, 'x', 'x', 13, 11] }], "A#": [null, { frets: ['x', 13, 13, 11, 13, 'x'] }] },
  "C#m7b5": { "E": [{ frets: [0, 2, 'x', 0, 2, 'x'] }, null], "G": [null, { frets: [15, 14, 11, 'x', 'x', 12] }], "B": [null, { frets: ['x', 14, 11, 12, 'x', 12] }] },
  "Dbm7b5": { "E": [{ frets: [0, 2, 'x', 0, 2, 'x'] }, null], "G": [null, { frets: [15, 14, 11, 'x', 'x', 12] }], "B": [null, { frets: ['x', 14, 11, 12, 'x', 12] }] },
  "Dm7b5": { "F": [null, { frets: [13, 11, 12, 'x', 13, 'x'] }], "G#": [null, { frets: ['x', 11, 10, 10, 'x', 10] }], "C": [null, { frets: [8, 8, 'x', 7, 9, 'x'] }] },
  "D#m7b5": { "F#": [null, { frets: [14, 12, 11, 'x', 'x', 11] }], "A": [{ frets: ['x', 0, 1, 'x', 2, 2] }, { frets: ['x', 12, 11, 11, 'x', 11] }], "C#": [null, { frets: [9, 9, 'x', 8, 10, 'x'] }] },
  "Ebm7b5": { "F#": [null, { frets: [14, 12, 11, 'x', 'x', 11] }], "A": [{ frets: ['x', 0, 1, 'x', 2, 2] }, { frets: ['x', 12, 11, 11, 'x', 11] }], "C#": [null, { frets: [9, 9, 'x', 8, 10, 'x'] }] },
  "Em7b5": { "G": [null, { frets: [15, 'x', 12, 'x', 11, 12] }], "A#": [{ frets: ['x', 1, 0, 0, 'x', 0] }, { frets: ['x', 13, 14, 12, 'x', 10] }], "D": [null, { frets: [10, 10, 'x', 9, 11, 'x'] }] },
  "Fm7b5": { "G#": [null, { frets: ['x', 11, 9, 10, 'x', 11] }], "B": [{ frets: ['x', 2, 1, 1, 'x', 1] }, { frets: ['x', 14, 15, 13, 'x', 11] }], "D#": [{ frets: ['x', 'x', 1, 1, 0, 1] }, { frets: [11, 11, 'x', 10, 12, 'x'] }] },
  "F#m7b5": { "A": [{ frets: ['x', 0, 2, 'x', 1, 2] }, { frets: ['x', 12, 10, 11, 'x', 12] }], "C": [{ frets: ['x', 3, 2, 2, 'x', 2] }, { frets: ['x', 'x', 10, 11, 10, 12] }], "E": [{ frets: [0, 0, 'x', 'x', 1, 2] }, { frets: [12, 12, 'x', 11, 13, 'x'] }] },
  "Gbm7b5": { "A": [{ frets: ['x', 0, 2, 'x', 1, 2] }, { frets: ['x', 12, 10, 11, 'x', 12] }], "C": [{ frets: ['x', 3, 2, 2, 'x', 2] }, { frets: ['x', 'x', 10, 11, 10, 12] }], "E": [{ frets: [0, 0, 'x', 'x', 1, 2] }, { frets: [12, 12, 'x', 11, 13, 'x'] }] },
  "Gm7b5": { "A#": [{ frets: ['x', 1, 'x', 0, 2, 1] }, { frets: ['x', 13, 11, 12, 'x', 13] }], "C#": [{ frets: ['x', 4, 3, 3, 'x', 3] }, { frets: ['x', 'x', 11, 12, 11, 13] }], "F": [{ frets: [1, 1, 'x', 0, 2, 'x'] }, { frets: [13, 13, 11, 12, 'x', 'x'] }] },
  "G#m7b5": { "B": [{ frets: ['x', 2, 0, 1, 'x', 2] }, { frets: ['x', 'x', 9, 11, 9, 10] }], "D": [{ frets: ['x', 'x', 0, 1, 0, 2] }, null], "F#": [{ frets: [2, 2, 0, 1, 'x', 'x'] }, { frets: [14, 11, 12, 'x', 12, 'x'] }] },
  "Abm7b5": { "B": [{ frets: ['x', 2, 0, 1, 'x', 2] }, { frets: ['x', 'x', 9, 11, 9, 10] }], "D": [{ frets: ['x', 'x', 0, 1, 0, 2] }, null], "F#": [{ frets: [2, 2, 0, 1, 'x', 'x'] }, { frets: [14, 11, 12, 'x', 12, 'x'] }] },
  "Am7b5": { "C": [{ frets: ['x', 3, 1, 2, 'x', 3] }, { frets: ['x', 'x', 10, 12, 10, 11] }], "D#": [{ frets: ['x', 'x', 1, 2, 1, 3] }, null], "G": [{ frets: [3, 3, 1, 2, 'x', 'x'] }, { frets: [15, 15, 'x', 14, 'x', 11] }] },
  "A#m7b5": { "C#": [{ frets: ['x', 4, 2, 3, 'x', 4] }, { frets: ['x', 'x', 11, 13, 11, 12] }], "E": [{ frets: [0, 1, 'x', 1, 2, 'x'] }, null], "G#": [{ frets: [4, 4, 2, 3, 'x', 'x'] }, null] },
  "Bbm7b5": { "C#": [{ frets: ['x', 4, 2, 3, 'x', 4] }, { frets: ['x', 'x', 11, 13, 11, 12] }], "E": [{ frets: [0, 1, 'x', 1, 2, 'x'] }, null], "G#": [{ frets: [4, 4, 2, 3, 'x', 'x'] }, null] },
  "Bm7b5": { "D": [{ frets: ['x', 'x', 0, 2, 0, 1] }, null], "F": [null, { frets: [13, 12, 'x', 'x', 12, 10] }], "A": [null, { frets: ['x', 12, 12, 10, 12, 'x'] }] },
  // ---- add9 ----
  "Cadd9": { "E": [null, { frets: ['x', 'x', 14, 12, 13, 10] }], "G": [null, { frets: ['x', 10, 10, 9, 'x', 10] }], "D": [{ frets: ['x', 'x', 0, 0, 1, 0] }, { frets: [10, 10, 10, 'x', 'x', 12] }] },
  "C#add9": { "F": [null, { frets: ['x', 'x', 15, 13, 14, 11] }], "G#": [null, { frets: ['x', 11, 11, 10, 'x', 11] }], "D#": [{ frets: ['x', 'x', 1, 1, 2, 1] }, { frets: [11, 11, 11, 'x', 'x', 13] }] },
  "Dbadd9": { "F": [null, { frets: ['x', 'x', 15, 13, 14, 11] }], "G#": [null, { frets: ['x', 11, 11, 10, 'x', 11] }], "D#": [{ frets: ['x', 'x', 1, 1, 2, 1] }, { frets: [11, 11, 11, 'x', 'x', 13] }] },
  "Dadd9": { "F#": [null, { frets: [14, 12, 14, 'x', 'x', 10] }], "A": [{ frets: ['x', 0, 2, 'x', 3, 2] }, { frets: ['x', 12, 12, 11, 'x', 12] }], "E": [{ frets: [0, 0, 0, 'x', 'x', 2] }, { frets: [12, 12, 12, 11, 'x', 'x'] }] },
  "D#add9": { "G": [null, { frets: [15, 13, 15, 'x', 'x', 11] }], "A#": [{ frets: ['x', 1, 1, 0, 'x', 1] }, { frets: ['x', 13, 15, 12, 'x', 11] }], "F": [{ frets: [1, 1, 1, 0, 'x', 'x'] }, { frets: [13, 13, 'x', 12, 'x', 11] }] },
  "Ebadd9": { "G": [null, { frets: [15, 13, 15, 'x', 'x', 11] }], "A#": [{ frets: ['x', 1, 1, 0, 'x', 1] }, { frets: ['x', 13, 15, 12, 'x', 11] }], "F": [{ frets: [1, 1, 1, 0, 'x', 'x'] }, { frets: [13, 13, 'x', 12, 'x', 11] }] },
  "Eadd9": { "G#": [null, { frets: ['x', 11, 'x', 11, 12, 12] }], "B": [{ frets: ['x', 2, 2, 1, 'x', 2] }, { frets: ['x', 'x', 9, 11, 9, 12] }], "F#": [{ frets: [2, 2, 2, 1, 'x', 'x'] }, { frets: [14, 11, 14, 'x', 12, 'x'] }] },
  "Fadd9": { "A": [{ frets: ['x', 0, 'x', 0, 1, 1] }, { frets: ['x', 12, 10, 12, 'x', 13] }], "C": [{ frets: ['x', 3, 3, 2, 'x', 3] }, { frets: ['x', 'x', 10, 12, 10, 13] }], "G": [{ frets: [3, 3, 3, 2, 'x', 'x'] }, null] },
  "F#add9": { "A#": [{ frets: ['x', 1, 'x', 1, 2, 2] }, { frets: ['x', 13, 11, 13, 'x', 14] }], "C#": [{ frets: ['x', 4, 4, 3, 'x', 4] }, { frets: ['x', 'x', 11, 13, 11, 14] }], "G#": [{ frets: [4, 4, 4, 3, 'x', 'x'] }, null] },
  "Gbadd9": { "A#": [{ frets: ['x', 1, 'x', 1, 2, 2] }, { frets: ['x', 13, 11, 13, 'x', 14] }], "C#": [{ frets: ['x', 4, 4, 3, 'x', 4] }, { frets: ['x', 'x', 11, 13, 11, 14] }], "G#": [{ frets: [4, 4, 4, 3, 'x', 'x'] }, null] },
  "Gadd9": { "B": [{ frets: ['x', 2, 'x', 2, 3, 3] }, { frets: ['x', 14, 12, 12, 10, 'x'] }], "D": [{ frets: ['x', 5, 5, 4, 'x', 5] }, null], "A": [null, { frets: ['x', 12, 'x', 12, 12, 10] }] },
  "G#add9": { "C": [{ frets: ['x', 3, 'x', 3, 4, 4] }, { frets: ['x', 15, 13, 13, 11, 'x'] }], "D#": [{ frets: ['x', 6, 6, 5, 'x', 6] }, null], "A#": [null, { frets: ['x', 13, 'x', 13, 13, 11] }] },
  "Abadd9": { "C": [{ frets: ['x', 3, 'x', 3, 4, 4] }, { frets: ['x', 15, 13, 13, 11, 'x'] }], "D#": [{ frets: ['x', 6, 6, 5, 'x', 6] }, null], "A#": [null, { frets: ['x', 13, 'x', 13, 13, 11] }] },
  "Aadd9": { "C#": [{ frets: ['x', 4, 'x', 4, 5, 5] }, { frets: ['x', 'x', 11, 9, 10, 7] }], "E": [{ frets: ['x', 7, 7, 6, 'x', 7] }, null], "B": [null, { frets: ['x', 14, 11, 14, 'x', 12] }] },
  "A#add9": { "D": [{ frets: ['x', 'x', 0, 3, 1, 1] }, { frets: ['x', 'x', 12, 10, 11, 8] }], "F": [null, { frets: ['x', 8, 8, 7, 'x', 8] }], "C": [null, { frets: [8, 8, 8, 'x', 'x', 10] }] },
  "Bbadd9": { "D": [{ frets: ['x', 'x', 0, 3, 1, 1] }, { frets: ['x', 'x', 12, 10, 11, 8] }], "F": [null, { frets: ['x', 8, 8, 7, 'x', 8] }], "C": [null, { frets: [8, 8, 8, 'x', 'x', 10] }] },
  "Badd9": { "D#": [{ frets: ['x', 'x', 1, 4, 2, 2] }, { frets: ['x', 'x', 13, 11, 12, 9] }], "F#": [null, { frets: ['x', 9, 9, 8, 'x', 9] }], "C#": [null, { frets: [9, 9, 9, 'x', 'x', 11] }] },
}
