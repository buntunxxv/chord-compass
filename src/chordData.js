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
  "E7":       { notes: ["E4","G#4","B4","D5"],  next: [{ chord: "Am", notes: ["A3","C4","E4"], label: "Tension" }, { chord: "Am7",   notes: ["A3","C4","E4","G4"], label: "Familiar" }, { chord: "A",     notes: ["A3","C#4","E4"], label: "Darker" }] }
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
