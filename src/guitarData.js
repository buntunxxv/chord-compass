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
// The remaining 131 (10 accidental roots' 8-type set, plus diminished/
// augmented/m7b5 for all 17 roots) were added in a later pass, entirely via
// movable-barre transposition of the natural roots' own already-verified
// "E ..."/"A ..." shapes -- see the section comments below.

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
}
