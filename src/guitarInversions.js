// Guitar shapes for TRUE chord inversions -- bass note = an existing chord
// tone (3rd/5th/7th/9th in the bass), never a foreign-bass slash chord.
// Every shape here was derived, not curated by hand: for each of the 23
// distinct (chord type, which-tone-is-in-the-bass) interval patterns that
// occur across the 9 eligible chord types (major, minor, sus2, sus4, 7,
// maj7, m7, m7b5, add9 -- the same set isSlashEligible allows; diminished,
// augmented, and dim7 are symmetric and excluded, same as the bass-note
// selector itself), a small search picked one moveable string-set +
// per-string scale-degree assignment ("shape family") that stays playable
// (max fret span <= 4 frets) across every one of the 12 possible bass
// pitch classes it'll ever be transposed to -- not just optimized for a
// single reference root. Each chord/bass-note combination then re-solves
// that same shape family for its own actual bass pitch class (picking
// the lowest-fret octave placement for each string that still keeps the
// bass note strictly the lowest-sounding pitch), rather than blindly
// shifting a fixed template by a constant -- blind shifting alone would
// have made "B in the bass" or "A#/Bb in the bass" chords systematically
// unplayable, when in fact those are common, ordinary inversions.
//
// Every one of the 388 shapes below was verified programmatically:
// its sounded pitch classes exactly match the chord's real tones (no
// omissions, no extras) and its lowest-pitched played string is genuinely
// the selected bass note. 3 combinations across all 391 attempted
// (chord x eligible in-chord bass note) had no valid fingering within a
// 4-fret span and a fret <= 12 (a generous but not unlimited neck range)
// for the single shape family assigned to their category, and are
// skipped rather than guessed:
//   - C#maj7 / bass F (maj7, 3 in bass)
//   - Dbmaj7 / bass F (maj7, 3 in bass)
//   - Amaj7 / bass E (maj7, 5 in bass)

export const GUITAR_INVERSION_SHAPES = {
  // ---- major ----
  "C major": { "E": { frets: [0, 'x', 'x', 0, 1, 'x'] }, "G": { frets: ['x', 'x', 5, 5, 5, 'x'], barre: { fret: 5, from: 2, to: 4 } } },
  "C# major": { "F": { frets: [1, 'x', 'x', 1, 2, 'x'] }, "G#": { frets: ['x', 'x', 6, 6, 6, 'x'], barre: { fret: 6, from: 2, to: 4 } } },
  "Db major": { "F": { frets: [1, 'x', 'x', 1, 2, 'x'] }, "G#": { frets: ['x', 'x', 6, 6, 6, 'x'], barre: { fret: 6, from: 2, to: 4 } } },
  "D major": { "F#": { frets: [2, 'x', 'x', 2, 3, 'x'] }, "A": { frets: ['x', 'x', 7, 7, 7, 'x'], barre: { fret: 7, from: 2, to: 4 } } },
  "D# major": { "G": { frets: [3, 'x', 'x', 3, 4, 'x'] }, "A#": { frets: ['x', 'x', 8, 8, 8, 'x'], barre: { fret: 8, from: 2, to: 4 } } },
  "Eb major": { "G": { frets: [3, 'x', 'x', 3, 4, 'x'] }, "A#": { frets: ['x', 'x', 8, 8, 8, 'x'], barre: { fret: 8, from: 2, to: 4 } } },
  "E major": { "G#": { frets: [4, 'x', 'x', 4, 5, 'x'] }, "B": { frets: ['x', 'x', 9, 9, 9, 'x'], barre: { fret: 9, from: 2, to: 4 } } },
  "F major": { "A": { frets: [5, 'x', 'x', 5, 6, 'x'] }, "C": { frets: ['x', 'x', 10, 10, 10, 'x'], barre: { fret: 10, from: 2, to: 4 } } },
  "F# major": { "A#": { frets: [6, 'x', 'x', 6, 7, 'x'] }, "C#": { frets: ['x', 'x', 11, 11, 11, 'x'], barre: { fret: 11, from: 2, to: 4 } } },
  "Gb major": { "A#": { frets: [6, 'x', 'x', 6, 7, 'x'] }, "C#": { frets: ['x', 'x', 11, 11, 11, 'x'], barre: { fret: 11, from: 2, to: 4 } } },
  "G major": { "B": { frets: [7, 'x', 'x', 7, 8, 'x'] }, "D": { frets: ['x', 'x', 0, 0, 0, 'x'] } },
  "G# major": { "C": { frets: [8, 'x', 'x', 8, 9, 'x'] }, "D#": { frets: ['x', 'x', 1, 1, 1, 'x'], barre: { fret: 1, from: 2, to: 4 } } },
  "Ab major": { "C": { frets: [8, 'x', 'x', 8, 9, 'x'] }, "D#": { frets: ['x', 'x', 1, 1, 1, 'x'], barre: { fret: 1, from: 2, to: 4 } } },
  "A major": { "C#": { frets: [9, 'x', 'x', 9, 10, 'x'] }, "E": { frets: ['x', 'x', 2, 2, 2, 'x'], barre: { fret: 2, from: 2, to: 4 } } },
  "A# major": { "D": { frets: [10, 'x', 'x', 10, 11, 'x'] }, "F": { frets: ['x', 'x', 3, 3, 3, 'x'], barre: { fret: 3, from: 2, to: 4 } } },
  "Bb major": { "D": { frets: [10, 'x', 'x', 10, 11, 'x'] }, "F": { frets: ['x', 'x', 3, 3, 3, 'x'], barre: { fret: 3, from: 2, to: 4 } } },
  "B major": { "D#": { frets: [11, 'x', 'x', 11, 12, 'x'] }, "F#": { frets: ['x', 'x', 4, 4, 4, 'x'], barre: { fret: 4, from: 2, to: 4 } } },
  // ---- minor ----
  "C minor": { "D#": { frets: ['x', 'x', 'x', 8, 8, 8], barre: { fret: 8, from: 3, to: 5 } }, "G": { frets: [3, 3, 'x', 'x', 4, 'x'] } },
  "C# minor": { "E": { frets: ['x', 'x', 'x', 9, 9, 9], barre: { fret: 9, from: 3, to: 5 } }, "G#": { frets: [4, 4, 'x', 'x', 5, 'x'] } },
  "Db minor": { "E": { frets: ['x', 'x', 'x', 9, 9, 9], barre: { fret: 9, from: 3, to: 5 } }, "G#": { frets: [4, 4, 'x', 'x', 5, 'x'] } },
  "D minor": { "F": { frets: ['x', 'x', 'x', 10, 10, 10], barre: { fret: 10, from: 3, to: 5 } }, "A": { frets: [5, 5, 'x', 'x', 6, 'x'] } },
  "D# minor": { "F#": { frets: ['x', 'x', 'x', 11, 11, 11], barre: { fret: 11, from: 3, to: 5 } }, "A#": { frets: [6, 6, 'x', 'x', 7, 'x'] } },
  "Eb minor": { "F#": { frets: ['x', 'x', 'x', 11, 11, 11], barre: { fret: 11, from: 3, to: 5 } }, "A#": { frets: [6, 6, 'x', 'x', 7, 'x'] } },
  "E minor": { "G": { frets: ['x', 'x', 'x', 0, 0, 0] }, "B": { frets: [7, 7, 'x', 'x', 8, 'x'] } },
  "F minor": { "G#": { frets: ['x', 'x', 'x', 1, 1, 1], barre: { fret: 1, from: 3, to: 5 } }, "C": { frets: [8, 8, 'x', 'x', 9, 'x'] } },
  "F# minor": { "A": { frets: ['x', 'x', 'x', 2, 2, 2], barre: { fret: 2, from: 3, to: 5 } }, "C#": { frets: [9, 9, 'x', 'x', 10, 'x'] } },
  "Gb minor": { "A": { frets: ['x', 'x', 'x', 2, 2, 2], barre: { fret: 2, from: 3, to: 5 } }, "C#": { frets: [9, 9, 'x', 'x', 10, 'x'] } },
  "G minor": { "A#": { frets: ['x', 'x', 'x', 3, 3, 3], barre: { fret: 3, from: 3, to: 5 } }, "D": { frets: [10, 10, 'x', 'x', 11, 'x'] } },
  "G# minor": { "B": { frets: ['x', 'x', 'x', 4, 4, 4], barre: { fret: 4, from: 3, to: 5 } }, "D#": { frets: [11, 11, 'x', 'x', 12, 'x'] } },
  "Ab minor": { "B": { frets: ['x', 'x', 'x', 4, 4, 4], barre: { fret: 4, from: 3, to: 5 } }, "D#": { frets: [11, 11, 'x', 'x', 12, 'x'] } },
  "A minor": { "C": { frets: ['x', 'x', 'x', 5, 5, 5], barre: { fret: 5, from: 3, to: 5 } }, "E": { frets: [0, 0, 'x', 'x', 1, 'x'] } },
  "A# minor": { "C#": { frets: ['x', 'x', 'x', 6, 6, 6], barre: { fret: 6, from: 3, to: 5 } }, "F": { frets: [1, 1, 'x', 'x', 2, 'x'] } },
  "Bb minor": { "C#": { frets: ['x', 'x', 'x', 6, 6, 6], barre: { fret: 6, from: 3, to: 5 } }, "F": { frets: [1, 1, 'x', 'x', 2, 'x'] } },
  "B minor": { "D": { frets: ['x', 'x', 'x', 7, 7, 7], barre: { fret: 7, from: 3, to: 5 } }, "F#": { frets: [2, 2, 'x', 'x', 3, 'x'] } },
  // ---- sus2 ----
  "Csus2": { "D": { frets: [10, 10, 10, 'x', 'x', 'x'], barre: { fret: 10, from: 0, to: 2 } }, "G": { frets: [3, 3, 'x', 'x', 3, 'x'], barre: { fret: 3, from: 0, to: 4 } } },
  "C#sus2": { "D#": { frets: [11, 11, 11, 'x', 'x', 'x'], barre: { fret: 11, from: 0, to: 2 } }, "G#": { frets: [4, 4, 'x', 'x', 4, 'x'], barre: { fret: 4, from: 0, to: 4 } } },
  "Dbsus2": { "D#": { frets: [11, 11, 11, 'x', 'x', 'x'], barre: { fret: 11, from: 0, to: 2 } }, "G#": { frets: [4, 4, 'x', 'x', 4, 'x'], barre: { fret: 4, from: 0, to: 4 } } },
  "Dsus2": { "E": { frets: [0, 0, 0, 'x', 'x', 'x'] }, "A": { frets: [5, 5, 'x', 'x', 5, 'x'], barre: { fret: 5, from: 0, to: 4 } } },
  "D#sus2": { "F": { frets: [1, 1, 1, 'x', 'x', 'x'], barre: { fret: 1, from: 0, to: 2 } }, "A#": { frets: [6, 6, 'x', 'x', 6, 'x'], barre: { fret: 6, from: 0, to: 4 } } },
  "Ebsus2": { "F": { frets: [1, 1, 1, 'x', 'x', 'x'], barre: { fret: 1, from: 0, to: 2 } }, "A#": { frets: [6, 6, 'x', 'x', 6, 'x'], barre: { fret: 6, from: 0, to: 4 } } },
  "Esus2": { "F#": { frets: [2, 2, 2, 'x', 'x', 'x'], barre: { fret: 2, from: 0, to: 2 } }, "B": { frets: [7, 7, 'x', 'x', 7, 'x'], barre: { fret: 7, from: 0, to: 4 } } },
  "Fsus2": { "G": { frets: [3, 3, 3, 'x', 'x', 'x'], barre: { fret: 3, from: 0, to: 2 } }, "C": { frets: [8, 8, 'x', 'x', 8, 'x'], barre: { fret: 8, from: 0, to: 4 } } },
  "F#sus2": { "G#": { frets: [4, 4, 4, 'x', 'x', 'x'], barre: { fret: 4, from: 0, to: 2 } }, "C#": { frets: [9, 9, 'x', 'x', 9, 'x'], barre: { fret: 9, from: 0, to: 4 } } },
  "Gbsus2": { "G#": { frets: [4, 4, 4, 'x', 'x', 'x'], barre: { fret: 4, from: 0, to: 2 } }, "C#": { frets: [9, 9, 'x', 'x', 9, 'x'], barre: { fret: 9, from: 0, to: 4 } } },
  "Gsus2": { "A": { frets: [5, 5, 5, 'x', 'x', 'x'], barre: { fret: 5, from: 0, to: 2 } }, "D": { frets: [10, 10, 'x', 'x', 10, 'x'], barre: { fret: 10, from: 0, to: 4 } } },
  "G#sus2": { "A#": { frets: [6, 6, 6, 'x', 'x', 'x'], barre: { fret: 6, from: 0, to: 2 } }, "D#": { frets: [11, 11, 'x', 'x', 11, 'x'], barre: { fret: 11, from: 0, to: 4 } } },
  "Absus2": { "A#": { frets: [6, 6, 6, 'x', 'x', 'x'], barre: { fret: 6, from: 0, to: 2 } }, "D#": { frets: [11, 11, 'x', 'x', 11, 'x'], barre: { fret: 11, from: 0, to: 4 } } },
  "Asus2": { "B": { frets: [7, 7, 7, 'x', 'x', 'x'], barre: { fret: 7, from: 0, to: 2 } }, "E": { frets: [0, 0, 'x', 'x', 0, 'x'] } },
  "A#sus2": { "C": { frets: [8, 8, 8, 'x', 'x', 'x'], barre: { fret: 8, from: 0, to: 2 } }, "F": { frets: [1, 1, 'x', 'x', 1, 'x'], barre: { fret: 1, from: 0, to: 4 } } },
  "Bbsus2": { "C": { frets: [8, 8, 8, 'x', 'x', 'x'], barre: { fret: 8, from: 0, to: 2 } }, "F": { frets: [1, 1, 'x', 'x', 1, 'x'], barre: { fret: 1, from: 0, to: 4 } } },
  "Bsus2": { "C#": { frets: [9, 9, 9, 'x', 'x', 'x'], barre: { fret: 9, from: 0, to: 2 } }, "F#": { frets: [2, 2, 'x', 'x', 2, 'x'], barre: { fret: 2, from: 0, to: 4 } } },
  // ---- sus4 ----
  "Csus4": { "F": { frets: ['x', 8, 'x', 'x', 8, 8], barre: { fret: 8, from: 1, to: 5 } }, "G": { frets: [3, 3, 3, 'x', 'x', 'x'], barre: { fret: 3, from: 0, to: 2 } } },
  "C#sus4": { "F#": { frets: ['x', 9, 'x', 'x', 9, 9], barre: { fret: 9, from: 1, to: 5 } }, "G#": { frets: [4, 4, 4, 'x', 'x', 'x'], barre: { fret: 4, from: 0, to: 2 } } },
  "Dbsus4": { "F#": { frets: ['x', 9, 'x', 'x', 9, 9], barre: { fret: 9, from: 1, to: 5 } }, "G#": { frets: [4, 4, 4, 'x', 'x', 'x'], barre: { fret: 4, from: 0, to: 2 } } },
  "Dsus4": { "G": { frets: ['x', 10, 'x', 'x', 10, 10], barre: { fret: 10, from: 1, to: 5 } }, "A": { frets: [5, 5, 5, 'x', 'x', 'x'], barre: { fret: 5, from: 0, to: 2 } } },
  "D#sus4": { "G#": { frets: ['x', 11, 'x', 'x', 11, 11], barre: { fret: 11, from: 1, to: 5 } }, "A#": { frets: [6, 6, 6, 'x', 'x', 'x'], barre: { fret: 6, from: 0, to: 2 } } },
  "Ebsus4": { "G#": { frets: ['x', 11, 'x', 'x', 11, 11], barre: { fret: 11, from: 1, to: 5 } }, "A#": { frets: [6, 6, 6, 'x', 'x', 'x'], barre: { fret: 6, from: 0, to: 2 } } },
  "Esus4": { "A": { frets: ['x', 0, 'x', 'x', 0, 0] }, "B": { frets: [7, 7, 7, 'x', 'x', 'x'], barre: { fret: 7, from: 0, to: 2 } } },
  "Fsus4": { "A#": { frets: ['x', 1, 'x', 'x', 1, 1], barre: { fret: 1, from: 1, to: 5 } }, "C": { frets: [8, 8, 8, 'x', 'x', 'x'], barre: { fret: 8, from: 0, to: 2 } } },
  "F#sus4": { "B": { frets: ['x', 2, 'x', 'x', 2, 2], barre: { fret: 2, from: 1, to: 5 } }, "C#": { frets: [9, 9, 9, 'x', 'x', 'x'], barre: { fret: 9, from: 0, to: 2 } } },
  "Gbsus4": { "B": { frets: ['x', 2, 'x', 'x', 2, 2], barre: { fret: 2, from: 1, to: 5 } }, "C#": { frets: [9, 9, 9, 'x', 'x', 'x'], barre: { fret: 9, from: 0, to: 2 } } },
  "Gsus4": { "C": { frets: ['x', 3, 'x', 'x', 3, 3], barre: { fret: 3, from: 1, to: 5 } }, "D": { frets: [10, 10, 10, 'x', 'x', 'x'], barre: { fret: 10, from: 0, to: 2 } } },
  "G#sus4": { "C#": { frets: ['x', 4, 'x', 'x', 4, 4], barre: { fret: 4, from: 1, to: 5 } }, "D#": { frets: [11, 11, 11, 'x', 'x', 'x'], barre: { fret: 11, from: 0, to: 2 } } },
  "Absus4": { "C#": { frets: ['x', 4, 'x', 'x', 4, 4], barre: { fret: 4, from: 1, to: 5 } }, "D#": { frets: [11, 11, 11, 'x', 'x', 'x'], barre: { fret: 11, from: 0, to: 2 } } },
  "Asus4": { "D": { frets: ['x', 5, 'x', 'x', 5, 5], barre: { fret: 5, from: 1, to: 5 } }, "E": { frets: [0, 0, 0, 'x', 'x', 'x'] } },
  "A#sus4": { "D#": { frets: ['x', 6, 'x', 'x', 6, 6], barre: { fret: 6, from: 1, to: 5 } }, "F": { frets: [1, 1, 1, 'x', 'x', 'x'], barre: { fret: 1, from: 0, to: 2 } } },
  "Bbsus4": { "D#": { frets: ['x', 6, 'x', 'x', 6, 6], barre: { fret: 6, from: 1, to: 5 } }, "F": { frets: [1, 1, 1, 'x', 'x', 'x'], barre: { fret: 1, from: 0, to: 2 } } },
  "Bsus4": { "E": { frets: ['x', 7, 'x', 'x', 7, 7], barre: { fret: 7, from: 1, to: 5 } }, "F#": { frets: [2, 2, 2, 'x', 'x', 'x'], barre: { fret: 2, from: 0, to: 2 } } },
  // ---- dom7 ----
  "C7": { "E": { frets: [0, 1, 'x', 0, 1, 'x'] }, "G": { frets: [3, 3, 2, 3, 'x', 'x'] }, "A#": { frets: [6, 'x', 5, 5, 5, 'x'] } },
  "C#7": { "F": { frets: [1, 2, 'x', 1, 2, 'x'] }, "G#": { frets: [4, 4, 3, 4, 'x', 'x'] }, "B": { frets: [7, 'x', 6, 6, 6, 'x'] } },
  "Db7": { "F": { frets: [1, 2, 'x', 1, 2, 'x'] }, "G#": { frets: [4, 4, 3, 4, 'x', 'x'] }, "B": { frets: [7, 'x', 6, 6, 6, 'x'] } },
  "D7": { "F#": { frets: [2, 3, 'x', 2, 3, 'x'] }, "A": { frets: [5, 5, 4, 5, 'x', 'x'] }, "C": { frets: [8, 'x', 7, 7, 7, 'x'] } },
  "D#7": { "G": { frets: [3, 4, 'x', 3, 4, 'x'] }, "A#": { frets: [6, 6, 5, 6, 'x', 'x'] }, "C#": { frets: [9, 'x', 8, 8, 8, 'x'] } },
  "Eb7": { "G": { frets: [3, 4, 'x', 3, 4, 'x'] }, "A#": { frets: [6, 6, 5, 6, 'x', 'x'] }, "C#": { frets: [9, 'x', 8, 8, 8, 'x'] } },
  "E7": { "G#": { frets: [4, 5, 'x', 4, 5, 'x'] }, "B": { frets: [7, 7, 6, 7, 'x', 'x'] }, "D": { frets: [10, 'x', 9, 9, 9, 'x'] } },
  "F7": { "A": { frets: [5, 6, 'x', 5, 6, 'x'] }, "C": { frets: [8, 8, 7, 8, 'x', 'x'] }, "D#": { frets: [11, 'x', 10, 10, 10, 'x'] } },
  "F#7": { "A#": { frets: [6, 7, 'x', 6, 7, 'x'] }, "C#": { frets: [9, 9, 8, 9, 'x', 'x'] }, "E": { frets: [12, 'x', 11, 11, 11, 'x'] } },
  "Gb7": { "A#": { frets: [6, 7, 'x', 6, 7, 'x'] }, "C#": { frets: [9, 9, 8, 9, 'x', 'x'] }, "E": { frets: [12, 'x', 11, 11, 11, 'x'] } },
  "G7": { "B": { frets: [7, 8, 'x', 7, 8, 'x'] }, "D": { frets: [10, 10, 9, 10, 'x', 'x'] }, "F": { frets: [1, 'x', 0, 0, 0, 'x'] } },
  "G#7": { "C": { frets: [8, 9, 'x', 8, 9, 'x'] }, "D#": { frets: [11, 11, 10, 11, 'x', 'x'] }, "F#": { frets: [2, 'x', 1, 1, 1, 'x'] } },
  "Ab7": { "C": { frets: [8, 9, 'x', 8, 9, 'x'] }, "D#": { frets: [11, 11, 10, 11, 'x', 'x'] }, "F#": { frets: [2, 'x', 1, 1, 1, 'x'] } },
  "A7": { "C#": { frets: [9, 10, 'x', 9, 10, 'x'] }, "E": { frets: [12, 12, 11, 12, 'x', 'x'] }, "G": { frets: [3, 'x', 2, 2, 2, 'x'] } },
  "A#7": { "D": { frets: [10, 11, 'x', 10, 11, 'x'] }, "F": { frets: [1, 1, 0, 1, 'x', 'x'] }, "G#": { frets: [4, 'x', 3, 3, 3, 'x'] } },
  "Bb7": { "D": { frets: [10, 11, 'x', 10, 11, 'x'] }, "F": { frets: [1, 1, 0, 1, 'x', 'x'] }, "G#": { frets: [4, 'x', 3, 3, 3, 'x'] } },
  "B7": { "D#": { frets: [11, 12, 'x', 11, 12, 'x'] }, "F#": { frets: [2, 2, 1, 2, 'x', 'x'] }, "A": { frets: [5, 'x', 4, 4, 4, 'x'] } },
  // ---- maj7 ----
  "Cmaj7": { "E": { frets: [12, 10, 10, 'x', 12, 'x'] }, "G": { frets: [3, 3, 2, 4, 'x', 'x'] }, "B": { frets: [7, 7, 'x', 'x', 8, 8] } },
  "C#maj7": { "G#": { frets: [4, 4, 3, 5, 'x', 'x'] }, "C": { frets: [8, 8, 'x', 'x', 9, 9] } },
  "Dbmaj7": { "G#": { frets: [4, 4, 3, 5, 'x', 'x'] }, "C": { frets: [8, 8, 'x', 'x', 9, 9] } },
  "Dmaj7": { "F#": { frets: [2, 0, 0, 'x', 2, 'x'] }, "A": { frets: [5, 5, 4, 6, 'x', 'x'] }, "C#": { frets: [9, 9, 'x', 'x', 10, 10] } },
  "D#maj7": { "G": { frets: [3, 1, 1, 'x', 3, 'x'] }, "A#": { frets: [6, 6, 5, 7, 'x', 'x'] }, "D": { frets: [10, 10, 'x', 'x', 11, 11] } },
  "Ebmaj7": { "G": { frets: [3, 1, 1, 'x', 3, 'x'] }, "A#": { frets: [6, 6, 5, 7, 'x', 'x'] }, "D": { frets: [10, 10, 'x', 'x', 11, 11] } },
  "Emaj7": { "G#": { frets: [4, 2, 2, 'x', 4, 'x'] }, "B": { frets: [7, 7, 6, 8, 'x', 'x'] }, "D#": { frets: [11, 11, 'x', 'x', 12, 12] } },
  "Fmaj7": { "A": { frets: [5, 3, 3, 'x', 5, 'x'] }, "C": { frets: [8, 8, 7, 9, 'x', 'x'] }, "E": { frets: [0, 0, 'x', 'x', 1, 1] } },
  "F#maj7": { "A#": { frets: [6, 4, 4, 'x', 6, 'x'] }, "C#": { frets: [9, 9, 8, 10, 'x', 'x'] }, "F": { frets: [1, 1, 'x', 'x', 2, 2] } },
  "Gbmaj7": { "A#": { frets: [6, 4, 4, 'x', 6, 'x'] }, "C#": { frets: [9, 9, 8, 10, 'x', 'x'] }, "F": { frets: [1, 1, 'x', 'x', 2, 2] } },
  "Gmaj7": { "B": { frets: [7, 5, 5, 'x', 7, 'x'] }, "D": { frets: [10, 10, 9, 11, 'x', 'x'] }, "F#": { frets: [2, 2, 'x', 'x', 3, 3] } },
  "G#maj7": { "C": { frets: [8, 6, 6, 'x', 8, 'x'] }, "D#": { frets: [11, 11, 10, 12, 'x', 'x'] }, "G": { frets: [3, 3, 'x', 'x', 4, 4] } },
  "Abmaj7": { "C": { frets: [8, 6, 6, 'x', 8, 'x'] }, "D#": { frets: [11, 11, 10, 12, 'x', 'x'] }, "G": { frets: [3, 3, 'x', 'x', 4, 4] } },
  "Amaj7": { "C#": { frets: [9, 7, 7, 'x', 9, 'x'] }, "G#": { frets: [4, 4, 'x', 'x', 5, 5] } },
  "A#maj7": { "D": { frets: [10, 8, 8, 'x', 10, 'x'] }, "F": { frets: [1, 1, 0, 2, 'x', 'x'] }, "A": { frets: [5, 5, 'x', 'x', 6, 6] } },
  "Bbmaj7": { "D": { frets: [10, 8, 8, 'x', 10, 'x'] }, "F": { frets: [1, 1, 0, 2, 'x', 'x'] }, "A": { frets: [5, 5, 'x', 'x', 6, 6] } },
  "Bmaj7": { "D#": { frets: [11, 9, 9, 'x', 11, 'x'] }, "F#": { frets: [2, 2, 1, 3, 'x', 'x'] }, "A#": { frets: [6, 6, 'x', 'x', 7, 7] } },
  // ---- m7 ----
  "Cm7": { "D#": { frets: [11, 10, 10, 'x', 11, 'x'] }, "G": { frets: [3, 3, 'x', 3, 4, 'x'] }, "A#": { frets: ['x', 'x', 8, 8, 8, 8], barre: { fret: 8, from: 2, to: 5 } } },
  "C#m7": { "E": { frets: [12, 11, 11, 'x', 12, 'x'] }, "G#": { frets: [4, 4, 'x', 4, 5, 'x'] }, "B": { frets: ['x', 'x', 9, 9, 9, 9], barre: { fret: 9, from: 2, to: 5 } } },
  "Dbm7": { "E": { frets: [12, 11, 11, 'x', 12, 'x'] }, "G#": { frets: [4, 4, 'x', 4, 5, 'x'] }, "B": { frets: ['x', 'x', 9, 9, 9, 9], barre: { fret: 9, from: 2, to: 5 } } },
  "Dm7": { "F": { frets: [1, 0, 0, 'x', 1, 'x'] }, "A": { frets: [5, 5, 'x', 5, 6, 'x'] }, "C": { frets: ['x', 'x', 10, 10, 10, 10], barre: { fret: 10, from: 2, to: 5 } } },
  "D#m7": { "F#": { frets: [2, 1, 1, 'x', 2, 'x'] }, "A#": { frets: [6, 6, 'x', 6, 7, 'x'] }, "C#": { frets: ['x', 'x', 11, 11, 11, 11], barre: { fret: 11, from: 2, to: 5 } } },
  "Ebm7": { "F#": { frets: [2, 1, 1, 'x', 2, 'x'] }, "A#": { frets: [6, 6, 'x', 6, 7, 'x'] }, "C#": { frets: ['x', 'x', 11, 11, 11, 11], barre: { fret: 11, from: 2, to: 5 } } },
  "Em7": { "G": { frets: [3, 2, 2, 'x', 3, 'x'] }, "B": { frets: [7, 7, 'x', 7, 8, 'x'] }, "D": { frets: ['x', 'x', 0, 0, 0, 0] } },
  "Fm7": { "G#": { frets: [4, 3, 3, 'x', 4, 'x'] }, "C": { frets: [8, 8, 'x', 8, 9, 'x'] }, "D#": { frets: ['x', 'x', 1, 1, 1, 1], barre: { fret: 1, from: 2, to: 5 } } },
  "F#m7": { "A": { frets: [5, 4, 4, 'x', 5, 'x'] }, "C#": { frets: [9, 9, 'x', 9, 10, 'x'] }, "E": { frets: ['x', 'x', 2, 2, 2, 2], barre: { fret: 2, from: 2, to: 5 } } },
  "Gbm7": { "A": { frets: [5, 4, 4, 'x', 5, 'x'] }, "C#": { frets: [9, 9, 'x', 9, 10, 'x'] }, "E": { frets: ['x', 'x', 2, 2, 2, 2], barre: { fret: 2, from: 2, to: 5 } } },
  "Gm7": { "A#": { frets: [6, 5, 5, 'x', 6, 'x'] }, "D": { frets: [10, 10, 'x', 10, 11, 'x'] }, "F": { frets: ['x', 'x', 3, 3, 3, 3], barre: { fret: 3, from: 2, to: 5 } } },
  "G#m7": { "B": { frets: [7, 6, 6, 'x', 7, 'x'] }, "D#": { frets: [11, 11, 'x', 11, 12, 'x'] }, "F#": { frets: ['x', 'x', 4, 4, 4, 4], barre: { fret: 4, from: 2, to: 5 } } },
  "Abm7": { "B": { frets: [7, 6, 6, 'x', 7, 'x'] }, "D#": { frets: [11, 11, 'x', 11, 12, 'x'] }, "F#": { frets: ['x', 'x', 4, 4, 4, 4], barre: { fret: 4, from: 2, to: 5 } } },
  "Am7": { "C": { frets: [8, 7, 7, 'x', 8, 'x'] }, "E": { frets: [0, 0, 'x', 0, 1, 'x'] }, "G": { frets: ['x', 'x', 5, 5, 5, 5], barre: { fret: 5, from: 2, to: 5 } } },
  "A#m7": { "C#": { frets: [9, 8, 8, 'x', 9, 'x'] }, "F": { frets: [1, 1, 'x', 1, 2, 'x'] }, "G#": { frets: ['x', 'x', 6, 6, 6, 6], barre: { fret: 6, from: 2, to: 5 } } },
  "Bbm7": { "C#": { frets: [9, 8, 8, 'x', 9, 'x'] }, "F": { frets: [1, 1, 'x', 1, 2, 'x'] }, "G#": { frets: ['x', 'x', 6, 6, 6, 6], barre: { fret: 6, from: 2, to: 5 } } },
  "Bm7": { "D": { frets: [10, 9, 9, 'x', 10, 'x'] }, "F#": { frets: [2, 2, 'x', 2, 3, 'x'] }, "A": { frets: ['x', 'x', 7, 7, 7, 7], barre: { fret: 7, from: 2, to: 5 } } },
  // ---- m7b5 ----
  "Cm7b5": { "D#": { frets: [11, 'x', 10, 11, 11, 'x'] }, "F#": { frets: [2, 1, 1, 'x', 1, 'x'] }, "A#": { frets: ['x', 1, 1, 'x', 1, 2] } },
  "C#m7b5": { "E": { frets: [12, 'x', 11, 12, 12, 'x'] }, "G": { frets: [3, 2, 2, 'x', 2, 'x'] }, "B": { frets: ['x', 2, 2, 'x', 2, 3] } },
  "Dbm7b5": { "E": { frets: [12, 'x', 11, 12, 12, 'x'] }, "G": { frets: [3, 2, 2, 'x', 2, 'x'] }, "B": { frets: ['x', 2, 2, 'x', 2, 3] } },
  "Dm7b5": { "F": { frets: [1, 'x', 0, 1, 1, 'x'] }, "G#": { frets: [4, 3, 3, 'x', 3, 'x'] }, "C": { frets: ['x', 3, 3, 'x', 3, 4] } },
  "D#m7b5": { "F#": { frets: [2, 'x', 1, 2, 2, 'x'] }, "A": { frets: [5, 4, 4, 'x', 4, 'x'] }, "C#": { frets: ['x', 4, 4, 'x', 4, 5] } },
  "Ebm7b5": { "F#": { frets: [2, 'x', 1, 2, 2, 'x'] }, "A": { frets: [5, 4, 4, 'x', 4, 'x'] }, "C#": { frets: ['x', 4, 4, 'x', 4, 5] } },
  "Em7b5": { "G": { frets: [3, 'x', 2, 3, 3, 'x'] }, "A#": { frets: [6, 5, 5, 'x', 5, 'x'] }, "D": { frets: ['x', 5, 5, 'x', 5, 6] } },
  "Fm7b5": { "G#": { frets: [4, 'x', 3, 4, 4, 'x'] }, "B": { frets: [7, 6, 6, 'x', 6, 'x'] }, "D#": { frets: ['x', 6, 6, 'x', 6, 7] } },
  "F#m7b5": { "A": { frets: [5, 'x', 4, 5, 5, 'x'] }, "C": { frets: [8, 7, 7, 'x', 7, 'x'] }, "E": { frets: ['x', 7, 7, 'x', 7, 8] } },
  "Gbm7b5": { "A": { frets: [5, 'x', 4, 5, 5, 'x'] }, "C": { frets: [8, 7, 7, 'x', 7, 'x'] }, "E": { frets: ['x', 7, 7, 'x', 7, 8] } },
  "Gm7b5": { "A#": { frets: [6, 'x', 5, 6, 6, 'x'] }, "C#": { frets: [9, 8, 8, 'x', 8, 'x'] }, "F": { frets: ['x', 8, 8, 'x', 8, 9] } },
  "G#m7b5": { "B": { frets: [7, 'x', 6, 7, 7, 'x'] }, "D": { frets: [10, 9, 9, 'x', 9, 'x'] }, "F#": { frets: ['x', 9, 9, 'x', 9, 10] } },
  "Abm7b5": { "B": { frets: [7, 'x', 6, 7, 7, 'x'] }, "D": { frets: [10, 9, 9, 'x', 9, 'x'] }, "F#": { frets: ['x', 9, 9, 'x', 9, 10] } },
  "Am7b5": { "C": { frets: [8, 'x', 7, 8, 8, 'x'] }, "D#": { frets: [11, 10, 10, 'x', 10, 'x'] }, "G": { frets: ['x', 10, 10, 'x', 10, 11] } },
  "A#m7b5": { "C#": { frets: [9, 'x', 8, 9, 9, 'x'] }, "E": { frets: [12, 11, 11, 'x', 11, 'x'] }, "G#": { frets: ['x', 11, 11, 'x', 11, 12] } },
  "Bbm7b5": { "C#": { frets: [9, 'x', 8, 9, 9, 'x'] }, "E": { frets: [12, 11, 11, 'x', 11, 'x'] }, "G#": { frets: ['x', 11, 11, 'x', 11, 12] } },
  "Bm7b5": { "D": { frets: [10, 'x', 9, 10, 10, 'x'] }, "F": { frets: [1, 0, 0, 'x', 0, 'x'] }, "A": { frets: ['x', 0, 0, 'x', 0, 1] } },
  // ---- add9 ----
  "Cadd9": { "E": { frets: [0, 'x', 0, 0, 1, 'x'] }, "G": { frets: [3, 3, 2, 'x', 3, 'x'] }, "D": { frets: ['x', 5, 5, 5, 5, 'x'], barre: { fret: 5, from: 1, to: 4 } } },
  "C#add9": { "F": { frets: [1, 'x', 1, 1, 2, 'x'] }, "G#": { frets: [4, 4, 3, 'x', 4, 'x'] }, "D#": { frets: ['x', 6, 6, 6, 6, 'x'], barre: { fret: 6, from: 1, to: 4 } } },
  "Dbadd9": { "F": { frets: [1, 'x', 1, 1, 2, 'x'] }, "G#": { frets: [4, 4, 3, 'x', 4, 'x'] }, "D#": { frets: ['x', 6, 6, 6, 6, 'x'], barre: { fret: 6, from: 1, to: 4 } } },
  "Dadd9": { "F#": { frets: [2, 'x', 2, 2, 3, 'x'] }, "A": { frets: [5, 5, 4, 'x', 5, 'x'] }, "E": { frets: ['x', 7, 7, 7, 7, 'x'], barre: { fret: 7, from: 1, to: 4 } } },
  "D#add9": { "G": { frets: [3, 'x', 3, 3, 4, 'x'] }, "A#": { frets: [6, 6, 5, 'x', 6, 'x'] }, "F": { frets: ['x', 8, 8, 8, 8, 'x'], barre: { fret: 8, from: 1, to: 4 } } },
  "Ebadd9": { "G": { frets: [3, 'x', 3, 3, 4, 'x'] }, "A#": { frets: [6, 6, 5, 'x', 6, 'x'] }, "F": { frets: ['x', 8, 8, 8, 8, 'x'], barre: { fret: 8, from: 1, to: 4 } } },
  "Eadd9": { "G#": { frets: [4, 'x', 4, 4, 5, 'x'] }, "B": { frets: [7, 7, 6, 'x', 7, 'x'] }, "F#": { frets: ['x', 9, 9, 9, 9, 'x'], barre: { fret: 9, from: 1, to: 4 } } },
  "Fadd9": { "A": { frets: [5, 'x', 5, 5, 6, 'x'] }, "C": { frets: [8, 8, 7, 'x', 8, 'x'] }, "G": { frets: ['x', 10, 10, 10, 10, 'x'], barre: { fret: 10, from: 1, to: 4 } } },
  "F#add9": { "A#": { frets: [6, 'x', 6, 6, 7, 'x'] }, "C#": { frets: [9, 9, 8, 'x', 9, 'x'] }, "G#": { frets: ['x', 11, 11, 11, 11, 'x'], barre: { fret: 11, from: 1, to: 4 } } },
  "Gbadd9": { "A#": { frets: [6, 'x', 6, 6, 7, 'x'] }, "C#": { frets: [9, 9, 8, 'x', 9, 'x'] }, "G#": { frets: ['x', 11, 11, 11, 11, 'x'], barre: { fret: 11, from: 1, to: 4 } } },
  "Gadd9": { "B": { frets: [7, 'x', 7, 7, 8, 'x'] }, "D": { frets: [10, 10, 9, 'x', 10, 'x'] }, "A": { frets: ['x', 0, 0, 0, 0, 'x'] } },
  "G#add9": { "C": { frets: [8, 'x', 8, 8, 9, 'x'] }, "D#": { frets: [11, 11, 10, 'x', 11, 'x'] }, "A#": { frets: ['x', 1, 1, 1, 1, 'x'], barre: { fret: 1, from: 1, to: 4 } } },
  "Abadd9": { "C": { frets: [8, 'x', 8, 8, 9, 'x'] }, "D#": { frets: [11, 11, 10, 'x', 11, 'x'] }, "A#": { frets: ['x', 1, 1, 1, 1, 'x'], barre: { fret: 1, from: 1, to: 4 } } },
  "Aadd9": { "C#": { frets: [9, 'x', 9, 9, 10, 'x'] }, "E": { frets: [12, 12, 11, 'x', 12, 'x'] }, "B": { frets: ['x', 2, 2, 2, 2, 'x'], barre: { fret: 2, from: 1, to: 4 } } },
  "A#add9": { "D": { frets: [10, 'x', 10, 10, 11, 'x'] }, "F": { frets: [1, 1, 0, 'x', 1, 'x'] }, "C": { frets: ['x', 3, 3, 3, 3, 'x'], barre: { fret: 3, from: 1, to: 4 } } },
  "Bbadd9": { "D": { frets: [10, 'x', 10, 10, 11, 'x'] }, "F": { frets: [1, 1, 0, 'x', 1, 'x'] }, "C": { frets: ['x', 3, 3, 3, 3, 'x'], barre: { fret: 3, from: 1, to: 4 } } },
  "Badd9": { "D#": { frets: [11, 'x', 11, 11, 12, 'x'] }, "F#": { frets: [2, 2, 1, 'x', 2, 'x'] }, "C#": { frets: ['x', 4, 4, 4, 4, 'x'], barre: { fret: 4, from: 1, to: 4 } } },
}
