// Diatonic 7th-chord harmony lookup table, covering all 17 roots as tonic in
// both major and minor (34 keys total -- matches the root dropdown exactly).
//
// Standard diatonic 7th-chord harmony:
//   Major key:        I maj7, ii m7, iii m7, IV maj7, V 7, vi m7, vii° m7b5
//   Natural minor key: i m7, ii° m7b5, III maj7, iv m7, v m7, VI maj7, VII 7
//
// Each degree's chord root was computed via Tonal's Key.majorKey/minorKey
// (.natural).chords -- the same method already used for the bVI/bIII/
// borrowed-IV/II suggestion tables in prior sessions -- then practically
// respelled (Tonal's raw output includes theoretical spellings like Cb, Fb,
// E#, B#, and double accidentals such as F##/Bbb for the more remote keys;
// these were simplified to the matching natural-note spelling) so every
// value is an exact, existing CHORD_DATA key string. No new chord entries
// were generated here -- every one of the 238 lookups below (34 keys x 7
// degrees) resolves to a chord type already added to chordData.js.
//
// Verified programmatically: all 238 lookups resolve to a real CHORD_DATA
// key, zero misses.
export const DIATONIC_CHORDS = {
  "C major": { "I": "Cmaj7", "ii": "Dm7", "iii": "Em7", "IV": "Fmaj7", "V": "G7", "vi": "Am7", "vii°": "Bm7b5" },
  "C minor": { "i": "Cm7", "ii°": "Dm7b5", "III": "Ebmaj7", "iv": "Fm7", "v": "Gm7", "VI": "Abmaj7", "VII": "Bb7" },
  "C# major": { "I": "C#maj7", "ii": "D#m7", "iii": "Fm7", "IV": "F#maj7", "V": "G#7", "vi": "A#m7", "vii°": "Cm7b5" },
  "C# minor": { "i": "C#m7", "ii°": "D#m7b5", "III": "Emaj7", "iv": "F#m7", "v": "G#m7", "VI": "Amaj7", "VII": "B7" },
  "Db major": { "I": "Dbmaj7", "ii": "Ebm7", "iii": "Fm7", "IV": "Gbmaj7", "V": "Ab7", "vi": "Bbm7", "vii°": "Cm7b5" },
  "Db minor": { "i": "Dbm7", "ii°": "Ebm7b5", "III": "Emaj7", "iv": "Gbm7", "v": "Abm7", "VI": "Amaj7", "VII": "B7" },
  "D major": { "I": "Dmaj7", "ii": "Em7", "iii": "F#m7", "IV": "Gmaj7", "V": "A7", "vi": "Bm7", "vii°": "C#m7b5" },
  "D minor": { "i": "Dm7", "ii°": "Em7b5", "III": "Fmaj7", "iv": "Gm7", "v": "Am7", "VI": "Bbmaj7", "VII": "C7" },
  "D# major": { "I": "D#maj7", "ii": "Fm7", "iii": "Gm7", "IV": "G#maj7", "V": "A#7", "vi": "Cm7", "vii°": "Dm7b5" },
  "D# minor": { "i": "D#m7", "ii°": "Fm7b5", "III": "F#maj7", "iv": "G#m7", "v": "A#m7", "VI": "Bmaj7", "VII": "C#7" },
  "Eb major": { "I": "Ebmaj7", "ii": "Fm7", "iii": "Gm7", "IV": "Abmaj7", "V": "Bb7", "vi": "Cm7", "vii°": "Dm7b5" },
  "Eb minor": { "i": "Ebm7", "ii°": "Fm7b5", "III": "Gbmaj7", "iv": "Abm7", "v": "Bbm7", "VI": "Bmaj7", "VII": "Db7" },
  "E major": { "I": "Emaj7", "ii": "F#m7", "iii": "G#m7", "IV": "Amaj7", "V": "B7", "vi": "C#m7", "vii°": "D#m7b5" },
  "E minor": { "i": "Em7", "ii°": "F#m7b5", "III": "Gmaj7", "iv": "Am7", "v": "Bm7", "VI": "Cmaj7", "VII": "D7" },
  "F major": { "I": "Fmaj7", "ii": "Gm7", "iii": "Am7", "IV": "Bbmaj7", "V": "C7", "vi": "Dm7", "vii°": "Em7b5" },
  "F minor": { "i": "Fm7", "ii°": "Gm7b5", "III": "Abmaj7", "iv": "Bbm7", "v": "Cm7", "VI": "Dbmaj7", "VII": "Eb7" },
  "F# major": { "I": "F#maj7", "ii": "G#m7", "iii": "A#m7", "IV": "Bmaj7", "V": "C#7", "vi": "D#m7", "vii°": "Fm7b5" },
  "F# minor": { "i": "F#m7", "ii°": "G#m7b5", "III": "Amaj7", "iv": "Bm7", "v": "C#m7", "VI": "Dmaj7", "VII": "E7" },
  "Gb major": { "I": "Gbmaj7", "ii": "Abm7", "iii": "Bbm7", "IV": "Bmaj7", "V": "Db7", "vi": "Ebm7", "vii°": "Fm7b5" },
  "Gb minor": { "i": "Gbm7", "ii°": "Abm7b5", "III": "Amaj7", "iv": "Bm7", "v": "Dbm7", "VI": "Dmaj7", "VII": "E7" },
  "G major": { "I": "Gmaj7", "ii": "Am7", "iii": "Bm7", "IV": "Cmaj7", "V": "D7", "vi": "Em7", "vii°": "F#m7b5" },
  "G minor": { "i": "Gm7", "ii°": "Am7b5", "III": "Bbmaj7", "iv": "Cm7", "v": "Dm7", "VI": "Ebmaj7", "VII": "F7" },
  "G# major": { "I": "G#maj7", "ii": "A#m7", "iii": "Cm7", "IV": "C#maj7", "V": "D#7", "vi": "Fm7", "vii°": "Gm7b5" },
  "G# minor": { "i": "G#m7", "ii°": "A#m7b5", "III": "Bmaj7", "iv": "C#m7", "v": "D#m7", "VI": "Emaj7", "VII": "F#7" },
  "Ab major": { "I": "Abmaj7", "ii": "Bbm7", "iii": "Cm7", "IV": "Dbmaj7", "V": "Eb7", "vi": "Fm7", "vii°": "Gm7b5" },
  "Ab minor": { "i": "Abm7", "ii°": "Bbm7b5", "III": "Bmaj7", "iv": "Dbm7", "v": "Ebm7", "VI": "Emaj7", "VII": "Gb7" },
  "A major": { "I": "Amaj7", "ii": "Bm7", "iii": "C#m7", "IV": "Dmaj7", "V": "E7", "vi": "F#m7", "vii°": "G#m7b5" },
  "A minor": { "i": "Am7", "ii°": "Bm7b5", "III": "Cmaj7", "iv": "Dm7", "v": "Em7", "VI": "Fmaj7", "VII": "G7" },
  "A# major": { "I": "A#maj7", "ii": "Cm7", "iii": "Dm7", "IV": "D#maj7", "V": "F7", "vi": "Gm7", "vii°": "Am7b5" },
  "A# minor": { "i": "A#m7", "ii°": "Cm7b5", "III": "C#maj7", "iv": "D#m7", "v": "Fm7", "VI": "F#maj7", "VII": "G#7" },
  "Bb major": { "I": "Bbmaj7", "ii": "Cm7", "iii": "Dm7", "IV": "Ebmaj7", "V": "F7", "vi": "Gm7", "vii°": "Am7b5" },
  "Bb minor": { "i": "Bbm7", "ii°": "Cm7b5", "III": "Dbmaj7", "iv": "Ebm7", "v": "Fm7", "VI": "Gbmaj7", "VII": "Ab7" },
  "B major": { "I": "Bmaj7", "ii": "C#m7", "iii": "D#m7", "IV": "Emaj7", "V": "F#7", "vi": "G#m7", "vii°": "A#m7b5" },
  "B minor": { "i": "Bm7", "ii°": "C#m7b5", "III": "Dmaj7", "iv": "Em7", "v": "F#m7", "VI": "Gmaj7", "VII": "A7" }
};
