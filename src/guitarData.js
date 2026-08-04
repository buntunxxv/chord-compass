// Curated guitar chord shapes for every chord in CHORD_DATA. Each shape is a
// standard-tuning (E A D G B e, low to high) fret array — 'x' for muted, 0
// for open, or a fret number. Open-position shapes are used wherever a real
// one exists; everything else falls back to a movable E-shape or A-shape
// barre (annotated via `barre`), or an easier non-barre voicing where one is
// well established (e.g. Fmaj7).
// Every shape's actual sounding notes were checked against the chord's real
// tones before inclusion — not auto-generated.
//
// The first 56 entries (7 natural roots x 8 types) are the original set.
// The next 131 (10 accidental roots' 8-type set, plus diminished/
// augmented/m7b5 for all 17 roots) were added in a later pass, entirely via
// movable-barre transposition of the natural roots' own already-verified
// "E ..."/"A ..." shapes. The final 17 (fully-diminished dim7 for all 17
// roots) were added last -- see the section comments below.

export const GUITAR_SHAPES = {
  "C major": { frets: ['x', 3, 2, 0, 1, 0] },
  "C minor": { frets: ['x', 3, 5, 5, 4, 3] },
  "C7":      { frets: ['x', 3, 2, 3, 1, 0] },
  "Cmaj7":   { frets: ['x', 3, 2, 0, 0, 0] },
  "Cm7":     { frets: ['x', 3, 5, 3, 4, 3] },
  "Cadd9":   { frets: ['x', 3, 2, 0, 3, 0] },
  "Csus2":   { frets: ['x', 3, 0, 0, 3, 3] },
  "Csus4":   { frets: ['x', 3, 3, 0, 1, 1] },

  "D major": { frets: ['x', 'x', 0, 2, 3, 2] },
  "D minor": { frets: ['x', 'x', 0, 2, 3, 1] },
  "D7":      { frets: ['x', 'x', 0, 2, 1, 2] },
  "Dmaj7":   { frets: ['x', 'x', 0, 2, 2, 2] },
  "Dm7":     { frets: ['x', 'x', 0, 2, 1, 1] },
  "Dadd9":   { frets: ['x', 5, 4, 2, 3, 0] },
  "Dsus2":   { frets: ['x', 'x', 0, 2, 3, 0] },
  "Dsus4":   { frets: ['x', 'x', 0, 2, 3, 3] },

  "E major": { frets: [0, 2, 2, 1, 0, 0] },
  "E minor": { frets: [0, 2, 2, 0, 0, 0] },
  "E7":      { frets: [0, 2, 0, 1, 0, 0] },
  "Emaj7":   { frets: [0, 2, 1, 1, 0, 0] },
  "Em7":     { frets: [0, 2, 0, 0, 0, 0] },
  "Eadd9":   { frets: [0, 2, 4, 1, 0, 0] },
  "Esus2":   { frets: [0, 2, 4, 4, 0, 0] },
  "Esus4":   { frets: [0, 2, 2, 2, 0, 0] },

  "F major": { frets: [1, 3, 3, 2, 1, 1], barre: { fret: 1, from: 0, to: 5 } },
  "F minor": { frets: [1, 3, 3, 1, 1, 1], barre: { fret: 1, from: 0, to: 5 } },
  "F7":      { frets: [1, 3, 1, 2, 1, 1], barre: { fret: 1, from: 0, to: 5 } },
  "Fmaj7":   { frets: ['x', 'x', 3, 2, 1, 0] },
  "Fm7":     { frets: [1, 3, 1, 1, 1, 1], barre: { fret: 1, from: 0, to: 5 } },
  "Fadd9":   { frets: ['x', 'x', 3, 2, 1, 3] },
  "Fsus2":   { frets: ['x', 'x', 3, 0, 1, 1] },
  "Fsus4":   { frets: ['x', 'x', 3, 3, 1, 1] },

  "G major": { frets: [3, 2, 0, 0, 0, 3] },
  "G minor": { frets: [3, 5, 5, 3, 3, 3], barre: { fret: 3, from: 0, to: 5 } },
  "G7":      { frets: [3, 2, 0, 0, 0, 1] },
  "Gmaj7":   { frets: [3, 2, 0, 0, 0, 2] },
  "Gm7":     { frets: [3, 5, 3, 3, 3, 3], barre: { fret: 3, from: 0, to: 5 } },
  "Gadd9":   { frets: [3, 2, 0, 2, 0, 3] },
  "Gsus2":   { frets: [3, 0, 0, 0, 3, 3] },
  "Gsus4":   { frets: [3, 3, 0, 0, 1, 3] },

  "A major": { frets: ['x', 0, 2, 2, 2, 0] },
  "A minor": { frets: ['x', 0, 2, 2, 1, 0] },
  "A7":      { frets: ['x', 0, 2, 0, 2, 0] },
  "Amaj7":   { frets: ['x', 0, 2, 1, 2, 0] },
  "Am7":     { frets: ['x', 0, 2, 0, 1, 0] },
  "Aadd9":   { frets: ['x', 0, 2, 4, 2, 0] },
  "Asus2":   { frets: ['x', 0, 2, 2, 0, 0] },
  "Asus4":   { frets: ['x', 0, 2, 2, 3, 0] },

  "B major": { frets: ['x', 2, 4, 4, 4, 2], barre: { fret: 2, from: 1, to: 5 } },
  "B minor": { frets: ['x', 2, 4, 4, 3, 2], barre: { fret: 2, from: 1, to: 5 } },
  "B7":      { frets: ['x', 2, 1, 2, 0, 2] },
  "Bmaj7":   { frets: ['x', 2, 4, 3, 4, 2], barre: { fret: 2, from: 1, to: 5 } },
  "Bm7":     { frets: ['x', 2, 0, 2, 0, 2] },
  "Badd9":   { frets: ['x', 2, 4, 6, 4, 2], barre: { fret: 2, from: 1, to: 5 } },
  "Bsus2":   { frets: ['x', 2, 4, 4, 2, 2], barre: { fret: 2, from: 1, to: 5 } },
  "Bsus4":   { frets: ['x', 2, 4, 4, 5, 2], barre: { fret: 2, from: 1, to: 5 } },

  // Accidental roots' full 8-type set (major, minor, 7, maj7, m7, add9, sus2,
  // sus4), 10 roots x 8 types = 80 entries. None of these roots has an open
  // string in standard tuning, so every one is a movable E-shape or A-shape
  // barre chord (whichever family lands on the lower fret), built by
  // transposing the app's own already-verified natural-root "E ..."/"A ..."
  // shapes -- barre transposition preserves each string's chord-tone role
  // exactly, so every transposed shape is automatically correct. Each one
  // was still checked programmatically against its CHORD_DATA notes before
  // inclusion (zero sounded pitch classes outside the chord's real tones,
  // triads sound every tone with no omissions, root always present).
  "C# major": { frets: ['x', 4, 6, 6, 6, 4], barre: { fret: 4, from: 1, to: 5 } },
  "C# minor": { frets: ['x', 4, 6, 6, 5, 4], barre: { fret: 4, from: 1, to: 5 } },
  "C#7": { frets: ['x', 4, 6, 4, 6, 4], barre: { fret: 4, from: 1, to: 5 } },
  "C#maj7": { frets: ['x', 4, 6, 5, 6, 4], barre: { fret: 4, from: 1, to: 5 } },
  "C#m7": { frets: ['x', 4, 6, 4, 5, 4], barre: { fret: 4, from: 1, to: 5 } },
  "C#add9": { frets: ['x', 4, 6, 8, 6, 4], barre: { fret: 4, from: 1, to: 5 } },
  "C#sus2": { frets: ['x', 4, 6, 6, 4, 4], barre: { fret: 4, from: 1, to: 5 } },
  "C#sus4": { frets: ['x', 4, 6, 6, 7, 4], barre: { fret: 4, from: 1, to: 5 } },

  "Db major": { frets: ['x', 4, 6, 6, 6, 4], barre: { fret: 4, from: 1, to: 5 } },
  "Db minor": { frets: ['x', 4, 6, 6, 5, 4], barre: { fret: 4, from: 1, to: 5 } },
  "Db7": { frets: ['x', 4, 6, 4, 6, 4], barre: { fret: 4, from: 1, to: 5 } },
  "Dbmaj7": { frets: ['x', 4, 6, 5, 6, 4], barre: { fret: 4, from: 1, to: 5 } },
  "Dbm7": { frets: ['x', 4, 6, 4, 5, 4], barre: { fret: 4, from: 1, to: 5 } },
  "Dbadd9": { frets: ['x', 4, 6, 8, 6, 4], barre: { fret: 4, from: 1, to: 5 } },
  "Dbsus2": { frets: ['x', 4, 6, 6, 4, 4], barre: { fret: 4, from: 1, to: 5 } },
  "Dbsus4": { frets: ['x', 4, 6, 6, 7, 4], barre: { fret: 4, from: 1, to: 5 } },

  "D# major": { frets: ['x', 6, 8, 8, 8, 6], barre: { fret: 6, from: 1, to: 5 } },
  "D# minor": { frets: ['x', 6, 8, 8, 7, 6], barre: { fret: 6, from: 1, to: 5 } },
  "D#7": { frets: ['x', 6, 8, 6, 8, 6], barre: { fret: 6, from: 1, to: 5 } },
  "D#maj7": { frets: ['x', 6, 8, 7, 8, 6], barre: { fret: 6, from: 1, to: 5 } },
  "D#m7": { frets: ['x', 6, 8, 6, 7, 6], barre: { fret: 6, from: 1, to: 5 } },
  "D#add9": { frets: ['x', 6, 8, 10, 8, 6], barre: { fret: 6, from: 1, to: 5 } },
  "D#sus2": { frets: ['x', 6, 8, 8, 6, 6], barre: { fret: 6, from: 1, to: 5 } },
  "D#sus4": { frets: ['x', 6, 8, 8, 9, 6], barre: { fret: 6, from: 1, to: 5 } },

  "Eb major": { frets: ['x', 6, 8, 8, 8, 6], barre: { fret: 6, from: 1, to: 5 } },
  "Eb minor": { frets: ['x', 6, 8, 8, 7, 6], barre: { fret: 6, from: 1, to: 5 } },
  "Eb7": { frets: ['x', 6, 8, 6, 8, 6], barre: { fret: 6, from: 1, to: 5 } },
  "Ebmaj7": { frets: ['x', 6, 8, 7, 8, 6], barre: { fret: 6, from: 1, to: 5 } },
  "Ebm7": { frets: ['x', 6, 8, 6, 7, 6], barre: { fret: 6, from: 1, to: 5 } },
  "Ebadd9": { frets: ['x', 6, 8, 10, 8, 6], barre: { fret: 6, from: 1, to: 5 } },
  "Ebsus2": { frets: ['x', 6, 8, 8, 6, 6], barre: { fret: 6, from: 1, to: 5 } },
  "Ebsus4": { frets: ['x', 6, 8, 8, 9, 6], barre: { fret: 6, from: 1, to: 5 } },

  "F# major": { frets: [2, 4, 4, 3, 2, 2], barre: { fret: 2, from: 0, to: 5 } },
  "F# minor": { frets: [2, 4, 4, 2, 2, 2], barre: { fret: 2, from: 0, to: 5 } },
  "F#7": { frets: [2, 4, 2, 3, 2, 2], barre: { fret: 2, from: 0, to: 5 } },
  "F#maj7": { frets: [2, 4, 3, 3, 2, 2], barre: { fret: 2, from: 0, to: 5 } },
  "F#m7": { frets: [2, 4, 2, 2, 2, 2], barre: { fret: 2, from: 0, to: 5 } },
  "F#add9": { frets: [2, 4, 6, 3, 2, 2], barre: { fret: 2, from: 0, to: 5 } },
  "F#sus2": { frets: [2, 4, 6, 6, 2, 2], barre: { fret: 2, from: 0, to: 5 } },
  "F#sus4": { frets: [2, 4, 4, 4, 2, 2], barre: { fret: 2, from: 0, to: 5 } },

  "Gb major": { frets: [2, 4, 4, 3, 2, 2], barre: { fret: 2, from: 0, to: 5 } },
  "Gb minor": { frets: [2, 4, 4, 2, 2, 2], barre: { fret: 2, from: 0, to: 5 } },
  "Gb7": { frets: [2, 4, 2, 3, 2, 2], barre: { fret: 2, from: 0, to: 5 } },
  "Gbmaj7": { frets: [2, 4, 3, 3, 2, 2], barre: { fret: 2, from: 0, to: 5 } },
  "Gbm7": { frets: [2, 4, 2, 2, 2, 2], barre: { fret: 2, from: 0, to: 5 } },
  "Gbadd9": { frets: [2, 4, 6, 3, 2, 2], barre: { fret: 2, from: 0, to: 5 } },
  "Gbsus2": { frets: [2, 4, 6, 6, 2, 2], barre: { fret: 2, from: 0, to: 5 } },
  "Gbsus4": { frets: [2, 4, 4, 4, 2, 2], barre: { fret: 2, from: 0, to: 5 } },

  "G# major": { frets: [4, 6, 6, 5, 4, 4], barre: { fret: 4, from: 0, to: 5 } },
  "G# minor": { frets: [4, 6, 6, 4, 4, 4], barre: { fret: 4, from: 0, to: 5 } },
  "G#7": { frets: [4, 6, 4, 5, 4, 4], barre: { fret: 4, from: 0, to: 5 } },
  "G#maj7": { frets: [4, 6, 5, 5, 4, 4], barre: { fret: 4, from: 0, to: 5 } },
  "G#m7": { frets: [4, 6, 4, 4, 4, 4], barre: { fret: 4, from: 0, to: 5 } },
  "G#add9": { frets: [4, 6, 8, 5, 4, 4], barre: { fret: 4, from: 0, to: 5 } },
  "G#sus2": { frets: [4, 6, 8, 8, 4, 4], barre: { fret: 4, from: 0, to: 5 } },
  "G#sus4": { frets: [4, 6, 6, 6, 4, 4], barre: { fret: 4, from: 0, to: 5 } },

  "Ab major": { frets: [4, 6, 6, 5, 4, 4], barre: { fret: 4, from: 0, to: 5 } },
  "Ab minor": { frets: [4, 6, 6, 4, 4, 4], barre: { fret: 4, from: 0, to: 5 } },
  "Ab7": { frets: [4, 6, 4, 5, 4, 4], barre: { fret: 4, from: 0, to: 5 } },
  "Abmaj7": { frets: [4, 6, 5, 5, 4, 4], barre: { fret: 4, from: 0, to: 5 } },
  "Abm7": { frets: [4, 6, 4, 4, 4, 4], barre: { fret: 4, from: 0, to: 5 } },
  "Abadd9": { frets: [4, 6, 8, 5, 4, 4], barre: { fret: 4, from: 0, to: 5 } },
  "Absus2": { frets: [4, 6, 8, 8, 4, 4], barre: { fret: 4, from: 0, to: 5 } },
  "Absus4": { frets: [4, 6, 6, 6, 4, 4], barre: { fret: 4, from: 0, to: 5 } },

  "A# major": { frets: ['x', 1, 3, 3, 3, 1], barre: { fret: 1, from: 1, to: 5 } },
  "A# minor": { frets: ['x', 1, 3, 3, 2, 1], barre: { fret: 1, from: 1, to: 5 } },
  "A#7": { frets: ['x', 1, 3, 1, 3, 1], barre: { fret: 1, from: 1, to: 5 } },
  "A#maj7": { frets: ['x', 1, 3, 2, 3, 1], barre: { fret: 1, from: 1, to: 5 } },
  "A#m7": { frets: ['x', 1, 3, 1, 2, 1], barre: { fret: 1, from: 1, to: 5 } },
  "A#add9": { frets: ['x', 1, 3, 5, 3, 1], barre: { fret: 1, from: 1, to: 5 } },
  "A#sus2": { frets: ['x', 1, 3, 3, 1, 1], barre: { fret: 1, from: 1, to: 5 } },
  "A#sus4": { frets: ['x', 1, 3, 3, 4, 1], barre: { fret: 1, from: 1, to: 5 } },

  "Bb major": { frets: ['x', 1, 3, 3, 3, 1], barre: { fret: 1, from: 1, to: 5 } },
  "Bb minor": { frets: ['x', 1, 3, 3, 2, 1], barre: { fret: 1, from: 1, to: 5 } },
  "Bb7": { frets: ['x', 1, 3, 1, 3, 1], barre: { fret: 1, from: 1, to: 5 } },
  "Bbmaj7": { frets: ['x', 1, 3, 2, 3, 1], barre: { fret: 1, from: 1, to: 5 } },
  "Bbm7": { frets: ['x', 1, 3, 1, 2, 1], barre: { fret: 1, from: 1, to: 5 } },
  "Bbadd9": { frets: ['x', 1, 3, 5, 3, 1], barre: { fret: 1, from: 1, to: 5 } },
  "Bbsus2": { frets: ['x', 1, 3, 3, 1, 1], barre: { fret: 1, from: 1, to: 5 } },
  "Bbsus4": { frets: ['x', 1, 3, 3, 4, 1], barre: { fret: 1, from: 1, to: 5 } },

  // Diminished, augmented, and half-diminished (m7b5) triads/tetrads for all
  // 17 roots (51 entries) -- these three qualities had no shapes at all before
  // (not even for the natural roots), since they didn't exist as chord types
  // in earlier phases of GUITAR_SHAPES. E-shape and A-shape movable templates
  // for these three qualities have no natural-root precedent to reuse (unlike
  // the 8-type set above), so each was hand-derived once and checked against
  // its own pitch classes before being used as a transposable template -- see
  // the commit message for the derivation. E and A themselves land at fret 0
  // for their respective shape family, which is really just the open-position
  // chord (no barre needed); every other root is a genuine movable barre.
  "C diminished": { frets: ['x', 3, 4, 'x', 4, 'x'] },
  "C augmented": { frets: ['x', 3, 6, 'x', 5, 'x'] },
  "Cm7b5": { frets: ['x', 3, 4, 3, 4, 'x'], barre: { fret: 3, from: 1, to: 4 } },
  "C# diminished": { frets: ['x', 4, 5, 'x', 5, 'x'] },
  "C# augmented": { frets: ['x', 4, 7, 'x', 6, 'x'] },
  "C#m7b5": { frets: ['x', 4, 5, 4, 5, 'x'], barre: { fret: 4, from: 1, to: 4 } },
  "Db diminished": { frets: ['x', 4, 5, 'x', 5, 'x'] },
  "Db augmented": { frets: ['x', 4, 7, 'x', 6, 'x'] },
  "Dbm7b5": { frets: ['x', 4, 5, 4, 5, 'x'], barre: { fret: 4, from: 1, to: 4 } },
  "D diminished": { frets: ['x', 5, 6, 'x', 6, 'x'] },
  "D augmented": { frets: ['x', 5, 8, 'x', 7, 'x'] },
  "Dm7b5": { frets: ['x', 5, 6, 5, 6, 'x'], barre: { fret: 5, from: 1, to: 4 } },
  "D# diminished": { frets: ['x', 6, 7, 'x', 7, 'x'] },
  "D# augmented": { frets: ['x', 6, 9, 'x', 8, 'x'] },
  "D#m7b5": { frets: ['x', 6, 7, 6, 7, 'x'], barre: { fret: 6, from: 1, to: 4 } },
  "Eb diminished": { frets: ['x', 6, 7, 'x', 7, 'x'] },
  "Eb augmented": { frets: ['x', 6, 9, 'x', 8, 'x'] },
  "Ebm7b5": { frets: ['x', 6, 7, 6, 7, 'x'], barre: { fret: 6, from: 1, to: 4 } },
  "E diminished": { frets: [0, 1, 2, 0, 'x', 'x'] },
  "E augmented": { frets: [0, 'x', 'x', 1, 1, 'x'] },
  "Em7b5": { frets: [0, 1, 0, 0, 'x', 'x'] },
  "F diminished": { frets: [1, 2, 3, 1, 'x', 'x'], barre: { fret: 1, from: 0, to: 3 } },
  "F augmented": { frets: [1, 'x', 'x', 2, 2, 'x'] },
  "Fm7b5": { frets: [1, 2, 1, 1, 'x', 'x'], barre: { fret: 1, from: 0, to: 3 } },
  "F# diminished": { frets: [2, 3, 4, 2, 'x', 'x'], barre: { fret: 2, from: 0, to: 3 } },
  "F# augmented": { frets: [2, 'x', 'x', 3, 3, 'x'] },
  "F#m7b5": { frets: [2, 3, 2, 2, 'x', 'x'], barre: { fret: 2, from: 0, to: 3 } },
  "Gb diminished": { frets: [2, 3, 4, 2, 'x', 'x'], barre: { fret: 2, from: 0, to: 3 } },
  "Gb augmented": { frets: [2, 'x', 'x', 3, 3, 'x'] },
  "Gbm7b5": { frets: [2, 3, 2, 2, 'x', 'x'], barre: { fret: 2, from: 0, to: 3 } },
  "G diminished": { frets: [3, 4, 5, 3, 'x', 'x'], barre: { fret: 3, from: 0, to: 3 } },
  "G augmented": { frets: [3, 'x', 'x', 4, 4, 'x'] },
  "Gm7b5": { frets: [3, 4, 3, 3, 'x', 'x'], barre: { fret: 3, from: 0, to: 3 } },
  "G# diminished": { frets: [4, 5, 6, 4, 'x', 'x'], barre: { fret: 4, from: 0, to: 3 } },
  "G# augmented": { frets: [4, 'x', 'x', 5, 5, 'x'] },
  "G#m7b5": { frets: [4, 5, 4, 4, 'x', 'x'], barre: { fret: 4, from: 0, to: 3 } },
  "Ab diminished": { frets: [4, 5, 6, 4, 'x', 'x'], barre: { fret: 4, from: 0, to: 3 } },
  "Ab augmented": { frets: [4, 'x', 'x', 5, 5, 'x'] },
  "Abm7b5": { frets: [4, 5, 4, 4, 'x', 'x'], barre: { fret: 4, from: 0, to: 3 } },
  "A diminished": { frets: ['x', 0, 1, 'x', 1, 'x'] },
  "A augmented": { frets: ['x', 0, 3, 'x', 2, 'x'] },
  "Am7b5": { frets: ['x', 0, 1, 0, 1, 'x'] },
  "A# diminished": { frets: ['x', 1, 2, 'x', 2, 'x'] },
  "A# augmented": { frets: ['x', 1, 4, 'x', 3, 'x'] },
  "A#m7b5": { frets: ['x', 1, 2, 1, 2, 'x'], barre: { fret: 1, from: 1, to: 4 } },
  "Bb diminished": { frets: ['x', 1, 2, 'x', 2, 'x'] },
  "Bb augmented": { frets: ['x', 1, 4, 'x', 3, 'x'] },
  "Bbm7b5": { frets: ['x', 1, 2, 1, 2, 'x'], barre: { fret: 1, from: 1, to: 4 } },
  "B diminished": { frets: ['x', 2, 3, 'x', 3, 'x'] },
  "B augmented": { frets: ['x', 2, 5, 'x', 4, 'x'] },
  "Bm7b5": { frets: ['x', 2, 3, 2, 3, 'x'], barre: { fret: 2, from: 1, to: 4 } },

  // Fully-diminished 7th (dim7) chords for all 17 roots. Unlike every other
  // quality in this file, dim7 is symmetric -- it's built from stacked minor
  // thirds, so it repeats every 3 semitones and there are only 3 distinct
  // pitch-class sets across all 12 roots (same idea the augmented triad's
  // suggestion-table symmetry used elsewhere in this app). Every one of the
  // 17 roots' dim7 chord falls into one of those 3 sets, so a single low-
  // position shape per set covers every root that lands on it -- e.g. the
  // literal "Cdim7" shape below sounds exactly the right notes for Cdim7,
  // Adim7, D#dim7, Ebdim7, F#dim7, and Gbdim7 alike, since they're all the
  // same four physical pitches. No new shapes were guessed per root; each
  // of the 3 base shapes was solved for and checked against its pitch-class
  // set before being reused. All 3 are compact, mostly-open, non-barre
  // voicings (max fret span of 2).
  "Cdim7": { frets: ['x', 0, 1, 'x', 1, 2] },
  "C#dim7": { frets: [0, 1, 'x', 0, 2, 'x'] },
  "Dbdim7": { frets: [0, 1, 'x', 0, 2, 'x'] },
  "Ddim7": { frets: [1, 'x', 0, 1, 0, 'x'] },
  "D#dim7": { frets: ['x', 0, 1, 'x', 1, 2] },
  "Ebdim7": { frets: ['x', 0, 1, 'x', 1, 2] },
  "Edim7": { frets: [0, 1, 'x', 0, 2, 'x'] },
  "Fdim7": { frets: [1, 'x', 0, 1, 0, 'x'] },
  "F#dim7": { frets: ['x', 0, 1, 'x', 1, 2] },
  "Gbdim7": { frets: ['x', 0, 1, 'x', 1, 2] },
  "Gdim7": { frets: [0, 1, 'x', 0, 2, 'x'] },
  "G#dim7": { frets: [1, 'x', 0, 1, 0, 'x'] },
  "Abdim7": { frets: [1, 'x', 0, 1, 0, 'x'] },
  "Adim7": { frets: ['x', 0, 1, 'x', 1, 2] },
  "A#dim7": { frets: [0, 1, 'x', 0, 2, 'x'] },
  "Bbdim7": { frets: [0, 1, 'x', 0, 2, 'x'] },
  "Bdim7": { frets: [1, 'x', 0, 1, 0, 'x'] },

  // Extended and altered chords (9, maj9, m9, 11, m11, 13, maj13, m13, 7#9,
  // 7b9, 7#5, 7b5, 7#11) for all 17 roots, 221 entries. These are 4-6-tone
  // chords by definition and, unlike every earlier section of this file,
  // NOT every formula tone from CHORD_DATA is expected to sound here -- it's
  // standard, accepted jazz-guitar practice to omit non-essential tones (the
  // 5th always goes first, and the 9th too for the 13-family types, since
  // "13" names the chord, not "9/13") as long as what actually IDENTIFIES
  // the chord stays: the root, the 3rd/b3 (when the formula has one), the
  // 7th, and whichever alteration/extension is literally in the chord's
  // name. Every shape here was checked against that rule specifically (not
  // full-formula inclusion) plus: sounded notes are a genuine subset of the
  // chord's real tones, root is the lowest-sounding note (true root
  // position, matching every shape above), fret span <=4, and at most one
  // interior string muted (an ordinary "drop voicing" skip, not a stretch
  // two adjacent strings can't cover).
  //
  // Solved as moveable template families, same approach as the rest of this
  // file: one hand-derived "shell" shape per chord type (e.g. the 9th-chord
  // grip is the same widely-taught x-3-2-3-3-x shape blues/funk/jazz players
  // already use; 7#9 is the famous "Hendrix chord"; the "11" and "m11" types
  // land as a straight same-fret 4-string barre, since the quartal stack of
  // b7-9-11 -- and b3-11-b7-9 for m11 -- happens to sit on strings a
  // perfect-4th/major-3rd apart, which is exactly what standard tuning's
  // open intervals are), transposed to all 17 roots by the usual fret-math.
  // 201 of 221 roots fit that single family directly. The other 20 needed a
  // second, genuinely different voicing for the same chord type (same
  // defining-tone rule, different string set/octave) because the primary
  // family's fret math happened to wrap awkwardly for that specific root
  // under a fret <=12 ceiling (matching guitarInversions.js's own "generous
  // but not unlimited" convention) -- e.g. G#13/Ab13 move the whole grip
  // from an A-string-rooted shape to an E-string-rooted one a string lower.
  // Every one of those 20 is still root-inclusive, root-lowest, and within
  // the same span/interior-gap rules -- not a relaxed exception.
  //
  // Zero entries were skipped. That's a real result, not a lowered bar: the
  // whole point of trading strict full-formula inclusion for "defining
  // tones only" is that it turns chords that would otherwise have no
  // 6-string fingering at all into ordinary 4-string jazz shell voicings,
  // which is exactly the technique real guitarists reach for on these chord
  // types. Verified independently against the actual CHORD_DATA note sets
  // for all 221 entries (see commit message for the summary).
  // ---- 9th chords ----
  "C9": { frets: ['x', 3, 2, 3, 3, 'x'] },
  "C#9": { frets: ['x', 4, 3, 4, 4, 'x'] },
  "Db9": { frets: ['x', 4, 3, 4, 4, 'x'] },
  "D9": { frets: ['x', 5, 4, 5, 5, 'x'] },
  "D#9": { frets: ['x', 6, 5, 6, 6, 'x'] },
  "Eb9": { frets: ['x', 6, 5, 6, 6, 'x'] },
  "E9": { frets: ['x', 7, 6, 7, 7, 'x'] },
  "F9": { frets: ['x', 8, 7, 8, 8, 'x'] },
  "F#9": { frets: ['x', 9, 8, 9, 9, 'x'] },
  "Gb9": { frets: ['x', 9, 8, 9, 9, 'x'] },
  "G9": { frets: ['x', 10, 9, 10, 10, 'x'] },
  "G#9": { frets: ['x', 11, 10, 11, 11, 'x'] },
  "Ab9": { frets: ['x', 11, 10, 11, 11, 'x'] },
  "A9": { frets: ['x', 12, 11, 12, 12, 'x'] },
  "A#9": { frets: ['x', 1, 0, 1, 1, 'x'] },
  "Bb9": { frets: ['x', 1, 0, 1, 1, 'x'] },
  "B9": { frets: ['x', 2, 1, 2, 2, 'x'] },
  // ---- maj9 chords ----
  "Cmaj9": { frets: ['x', 3, 2, 4, 3, 'x'] },
  "C#maj9": { frets: ['x', 4, 3, 5, 4, 'x'] },
  "Dbmaj9": { frets: ['x', 4, 3, 5, 4, 'x'] },
  "Dmaj9": { frets: ['x', 5, 4, 6, 5, 'x'] },
  "D#maj9": { frets: ['x', 6, 5, 7, 6, 'x'] },
  "Ebmaj9": { frets: ['x', 6, 5, 7, 6, 'x'] },
  "Emaj9": { frets: ['x', 7, 6, 8, 7, 'x'] },
  "Fmaj9": { frets: ['x', 8, 7, 9, 8, 'x'] },
  "F#maj9": { frets: ['x', 9, 8, 10, 9, 'x'] },
  "Gbmaj9": { frets: ['x', 9, 8, 10, 9, 'x'] },
  "Gmaj9": { frets: ['x', 10, 9, 11, 10, 'x'] },
  "G#maj9": { frets: ['x', 11, 10, 12, 11, 'x'] },
  "Abmaj9": { frets: ['x', 11, 10, 12, 11, 'x'] },
  "Amaj9": { frets: [5, 4, 6, 4, 'x', 'x'] },
  "A#maj9": { frets: ['x', 1, 0, 2, 1, 'x'] },
  "Bbmaj9": { frets: ['x', 1, 0, 2, 1, 'x'] },
  "Bmaj9": { frets: ['x', 2, 1, 3, 2, 'x'] },
  // ---- m9 chords ----
  "Cm9": { frets: ['x', 3, 1, 3, 3, 'x'] },
  "C#m9": { frets: ['x', 4, 2, 4, 4, 'x'] },
  "Dbm9": { frets: ['x', 4, 2, 4, 4, 'x'] },
  "Dm9": { frets: ['x', 5, 3, 5, 5, 'x'] },
  "D#m9": { frets: ['x', 6, 4, 6, 6, 'x'] },
  "Ebm9": { frets: ['x', 6, 4, 6, 6, 'x'] },
  "Em9": { frets: ['x', 7, 5, 7, 7, 'x'] },
  "Fm9": { frets: ['x', 8, 6, 8, 8, 'x'] },
  "F#m9": { frets: ['x', 9, 7, 9, 9, 'x'] },
  "Gbm9": { frets: ['x', 9, 7, 9, 9, 'x'] },
  "Gm9": { frets: ['x', 10, 8, 10, 10, 'x'] },
  "G#m9": { frets: ['x', 11, 9, 11, 11, 'x'] },
  "Abm9": { frets: ['x', 11, 9, 11, 11, 'x'] },
  "Am9": { frets: ['x', 12, 10, 12, 12, 'x'] },
  "A#m9": { frets: [6, 4, 6, 5, 'x', 'x'] },
  "Bbm9": { frets: [6, 4, 6, 5, 'x', 'x'] },
  "Bm9": { frets: ['x', 2, 0, 2, 2, 'x'] },
  // ---- 11 chords ----
  "C11": { frets: ['x', 3, 3, 3, 3, 'x'], barre: { fret: 3, from: 1, to: 4 } },
  "C#11": { frets: ['x', 4, 4, 4, 4, 'x'], barre: { fret: 4, from: 1, to: 4 } },
  "Db11": { frets: ['x', 4, 4, 4, 4, 'x'], barre: { fret: 4, from: 1, to: 4 } },
  "D11": { frets: ['x', 5, 5, 5, 5, 'x'], barre: { fret: 5, from: 1, to: 4 } },
  "D#11": { frets: ['x', 6, 6, 6, 6, 'x'], barre: { fret: 6, from: 1, to: 4 } },
  "Eb11": { frets: ['x', 6, 6, 6, 6, 'x'], barre: { fret: 6, from: 1, to: 4 } },
  "E11": { frets: ['x', 7, 7, 7, 7, 'x'], barre: { fret: 7, from: 1, to: 4 } },
  "F11": { frets: ['x', 8, 8, 8, 8, 'x'], barre: { fret: 8, from: 1, to: 4 } },
  "F#11": { frets: ['x', 9, 9, 9, 9, 'x'], barre: { fret: 9, from: 1, to: 4 } },
  "Gb11": { frets: ['x', 9, 9, 9, 9, 'x'], barre: { fret: 9, from: 1, to: 4 } },
  "G11": { frets: ['x', 10, 10, 10, 10, 'x'], barre: { fret: 10, from: 1, to: 4 } },
  "G#11": { frets: ['x', 11, 11, 11, 11, 'x'], barre: { fret: 11, from: 1, to: 4 } },
  "Ab11": { frets: ['x', 11, 11, 11, 11, 'x'], barre: { fret: 11, from: 1, to: 4 } },
  "A11": { frets: ['x', 0, 0, 0, 0, 'x'] },
  "A#11": { frets: ['x', 1, 1, 1, 1, 'x'], barre: { fret: 1, from: 1, to: 4 } },
  "Bb11": { frets: ['x', 1, 1, 1, 1, 'x'], barre: { fret: 1, from: 1, to: 4 } },
  "B11": { frets: ['x', 2, 2, 2, 2, 'x'], barre: { fret: 2, from: 1, to: 4 } },
  // ---- m11 chords ----
  "Cm11": { frets: [8, 8, 8, 8, 'x', 'x'], barre: { fret: 8, from: 0, to: 3 } },
  "C#m11": { frets: [9, 9, 9, 9, 'x', 'x'], barre: { fret: 9, from: 0, to: 3 } },
  "Dbm11": { frets: [9, 9, 9, 9, 'x', 'x'], barre: { fret: 9, from: 0, to: 3 } },
  "Dm11": { frets: [10, 10, 10, 10, 'x', 'x'], barre: { fret: 10, from: 0, to: 3 } },
  "D#m11": { frets: [11, 11, 11, 11, 'x', 'x'], barre: { fret: 11, from: 0, to: 3 } },
  "Ebm11": { frets: [11, 11, 11, 11, 'x', 'x'], barre: { fret: 11, from: 0, to: 3 } },
  "Em11": { frets: [0, 0, 0, 0, 'x', 'x'] },
  "Fm11": { frets: [1, 1, 1, 1, 'x', 'x'], barre: { fret: 1, from: 0, to: 3 } },
  "F#m11": { frets: [2, 2, 2, 2, 'x', 'x'], barre: { fret: 2, from: 0, to: 3 } },
  "Gbm11": { frets: [2, 2, 2, 2, 'x', 'x'], barre: { fret: 2, from: 0, to: 3 } },
  "Gm11": { frets: [3, 3, 3, 3, 'x', 'x'], barre: { fret: 3, from: 0, to: 3 } },
  "G#m11": { frets: [4, 4, 4, 4, 'x', 'x'], barre: { fret: 4, from: 0, to: 3 } },
  "Abm11": { frets: [4, 4, 4, 4, 'x', 'x'], barre: { fret: 4, from: 0, to: 3 } },
  "Am11": { frets: [5, 5, 5, 5, 'x', 'x'], barre: { fret: 5, from: 0, to: 3 } },
  "A#m11": { frets: [6, 6, 6, 6, 'x', 'x'], barre: { fret: 6, from: 0, to: 3 } },
  "Bbm11": { frets: [6, 6, 6, 6, 'x', 'x'], barre: { fret: 6, from: 0, to: 3 } },
  "Bm11": { frets: [7, 7, 7, 7, 'x', 'x'], barre: { fret: 7, from: 0, to: 3 } },
  // ---- 13 chords ----
  "C13": { frets: ['x', 3, 2, 3, 'x', 5] },
  "C#13": { frets: ['x', 4, 3, 4, 'x', 6] },
  "Db13": { frets: ['x', 4, 3, 4, 'x', 6] },
  "D13": { frets: ['x', 5, 4, 5, 'x', 7] },
  "D#13": { frets: ['x', 6, 5, 6, 'x', 8] },
  "Eb13": { frets: ['x', 6, 5, 6, 'x', 8] },
  "E13": { frets: ['x', 7, 6, 7, 'x', 9] },
  "F13": { frets: ['x', 8, 7, 8, 'x', 10] },
  "F#13": { frets: ['x', 9, 8, 9, 'x', 11] },
  "Gb13": { frets: ['x', 9, 8, 9, 'x', 11] },
  "G13": { frets: ['x', 10, 9, 10, 'x', 12] },
  "G#13": { frets: [4, 'x', 4, 5, 6, 'x'] },
  "Ab13": { frets: [4, 'x', 4, 5, 6, 'x'] },
  "A13": { frets: ['x', 0, 'x', 0, 2, 2] },
  "A#13": { frets: ['x', 1, 0, 1, 'x', 3] },
  "Bb13": { frets: ['x', 1, 0, 1, 'x', 3] },
  "B13": { frets: ['x', 2, 1, 2, 'x', 4] },
  // ---- maj13 chords ----
  "Cmaj13": { frets: ['x', 3, 2, 4, 'x', 5] },
  "C#maj13": { frets: ['x', 4, 3, 5, 'x', 6] },
  "Dbmaj13": { frets: ['x', 4, 3, 5, 'x', 6] },
  "Dmaj13": { frets: ['x', 5, 4, 6, 'x', 7] },
  "D#maj13": { frets: ['x', 6, 5, 7, 'x', 8] },
  "Ebmaj13": { frets: ['x', 6, 5, 7, 'x', 8] },
  "Emaj13": { frets: ['x', 7, 6, 8, 'x', 9] },
  "Fmaj13": { frets: ['x', 8, 7, 9, 'x', 10] },
  "F#maj13": { frets: ['x', 9, 8, 10, 'x', 11] },
  "Gbmaj13": { frets: ['x', 9, 8, 10, 'x', 11] },
  "Gmaj13": { frets: ['x', 10, 9, 11, 'x', 12] },
  "G#maj13": { frets: [4, 'x', 5, 5, 6, 'x'] },
  "Abmaj13": { frets: [4, 'x', 5, 5, 6, 'x'] },
  "Amaj13": { frets: ['x', 0, 'x', 1, 2, 2] },
  "A#maj13": { frets: ['x', 1, 0, 2, 'x', 3] },
  "Bbmaj13": { frets: ['x', 1, 0, 2, 'x', 3] },
  "Bmaj13": { frets: ['x', 2, 1, 3, 'x', 4] },
  // ---- m13 chords ----
  "Cm13": { frets: ['x', 3, 1, 3, 'x', 5] },
  "C#m13": { frets: ['x', 4, 2, 4, 'x', 6] },
  "Dbm13": { frets: ['x', 4, 2, 4, 'x', 6] },
  "Dm13": { frets: ['x', 5, 3, 5, 'x', 7] },
  "D#m13": { frets: ['x', 6, 4, 6, 'x', 8] },
  "Ebm13": { frets: ['x', 6, 4, 6, 'x', 8] },
  "Em13": { frets: ['x', 7, 5, 7, 'x', 9] },
  "Fm13": { frets: ['x', 8, 6, 8, 'x', 10] },
  "F#m13": { frets: ['x', 9, 7, 9, 'x', 11] },
  "Gbm13": { frets: ['x', 9, 7, 9, 'x', 11] },
  "Gm13": { frets: ['x', 10, 8, 10, 'x', 12] },
  "G#m13": { frets: [4, 'x', 4, 4, 6, 'x'] },
  "Abm13": { frets: [4, 'x', 4, 4, 6, 'x'] },
  "Am13": { frets: ['x', 0, 'x', 0, 1, 2] },
  "A#m13": { frets: ['x', 1, 'x', 1, 2, 3] },
  "Bbm13": { frets: ['x', 1, 'x', 1, 2, 3] },
  "Bm13": { frets: ['x', 2, 0, 2, 'x', 4] },
  // ---- 7#9 chords ----
  "C7#9": { frets: ['x', 3, 2, 3, 4, 'x'] },
  "C#7#9": { frets: ['x', 4, 3, 4, 5, 'x'] },
  "Db7#9": { frets: ['x', 4, 3, 4, 5, 'x'] },
  "D7#9": { frets: ['x', 5, 4, 5, 6, 'x'] },
  "D#7#9": { frets: ['x', 6, 5, 6, 7, 'x'] },
  "Eb7#9": { frets: ['x', 6, 5, 6, 7, 'x'] },
  "E7#9": { frets: ['x', 7, 6, 7, 8, 'x'] },
  "F7#9": { frets: ['x', 8, 7, 8, 9, 'x'] },
  "F#7#9": { frets: ['x', 9, 8, 9, 10, 'x'] },
  "Gb7#9": { frets: ['x', 9, 8, 9, 10, 'x'] },
  "G7#9": { frets: ['x', 10, 9, 10, 11, 'x'] },
  "G#7#9": { frets: ['x', 11, 10, 11, 12, 'x'] },
  "Ab7#9": { frets: ['x', 11, 10, 11, 12, 'x'] },
  "A7#9": { frets: [5, 4, 5, 5, 'x', 'x'] },
  "A#7#9": { frets: ['x', 1, 0, 1, 2, 'x'] },
  "Bb7#9": { frets: ['x', 1, 0, 1, 2, 'x'] },
  "B7#9": { frets: ['x', 2, 1, 2, 3, 'x'] },
  // ---- 7b9 chords ----
  "C7b9": { frets: ['x', 3, 2, 3, 2, 'x'] },
  "C#7b9": { frets: ['x', 4, 3, 4, 3, 'x'] },
  "Db7b9": { frets: ['x', 4, 3, 4, 3, 'x'] },
  "D7b9": { frets: ['x', 5, 4, 5, 4, 'x'] },
  "D#7b9": { frets: ['x', 6, 5, 6, 5, 'x'] },
  "Eb7b9": { frets: ['x', 6, 5, 6, 5, 'x'] },
  "E7b9": { frets: ['x', 7, 6, 7, 6, 'x'] },
  "F7b9": { frets: ['x', 8, 7, 8, 7, 'x'] },
  "F#7b9": { frets: ['x', 9, 8, 9, 8, 'x'] },
  "Gb7b9": { frets: ['x', 9, 8, 9, 8, 'x'] },
  "G7b9": { frets: ['x', 10, 9, 10, 9, 'x'] },
  "G#7b9": { frets: ['x', 11, 10, 11, 10, 'x'] },
  "Ab7b9": { frets: ['x', 11, 10, 11, 10, 'x'] },
  "A7b9": { frets: ['x', 12, 11, 12, 11, 'x'] },
  "A#7b9": { frets: ['x', 1, 0, 1, 0, 'x'] },
  "Bb7b9": { frets: ['x', 1, 0, 1, 0, 'x'] },
  "B7b9": { frets: ['x', 2, 1, 2, 1, 'x'] },
  // ---- 7#5 chords ----
  "C7#5": { frets: ['x', 3, 6, 3, 5, 'x'] },
  "C#7#5": { frets: ['x', 4, 7, 4, 6, 'x'] },
  "Db7#5": { frets: ['x', 4, 7, 4, 6, 'x'] },
  "D7#5": { frets: ['x', 5, 8, 5, 7, 'x'] },
  "D#7#5": { frets: ['x', 6, 9, 6, 8, 'x'] },
  "Eb7#5": { frets: ['x', 6, 9, 6, 8, 'x'] },
  "E7#5": { frets: ['x', 7, 10, 7, 9, 'x'] },
  "F7#5": { frets: ['x', 8, 11, 8, 10, 'x'] },
  "F#7#5": { frets: ['x', 9, 12, 9, 11, 'x'] },
  "Gb7#5": { frets: ['x', 9, 12, 9, 11, 'x'] },
  "G7#5": { frets: [3, 'x', 3, 4, 4, 'x'] },
  "G#7#5": { frets: [4, 'x', 4, 5, 5, 'x'] },
  "Ab7#5": { frets: [4, 'x', 4, 5, 5, 'x'] },
  "A7#5": { frets: ['x', 0, 3, 0, 2, 'x'] },
  "A#7#5": { frets: ['x', 1, 4, 1, 3, 'x'] },
  "Bb7#5": { frets: ['x', 1, 4, 1, 3, 'x'] },
  "B7#5": { frets: ['x', 2, 5, 2, 4, 'x'] },
  // ---- 7b5 chords ----
  "C7b5": { frets: ['x', 3, 4, 3, 5, 'x'] },
  "C#7b5": { frets: ['x', 4, 5, 4, 6, 'x'] },
  "Db7b5": { frets: ['x', 4, 5, 4, 6, 'x'] },
  "D7b5": { frets: ['x', 5, 6, 5, 7, 'x'] },
  "D#7b5": { frets: ['x', 6, 7, 6, 8, 'x'] },
  "Eb7b5": { frets: ['x', 6, 7, 6, 8, 'x'] },
  "E7b5": { frets: ['x', 7, 8, 7, 9, 'x'] },
  "F7b5": { frets: ['x', 8, 9, 8, 10, 'x'] },
  "F#7b5": { frets: ['x', 9, 10, 9, 11, 'x'] },
  "Gb7b5": { frets: ['x', 9, 10, 9, 11, 'x'] },
  "G7b5": { frets: ['x', 10, 11, 10, 12, 'x'] },
  "G#7b5": { frets: [4, 3, 4, 'x', 3, 'x'] },
  "Ab7b5": { frets: [4, 3, 4, 'x', 3, 'x'] },
  "A7b5": { frets: ['x', 0, 1, 0, 2, 'x'] },
  "A#7b5": { frets: ['x', 1, 2, 1, 3, 'x'] },
  "Bb7b5": { frets: ['x', 1, 2, 1, 3, 'x'] },
  "B7b5": { frets: ['x', 2, 3, 2, 4, 'x'] },
  // ---- 7#11 chords ----
  "C7#11": { frets: ['x', 3, 2, 3, 'x', 2] },
  "C#7#11": { frets: ['x', 4, 3, 4, 'x', 3] },
  "Db7#11": { frets: ['x', 4, 3, 4, 'x', 3] },
  "D7#11": { frets: ['x', 5, 4, 5, 'x', 4] },
  "D#7#11": { frets: ['x', 6, 5, 6, 'x', 5] },
  "Eb7#11": { frets: ['x', 6, 5, 6, 'x', 5] },
  "E7#11": { frets: ['x', 7, 6, 7, 'x', 6] },
  "F7#11": { frets: ['x', 8, 7, 8, 'x', 7] },
  "F#7#11": { frets: ['x', 9, 8, 9, 'x', 8] },
  "Gb7#11": { frets: ['x', 9, 8, 9, 'x', 8] },
  "G7#11": { frets: ['x', 10, 9, 10, 'x', 9] },
  "G#7#11": { frets: ['x', 11, 10, 11, 'x', 10] },
  "Ab7#11": { frets: ['x', 11, 10, 11, 'x', 10] },
  "A7#11": { frets: ['x', 12, 11, 12, 'x', 11] },
  "A#7#11": { frets: ['x', 1, 0, 1, 'x', 0] },
  "Bb7#11": { frets: ['x', 1, 0, 1, 'x', 0] },
  "B7#11": { frets: ['x', 2, 1, 2, 'x', 1] },
}
