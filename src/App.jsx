import { useState, useMemo, useEffect, useRef } from 'react'
import { Chord } from 'tonal'
import { CHORD_DATA } from './chordData'
import { buildChordSymbol } from './components/ChordSelector'
import ChordSelector from './components/ChordSelector'
import ChordOutputPanel from './components/ChordOutputPanel'
import PianoDisplay from './components/PianoDisplay'
import PlaybackControls from './components/PlaybackControls'
import NextChordSuggestions from './components/NextChordSuggestions'
import ProgressionStrip from './components/ProgressionStrip'
import FeedbackPanel from './components/FeedbackPanel'
import OnboardingModal from './components/OnboardingModal'
import './App.css'

const PROGRESSION_LIMIT = 4
const PROGRESSION_STORAGE_KEY = 'chordCompassProgression'
const PROGRESSION_TEASER = 'Longer progressions are coming in Chord Compass Pro.'

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
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [onboardingOpen, setOnboardingOpen] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem('kcc_seen_intro')) {
      setOnboardingOpen(true)
    }
  }, [])
  const [previewIndex, setPreviewIndex] = useState(null)
  const [progression, setProgression] = useState(() => {
    try {
      const stored = localStorage.getItem(PROGRESSION_STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })
  const [progressionTeaser, setProgressionTeaser] = useState('')
  const teaserTimeoutRef = useRef(null)

  const { root, quality, extension } = selection

  const dataKey = useMemo(() => toDataKey(root, quality, extension), [root, quality, extension])
  const chordEntry = dataKey ? CHORD_DATA[dataKey] : null

  // Suggested-chord preview only makes sense for the chord it was shown under
  useEffect(() => {
    setPreviewIndex(null)
  }, [dataKey])

  const previewNotes = previewIndex != null ? chordEntry?.next?.[previewIndex]?.notes : null

  useEffect(() => {
    localStorage.setItem(PROGRESSION_STORAGE_KEY, JSON.stringify(progression))
  }, [progression])

  function addToProgression(chord, notes) {
    if (progression.length >= PROGRESSION_LIMIT) {
      setProgressionTeaser(PROGRESSION_TEASER)
      if (teaserTimeoutRef.current) clearTimeout(teaserTimeoutRef.current)
      teaserTimeoutRef.current = setTimeout(() => setProgressionTeaser(''), 4000)
      return
    }
    setProgression(prev => [...prev, { chord, notes }])
  }

  function clearProgression() {
    setProgression([])
  }

  const symbol = useMemo(() => buildChordSymbol(root, quality, extension), [root, quality, extension])
  const tonalChord = useMemo(() => (symbol ? Chord.get(symbol) : null), [symbol])

  const displayName = useMemo(() => {
    if (!tonalChord || !tonalChord.tonic) return symbol || '—'
    return tonalChord.symbol || symbol
  }, [tonalChord, symbol])

  const intervals = tonalChord?.intervals || []

  // Notes to highlight: use CHORD_DATA notes if available, else derive from tonal at octave 4
  const chordNotes = chordEntry?.notes || []

  const available = !!chordEntry

  return (
    <div className="app">
      <header className="app__header">
        <div className="app__header-inner">
          <div className="app__logo">
            <a href="https://www.kyndalearning.co.uk" className="app__logo-link">
              <img src="/kynda-logo-full.png" alt="Kynda Learning" />
            </a>
            <nav className="app__site-nav">
              <a href="https://www.kyndalearning.co.uk/courses" className="app__site-nav-link">Courses</a>
              <a href="https://www.kyndalearning.co.uk/workshops" className="app__site-nav-link">Workshops</a>
              <a href="https://www.kyndalearning.co.uk/portal" className="app__site-nav-link">Portal</a>
            </nav>
          </div>
          <div className="app__header-tool">
            <div className="app__header-divider" />
            <span className="app__header-tool-name">Chord Compass</span>
            <div className="app__header-divider" />
            <button
              className="app__header-feedback-btn"
              onClick={() => setFeedbackOpen(true)}
              aria-label="Share feedback"
            >
              Share feedback
            </button>
            <button
              className="app__hamburger"
              onClick={() => setMenuOpen(o => !o)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
            >
              <span className="app__hamburger-line" />
              <span className="app__hamburger-line" />
              <span className="app__hamburger-line" />
            </button>
            <button
              className="app__help-btn"
              onClick={() => setOnboardingOpen(true)}
              aria-label="How to use Chord Compass"
            >
              ?
            </button>
          </div>
        </div>
        {menuOpen && (
          <div className="app__mobile-menu">
            <a href="https://www.kyndalearning.co.uk/courses" className="app__mobile-menu-link" onClick={() => setMenuOpen(false)}>Courses</a>
            <a href="https://www.kyndalearning.co.uk/workshops" className="app__mobile-menu-link" onClick={() => setMenuOpen(false)}>Workshops</a>
            <a href="https://www.kyndalearning.co.uk/portal" className="app__mobile-menu-link" onClick={() => setMenuOpen(false)}>Portal</a>
            <button
              className="app__mobile-menu-link app__mobile-menu-feedback"
              onClick={() => { setMenuOpen(false); setFeedbackOpen(true) }}
            >
              Share feedback
            </button>
          </div>
        )}
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
            onAddToProgression={addToProgression}
          />
        </section>

        <section className="app__section">
          <PianoDisplay
            chordNotes={chordNotes}
            previewNotes={previewNotes}
          />
        </section>

        <section className="app__section">
          <PlaybackControls
            notes={chordNotes}
          />
        </section>

        {available && chordEntry?.next && (
          <section className="app__section">
            <NextChordSuggestions
              suggestions={chordEntry.next}
              currentNotes={chordNotes}
              bpm={bpm}
              previewIndex={previewIndex}
              onPreviewChange={setPreviewIndex}
              onAddToProgression={addToProgression}
            />
          </section>
        )}

        {!available && (
          <section className="app__section app__unavailable">
            <p>This chord combination is not available in Stage 1. Select one of the 12 seed chords to explore suggestions.</p>
          </section>
        )}
      </main>

      <ProgressionStrip
        progression={progression}
        bpm={bpm}
        onBpmChange={setBpm}
        onClear={clearProgression}
        teaserMessage={progressionTeaser}
      />

      {/* Feedback panel — state persists while closed */}
      <FeedbackPanel
        isOpen={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
      />

      <OnboardingModal
        isOpen={onboardingOpen}
        onClose={() => setOnboardingOpen(false)}
      />
    </div>
  )
}
