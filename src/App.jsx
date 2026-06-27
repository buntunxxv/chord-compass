import { useState, useMemo } from 'react'
import { Chord } from 'tonal'
import { CHORD_DATA } from './chordData'
import { buildChordSymbol } from './components/ChordSelector'
import ChordSelector from './components/ChordSelector'
import ChordOutputPanel from './components/ChordOutputPanel'
import PianoDisplay from './components/PianoDisplay'
import PlaybackControls from './components/PlaybackControls'
import NextChordSuggestions from './components/NextChordSuggestions'
import './App.css'

// Map selector state to CHORD_DATA key
function toDataKey(root, quality, extension) {
  const qualityMap = {
    major: '',
    minor: 'minor',
    diminished: 'diminished',
    augmented: 'augmented',
    sus2: 'sus2',
    sus4: 'sus4',
  }
  const extMap = {
    none: '',
    '7': '7',
    maj7: 'maj7',
    add9: 'add9',
  }

  if (quality === 'major' && extension === 'none') return `${root} major`
  if (quality === 'minor' && extension === 'none') return `${root} minor`
  if (quality === 'major' && extension === '7') return `${root}7`
  if (quality === 'major' && extension === 'maj7') return `${root}maj7`
  if (quality === 'minor' && extension === '7') return `${root}m7`
  if (quality === 'major' && extension === 'add9') return `${root}add9`
  if (quality === 'sus4' && extension === 'none') return `${root}sus4`
  return null
}

// Format chord display name from tonal
function getDisplayName(root, quality, extension) {
  const symbol = buildChordSymbol(root, quality, extension)
  if (!symbol) return '—'
  const c = Chord.get(symbol)
  if (!c || !c.tonic) return symbol
  // Build a clean display name
  return c.symbol || symbol
}

export default function App() {
  const [selection, setSelection] = useState({ root: 'C', quality: 'major', extension: 'none' })
  const [bpm, setBpm] = useState(90)

  const { root, quality, extension } = selection

  const dataKey = useMemo(() => toDataKey(root, quality, extension), [root, quality, extension])
  const chordEntry = dataKey ? CHORD_DATA[dataKey] : null

  const symbol = useMemo(() => buildChordSymbol(root, quality, extension), [root, quality, extension])
  const tonalChord = useMemo(() => (symbol ? Chord.get(symbol) : null), [symbol])

  const displayName = useMemo(() => {
    if (!tonalChord || !tonalChord.tonic) return symbol || '—'
    return tonalChord.symbol || symbol
  }, [tonalChord, symbol])

  const intervals = tonalChord?.intervals || []

  // Notes to highlight: use CHORD_DATA notes if available, else derive from tonal at octave 4
  const chordNotes = chordEntry?.notes || []
  const rootNote = root

  const available = !!chordEntry

  return (
    <div className="app">
      <header className="app__header">
        <div className="app__header-inner">
          <div className="app__logo">
            <span className="app__logo-mark">◈</span>
            <span className="app__logo-name">Chord Compass</span>
          </div>
          <span className="app__logo-by">by Kynda Learning</span>
        </div>
      </header>

      <main className="app__main">
        <section className="app__section">
          <ChordSelector
            root={root}
            quality={quality}
            extension={extension}
            onChange={setSelection}
          />
        </section>

        <section className="app__section">
          <ChordOutputPanel
            chordName={displayName}
            notes={chordNotes}
            intervals={intervals}
            available={available}
          />
        </section>

        <section className="app__section">
          <PianoDisplay
            chordNotes={chordNotes}
            rootNote={rootNote}
          />
        </section>

        <section className="app__section">
          <PlaybackControls
            notes={chordNotes}
            bpm={bpm}
            onBpmChange={setBpm}
          />
        </section>

        {available && chordEntry?.next && (
          <section className="app__section">
            <NextChordSuggestions
              suggestions={chordEntry.next}
              currentNotes={chordNotes}
              bpm={bpm}
            />
          </section>
        )}

        {!available && (
          <section className="app__section app__unavailable">
            <p>This chord combination is not available in Stage 1. Select one of the 12 seed chords to explore suggestions.</p>
          </section>
        )}
      </main>
    </div>
  )
}
