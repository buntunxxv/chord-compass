import { useState, useMemo, useEffect, useRef } from 'react'
import { Chord, Note } from 'tonal'
import { CHORD_DATA } from './chordData'
import { GUITAR_SHAPES } from './guitarData'
import { GUITAR_INVERSION_SHAPES } from './guitarInversions'
import { GUITAR_ALT_POSITIONS } from './guitarPositions'
import { GUITAR_INVERSION_ALT_POSITIONS } from './guitarInversionPositions'
import { buildChordSymbol } from './components/ChordSelector'
import { isSlashEligible, computeSlashNotes, appendSlashSymbol, isInChordTone } from './utils/slashChord'
import { applyDrop2, applyLeftHandSplit } from './utils/pianoVoicings'
import { useTheme } from './hooks/useTheme'
import { getAdjacentTabIndex } from './utils/tabsKeyboardNav'
import ChordSelector from './components/ChordSelector'
import ChordOutputPanel from './components/ChordOutputPanel'
import NextChordSuggestions from './components/NextChordSuggestions'
import ProgressionTemplates from './components/ProgressionTemplates'
import ProgressionStrip from './components/ProgressionStrip'
import ReverseVoicingFinder from './components/ReverseVoicingFinder'
import FeedbackPanel from './components/FeedbackPanel'
import WalkthroughOverlay from './components/WalkthroughOverlay'
import ThemeToggle from './components/ThemeToggle'
import './App.css'

const PROGRESSION_LIMIT = 4
const PROGRESSION_STORAGE_KEY = 'chordCompassProgression'
const PROGRESSION_TEASER = 'Longer progressions are coming in Chord Compass Pro.'
// How long the one-step "Undo" after a template load stays available before
// it silently expires -- it also clears sooner, immediately, on any other
// progression-mutating action (see clearLoadUndo's call sites below).
const LOAD_UNDO_WINDOW_MS = 10000

const MODE_TABS = [
  { key: 'build', label: 'Build a Chord' },
  { key: 'find', label: 'Find Shapes by Notes' },
]

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

// Guitar-shape/position resolution for a chord identified by its own
// dataKey + (optional) slash bass -- factored out of the active-chord
// computation below so Phase 2's reverse-lookup ranking (App.jsx's
// referenceGuitarShape) can resolve a shape for the last progression
// chord too, without duplicating this lookup a second time.
function resolveGuitarPositions(dataKey, hasSlashBass, effectiveBassNote, chordNotes) {
  if (!dataKey) return null
  if (hasSlashBass) {
    const isInversion = isInChordTone(chordNotes, effectiveBassNote)
    const inversionShape = isInversion ? GUITAR_INVERSION_SHAPES[dataKey]?.[effectiveBassNote] : null
    if (!isInversion || !inversionShape) return null
    const alt = GUITAR_INVERSION_ALT_POSITIONS[dataKey]?.[effectiveBassNote] || []
    return [inversionShape, ...alt.filter(Boolean)]
  }
  if (!GUITAR_SHAPES[dataKey]) return null
  const alt = GUITAR_ALT_POSITIONS[dataKey] || []
  return [GUITAR_SHAPES[dataKey], ...alt.filter(Boolean)]
}

// Resolves each displayed note's interval label from what it actually IS
// (by pitch class), not from its position in the array -- notes get
// reordered/re-voiced independently of tonalChord's own root-position
// notes/intervals (slash-chord bass via computeSlashNotes, Drop-2, Split),
// so a positional pairing is only ever coincidentally correct. Building a
// chroma -> interval lookup from tonalChord's own notes/intervals pairing
// once, then resolving every displayed note against it by pitch class,
// handles any reordering with a single lookup -- no separate slash-chord
// special case needed. A note whose pitch class isn't one of the chord's
// own tones (only possible today via a foreign, non-chord-tone slash bass)
// has no interval to report and is simply omitted.
function intervalsForNotes(tonalChord, notes) {
  if (!tonalChord?.notes || !tonalChord?.intervals) return []
  const chromaToInterval = new Map()
  tonalChord.notes.forEach((n, i) => chromaToInterval.set(Note.chroma(n), tonalChord.intervals[i]))
  return notes.map(n => chromaToInterval.get(Note.chroma(n))).filter(Boolean)
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
  // Push-swipe Templates drawer -- not persisted, always starts closed
  const [templatesDrawerOpen, setTemplatesDrawerOpen] = useState(false)
  // Progression/instrument bottom sheet -- collapsed by default so the
  // chord builder gets the vast majority of a mobile viewport. Lives here
  // (not inside ProgressionStrip) only because App.css's bottom-padding
  // reservation for the fixed-position sheet needs to know its height too;
  // otherwise this is pure UI state, not persisted, and nothing but the
  // user's own tap/swipe on the sheet ever changes it -- selecting a chord,
  // playing, switching Build/Templates/Find modes, none of that touches it.
  const [sheetExpanded, setSheetExpanded] = useState(false)
  // Builder-panel mode toggle: the normal forward chord builder, or the new
  // reverse voicing lookup (Phase 1 -- pick notes, get ranked guitar shapes
  // that contain them). A tab inside the existing panel, not a separate
  // route or modal, and not persisted -- always starts back on the builder.
  const [mode, setMode] = useState('build')
  const modeTabRefs = useRef([])

  function handleModeTabKeyDown(e, index) {
    const nextIndex = getAdjacentTabIndex(MODE_TABS, index, e.key)
    if (nextIndex === index) return
    e.preventDefault()
    setMode(MODE_TABS[nextIndex].key)
    modeTabRefs.current[nextIndex]?.focus()
  }

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
  // Which progression chip was last tapped (drives the chord builder/piano/
  // guitar views, and is where the next add-to-progression call inserts --
  // null means "no chip tapped yet," which falls back to appending at the
  // end, same as before any chip but the last was tappable at all. Kept as
  // a plain index rather than an id because every mutation that could move
  // or invalidate it (insert, remove, reorder) is a function right here in
  // this component that can just adjust it in the same breath.
  const [tappedChordIndex, setTappedChordIndex] = useState(null)
  const [isPro, setIsPro] = useState(false)
  const [templateKeyRoot, setTemplateKeyRoot] = useState('C')
  const [templateKeyMode, setTemplateKeyMode] = useState('major')
  const [activeTemplate, setActiveTemplate] = useState(null)
  // Snapshot of {progression, activeTemplate, tappedChordIndex} taken right
  // before a template load overwrites them -- null means no undo is
  // currently available. One step only: a second load overwrites this with
  // its own pre-load snapshot rather than stacking a history.
  const [loadUndoSnapshot, setLoadUndoSnapshot] = useState(null)
  const loadUndoTimeoutRef = useRef(null)

  useEffect(() => {
    return () => { if (loadUndoTimeoutRef.current) clearTimeout(loadUndoTimeoutRef.current) }
  }, [])

  function armLoadUndo(snapshot) {
    if (loadUndoTimeoutRef.current) clearTimeout(loadUndoTimeoutRef.current)
    setLoadUndoSnapshot(snapshot)
    loadUndoTimeoutRef.current = setTimeout(() => setLoadUndoSnapshot(null), LOAD_UNDO_WINDOW_MS)
  }

  // Called at the top of every progression mutation that ISN'T itself a
  // template load, so the undo affordance only ever offers to restore the
  // state from immediately before the most recent load, never a stale one
  // from several edits ago.
  function clearLoadUndo() {
    if (loadUndoTimeoutRef.current) {
      clearTimeout(loadUndoTimeoutRef.current)
      loadUndoTimeoutRef.current = null
    }
    setLoadUndoSnapshot(null)
  }

  function undoLoad() {
    if (!loadUndoSnapshot) return
    if (loadUndoTimeoutRef.current) {
      clearTimeout(loadUndoTimeoutRef.current)
      loadUndoTimeoutRef.current = null
    }
    setProgression(loadUndoSnapshot.progression)
    setActiveTemplate(loadUndoSnapshot.activeTemplate)
    setTappedChordIndex(loadUndoSnapshot.tappedChordIndex)
    setLoadUndoSnapshot(null)
  }

  useEffect(() => {
    setIsPro(localStorage.getItem('kcc_tier') === 'pro')
  }, [])
  const [playingChordNotes, setPlayingChordNotes] = useState(null)
  const [playingRootNote, setPlayingRootNote] = useState(null)
  const [keysPositionIndex, setKeysPositionIndex] = useState(0)
  // Lifted out of InstrumentDock (which used to own this locally) so the
  // reverse-lookup's "closest to the last progression chord" ranking can
  // tell whether the last chord IS the one currently shown on the Guitar
  // tab, and if so, use whichever neck position is actually selected for
  // it right now instead of always assuming position 1.
  const [guitarPositionIndex, setGuitarPositionIndex] = useState(0)

  // ProgressionStrip now applies the selected Keys voicing (Drop-2/Split)
  // during playback too, so playingChordNotes[0] is no longer reliably the
  // true root the way it was when playback only ever voice-led the chord
  // as-stored -- it needs its own untouched root passed alongside the notes.
  function handlePlayingChordChange(notes, rootNote) {
    setPlayingChordNotes(notes)
    setPlayingRootNote(rootNote ?? null)
  }
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
  const guitarPositions = useMemo(
    () => resolveGuitarPositions(dataKey, hasSlashBass, effectiveBassNote, chordEntry?.notes),
    [dataKey, hasSlashBass, effectiveBassNote, chordEntry],
  )

  // Reference shape for the reverse-lookup's Phase 2 ranking: the LAST
  // chord already in the progression, resolved via the exact same
  // resolveGuitarPositions lookup above -- reused, not duplicated. Its
  // name only tells us root/quality/extension (chordNameToSelection can't
  // recover a slash bass from a display string), so this never resolves an
  // inversion shape for it; that's an acceptable simplification, not a
  // silent wrong answer -- an unresolvable last chord just means no
  // reference shape, same as an empty progression (ease-only ranking).
  //
  // "Whichever position is currently displayed for it" only has a real
  // answer when the last progression chord IS the chord the builder/Guitar
  // tab is actively showing right now -- guitarPositionIndex is a single,
  // global "what's selected for the chord on screen" value, not a memory
  // per progression slot. When the last chord isn't what's on screen, its
  // own position 1 (the shape's default fingering) is the only honest
  // choice, since nothing else was ever "selected" for it.
  const lastProgressionEntry = progression.length > 0 ? progression[progression.length - 1] : null
  const lastChordSelection = lastProgressionEntry ? chordNameToSelection(lastProgressionEntry.chord) : null
  const lastChordDataKey = lastChordSelection
    ? toDataKey(lastChordSelection.root, lastChordSelection.quality, lastChordSelection.extension)
    : null
  const lastChordGuitarPositions = lastChordDataKey
    ? resolveGuitarPositions(lastChordDataKey, false, 'none', null)
    : null
  const lastChordIsOnScreen = !hasSlashBass && lastChordDataKey === dataKey
  const referenceGuitarShape = lastChordGuitarPositions
    ? lastChordGuitarPositions[lastChordIsOnScreen ? Math.min(guitarPositionIndex, lastChordGuitarPositions.length - 1) : 0]
    : null

  // Suggested-chord preview only makes sense for the chord it was shown under
  useEffect(() => {
    setPreviewIndex(null)
  }, [dataKey])

  // A new chord (or a new slash/inversion bass) always starts back at Close
  // position -- same "always reset to position 1" rule Session 29 used for
  // the guitar neck-position selector.
  useEffect(() => {
    setKeysPositionIndex(0)
  }, [dataKey, effectiveBassNote])

  // Same reset rule for the guitar neck position, now that it's lifted up
  // here instead of living inside InstrumentDock.
  useEffect(() => {
    setGuitarPositionIndex(0)
  }, [dataKey, effectiveBassNote])

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

  // Adds after the currently tapped chip (whichever chord is driving the
  // builder right now), not always at the end -- if the last chip is what's
  // tapped (the default, e.g. nothing's been tapped yet) that's the same
  // position as appending, so this is a strict generalization of the old
  // always-append behavior, not a different one.
  function addToProgression(chord, notes) {
    if (!isPro && progression.length >= PROGRESSION_LIMIT) {
      setProgressionTeaser(PROGRESSION_TEASER)
      if (teaserTimeoutRef.current) clearTimeout(teaserTimeoutRef.current)
      teaserTimeoutRef.current = setTimeout(() => setProgressionTeaser(''), 4000)
      return
    }
    clearLoadUndo()
    setActiveTemplate(null)
    const insertAt = (tappedChordIndex != null && tappedChordIndex < progression.length)
      ? tappedChordIndex + 1
      : progression.length
    setProgression(prev => [...prev.slice(0, insertAt), { chord, notes }, ...prev.slice(insertAt)])
    // The freshly-inserted chord becomes the new tapped position, so adding
    // several suggestions in a row while exploring from a middle chip keeps
    // extending forward from there instead of stacking in reverse order.
    setTappedChordIndex(insertAt)
  }

  // Bulk sibling of addToProgression, for importing an ordered sequence of
  // chords in one shot (MIDI range import). addToProgression reads
  // progression.length/tappedChordIndex from this render's own closured
  // state, which is fine for a single call but would silently reorder the
  // sequence if called once per chord in a loop: every call in the same
  // synchronous batch would see the SAME pre-loop progression/index (React
  // doesn't re-render mid-loop), so each chord would compute the same
  // insertAt and effectively race to the same slot rather than building on
  // the previous insert. Computing insertAt/the cap ONCE here and inserting
  // every chord via a single setProgression call sidesteps that entirely.
  //
  // Free-tier cap still applies here for consistency with addToProgression/
  // loadTemplate, even though today only Pro users can reach a MIDI import
  // in the first place (it's Pro-gated at the UI level) -- so this path
  // never actually truncates yet, but stays correct if that ever changes.
  function addProgressionSequence(chords) {
    if (!chords || chords.length === 0) return
    const insertAt = (tappedChordIndex != null && tappedChordIndex < progression.length)
      ? tappedChordIndex + 1
      : progression.length
    const allowed = isPro ? chords : chords.slice(0, Math.max(0, PROGRESSION_LIMIT - progression.length))
    if (allowed.length < chords.length) {
      setProgressionTeaser(PROGRESSION_TEASER)
      if (teaserTimeoutRef.current) clearTimeout(teaserTimeoutRef.current)
      teaserTimeoutRef.current = setTimeout(() => setProgressionTeaser(''), 4000)
    }
    if (allowed.length === 0) return
    clearLoadUndo()
    setActiveTemplate(null)
    setProgression(prev => [
      ...prev.slice(0, insertAt),
      ...allowed.map(({ chord, notes }) => ({ chord, notes })),
      ...prev.slice(insertAt),
    ])
    setTappedChordIndex(insertAt + allowed.length - 1)
  }

  function clearProgression() {
    clearLoadUndo()
    setActiveTemplate(null)
    setProgression([])
    setTappedChordIndex(null)
  }

  function removeLast() {
    clearLoadUndo()
    setActiveTemplate(null)
    setProgression(prev => prev.slice(0, -1))
    setTappedChordIndex(prev => (prev === progression.length - 1 ? null : prev))
  }

  // Templates only ever ADD chords (never merge into an existing one), so
  // loading one over a non-empty progression is a full, hard-to-undo
  // replacement -- worth a confirm. An empty progression has nothing to
  // lose, so it loads straight away. Either way, the progression as it
  // stood right before this call is kept for one undoLoad() (see
  // armLoadUndo above) so a confirmed replace is never truly a one-way door.
  function loadTemplate(entries, template) {
    if (!isPro && entries.length > PROGRESSION_LIMIT) {
      setProgressionTeaser(PROGRESSION_TEASER)
      if (teaserTimeoutRef.current) clearTimeout(teaserTimeoutRef.current)
      teaserTimeoutRef.current = setTimeout(() => setProgressionTeaser(''), 4000)
      return
    }
    if (progression.length > 0) {
      const confirmed = window.confirm(
        `Replace your current progression (${progression.length} chord${progression.length === 1 ? '' : 's'}) with "${template.name}"?`
      )
      if (!confirmed) return
    }
    armLoadUndo({ progression, activeTemplate, tappedChordIndex })
    setProgression(entries)
    setActiveTemplate({ name: template.name, description: template.description })
    setTappedChordIndex(null)
  }

  function loadSavedProgression(chords) {
    clearLoadUndo()
    setActiveTemplate(null)
    setProgression(chords)
    setTappedChordIndex(null)
  }

  // Drag-to-reorder: splice the moved chord into its new position, and slide
  // tappedChordIndex along with whatever it was pointing at (itself, if that
  // chord is what moved; otherwise shifted by one only if it sat between the
  // old and new position) so a reorder never silently detaches the tapped
  // chip from the chord it was actually tapped on.
  function moveChord(fromIndex, toIndex) {
    if (fromIndex === toIndex) return
    clearLoadUndo()
    setActiveTemplate(null)
    setProgression(prev => {
      const next = [...prev]
      const [moved] = next.splice(fromIndex, 1)
      next.splice(toIndex, 0, moved)
      return next
    })
    setTappedChordIndex(prev => {
      if (prev == null) return prev
      if (prev === fromIndex) return toIndex
      if (fromIndex < toIndex) {
        if (prev > fromIndex && prev <= toIndex) return prev - 1
      } else if (prev >= toIndex && prev < fromIndex) {
        return prev + 1
      }
      return prev
    })
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

  // Generalized from "tap the last chip" (Session 11) to any chip -- tapping
  // always records the tapped position (so the next add-to-progression
  // inserts after it) even if the name doesn't parse into a selector state
  // for some reason; the two are independent, position tracking shouldn't
  // depend on display-parsing succeeding.
  function handleSelectChord(index, chordName) {
    setTappedChordIndex(index)
    const sel = chordNameToSelection(chordName)
    if (sel) setSelection({ ...sel, bassNote: 'none' })
  }

  const symbol = useMemo(() => buildChordSymbol(root, quality, extension), [root, quality, extension])
  const tonalChord = useMemo(() => (symbol ? Chord.get(symbol) : null), [symbol])

  const displayName = useMemo(() => {
    const base = (!tonalChord || !tonalChord.tonic) ? (symbol || '—') : (tonalChord.symbol || symbol)
    return appendSlashSymbol(base, effectiveBassNote, root)
  }, [tonalChord, symbol, effectiveBassNote, root])

  // Notes to highlight: use CHORD_DATA notes if available, else derive from tonal at octave 4,
  // re-voiced for the selected bass note (Pro-gated slash chords) -- see computeSlashNotes
  const chordNotes = computeSlashNotes(chordEntry?.notes || [], effectiveBassNote, root)

  const available = !!chordEntry

  // Keys-tab voicing positions: Close (whatever chordNotes already is --
  // works correctly for slash/inversion chords with zero extra handling,
  // since it's the same array), Drop-2, and a left-hand/right-hand split.
  // Position 1 is always free; 2-3 are Pro-gated. Clamping here (not just
  // disabling the tab buttons in InstrumentDock) means a free user can
  // never actually hear/see position 2/3 even if keysPositionIndex state
  // somehow held a stale non-zero value -- same defense-in-depth pattern
  // already used for effectiveBassNote and the guitar position selector.
  // applyDrop2 only needs to protect the bass from inversion when there's a
  // genuinely selected slash/inversion bass active -- for a plain root-
  // position chord, inverting which note ends up lowest is Drop-2's
  // intended, characterful behavior (the true root still gets highlighted
  // correctly below via the separate rootNote prop).
  const keysPositions = [chordNotes, applyDrop2(chordNotes, hasSlashBass), applyLeftHandSplit(chordNotes)]
  const maxAllowedKeysIndex = isPro ? keysPositions.length - 1 : 0
  const activeKeysIndex = Math.min(keysPositionIndex, maxAllowedKeysIndex)
  const displayedPianoNotes = keysPositions[activeKeysIndex]

  // See intervalsForNotes above -- resolved against whichever notes are
  // actually on screen (Close/Drop-2/Split, slash bass and all), not
  // tonalChord's own root-position array.
  const intervals = intervalsForNotes(tonalChord, displayedPianoNotes)

  // While a progression plays, the piano should track whatever's actually
  // sounding (ProgressionStrip applies the same selected voicing transform
  // per-chord before it ever reaches here).
  const pianoNotes = playingChordNotes || displayedPianoNotes
  // Only the LH/RH split gets its own bass highlight color -- Close and
  // Drop-2 keep the ordinary root/chord-tone convention. Split always places
  // the isolated bass at notes[0], live or during playback alike, so this
  // reads pianoNotes[0] directly instead of nulling out during playback.
  const pianoBassHighlight = activeKeysIndex === 2 ? pianoNotes[0] : null
  const pianoPreviewNotes = playingChordNotes ? null : previewNotes
  // Drop-2 deliberately re-sorts by pitch height, so notes[0] of the
  // transformed array isn't reliably the actual root anymore -- pass the
  // true root/bass explicitly so PianoDisplay's gold highlight always lands
  // on the real root, not whichever note happened to end up lowest. During
  // playback that's playingRootNote (captured alongside playingChordNotes,
  // see handlePlayingChordChange); live, it's chordNotes[0] before any
  // voicing transform.
  const pianoRootNote = playingChordNotes ? playingRootNote : (chordNotes[0] ?? null)

  return (
    <div className="app">
      {/* Same inert pattern the builder/templates panel swap already uses
          (see app__builder-panel/app__templates-panel below) -- while the
          feedback panel is open, this is everything "behind" it, so it's
          the side that goes inert, making FeedbackPanel a genuine modal
          rather than just a visually-on-top overlay a screen reader or
          keyboard user could still reach into. */}
      <div className="app__background" inert={feedbackOpen} aria-hidden={feedbackOpen ? 'true' : undefined}>
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
            <button
              type="button"
              className={`app__header-templates-btn ${templatesDrawerOpen ? 'app__header-templates-btn--active' : ''}`}
              onClick={() => setTemplatesDrawerOpen(o => !o)}
              aria-pressed={templatesDrawerOpen}
              aria-label={templatesDrawerOpen ? 'Back to chord builder' : 'Open progression templates'}
            >
              {templatesDrawerOpen ? '← Chords' : 'Templates'}
            </button>
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

      <div className="app__drawer-wrapper">
        <main
          className={`app__panel app__builder-panel ${templatesDrawerOpen ? 'app__builder-panel--hidden' : ''}`}
          inert={templatesDrawerOpen}
          aria-hidden={templatesDrawerOpen ? 'true' : undefined}
        >
          <div className={`app__panel-inner ${sheetExpanded ? '' : 'app__panel-inner--sheet-collapsed'}`}>
            <div className="app__mode-tabs" role="tablist" aria-label="Chord tool mode">
              {MODE_TABS.map((tab, index) => (
                <button
                  key={tab.key}
                  ref={el => { modeTabRefs.current[index] = el }}
                  type="button"
                  role="tab"
                  aria-selected={mode === tab.key}
                  tabIndex={mode === tab.key ? 0 : -1}
                  className={`app__mode-tab ${mode === tab.key ? 'app__mode-tab--active' : ''}`}
                  onClick={() => setMode(tab.key)}
                  onKeyDown={e => handleModeTabKeyDown(e, index)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {mode === 'find' ? (
              <section className="app__section">
                <ReverseVoicingFinder
                  onAddToProgression={addToProgression}
                  onImportSequence={addProgressionSequence}
                  progression={progression}
                  referenceGuitarShape={referenceGuitarShape}
                  isPro={isPro}
                />
              </section>
            ) : (
              <>
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
                    notes={displayedPianoNotes}
                    intervals={intervals}
                    available={available}
                    onAddToProgression={addToProgression}
                    isPro={isPro}
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
              </>
            )}
          </div>
        </main>

        <div
          className={`app__panel app__templates-panel ${templatesDrawerOpen ? 'app__templates-panel--open' : ''}`}
          inert={!templatesDrawerOpen}
          aria-hidden={!templatesDrawerOpen ? 'true' : undefined}
        >
          <div className={`app__panel-inner ${sheetExpanded ? '' : 'app__panel-inner--sheet-collapsed'}`}>
            <section className="app__section">
              <ProgressionTemplates
                keyRoot={templateKeyRoot}
                keyMode={templateKeyMode}
                onKeyRootChange={setTemplateKeyRoot}
                onKeyModeChange={setTemplateKeyMode}
                onLoad={loadTemplate}
              />
            </section>
          </div>
        </div>
      </div>

      <ProgressionStrip
        expanded={sheetExpanded}
        onExpandedChange={setSheetExpanded}
        activeChordName={displayName}
        progression={progression}
        bpm={bpm}
        onBpmChange={setBpm}
        onClear={clearProgression}
        onRemoveLast={removeLast}
        onSelectChord={handleSelectChord}
        onReorder={moveChord}
        onLoadSaved={loadSavedProgression}
        templateInfo={activeTemplate}
        canUndoLoad={!!loadUndoSnapshot}
        onUndoLoad={undoLoad}
        teaserMessage={progressionTeaser}
        onPlayingChordChange={handlePlayingChordChange}
        chordNotes={pianoNotes}
        previewNotes={pianoPreviewNotes}
        bassHighlightNote={pianoBassHighlight}
        keysRootNote={pianoRootNote}
        keysPositionIndex={keysPositionIndex}
        onKeysPositionChange={setKeysPositionIndex}
        guitarPositionIndex={guitarPositionIndex}
        onGuitarPositionChange={setGuitarPositionIndex}
        root={root}
        guitarShape={guitarShapeToShow}
        guitarSlashNotice={guitarSlashNotice}
        guitarInversionUnavailable={guitarInversionUnavailable}
        guitarPositions={guitarPositions}
        isPro={isPro}
      />
      </div>

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
