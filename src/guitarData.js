// Curated guitar chord shapes for every chord in CHORD_DATA (56 entries: 7
// natural roots x 8 types). Each shape is a standard-tuning (E A D G B e,
// low to high) fret array — 'x' for muted, 0 for open, or a fret number.
// Open-position shapes are used wherever a real one exists; everything else
// falls back to a movable E-shape or A-shape barre (annotated via `barre`),
// or an easier non-barre voicing where one is well established (e.g. Fmaj7).
// Every shape's actual sounding notes were checked against the chord's real
// tones before inclusion — not auto-generated.

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
}
