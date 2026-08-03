// Two alternate CAGED-style neck positions for every chord in GUITAR_SHAPES,
// on top of whatever position is already there (position 1, unchanged). Like
// the inversion shapes in guitarInversions.js, these are derived, not
// hand-curated: for each of the 12 chord types, a search over every string
// subset + per-string scale-degree assignment found every moveable "family"
// that stays playable (fret span <= 4) across all 12 possible roots, ranked
// by where that family naturally sits when the root is C. Two default
// families are picked per chord type this way -- a lower-sitting one and a
// higher-sitting one, several frets apart -- so they span two different
// regions of the neck (an "E/A-shape"-style lower family and a "D/C/G-
// shape"-style higher one, in CAGED terms) rather than two adjacent
// fingerings of the same family. Every family keeps the chord's own root as
// the lowest sounding string, same as every shape already in GUITAR_SHAPES.
//
// Naturals get bespoke, non-transposable position-1 fingerings (open
// chords), so the two type-level defaults land at different ABSOLUTE frets
// for every root, unpredictably relative to each root's own position-1
// shape -- sometimes coinciding with it. So each chord independently
// re-solves its position from the full ranked family pool (trying its
// type's default family first, falling back to the next-best one in the
// pool) to guarantee position 2 is genuinely BELOW and position 3 is
// genuinely ABOVE that specific chord's own position-1 fret -- never just
// "a different family that happens to land nearby."
//
// Format: GUITAR_ALT_POSITIONS[dataKey] = [position2 | null, position3 | null].
// A null means no fingering exists on the required side of that chord's own
// position-1 fret (checked against every family in the shared pool, AND,
// as a final fallback, every possible string-set/finger-assignment for that
// chord type at that specific root, not just the shared pool) -- flagged
// and skipped rather than guessed, per Session 26/27's discipline.
//
// 174 of 408 attempted (chord x new position) combinations were
// skipped, ALL of them position 2 (the "lower" slot) -- position 3 (higher)
// succeeded for all 204 chords. Every position-2 skip is a genuine, verified
// structural floor: that chord's existing position-1 shape (already chosen,
// in earlier sessions, to be the E-shape/A-shape landing on the LOWEST
// available fret, or -- for naturals -- an actual open chord) is already at
// or within a semitone or two of the lowest fret any valid fingering for
// that chord type can reach in standard tuning; nothing can legally go
// lower than fret 0. Skipped: 174 position-2 combinations across these chords:
//   C major, C# major, Db major, D major, E major, F major, F# major, Gb major, G major, G# major, Ab major, A major, A# major, Bb major, B major, C minor, C# minor, Db minor, D minor, E minor, F minor, F# minor, Gb minor, G minor, G# minor, Ab minor, A minor, A# minor, Bb minor, B minor, C7, C#7, Db7, D7, E7, F7, F#7, Gb7, G7, G#7, Ab7, A7, A#7, Bb7, B7, Cmaj7, C#maj7, Dbmaj7, Dmaj7, Emaj7, F#maj7, Gbmaj7, Gmaj7, G#maj7, Abmaj7, Amaj7, A#maj7, Bbmaj7, Bmaj7, Cm7, C#m7, Dbm7, Dm7, Em7, Fm7, F#m7, Gbm7, Gm7, G#m7, Abm7, Am7, A#m7, Bbm7, Bm7, Cm7b5, C#m7b5, Dbm7b5, Em7b5, Fm7b5, F#m7b5, Gbm7b5, Gm7b5, G#m7b5, Abm7b5, Am7b5, A#m7b5, Bbm7b5, Bm7b5, Cadd9, C#add9, Dbadd9, Dadd9, D#add9, Ebadd9, Eadd9, F#add9, Gbadd9, Gadd9, G#add9, Abadd9, Aadd9, A#add9, Bbadd9, Badd9, Csus2, C#sus2, Dbsus2, Dsus2, Esus2, F#sus2, Gbsus2, Gsus2, G#sus2, Absus2, Asus2, A#sus2, Bbsus2, Bsus2, Csus4, C#sus4, Dbsus4, Dsus4, Esus4, F#sus4, Gbsus4, Gsus4, G#sus4, Absus4, Asus4, A#sus4, Bbsus4, Bsus4, C diminished, C# diminished, Db diminished, E diminished, F diminished, F# diminished, Gb diminished, G diminished, G# diminished, Ab diminished, A diminished, A# diminished, Bb diminished, B diminished, C augmented, C# augmented, Db augmented, E augmented, F augmented, F# augmented, Gb augmented, G augmented, A augmented, A# augmented, Bb augmented, B augmented, Cdim7, C#dim7, Dbdim7, D#dim7, Ebdim7, Edim7, Fdim7, F#dim7, Gbdim7, Gdim7, G#dim7, Abdim7, Adim7, A#dim7, Bbdim7, Bdim7

//
// Every one of the 234 generated shapes was verified programmatically:
// its sounded pitch classes exactly match the chord's real CHORD_DATA tones
// (no omissions, no extras), its lowest-pitched played string is genuinely
// the chord's root, and its neck position is genuinely lower (position 2) or
// higher (position 3) than that specific chord's existing position-1 shape.

export const GUITAR_ALT_POSITIONS = {
  // ---- major ----
  "C major": [null, { frets: [8, 'x', 'x', 9, 8, 'x'] }],
  "C# major": [null, { frets: [9, 'x', 'x', 10, 9, 'x'] }],
  "Db major": [null, { frets: [9, 'x', 'x', 10, 9, 'x'] }],
  "D major": [null, { frets: [10, 'x', 'x', 11, 10, 'x'] }],
  "D# major": [{ frets: ['x', 'x', 1, 3, 'x', 3] }, { frets: [11, 'x', 'x', 12, 11, 'x'] }],
  "Eb major": [{ frets: ['x', 'x', 1, 3, 'x', 3] }, { frets: [11, 'x', 'x', 12, 11, 'x'] }],
  "E major": [null, { frets: ['x', 'x', 'x', 9, 9, 7] }],
  "F major": [null, { frets: ['x', 'x', 'x', 10, 10, 8] }],
  "F# major": [null, { frets: ['x', 'x', 'x', 11, 11, 9] }],
  "Gb major": [null, { frets: ['x', 'x', 'x', 11, 11, 9] }],
  "G major": [null, { frets: ['x', 'x', 'x', 12, 12, 10] }],
  "G# major": [null, { frets: ['x', 'x', 'x', 13, 13, 11] }],
  "Ab major": [null, { frets: ['x', 'x', 'x', 13, 13, 11] }],
  "A major": [null, { frets: ['x', 12, 11, 'x', 'x', 12] }],
  "A# major": [null, { frets: ['x', 13, 12, 10, 'x', 'x'] }],
  "Bb major": [null, { frets: ['x', 13, 12, 10, 'x', 'x'] }],
  "B major": [null, { frets: ['x', 14, 13, 11, 'x', 'x'] }],
  // ---- minor ----
  "C minor": [null, { frets: [8, 10, 'x', 8, 'x', 'x'] }],
  "C# minor": [null, { frets: [9, 11, 'x', 9, 'x', 'x'] }],
  "Db minor": [null, { frets: [9, 11, 'x', 9, 'x', 'x'] }],
  "D minor": [null, { frets: [10, 12, 'x', 10, 'x', 'x'] }],
  "D# minor": [{ frets: ['x', 'x', 1, 3, 'x', 2] }, { frets: [11, 13, 'x', 11, 'x', 'x'] }],
  "Eb minor": [{ frets: ['x', 'x', 1, 3, 'x', 2] }, { frets: [11, 13, 'x', 11, 'x', 'x'] }],
  "E minor": [null, { frets: ['x', 'x', 'x', 9, 8, 7] }],
  "F minor": [null, { frets: ['x', 'x', 'x', 10, 9, 8] }],
  "F# minor": [null, { frets: ['x', 'x', 'x', 11, 10, 9] }],
  "Gb minor": [null, { frets: ['x', 'x', 'x', 11, 10, 9] }],
  "G minor": [null, { frets: ['x', 'x', 'x', 12, 11, 10] }],
  "G# minor": [null, { frets: ['x', 'x', 'x', 13, 12, 11] }],
  "Ab minor": [null, { frets: ['x', 'x', 'x', 13, 12, 11] }],
  "A minor": [null, { frets: ['x', 12, 10, 'x', 'x', 12] }],
  "A# minor": [null, { frets: ['x', 13, 11, 'x', 'x', 13] }],
  "Bb minor": [null, { frets: ['x', 13, 11, 'x', 'x', 13] }],
  "B minor": [null, { frets: ['x', 14, 12, 11, 'x', 'x'] }],
  // ---- dom7 ----
  "C7": [null, { frets: [8, 'x', 8, 9, 8, 'x'] }],
  "C#7": [null, { frets: [9, 'x', 9, 10, 9, 'x'] }],
  "Db7": [null, { frets: [9, 'x', 9, 10, 9, 'x'] }],
  "D7": [null, { frets: [10, 'x', 10, 11, 10, 'x'] }],
  "D#7": [{ frets: ['x', 'x', 1, 3, 2, 3] }, { frets: [11, 'x', 11, 12, 11, 'x'] }],
  "Eb7": [{ frets: ['x', 'x', 1, 3, 2, 3] }, { frets: [11, 'x', 11, 12, 11, 'x'] }],
  "E7": [null, { frets: [12, 11, 12, 'x', 12, 'x'] }],
  "F7": [null, { frets: [13, 12, 'x', 'x', 13, 11] }],
  "F#7": [null, { frets: [14, 13, 11, 'x', 'x', 12] }],
  "Gb7": [null, { frets: [14, 13, 11, 'x', 'x', 12] }],
  "G7": [null, { frets: ['x', 10, 9, 10, 'x', 10] }],
  "G#7": [null, { frets: ['x', 11, 10, 11, 'x', 11] }],
  "Ab7": [null, { frets: ['x', 11, 10, 11, 'x', 11] }],
  "A7": [null, { frets: ['x', 12, 11, 12, 'x', 12] }],
  "A#7": [null, { frets: [6, 'x', 6, 7, 6, 'x'] }],
  "Bb7": [null, { frets: [6, 'x', 6, 7, 6, 'x'] }],
  "B7": [null, { frets: [7, 'x', 7, 8, 7, 'x'] }],
  // ---- maj7 ----
  "Cmaj7": [null, { frets: [8, 'x', 9, 9, 8, 'x'] }],
  "C#maj7": [null, { frets: [9, 'x', 10, 10, 9, 'x'] }],
  "Dbmaj7": [null, { frets: [9, 'x', 10, 10, 9, 'x'] }],
  "Dmaj7": [null, { frets: [10, 'x', 11, 11, 10, 'x'] }],
  "D#maj7": [{ frets: ['x', 'x', 1, 3, 3, 3] }, { frets: [11, 'x', 12, 12, 11, 'x'] }],
  "Ebmaj7": [{ frets: ['x', 'x', 1, 3, 3, 3] }, { frets: [11, 'x', 12, 12, 11, 'x'] }],
  "Emaj7": [null, { frets: ['x', 7, 6, 4, 4, 'x'] }],
  "Fmaj7": [{ frets: [1, 0, 'x', 'x', 1, 0] }, { frets: ['x', 8, 7, 5, 5, 'x'] }],
  "F#maj7": [null, { frets: ['x', 9, 8, 6, 6, 'x'] }],
  "Gbmaj7": [null, { frets: ['x', 9, 8, 6, 6, 'x'] }],
  "Gmaj7": [null, { frets: ['x', 10, 9, 7, 7, 'x'] }],
  "G#maj7": [null, { frets: ['x', 11, 10, 8, 8, 'x'] }],
  "Abmaj7": [null, { frets: ['x', 11, 10, 8, 8, 'x'] }],
  "Amaj7": [null, { frets: ['x', 12, 11, 9, 9, 'x'] }],
  "A#maj7": [null, { frets: ['x', 13, 12, 10, 10, 'x'] }],
  "Bbmaj7": [null, { frets: ['x', 13, 12, 10, 10, 'x'] }],
  "Bmaj7": [null, { frets: ['x', 14, 13, 11, 11, 'x'] }],
  // ---- m7 ----
  "Cm7": [null, { frets: [8, 10, 8, 8, 'x', 'x'] }],
  "C#m7": [null, { frets: [9, 11, 9, 9, 'x', 'x'] }],
  "Dbm7": [null, { frets: [9, 11, 9, 9, 'x', 'x'] }],
  "Dm7": [null, { frets: [10, 12, 10, 10, 'x', 'x'] }],
  "D#m7": [{ frets: ['x', 'x', 1, 3, 2, 2] }, { frets: [11, 13, 11, 11, 'x', 'x'] }],
  "Ebm7": [{ frets: ['x', 'x', 1, 3, 2, 2] }, { frets: [11, 13, 11, 11, 'x', 'x'] }],
  "Em7": [null, { frets: [12, 10, 12, 'x', 12, 'x'] }],
  "Fm7": [null, { frets: [13, 11, 13, 'x', 13, 'x'] }],
  "F#m7": [null, { frets: [14, 12, 11, 'x', 'x', 12] }],
  "Gbm7": [null, { frets: [14, 12, 11, 'x', 'x', 12] }],
  "Gm7": [null, { frets: [15, 'x', 12, 'x', 11, 13] }],
  "G#m7": [null, { frets: ['x', 11, 9, 11, 'x', 11] }],
  "Abm7": [null, { frets: ['x', 11, 9, 11, 'x', 11] }],
  "Am7": [null, { frets: ['x', 12, 10, 12, 'x', 12] }],
  "A#m7": [null, { frets: ['x', 13, 11, 13, 'x', 13] }],
  "Bbm7": [null, { frets: ['x', 13, 11, 13, 'x', 13] }],
  "Bm7": [null, { frets: [7, 9, 7, 7, 'x', 'x'] }],
  // ---- m7b5 ----
  "Cm7b5": [null, { frets: [8, 9, 8, 8, 'x', 'x'] }],
  "C#m7b5": [null, { frets: [9, 10, 9, 9, 'x', 'x'] }],
  "Dbm7b5": [null, { frets: [9, 10, 9, 9, 'x', 'x'] }],
  "Dm7b5": [{ frets: ['x', 'x', 0, 1, 1, 1] }, { frets: [10, 11, 10, 10, 'x', 'x'] }],
  "D#m7b5": [{ frets: ['x', 'x', 1, 2, 2, 2] }, { frets: [11, 12, 11, 11, 'x', 'x'] }],
  "Ebm7b5": [{ frets: ['x', 'x', 1, 2, 2, 2] }, { frets: [11, 12, 11, 11, 'x', 'x'] }],
  "Em7b5": [null, { frets: [12, 'x', 12, 12, 11, 'x'] }],
  "Fm7b5": [null, { frets: [13, 11, 13, 'x', 12, 'x'] }],
  "F#m7b5": [null, { frets: [14, 12, 10, 'x', 'x', 12] }],
  "Gbm7b5": [null, { frets: [14, 12, 10, 'x', 'x', 12] }],
  "Gm7b5": [null, { frets: [15, 13, 11, 'x', 'x', 13] }],
  "G#m7b5": [null, { frets: ['x', 11, 9, 11, 'x', 10] }],
  "Abm7b5": [null, { frets: ['x', 11, 9, 11, 'x', 10] }],
  "Am7b5": [null, { frets: ['x', 12, 10, 12, 'x', 11] }],
  "A#m7b5": [null, { frets: ['x', 13, 11, 13, 'x', 12] }],
  "Bbm7b5": [null, { frets: ['x', 13, 11, 13, 'x', 12] }],
  "Bm7b5": [null, { frets: [7, 8, 7, 7, 'x', 'x'] }],
  // ---- add9 ----
  "Cadd9": [null, { frets: [8, 5, 5, 9, 'x', 'x'] }],
  "C#add9": [null, { frets: [9, 6, 6, 10, 'x', 'x'] }],
  "Dbadd9": [null, { frets: [9, 6, 6, 10, 'x', 'x'] }],
  "Dadd9": [null, { frets: [10, 7, 7, 11, 'x', 'x'] }],
  "D#add9": [null, { frets: [11, 8, 8, 12, 'x', 'x'] }],
  "Ebadd9": [null, { frets: [11, 8, 8, 12, 'x', 'x'] }],
  "Eadd9": [null, { frets: [12, 9, 9, 13, 'x', 'x'] }],
  "Fadd9": [{ frets: [1, 0, 'x', 0, 1, 'x'] }, { frets: [13, 10, 10, 14, 'x', 'x'] }],
  "F#add9": [null, { frets: [14, 11, 11, 15, 'x', 'x'] }],
  "Gbadd9": [null, { frets: [14, 11, 11, 15, 'x', 'x'] }],
  "Gadd9": [null, { frets: ['x', 10, 9, 'x', 10, 10] }],
  "G#add9": [null, { frets: ['x', 11, 10, 'x', 11, 11] }],
  "Abadd9": [null, { frets: ['x', 11, 10, 'x', 11, 11] }],
  "Aadd9": [null, { frets: ['x', 12, 11, 'x', 12, 12] }],
  "A#add9": [null, { frets: ['x', 13, 12, 10, 13, 'x'] }],
  "Bbadd9": [null, { frets: ['x', 13, 12, 10, 13, 'x'] }],
  "Badd9": [null, { frets: ['x', 14, 13, 11, 14, 'x'] }],
  // ---- sus2 ----
  "Csus2": [null, { frets: [8, 10, 'x', 'x', 'x', 10] }],
  "C#sus2": [null, { frets: [9, 11, 'x', 'x', 'x', 11] }],
  "Dbsus2": [null, { frets: [9, 11, 'x', 'x', 'x', 11] }],
  "Dsus2": [null, { frets: [10, 12, 'x', 'x', 'x', 12] }],
  "D#sus2": [{ frets: ['x', 'x', 1, 3, 'x', 1] }, { frets: [11, 13, 'x', 'x', 'x', 13] }],
  "Ebsus2": [{ frets: ['x', 'x', 1, 3, 'x', 1] }, { frets: [11, 13, 'x', 'x', 'x', 13] }],
  "Esus2": [null, { frets: ['x', 'x', 'x', 9, 7, 7] }],
  "Fsus2": [{ frets: [1, 'x', 'x', 0, 1, 'x'] }, { frets: ['x', 'x', 'x', 10, 8, 8] }],
  "F#sus2": [null, { frets: ['x', 'x', 'x', 11, 9, 9] }],
  "Gbsus2": [null, { frets: ['x', 'x', 'x', 11, 9, 9] }],
  "Gsus2": [null, { frets: ['x', 'x', 'x', 12, 10, 10] }],
  "G#sus2": [null, { frets: ['x', 'x', 'x', 13, 11, 11] }],
  "Absus2": [null, { frets: ['x', 'x', 'x', 13, 11, 11] }],
  "Asus2": [null, { frets: ['x', 12, 9, 9, 'x', 'x'] }],
  "A#sus2": [null, { frets: ['x', 13, 10, 10, 'x', 'x'] }],
  "Bbsus2": [null, { frets: ['x', 13, 10, 10, 'x', 'x'] }],
  "Bsus2": [null, { frets: ['x', 14, 11, 11, 'x', 'x'] }],
  // ---- sus4 ----
  "Csus4": [null, { frets: [8, 10, 'x', 10, 'x', 'x'] }],
  "C#sus4": [null, { frets: [9, 11, 'x', 11, 'x', 'x'] }],
  "Dbsus4": [null, { frets: [9, 11, 'x', 11, 'x', 'x'] }],
  "Dsus4": [null, { frets: [10, 12, 'x', 12, 'x', 'x'] }],
  "D#sus4": [{ frets: ['x', 'x', 1, 3, 'x', 4] }, { frets: [11, 13, 'x', 13, 'x', 'x'] }],
  "Ebsus4": [{ frets: ['x', 'x', 1, 3, 'x', 4] }, { frets: [11, 13, 'x', 13, 'x', 'x'] }],
  "Esus4": [null, { frets: ['x', 7, 7, 'x', 'x', 7], barre: { fret: 7, from: 1, to: 5 } }],
  "Fsus4": [{ frets: [1, 1, 'x', 'x', 1, 'x'], barre: { fret: 1, from: 0, to: 4 } }, { frets: ['x', 8, 8, 'x', 'x', 8], barre: { fret: 8, from: 1, to: 5 } }],
  "F#sus4": [null, { frets: ['x', 9, 9, 'x', 'x', 9], barre: { fret: 9, from: 1, to: 5 } }],
  "Gbsus4": [null, { frets: ['x', 9, 9, 'x', 'x', 9], barre: { fret: 9, from: 1, to: 5 } }],
  "Gsus4": [null, { frets: ['x', 10, 10, 'x', 'x', 10], barre: { fret: 10, from: 1, to: 5 } }],
  "G#sus4": [null, { frets: ['x', 11, 11, 'x', 'x', 11], barre: { fret: 11, from: 1, to: 5 } }],
  "Absus4": [null, { frets: ['x', 11, 11, 'x', 'x', 11], barre: { fret: 11, from: 1, to: 5 } }],
  "Asus4": [null, { frets: ['x', 12, 12, 9, 'x', 'x'] }],
  "A#sus4": [null, { frets: ['x', 13, 13, 10, 'x', 'x'] }],
  "Bbsus4": [null, { frets: ['x', 13, 13, 10, 'x', 'x'] }],
  "Bsus4": [null, { frets: ['x', 14, 14, 11, 'x', 'x'] }],
  // ---- diminished ----
  "C diminished": [null, { frets: [8, 9, 'x', 8, 'x', 'x'] }],
  "C# diminished": [null, { frets: [9, 10, 'x', 9, 'x', 'x'] }],
  "Db diminished": [null, { frets: [9, 10, 'x', 9, 'x', 'x'] }],
  "D diminished": [{ frets: ['x', 'x', 0, 1, 'x', 1] }, { frets: [10, 11, 'x', 10, 'x', 'x'] }],
  "D# diminished": [{ frets: ['x', 'x', 1, 2, 'x', 2] }, { frets: [11, 12, 'x', 11, 'x', 'x'] }],
  "Eb diminished": [{ frets: ['x', 'x', 1, 2, 'x', 2] }, { frets: [11, 12, 'x', 11, 'x', 'x'] }],
  "E diminished": [null, { frets: [12, 'x', 'x', 12, 11, 'x'] }],
  "F diminished": [null, { frets: [13, 11, 'x', 'x', 12, 'x'] }],
  "F# diminished": [null, { frets: [14, 12, 10, 'x', 'x', 'x'] }],
  "Gb diminished": [null, { frets: [14, 12, 10, 'x', 'x', 'x'] }],
  "G diminished": [null, { frets: [15, 13, 11, 'x', 'x', 'x'] }],
  "G# diminished": [null, { frets: ['x', 'x', 'x', 13, 12, 10] }],
  "Ab diminished": [null, { frets: ['x', 'x', 'x', 13, 12, 10] }],
  "A diminished": [null, { frets: ['x', 'x', 'x', 14, 13, 11] }],
  "A# diminished": [null, { frets: ['x', 13, 11, 'x', 'x', 12] }],
  "Bb diminished": [null, { frets: ['x', 13, 11, 'x', 'x', 12] }],
  "B diminished": [null, { frets: [7, 8, 'x', 7, 'x', 'x'] }],
  // ---- augmented ----
  "C augmented": [null, { frets: [8, 'x', 'x', 9, 9, 'x'] }],
  "C# augmented": [null, { frets: [9, 'x', 'x', 10, 10, 'x'] }],
  "Db augmented": [null, { frets: [9, 'x', 'x', 10, 10, 'x'] }],
  "D augmented": [{ frets: ['x', 'x', 0, 3, 'x', 2] }, { frets: [10, 'x', 'x', 11, 11, 'x'] }],
  "D# augmented": [{ frets: ['x', 'x', 1, 0, 0, 'x'] }, { frets: [11, 'x', 'x', 12, 12, 'x'] }],
  "Eb augmented": [{ frets: ['x', 'x', 1, 0, 0, 'x'] }, { frets: [11, 'x', 'x', 12, 12, 'x'] }],
  "E augmented": [null, { frets: ['x', 'x', 'x', 9, 9, 8] }],
  "F augmented": [null, { frets: ['x', 'x', 'x', 10, 10, 9] }],
  "F# augmented": [null, { frets: ['x', 'x', 'x', 11, 11, 10] }],
  "Gb augmented": [null, { frets: ['x', 'x', 'x', 11, 11, 10] }],
  "G augmented": [null, { frets: ['x', 'x', 'x', 12, 12, 11] }],
  "G# augmented": [{ frets: ['x', 'x', 'x', 1, 1, 0] }, { frets: ['x', 11, 10, 9, 'x', 'x'] }],
  "Ab augmented": [{ frets: ['x', 'x', 'x', 1, 1, 0] }, { frets: ['x', 11, 10, 9, 'x', 'x'] }],
  "A augmented": [null, { frets: ['x', 12, 11, 10, 'x', 'x'] }],
  "A# augmented": [null, { frets: ['x', 13, 12, 11, 'x', 'x'] }],
  "Bb augmented": [null, { frets: ['x', 13, 12, 11, 'x', 'x'] }],
  "B augmented": [null, { frets: ['x', 14, 'x', 12, 'x', 11] }],
  // ---- dim7 ----
  "Cdim7": [null, { frets: [8, 9, 7, 8, 'x', 'x'] }],
  "C#dim7": [null, { frets: [9, 10, 8, 9, 'x', 'x'] }],
  "Dbdim7": [null, { frets: [9, 10, 8, 9, 'x', 'x'] }],
  "Ddim7": [{ frets: ['x', 'x', 0, 1, 0, 1] }, { frets: [10, 11, 9, 10, 'x', 'x'] }],
  "D#dim7": [null, { frets: [11, 12, 10, 11, 'x', 'x'] }],
  "Ebdim7": [null, { frets: [11, 12, 10, 11, 'x', 'x'] }],
  "Edim7": [null, { frets: [12, 13, 11, 12, 'x', 'x'] }],
  "Fdim7": [null, { frets: [13, 11, 12, 'x', 12, 'x'] }],
  "F#dim7": [null, { frets: ['x', 9, 7, 8, 'x', 8] }],
  "Gbdim7": [null, { frets: ['x', 9, 7, 8, 'x', 8] }],
  "Gdim7": [null, { frets: ['x', 10, 8, 9, 'x', 9] }],
  "G#dim7": [null, { frets: ['x', 11, 9, 10, 'x', 10] }],
  "Abdim7": [null, { frets: ['x', 11, 9, 10, 'x', 10] }],
  "Adim7": [null, { frets: ['x', 12, 10, 11, 'x', 11] }],
  "A#dim7": [null, { frets: ['x', 13, 11, 12, 'x', 12] }],
  "Bbdim7": [null, { frets: ['x', 13, 11, 12, 'x', 12] }],
  "Bdim7": [null, { frets: [7, 8, 6, 7, 'x', 'x'] }],
}
