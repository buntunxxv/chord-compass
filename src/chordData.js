export const CHORD_DATA = {
  "C major":  { notes: ["C4","E4","G4"],    next: [{ chord: "Am7",   notes: ["A3","C4","E4","G4"], label: "Familiar" }, { chord: "Fmaj7", notes: ["F3","A3","C4","E4"], label: "Opens out" }, { chord: "G",     notes: ["G3","B3","D4"], label: "Moves forward" }] },
  "C minor":  { notes: ["C4","Eb4","G4"],   next: [{ chord: "Ab",    notes: ["Ab3","C4","Eb4"], label: "Opens out" }, { chord: "Eb",    notes: ["Eb3","G3","Bb3"], label: "Lift" }, { chord: "G7",    notes: ["G3","B3","D4","F4"], label: "Tension" }] },
  "C7":       { notes: ["C4","E4","G4","Bb4"], next: [{ chord: "F",  notes: ["F3","A3","C4"], label: "Tension" }, { chord: "Fm",    notes: ["F3","Ab3","C4"], label: "Darker" }, { chord: "Am",    notes: ["A3","C4","E4"], label: "Familiar" }] },
  "Cmaj7":    { notes: ["C4","E4","G4","B4"],  next: [{ chord: "Am7",notes: ["A3","C4","E4","G4"], label: "Familiar" }, { chord: "Fmaj7",notes: ["F3","A3","C4","E4"], label: "Opens out" }, { chord: "Dm7",  notes: ["D4","F4","A4","C5"], label: "Moves forward" }] },
  "Cm7":      { notes: ["C4","Eb4","G4","Bb4"],next: [{ chord: "Fm7",notes: ["F3","Ab3","C4","Eb4"], label: "Darker" }, { chord: "Abmaj7",notes: ["Ab3","C4","Eb4","G4"], label: "Opens out" }, { chord: "Ebmaj7",notes: ["Eb3","G3","Bb3","D4"], label: "Familiar" }] },
  "Cadd9":    { notes: ["C4","E4","G4","D5"],  next: [{ chord: "G",  notes: ["G3","B3","D4"], label: "Opens out" }, { chord: "Am",    notes: ["A3","C4","E4"], label: "Familiar" }, { chord: "Fmaj7",notes: ["F3","A3","C4","E4"], label: "Lift" }] },
  "Csus4":    { notes: ["C4","F4","G4"],        next: [{ chord: "C",  notes: ["C4","E4","G4"], label: "Resolution" }, { chord: "Am",    notes: ["A3","C4","E4"], label: "Familiar" }, { chord: "G",     notes: ["G3","B3","D4"], label: "Moves forward" }] },
  "Fmaj7":    { notes: ["F3","A3","C4","E4"],   next: [{ chord: "C",  notes: ["C4","E4","G4"], label: "Familiar" }, { chord: "Am7",   notes: ["A3","C4","E4","G4"], label: "Darker" }, { chord: "Dm7",   notes: ["D4","F4","A4","C5"], label: "Moves forward" }] },
  "G7":       { notes: ["G3","B3","D4","F4"],   next: [{ chord: "C",  notes: ["C4","E4","G4"], label: "Resolution" }, { chord: "Cm",    notes: ["C4","Eb4","G4"], label: "Darker" }, { chord: "Em",    notes: ["E4","G4","B4"], label: "Familiar" }] },
  "Am7":      { notes: ["A3","C4","E4","G4"],   next: [{ chord: "Fmaj7",notes: ["F3","A3","C4","E4"], label: "Familiar" }, { chord: "Dm7",notes: ["D4","F4","A4","C5"], label: "Moves forward" }, { chord: "C",notes: ["C4","E4","G4"], label: "Opens out" }] },
  "Dm7":      { notes: ["D4","F4","A4","C5"],   next: [{ chord: "G7", notes: ["G3","B3","D4","F4"], label: "Tension" }, { chord: "Cmaj7",notes: ["C4","E4","G4","B4"], label: "Resolution" }, { chord: "Am7",notes: ["A3","C4","E4","G4"], label: "Familiar" }] },
  "E7":       { notes: ["E3","G#3","B3","D4"],  next: [{ chord: "Am", notes: ["A3","C4","E4"], label: "Tension" }, { chord: "Am7",   notes: ["A3","C4","E4","G4"], label: "Familiar" }, { chord: "A",     notes: ["A3","C#4","E4"], label: "Darker" }] },

  "D major": { notes: ["D4","F#4","A4"],   next: [{ chord: "Bm",  notes: ["B3","D4","F#4"],   label: "Familiar" }, { chord: "G",  notes: ["G3","B3","D4"],    label: "Opens out" },  { chord: "A",  notes: ["A3","C#4","E4"],   label: "Moves forward" }] },
  "D minor": { notes: ["D4","F4","A4"],    next: [{ chord: "Gm",  notes: ["G3","Bb3","D4"],   label: "Darker"   }, { chord: "Bb", notes: ["Bb3","D4","F4"],   label: "Opens out" },  { chord: "F",  notes: ["F3","A3","C4"],    label: "Familiar"      }] },
  "E major": { notes: ["E4","G#4","B4"],   next: [{ chord: "C#m", notes: ["C#4","E4","G#4"],  label: "Familiar" }, { chord: "A",  notes: ["A3","C#4","E4"],   label: "Opens out" },  { chord: "B",  notes: ["B3","D#4","F#4"],  label: "Moves forward" }] },
  "E minor": { notes: ["E4","G4","B4"],    next: [{ chord: "Am",  notes: ["A3","C4","E4"],    label: "Darker"   }, { chord: "C",  notes: ["C4","E4","G4"],    label: "Opens out" },  { chord: "G",  notes: ["G3","B3","D4"],    label: "Familiar"      }] },
  "F major": { notes: ["F3","A3","C4"],    next: [{ chord: "Dm",  notes: ["D4","F4","A4"],    label: "Familiar" }, { chord: "Bb", notes: ["Bb3","D4","F4"],   label: "Opens out" },  { chord: "C",  notes: ["C4","E4","G4"],    label: "Moves forward" }] },
  "F minor": { notes: ["F3","Ab3","C4"],   next: [{ chord: "Bbm", notes: ["Bb3","Db4","F4"],  label: "Darker"   }, { chord: "Db", notes: ["Db4","F4","Ab4"],  label: "Opens out" },  { chord: "Ab", notes: ["Ab3","C4","Eb4"],  label: "Familiar"      }] },
  "G major": { notes: ["G3","B3","D4"],    next: [{ chord: "Em",  notes: ["E4","G4","B4"],    label: "Familiar" }, { chord: "C",  notes: ["C4","E4","G4"],    label: "Opens out" },  { chord: "D",  notes: ["D4","F#4","A4"],   label: "Moves forward" }] },
  "G minor": { notes: ["G3","Bb3","D4"],   next: [{ chord: "Cm",  notes: ["C4","Eb4","G4"],   label: "Darker"   }, { chord: "Eb", notes: ["Eb3","G3","Bb3"],  label: "Opens out" },  { chord: "Bb", notes: ["Bb3","D4","F4"],   label: "Familiar"      }] },
  "A major": { notes: ["A3","C#4","E4"],   next: [{ chord: "F#m", notes: ["F#3","A3","C#4"],  label: "Familiar" }, { chord: "D",  notes: ["D4","F#4","A4"],   label: "Opens out" },  { chord: "E",  notes: ["E4","G#4","B4"],   label: "Moves forward" }] },
  "A minor": { notes: ["A3","C4","E4"],    next: [{ chord: "Dm",  notes: ["D4","F4","A4"],    label: "Darker"   }, { chord: "F",  notes: ["F3","A3","C4"],    label: "Opens out" },  { chord: "C",  notes: ["C4","E4","G4"],    label: "Familiar"      }] },
  "B major": { notes: ["B3","D#4","F#4"],  next: [{ chord: "G#m", notes: ["G#3","B3","D#4"],  label: "Familiar" }, { chord: "E",  notes: ["E4","G#4","B4"],   label: "Opens out" },  { chord: "F#", notes: ["F#3","A#3","C#4"], label: "Moves forward" }] },
  "B minor": { notes: ["B3","D4","F#4"],   next: [{ chord: "Em",  notes: ["E4","G4","B4"],    label: "Darker"   }, { chord: "G",  notes: ["G3","B3","D4"],    label: "Opens out" },  { chord: "D",  notes: ["D4","F#4","A4"],   label: "Familiar"      }] }
};

export const LABEL_COLORS = {
  "Familiar":       { bg: "#e8f5f5", text: "#117a79" },
  "Opens out":      { bg: "#e8f0fb", text: "#2a5fc9" },
  "Moves forward":  { bg: "#fff3e0", text: "#c26f00" },
  "Tension":        { bg: "#fde8e8", text: "#c0392b" },
  "Darker":         { bg: "#ede8f5", text: "#5b3fa0" },
  "Lift":           { bg: "#e8f5eb", text: "#1a7a3a" },
  "Surprise":       { bg: "#fde8f5", text: "#a0284a" },
  "Resolution":     { bg: "#f0ffe8", text: "#2d7a1a" },
};

export const LABEL_EXPLANATIONS = {
  "Familiar":       "A natural next step that stays close to home — an easy, expected move.",
  "Opens out":      "Steps outside the immediate key, widening the harmonic colour.",
  "Moves forward":  "Pushes the progression toward a new centre, creating a sense of motion.",
  "Tension":        "Builds tension that wants to resolve, adding a pull forward.",
  "Darker":         "Shifts to a minor colour, giving the progression a more introspective feel.",
  "Lift":           "Brightens the mood, lifting the energy of the progression.",
  "Surprise":       "An unexpected turn that breaks from the obvious choice.",
  "Resolution":     "Resolves the tension and feels like coming home.",
};
