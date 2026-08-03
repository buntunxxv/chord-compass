import { useState, useMemo, useEffect, useRef } from 'react'
import { Chord, Note } from 'tonal'
import { CHORD_DATA } from './chordData'
import { GUITAR_SHAPES } from './guitarData'
import { GUITAR_INVERSION_SHAPES } from './guitarInversions'
import { GUITAR_ALT_POSITIONS } from './guitarPositions'
import { GUITAR_INVERSION_ALT_POSITIONS } from './guitarInversionPositions'
import { buildChordSymbol } from './components/ChordSelector'
import { isSlashEligible, computeSlashNotes, appendSlashSymbol, isInChordTone } from './utils/slashChord'
import { useTheme } from './hooks/useTheme'
import ChordSelector from './components/ChordSelector'
import ChordOutputPanel from './components/ChordOutputPanel'
import NextChordSuggestions from './components/NextChordSuggestions'
import ProgressionTemplates from './components/ProgressionTemplates'
import ProgressionStrip from './components/ProgressionStrip'
import FeedbackPanel from './components/FeedbackPanel'
import WalkthroughOverlay from './components/WalkthroughOverlay'
import ThemeToggle from './components/ThemeToggle'
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
  if (quality === 'diminished' && extension === 'none') return `${root} diminished`
  if (quality === 'augmented' && extension === 'none') return `${root} augmented`
  if (quality === 'major' && extension === '7') return `${root}7`
  if (quality === 'major' && extension === 'maj7') return `${root}maj7`
  if (quality === 'minor' && extension === '7') return `${root}m7`
  if (quality === 'diminished' && extension === '7') return `${root}m7b5`
  if (quality === 'diminished' && extension === 'dim7') return `${root}dim7`
  if (quality === 'major' && extension === 'add9') return `${root}add9`
  if (quality === 'sus2' && extension === 'none') return `${root}sus2`
  if (quality === 'sus4' && extension === 'none') return `${root}sus4`
  if (quality === 'major' && extension === '9') return `${root}9`
  if (quality === 'major' && extension === 'maj9') return `${root}maj9`
  if (quality === 'minor' && extension === '9') return `${root}m9`
  if (quality === 'major' && extension === '11') return `${root}11`
  if (quality === 'minor' && extension === '11') return `${root}m11`
  if (quality === 'major' && extension === '13') return `${root}13`
  if (quality === 'major' && extension === 'maj13') return `${root}maj13`
  if (quality === 'minor' && extension === '13') return `${root}m13`
  if (quality === 'major' && extension === '7#9') return `${root}7#9`
  if (quality === 'major' && extension === '7b9') return `${root}7b9`
  if (quality === 'major' && extension === '7#5') return `${root}7#5`
  if (quality === 'major' && extension === '7b5') return `${root}7b5`
  if (quality === 'major' && extension === '7#11') return `${root}7#11`
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
  const [selection, setSelection] = useState({ root: 'C', quality: 'major', extension: 'none', bassNote: 'none' })
  const [bpm, setBpm] = useState(90)
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [onboardingOpen, setOnboardingOpen] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem('kcc_seen_intro_v2')) {
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
  const [isPro, setIsPro] = useState(false)
  const [templateKeyRoot, setTemplateKeyRoot] = useState('C')
  const [templateKeyMode, setTemplateKeyMode] = useState('major')
  const [activeTemplate, setActiveTemplate] = useState(null)

  useEffect(() => {
    setIsPro(localStorage.getItem('kcc_tier') === 'pro')
  }, [])
  const [playingChordNotes, setPlayingChordNotes] = useState(null)
  const { preference: themePreference, resolvedTheme, setPreference: setThemePreference } = useTheme()

  const { root, quality, extension, bassNote } = selection

  const dataKey = useMemo(() => toDataKey(root, quality, extension), [root, quality, extension])
  const chordEntry = dataKey ? CHORD_DATA[dataKey] : null

  // Slash chords/inversions are Pro-gated and don't apply to the symmetric
  // diminished/augmented/dim7 chord types (see src/utils/slashChord.js) --
  // effectiveBassNote is the single source of truth actually used to build
  // notes/symbol, so a free user or an ineligible quality has zero effect
  // even if selection.bassNote somehow held a stale non-"none" value.
  const bassEligible = useMemo(() => isSlashEligible(quality, extension), [quality, extension])
  const effectiveBassNote = isPro && bassEligible ? bassNote : 'none'
  const hasSlashBass = effectiveBassNote !== 'none' && Note.chroma(effectiveBassNote) !== Note.chroma(root)

  // Guitar shapes only exist for true inversions (bass = an existing chord
  // tone) -- a foreign-bass slash chord changes the chord's actual pitch-
  // class set and has no fixed fingering template at all yet, so it keeps
  // showing the honest "coming soon" notice (the tab stays clickable). A
  // true in-chord inversion with no generated shape is a different case:
  // guitarInversions.js's search already tried and documented (in its
  // skip-list comment) that no clean fingering exists within a reasonable
  // fret span for that specific chord/bass combination -- there's nothing
  // "coming," so the Guitar tab is disabled entirely instead, same as any
  // other structurally-unavailable control in this app.
  const isInversion = hasSlashBass && isInChordTone(chordEntry?.notes, effectiveBassNote)
  const inversionGuitarShape = isInversion ? GUITAR_INVERSION_SHAPES[dataKey]?.[effectiveBassNote] : null
  const guitarShapeToShow = hasSlashBass ? inversionGuitarShape : GUITAR_SHAPES[dataKey]
  const guitarInversionUnavailable = isInversion && !inversionGuitarShape
  const guitarSlashNotice = hasSlashBass && !isInversion

  // Alternate neck positions: root-position chords use guitarPositions.js,
  // true inversions use guitarInversionPositions.js (same idea, but every
  // position keeps the selected BASS TONE lowest, not the root). Foreign-
  // bass slash chords and inversions with no position-1 shape at all
  // (guitarInversionUnavailable) get no selector -- there's nothing to
  // page through. Position 1 is always whatever guitarShapeToShow already
  // resolved to; any additional positions get appended after it, so the
  // array's own length (1-3) already reflects how many of the 2 alternates
  // actually exist for this specific chord (+ bass, for inversions).
  const guitarPositions = useMemo(() => {
    if (!dataKey) return null
    if (hasSlashBass) {
      if (!isInversion || !inversionGuitarShape) return null
      const alt = GUITAR_INVERSION_ALT_POSITIONS[dataKey]?.[effectiveBassNote] || []
      return [inversionGuitarShape, ...alt.filter(Boolean)]
    }
    if (!GUITAR_SHAPES[dataKey]) return null
    const alt = GUITAR_ALT_POSITIONS[dataKey] || []
    return [GUITAR_SHAPES[dataKey], ...alt.filter(Boolean)]
  }, [hasSlashBass, dataKey, isInversion, inversionGuitarShape, effectiveBassNote])

  // Suggested-chord preview only makes sense for the chord it was shown under
  useEffect(() => {
    setPreviewIndex(null)
  }, [dataKey])

  // Reset the bass note whenever it stops being selectable, so switching
  // back to an eligible quality later doesn't resurrect a stale slash choice
  useEffect(() => {
    if (!bassEligible && bassNote !== 'none') {
      setSelection(sel => ({ ...sel, bassNote: 'none' }))
    }
  }, [bassEligible]) // eslint-disable-line react-hooks/exhaustive-deps

  const previewNotes = previewIndex != null ? chordEntry?.next?.[previewIndex]?.notes : null

  useEffect(() => {
    localStorage.setItem(PROGRESSION_STORAGE_KEY, JSON.stringify(progression))
  }, [progression])

  function addToProgression(chord, notes) {
    if (!isPro && progression.length >= PROGRESSION_LIMIT) {
      setProgressionTeaser(PROGRESSION_TEASER)
      if (teaserTimeoutRef.current) clearTimeout(teaserTimeoutRef.current)
      teaserTimeoutRef.current = setTimeout(() => setProgressionTeaser(''), 4000)
      return
    }
    setActiveTemplate(null)
    setProgression(prev => [...prev, { chord, notes }])
  }

  function clearProgression() {
    setActiveTemplate(null)
    setProgression([])
  }

  function removeLast() {
    setActiveTemplate(null)
    setProgression(prev => prev.slice(0, -1))
  }

  function loadTemplate(entries, template) {
    if (!isPro && entries.length > PROGRESSION_LIMIT) {
      setProgressionTeaser(PROGRESSION_TEASER)
      if (teaserTimeoutRef.current) clearTimeout(teaserTimeoutRef.current)
      teaserTimeoutRef.current = setTimeout(() => setProgressionTeaser(''), 4000)
      return
    }
    setProgression(entries)
    setActiveTemplate({ name: template.name, description: template.description })
  }

  function loadSavedProgression(chords) {
    setActiveTemplate(null)
    setProgression(chords)
  }

  // Parse a chord display name back into selector state
  function chordNameToSelection(name) {
    const m = name.match(/^([A-G][#b]?)(m7|maj7|m|add9|sus2|sus4|7|)$/)
    if (!m) return null
    const [, root, suffix] = m
    const map = {
      '': { quality: 'major', extension: 'none' },
      'm': { quality: 'minor', extension: 'none' },
      '7': { quality: 'major', extension: '7' },
      'maj7': { quality: 'major', extension: 'maj7' },
      'm7': { quality: 'minor', extension: '7' },
      'add9': { quality: 'major', extension: 'add9' },
      'sus2': { quality: 'sus2', extension: 'none' },
      'sus4': { quality: 'sus4', extension: 'none' },
    }
    const qual = map[suffix]
    if (!qual) return null
    return { root, ...qual }
  }

  function handleSelectLastChord(chordName) {
    const sel = chordNameToSelection(chordName)
    if (sel) setSelection({ ...sel, bassNote: 'none' })
  }

  const symbol = useMemo(() => buildChordSymbol(root, quality, extension), [root, quality, extension])
  const tonalChord = useMemo(() => (symbol ? Chord.get(symbol) : null), [symbol])

  const displayName = useMemo(() => {
    const base = (!tonalChord || !tonalChord.tonic) ? (symbol || '—') : (tonalChord.symbol || symbol)
    return appendSlashSymbol(base, effectiveBassNote, root)
  }, [tonalChord, symbol, effectiveBassNote, root])

  const intervals = tonalChord?.intervals || []

  // Notes to highlight: use CHORD_DATA notes if available, else derive from tonal at octave 4,
  // re-voiced for the selected bass note (Pro-gated slash chords) -- see computeSlashNotes
  const chordNotes = computeSlashNotes(chordEntry?.notes || [], effectiveBassNote, root)

  const available = !!chordEntry

  // While a progression plays, the piano should track whatever's actually sounding
  const pianoNotes = playingChordNotes || chordNotes
  const pianoPreviewNotes = playingChordNotes ? null : previewNotes

  return (
    <div className="app">
      <header className="app__header">
        <div className="app__header-inner">
          <div className="app__logo">
            <a href="https://www.kyndalearning.co.uk" className="app__logo-link">
              <img src={resolvedTheme === 'dark' ? '/kynda-logo-white.png' : '/kynda-logo-full.png'} alt="Kynda Learning" />
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
            <ThemeToggle preference={themePreference} onChange={setThemePreference} />
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
            <div className="app__mobile-menu-theme">
              <span className="app__mobile-menu-theme-label">Appearance</span>
              <ThemeToggle preference={themePreference} onChange={setThemePreference} />
            </div>
          </div>
        )}
      </header>

      <main className="app__main">
        <section className="app__section">
          <ChordSelector
            root={root}
            quality={quality}
            extension={extension}
            bassNote={bassNote}
            isPro={isPro}
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

        {available && chordEntry?.next && (
          <section className="app__section">
            <NextChordSuggestions
              suggestions={chordEntry.next}
              currentNotes={chordNotes}
              bpm={bpm}
              previewIndex={previewIndex}
              onPreviewChange={setPreviewIndex}
              onAddToProgression={addToProgression}
              theme={resolvedTheme}
              isPro={isPro}
            />
          </section>
        )}

        {!available && (
          <section className="app__section app__unavailable">
            <p>This chord combination is not available in Stage 1. Select one of the 12 seed chords to explore suggestions.</p>
          </section>
        )}

        <section className="app__section">
          <ProgressionTemplates
            keyRoot={templateKeyRoot}
            keyMode={templateKeyMode}
            onKeyRootChange={setTemplateKeyRoot}
            onKeyModeChange={setTemplateKeyMode}
            onLoad={loadTemplate}
          />
        </section>
      </main>

      <ProgressionStrip
        progression={progression}
        bpm={bpm}
        onBpmChange={setBpm}
        onClear={clearProgression}
        onRemoveLast={removeLast}
        onSelectLastChord={handleSelectLastChord}
        onLoadSaved={loadSavedProgression}
        templateInfo={activeTemplate}
        teaserMessage={progressionTeaser}
        onPlayingChordChange={setPlayingChordNotes}
        chordNotes={pianoNotes}
        previewNotes={pianoPreviewNotes}
        root={root}
        guitarShape={guitarShapeToShow}
        guitarSlashNotice={guitarSlashNotice}
        guitarInversionUnavailable={guitarInversionUnavailable}
        guitarPositions={guitarPositions}
        isPro={isPro}
      />

      {/* Feedback panel — state persists while closed */}
      <FeedbackPanel
        isOpen={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
        theme={resolvedTheme}
      />

      <WalkthroughOverlay
        isOpen={onboardingOpen}
        onClose={() => setOnboardingOpen(false)}
      />
    </div>
  )
}
