// Named chord progression templates. Each template is a Roman-numeral degree
// sequence, a genre/mood tag, and a one-sentence plain-English explanation --
// never a fixed set of chords in one key. Realizing a template into an actual
// key's chords happens at selection time by looking up each degree in
// DIATONIC_CHORDS (diatonicChords.js) for the chosen key, so the same
// template plays in any of the 34 keys.
//
// One nuance worth flagging for whoever writes that realization step: two of
// the minor-mode templates below ("Minor ii-V-i" and "Andalusian Cadence")
// use an uppercase "V" degree. DIATONIC_CHORDS only models natural minor
// harmony, where the fifth degree is a minor triad/m7 ("v", lowercase) --
// there is no "V" entry in any minor key's table. The uppercase "V" here is
// the classic borrowed harmonic-minor dominant (the raised leading tone
// turns the natural minor's v-m7 into a dominant 7 a half step away from a
// clean resolution to i) -- it's what every real recording and jazz chart
// actually plays for these two progressions, not a typo. Its root is always
// identical to that key's natural-minor "v" degree root; only the chord
// quality changes, from m7 to dominant 7 (e.g. in A minor, "v" is Em7 and
// the borrowed "V" is E7 -- same root, different suffix). Since CHORD_DATA
// has a "{root}7" entry for every one of the 17 roots regardless of key,
// that substitution -- reuse the "v" degree's root, look up "{root}7"
// instead of "{root}m7" -- always resolves to an existing chord.
export const PROGRESSION_TEMPLATES = [
  {
    name: "50s Progression",
    mode: "major",
    degrees: ["I", "vi", "IV", "V"],
    mood: "Nostalgic",
    description: "The doo-wop classic behind hundreds of songs.",
  },
  {
    name: "Pop Loop",
    mode: "major",
    degrees: ["I", "V", "vi", "IV"],
    mood: "Anthemic",
    description: "The most-used four chords in modern pop.",
  },
  {
    name: "Jazz Turnaround",
    mode: "major",
    degrees: ["ii", "V", "I"],
    mood: "Sophisticated",
    description: "The engine of jazz harmony — tension into resolution.",
  },
  {
    name: "Circle Progression",
    mode: "major",
    degrees: ["vi", "ii", "V", "I"],
    mood: "Purposeful",
    description: "Chords falling in fifths, always pulling forward.",
  },
  {
    name: "Minor ii–V–i",
    mode: "minor",
    degrees: ["ii°", "V", "i"],
    mood: "Moody",
    description: "The half-diminished chord gives this its dark, jazzy pull toward home.",
  },
  {
    name: "Andalusian Cadence",
    mode: "minor",
    degrees: ["i", "VII", "VI", "V"],
    mood: "Cinematic",
    description: "A descending minor-key classic, flamenco and film-score alike.",
  },
  {
    name: "50s Doo-Wop Minor",
    mode: "minor",
    degrees: ["i", "VI", "III", "VII"],
    mood: "Wistful",
    description: "The minor-key cousin of the 50s progression.",
  },
];
