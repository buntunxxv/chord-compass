import { Chord, Note, Scale } from 'tonal'

export const ROOTS = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B']

export const CHORD_TYPES = [
  { label: 'Major', symbol: '' },
  { label: 'Minor', symbol: 'm' },
  { label: 'Dominant 7', symbol: '7' },
  { label: 'Major 7', symbol: 'maj7' },
  { label: 'Minor 7', symbol: 'm7' },
]

export const SCALE_TYPES = [
  { name: 'major', label: 'Major', character: 'clear and resolved' },
  // Tonal calls the natural-minor collection simply "minor".
  { name: 'minor', label: 'Natural minor', character: 'dark and familiar' },
  { name: 'dorian', label: 'Dorian', character: 'minor with a brighter lift' },
  { name: 'phrygian', label: 'Phrygian', character: 'tense and close' },
  { name: 'lydian', label: 'Lydian', character: 'open and weightless' },
  { name: 'mixolydian', label: 'Mixolydian', character: 'major with a bluesy pull' },
  { name: 'harmonic minor', label: 'Harmonic minor', character: 'dramatic and strongly directed' },
  { name: 'melodic minor', label: 'Melodic minor', character: 'minor with a smoother upward colour' },
  { name: 'major pentatonic', label: 'Major pentatonic', character: 'simple, spacious and singable' },
  { name: 'minor pentatonic', label: 'Minor pentatonic', character: 'direct, flexible and soulful' },
]

function chromaSet(notes) {
  return new Set(notes.map(Note.chroma))
}

function containsAll(containerNotes, requiredNotes) {
  const available = chromaSet(containerNotes)
  return requiredNotes.every(note => available.has(Note.chroma(note)))
}

export function getCompatibleScales(root, chordType) {
  const chord = Chord.get(`${root}${chordType.symbol}`)
  return SCALE_TYPES
    .map(scaleType => ({ scaleType, scale: Scale.get(`${root} ${scaleType.name}`) }))
    .filter(({ scale }) => !scale.empty && containsAll(scale.notes, chord.notes))
    .map(({ scaleType, scale }) => ({
      name: `${root} ${scaleType.label}`,
      notes: scale.notes,
      intervals: scale.intervals,
      character: scaleType.character,
      sharedNotes: chord.notes,
    }))
}

export function getChordsInScale(root, scaleType) {
  const scale = Scale.get(`${root} ${scaleType.name}`)
  const qualities = [
    { suffix: '', label: 'major' },
    { suffix: 'm', label: 'minor' },
    { suffix: 'dim', label: 'diminished' },
  ]

  return scale.notes.flatMap(note => qualities.map(quality => {
    const chord = Chord.get(`${note}${quality.suffix}`)
    return { chord, quality }
  }))
    .filter(({ chord }) => !chord.empty && containsAll(scale.notes, chord.notes))
    .map(({ chord, quality }) => ({
      name: chord.symbol,
      quality: quality.label,
      notes: chord.notes,
      intervals: chord.intervals,
    }))
}

export function pitchesFromIntervals(root, intervals, octave = 4) {
  return intervals.map(interval => Note.transpose(`${root}${octave}`, interval))
}
