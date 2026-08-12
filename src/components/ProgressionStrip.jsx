import { useState, useRef, useEffect } from 'react'
import * as Tone from 'tone'
import { createKeysSynth, startAudioContext } from '../audio/synth'
import { computePlaybackProgression } from '../utils/voiceLeading'
import { buildProgressionMidiBytes, downloadMidiFile } from '../utils/midiExport'
import InstrumentDock from './InstrumentDock'
import PianoDisplay from './PianoDisplay'
import './ProgressionStrip.css'

const BPM_MIN = 60
const BPM_MAX = 140
const BPM_MID = 100
const SNAP_THRESHOLD = 4
const SAVED_STORAGE_KEY = 'chordCompassSavedProgressions'
const CONFIRMATION_MS = 1500
// Below this many pixels of pointer travel, a press-and-release on a chip is
// treated as a tap (select), not a drag (reorder) -- keeps an ordinary tap
// from being misread as a zero-distance "drag" that does nothing.
const DRAG_THRESHOLD_PX = 6
// Long-press-to-drag: how long a chip has to be held essentially stationary
// before drag mode engages. Chips sit in a horizontally-scrollable row, so
// a touch-drag can't be captured as a reorder attempt the instant it
// starts -- that would make it impossible to ever scroll the row by
// swiping across a chip. Instead, native scrolling stays available by
// default (no touch-action:none) until the pointer has been held still
// this long, at which point drag mode arms and touch-action:none applies
// only for the remainder of that specific drag.
const LONG_PRESS_MS = 350
// A pending long-press is cancelled the moment the pointer moves more than
// this many px before the timer fires -- that movement means the user
// meant to scroll, not hold-and-drag, so the browser's native scroll
// handles it from there with no further involvement from this component.
const LONG_PRESS_MOVE_CANCEL_PX = 6
// Drag-to-reorder auto-scroll: how close to the scroll container's edge (in
// px) a drag has to get before it starts nudging the scroll position, and
// how far each nudge moves -- without this, a chip can only be dragged as
// far as whatever's already visible, which breaks down completely once the
// chip row is wider than the viewport (any progression beyond a handful of
// chords).
const AUTO_SCROLL_EDGE_PX = 48
const AUTO_SCROLL_STEP_PX = 16

function formatProgressionText(progression) {
  return progression
    .map(entry => (entry.degree ? `${entry.chord} (${entry.degree})` : entry.chord))
    .join(' – ')
}

function snapBpm(val) {
  return Math.abs(val - BPM_MID) <= SNAP_THRESHOLD ? BPM_MID : val
}

export default function ProgressionStrip({ expanded, onExpandedChange, activeChordName, progression, bpm, onBpmChange, onClear, onRemoveLast, onSelectChord, onReorder, onLoadSaved, teaserMessage, onPlayingChordChange, chordNotes, previewNotes, bassHighlightNote, keysRootNote, keysPositionIndex, onKeysPositionChange, guitarPositionIndex, onGuitarPositionChange, root, guitarShape, guitarSlashNotice, guitarInversionUnavailable, guitarPositions, templateInfo, canUndoLoad, onUndoLoad, isPro }) {
  const [activeIndex, setActiveIndex] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const synthRef = useRef(null)

  // Bottom-sheet collapse/expand: the handle (a standard iOS/Android pill)
  // supports both a plain tap and a swipe up/down, same threshold-based
  // tap-vs-gesture split the progression chips already use below. expanded
  // state itself lives in App.jsx (it needs to affect layout padding
  // outside this component too), so this only ever calls onExpandedChange
  // -- it never decides on its own to open or close.
  const handleDragStartYRef = useRef(null)

  function handleHandlePointerDown(e) {
    e.currentTarget.setPointerCapture(e.pointerId)
    handleDragStartYRef.current = e.clientY
  }

  function handleHandlePointerUp(e) {
    const startY = handleDragStartYRef.current
    if (startY == null) return
    handleDragStartYRef.current = null
    const deltaY = e.clientY - startY
    if (Math.abs(deltaY) < DRAG_THRESHOLD_PX) {
      onExpandedChange?.(!expanded)
    } else if (deltaY < 0) {
      onExpandedChange?.(true) // swiped up
    } else {
      onExpandedChange?.(false) // swiped down
    }
  }

  function handleHandlePointerCancel() {
    handleDragStartYRef.current = null
  }

  // Drag-to-reorder (Pointer Events, not HTML5 DnD -- consistent, reliable
  // touch support is the whole reason for that choice on a mobile-first
  // app). dragFromIndex/dragOverIndex are transient UI state local to this
  // component; the actual reorder is committed to the real progression
  // array (owned by App.jsx) only on pointer-up, via onReorder.
  const [dragFromIndex, setDragFromIndex] = useState(null)
  const [dragOverIndex, setDragOverIndex] = useState(null)
  const dragStartRef = useRef(null)
  const chipRefs = useRef([])
  const chartScrollRef = useRef(null)
  // Set while a long-press is timing out but hasn't armed drag mode yet --
  // distinct from dragFromIndex, which only becomes non-null once the press
  // has actually been held long enough (see handleChipPointerDown below).
  const pendingDragIndexRef = useRef(null)
  const longPressTimerRef = useRef(null)
  // The chip currently wearing the native touchmove listener that blocks
  // scrolling during an active drag -- see armDrag/releaseDragTouchBlock.
  const dragTouchBlockElRef = useRef(null)

  // Chips now sit in a single horizontally-scrollable row (not a wrapped
  // multi-row grid), so the nearest-chip search is just 1D distance along x
  // -- carrying over the old 2D (x,y) distance formula would let a finger
  // drifting vertically during a touch-drag skew which chip reads as
  // "nearest" for no reason, since every chip now sits at the same y.
  function nearestChipIndex(x) {
    let best = null
    let bestDist = Infinity
    chipRefs.current.forEach((el, idx) => {
      if (!el) return
      const rect = el.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const dist = Math.abs(cx - x)
      if (dist < bestDist) {
        bestDist = dist
        best = idx
      }
    })
    return best
  }

  // Nudges the chip row's own scroll position when a drag gets close to
  // either edge, so a chip can be dragged all the way to a position that
  // isn't currently visible -- without this, reordering breaks down as soon
  // as the row is wider than the viewport.
  function autoScrollChartDuringDrag(x) {
    const el = chartScrollRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    if (x < rect.left + AUTO_SCROLL_EDGE_PX) {
      el.scrollLeft -= AUTO_SCROLL_STEP_PX
    } else if (x > rect.right - AUTO_SCROLL_EDGE_PX) {
      el.scrollLeft += AUTO_SCROLL_STEP_PX
    }
  }

  function clearPendingLongPress() {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }
    pendingDragIndexRef.current = null
  }

  // Cancels the touchmove default action for as long as it's attached --
  // used to block native scrolling only once a drag is actually armed.
  function preventTouchScroll(e) {
    e.preventDefault()
  }

  // CSS touch-action and calling preventDefault() from a React onPointerMove
  // handler both turn out not to be reliably honored once a touch sequence
  // is already in flight -- Chromium's gesture recognizer only waits for JS
  // before committing to a scroll if a genuinely non-passive raw `touchmove`
  // listener exists on the target at the moment of the next move, and
  // apparently doesn't extend that same courtesy to a Pointer Event
  // listener. Attaching one directly, right as the long-press timer fires
  // (i.e. before the next move can occur), is what actually suppresses the
  // native scroll for the rest of an armed drag.
  function blockTouchScrollFor(el) {
    if (!el) return
    el.addEventListener('touchmove', preventTouchScroll, { passive: false })
    dragTouchBlockElRef.current = el
  }

  function releaseDragTouchBlock() {
    if (dragTouchBlockElRef.current) {
      dragTouchBlockElRef.current.removeEventListener('touchmove', preventTouchScroll)
      dragTouchBlockElRef.current = null
    }
  }

  // setPointerCapture happens immediately (harmless -- it only affects which
  // element JS pointer events route to, it doesn't itself block native
  // scrolling the way touch-action does), but drag mode itself is deferred
  // to the long-press timer below. Until that timer fires, this is
  // indistinguishable from an ordinary tap or the start of a scroll swipe.
  function handleChipPointerDown(e, index) {
    if (isPlaying) return
    e.currentTarget.setPointerCapture(e.pointerId)
    dragStartRef.current = { x: e.clientX, y: e.clientY }
    pendingDragIndexRef.current = index
    longPressTimerRef.current = setTimeout(() => {
      longPressTimerRef.current = null
      if (pendingDragIndexRef.current === index) {
        pendingDragIndexRef.current = null
        blockTouchScrollFor(chipRefs.current[index])
        setDragFromIndex(index)
        setDragOverIndex(index)
      }
    }, LONG_PRESS_MS)
  }

  function handleChipPointerMove(e) {
    if (dragFromIndex === null) {
      // Still waiting on the long-press timer -- real movement this early
      // means the user meant to scroll, not hold-and-drag, so cancel the
      // pending arm and leave the browser's native touch scroll alone for
      // the rest of this gesture (touch-action was never blocked).
      if (pendingDragIndexRef.current === null) return
      const start = dragStartRef.current
      const moved = start ? Math.hypot(e.clientX - start.x, e.clientY - start.y) : 0
      if (moved > LONG_PRESS_MOVE_CANCEL_PX) clearPendingLongPress()
      return
    }
    const idx = nearestChipIndex(e.clientX)
    if (idx !== null) setDragOverIndex(idx)
    autoScrollChartDuringDrag(e.clientX)
  }

  function endDrag(e, index, chordName, commit) {
    const wasArmed = dragFromIndex !== null
    clearPendingLongPress()
    releaseDragTouchBlock()
    if (commit) {
      const start = dragStartRef.current
      const moved = start ? Math.hypot(e.clientX - start.x, e.clientY - start.y) : 0
      if (moved < DRAG_THRESHOLD_PX) {
        onSelectChord?.(index, chordName)
      } else if (wasArmed && dragOverIndex !== null && dragOverIndex !== dragFromIndex) {
        onReorder?.(dragFromIndex, dragOverIndex)
      }
    }
    setDragFromIndex(null)
    setDragOverIndex(null)
    dragStartRef.current = null
  }

  useEffect(() => () => {
    if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current)
    releaseDragTouchBlock()
  }, [])

  const [savedProgressions, setSavedProgressions] = useState(() => {
    try {
      const stored = localStorage.getItem(SAVED_STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })
  const [showSaveInput, setShowSaveInput] = useState(false)
  const [saveName, setSaveName] = useState('')
  const [justSaved, setJustSaved] = useState(false)
  // 'idle' | 'exporting' | 'success' | 'error' -- gives the Export button a
  // brief, visible state for each phase, instead of the previous
  // build-and-download happening with no feedback at all if it fails.
  const [exportStatus, setExportStatus] = useState('idle')
  const [exportError, setExportError] = useState('')
  const [showSavedPanel, setShowSavedPanel] = useState(false)
  // Index of the saved-progression item currently being renamed inline, or
  // null when nothing is being edited -- only one at a time, same as the
  // top-level save flow only ever has one name input open.
  const [savedEditingIndex, setSavedEditingIndex] = useState(null)
  const [savedEditName, setSavedEditName] = useState('')
  // Reuses the exact same brief, self-clearing role="status" pattern (and
  // even the same CSS class) as justSaved's "Progression saved" message
  // above, just parameterized by message so rename and delete can both
  // flash through it instead of each inventing their own toast.
  const [savedListStatus, setSavedListStatus] = useState('')
  const saveInputRef = useRef(null)
  const savedEditInputRef = useRef(null)
  const exportResetRef = useRef(null)
  const savedListStatusResetRef = useRef(null)

  useEffect(() => {
    localStorage.setItem(SAVED_STORAGE_KEY, JSON.stringify(savedProgressions))
  }, [savedProgressions])

  useEffect(() => () => {
    if (exportResetRef.current) clearTimeout(exportResetRef.current)
    if (savedListStatusResetRef.current) clearTimeout(savedListStatusResetRef.current)
  }, [])

  useEffect(() => {
    if (showSaveInput) saveInputRef.current?.focus()
  }, [showSaveInput])

  useEffect(() => {
    if (savedEditingIndex != null) savedEditInputRef.current?.focus()
  }, [savedEditingIndex])

  function handleSaveClick() {
    if (!isPro || progression.length === 0) return
    setSaveName('')
    setShowSaveInput(true)
  }

  function handleConfirmSave() {
    const name = saveName.trim()
    if (!name) return
    setSavedProgressions(prev => [...prev, { name, chords: progression, savedAt: Date.now() }])
    setShowSaveInput(false)
    setSaveName('')
    setJustSaved(true)
    setTimeout(() => setJustSaved(false), CONFIRMATION_MS)
  }

  function handleCancelSave() {
    setShowSaveInput(false)
    setSaveName('')
  }

  function handleSaveKeyDown(e) {
    if (e.key === 'Enter') handleConfirmSave()
    if (e.key === 'Escape') handleCancelSave()
  }

  // Exports a real playable .mid file (via @tonejs/midi), not clipboard
  // text -- one chord per bar, in sequence, using the exact same voiced
  // notes (Close/Drop-2/Split, voice-led, slash/inversion-aware) that Play
  // actually sounds, since both go through computePlaybackProgression.
  function handleExportClick() {
    if (!isPro || progression.length === 0) return
    if (exportResetRef.current) clearTimeout(exportResetRef.current)
    setExportStatus('exporting')
    setExportError('')
    // Deferred a tick so the "Exporting…" state actually gets painted --
    // building the bytes and clicking the download anchor are otherwise
    // synchronous and would otherwise land in the same batched render as
    // the success/error state that follows it.
    setTimeout(() => {
      try {
        const activeKeysIndex = Math.min(keysPositionIndex, isPro ? 2 : 0)
        const voicedProgression = computePlaybackProgression(progression, activeKeysIndex)
        const bytes = buildProgressionMidiBytes(voicedProgression, bpm)
        downloadMidiFile(bytes, 'chord-progression.mid')
        setExportStatus('success')
      } catch (err) {
        setExportStatus('error')
        setExportError(err instanceof Error ? err.message : 'Export failed')
      }
      exportResetRef.current = setTimeout(() => setExportStatus('idle'), CONFIRMATION_MS)
    }, 0)
  }

  function handleLoadSaved(chords) {
    onLoadSaved?.(chords)
    setShowSavedPanel(false)
  }

  function flashSavedListStatus(message) {
    if (savedListStatusResetRef.current) clearTimeout(savedListStatusResetRef.current)
    setSavedListStatus(message)
    savedListStatusResetRef.current = setTimeout(() => setSavedListStatus(''), CONFIRMATION_MS)
  }

  function startSavedRename(index, currentName) {
    setSavedEditingIndex(index)
    setSavedEditName(currentName)
  }

  function cancelSavedRename() {
    setSavedEditingIndex(null)
    setSavedEditName('')
  }

  function confirmSavedRename(index) {
    const name = savedEditName.trim()
    if (!name) {
      cancelSavedRename()
      return
    }
    setSavedProgressions(prev => prev.map((saved, i) => (i === index ? { ...saved, name } : saved)))
    cancelSavedRename()
    flashSavedListStatus('Progression renamed')
  }

  function handleSavedRenameKeyDown(e, index) {
    if (e.key === 'Enter') confirmSavedRename(index)
    if (e.key === 'Escape') cancelSavedRename()
  }

  function handleDeleteSaved(index) {
    const target = savedProgressions[index]
    if (!target) return
    if (!window.confirm(`Delete saved progression "${target.name}"?`)) return
    setSavedProgressions(prev => prev.filter((_, i) => i !== index))
    // Deleting shifts every later index down by one -- if an unrelated item
    // was mid-rename, keep that edit pointed at the right row rather than
    // silently dropping or misattributing it; only clear it outright if the
    // deleted row was the one actually being edited.
    setSavedEditingIndex(prev => {
      if (prev == null) return prev
      if (prev === index) return null
      return prev > index ? prev - 1 : prev
    })
    if (savedEditingIndex === index) setSavedEditName('')
    flashSavedListStatus('Progression deleted')
  }

  async function handlePlay() {
    if (isPlaying || progression.length === 0) return
    setIsPlaying(true)

    await startAudioContext()
    Tone.getTransport().bpm.value = bpm

    if (!synthRef.current) {
      synthRef.current = createKeysSynth()
    }
    const synth = synthRef.current
    const barDuration = (60 / bpm) * 4 // seconds per chord (one bar)
    const now = Tone.now()

    // Root of each chord stays exactly as stored — only the upper notes are
    // re-voiced to the closest octave to the previous chord, so playback
    // doesn't jump registers every chord without ever using an inversion.
    // The selected Keys voicing (Close/Drop-2/Split) is then layered on top
    // of each already-voice-led chord as a separate step, same clamp as the
    // live builder uses so a free user can't hear a Pro-gated position here
    // either -- this doesn't replace or redesign voice-leading, it's purely
    // post-processing applied per chord. Pulled into computePlaybackProgression
    // (voiceLeading.js) so MIDI export builds the exact same voiced notes.
    const activeKeysIndex = Math.min(keysPositionIndex, isPro ? 2 : 0)
    const voicedProgression = computePlaybackProgression(progression, activeKeysIndex)

    voicedProgression.forEach((entry, i) => {
      synth.triggerAttackRelease(entry.notes, '1m', now + i * barDuration)
      setTimeout(() => {
        setActiveIndex(i)
        onPlayingChordChange?.(entry.notes, entry.rootNote, entry.chord)
      }, i * barDuration * 1000)
    })

    const totalMs = progression.length * barDuration * 1000 + 300
    setTimeout(() => {
      setActiveIndex(null)
      setIsPlaying(false)
      onPlayingChordChange?.(null, null, null)
    }, totalMs)
  }

  return (
    <div className={`progression-strip ${expanded ? 'progression-strip--expanded' : 'progression-strip--collapsed'}`} id="wt-progression">
      <div
        className="progression-strip__handle"
        onPointerDown={handleHandlePointerDown}
        onPointerUp={handleHandlePointerUp}
        onPointerCancel={handleHandlePointerCancel}
        role="button"
        tabIndex={0}
        aria-label={expanded ? 'Collapse chord tools' : 'Expand chord tools'}
        aria-expanded={expanded}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') onExpandedChange?.(!expanded) }}
      >
        <span className="progression-strip__handle-pill" />
      </div>

      <div
        className="progression-strip__collapsed-bar"
        onClick={() => onExpandedChange?.(true)}
        role="button"
        tabIndex={0}
        aria-label="Expand chord tools"
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') onExpandedChange?.(true) }}
      >
        <div className="progression-strip__collapsed-info">
          <span className="progression-strip__collapsed-chord-name">{activeChordName || '—'}</span>
          {progression.length > 0 && (
            <span className="progression-strip__collapsed-count">
              {progression.length} chord{progression.length === 1 ? '' : 's'}
            </span>
          )}
        </div>
        <PianoDisplay
          chordNotes={chordNotes}
          previewNotes={previewNotes}
          bassHighlightNote={bassHighlightNote}
          rootNote={keysRootNote}
          miniature
        />
        <button
          type="button"
          className={`progression-strip__collapsed-play-btn ${isPlaying ? 'progression-strip__collapsed-play-btn--playing' : ''}`}
          onClick={e => { e.stopPropagation(); handlePlay() }}
          disabled={isPlaying || progression.length === 0}
          aria-label={isPlaying ? 'Playing' : 'Play progression'}
        >
          {isPlaying ? '♪' : '▶'}
        </button>
      </div>

      <div className="progression-strip__expanded-content">
      <InstrumentDock
        chordNotes={chordNotes}
        previewNotes={previewNotes}
        bassHighlightNote={bassHighlightNote}
        keysRootNote={keysRootNote}
        keysPositionIndex={keysPositionIndex}
        onKeysPositionChange={onKeysPositionChange}
        guitarPositionIndex={guitarPositionIndex}
        onGuitarPositionChange={onGuitarPositionChange}
        root={root}
        guitarShape={guitarShape}
        guitarSlashNotice={guitarSlashNotice}
        guitarInversionUnavailable={guitarInversionUnavailable}
        guitarPositions={guitarPositions}
        isPro={isPro}
      />

      {teaserMessage && (
        <div className="progression-strip__teaser">🔒 {teaserMessage}</div>
      )}

      {templateInfo && progression.length > 0 && (
        <div className="progression-strip__template-banner">
          <strong>{templateInfo.name}</strong> — {templateInfo.description}
        </div>
      )}

      {/* One-step undo for the progression that was just replaced by a
          template load -- App.jsx clears this (canUndoLoad becomes false)
          after ~10s or as soon as any other progression edit happens, so it
          never lingers as a stale offer to restore an outdated state. */}
      {canUndoLoad && (
        <div className="progression-strip__undo-banner">
          <span>Progression loaded.</span>
          <button type="button" className="progression-strip__undo-btn" onClick={onUndoLoad}>
            Undo
          </button>
        </div>
      )}

      <div className="progression-strip__bar">
        <span className="progression-strip__label">Progression</span>

        {progression.length === 0 ? (
          <p className="progression-strip__empty">Add chords above to build a sequence</p>
        ) : (
          <div className="progression-strip__chart-group">
            <div
              className={`progression-strip__chart-scroll ${dragFromIndex !== null ? 'progression-strip__chart-scroll--dragging' : ''}`}
              ref={chartScrollRef}
            >
              {progression.map((entry, index) => {
                // Every chip is tappable (and draggable) now, not just the
                // last one -- Session 11's "last chip only" restriction is
                // lifted here; the same generalization also makes chords
                // with accidental roots (e.g. F#m7) fully tappable, since
                // the exclusion was never really about accidentals, just
                // about position, and chordNameToSelection already parses
                // sharps/flats correctly (Session 18).
                const tappable = !isPlaying
                const isDragSource = dragFromIndex === index
                const isDropTarget = dragOverIndex === index && dragFromIndex !== null && dragOverIndex !== dragFromIndex
                return (
                  <span
                    key={index}
                    ref={el => { chipRefs.current[index] = el }}
                    className={`progression-strip__slot ${activeIndex === index ? 'progression-strip__slot--active' : ''} ${tappable ? 'progression-strip__slot--tappable' : ''} ${isDragSource ? 'progression-strip__slot--dragging' : ''} ${isDropTarget ? 'progression-strip__slot--drag-over' : ''}`}
                    onPointerDown={tappable ? e => handleChipPointerDown(e, index) : undefined}
                    onPointerMove={tappable ? handleChipPointerMove : undefined}
                    onPointerUp={tappable ? e => endDrag(e, index, entry.chord, true) : undefined}
                    onPointerCancel={tappable ? e => endDrag(e, index, entry.chord, false) : undefined}
                    title={tappable ? `${entry.chord} — tap to select, drag to reorder` : undefined}
                  >
                    <span className="progression-strip__slot-index">{index + 1}</span>
                    <span className="progression-strip__slot-chord">{entry.chord}</span>
                  </span>
                )
              })}
            </div>
          </div>
        )}

        <div className="progression-strip__bpm">
          <span
            className={`progression-strip__bpm-value ${bpm === BPM_MID ? 'progression-strip__bpm-value--snapped' : ''}`}
            title="Tempo — only affects sequences of more than one chord"
          >
            {bpm} BPM
          </span>
          <input
            type="range"
            min={BPM_MIN}
            max={BPM_MAX}
            value={bpm}
            onChange={e => onBpmChange(snapBpm(Number(e.target.value)))}
            className="progression-strip__bpm-slider"
            aria-label="Tempo in BPM"
          />
        </div>

        <button
          className={`progression-strip__play-btn ${isPlaying ? 'progression-strip__play-btn--playing' : ''}`}
          onClick={handlePlay}
          disabled={isPlaying || progression.length === 0}
        >
          {isPlaying ? '♪ Playing…' : '▶ Play'}
        </button>

        <div className="progression-strip__pro-group">
          {showSaveInput ? (
            <div className="progression-strip__save-inline">
              <input
                ref={saveInputRef}
                type="text"
                className="progression-strip__save-input"
                placeholder="Name this progression"
                value={saveName}
                onChange={e => setSaveName(e.target.value)}
                onKeyDown={handleSaveKeyDown}
                maxLength={60}
              />
              <button
                className="progression-strip__save-confirm-btn"
                onClick={handleConfirmSave}
                disabled={!saveName.trim()}
                aria-label="Confirm save"
              >
                ✓
              </button>
              <button
                className="progression-strip__save-cancel-btn"
                onClick={handleCancelSave}
                aria-label="Cancel save"
              >
                ✕
              </button>
            </div>
          ) : isPro ? (
            <button
              className="progression-strip__pro-btn"
              onClick={handleSaveClick}
              disabled={progression.length === 0}
            >
              {justSaved ? 'Saved!' : 'Save'}
            </button>
          ) : (
            <button className="progression-strip__pro-btn progression-strip__pro-btn--locked" disabled>
              Save <span className="progression-strip__pro-badge">PRO</span>
            </button>
          )}

          {/* Same self-clearing status-message pattern the export button
              already uses below (role="status" so it's announced, cleared
              by the same justSaved timeout that flips the Save button's own
              label back) -- previously the only feedback here was the
              "Saved (N)" toggle's count silently changing, easy to miss
              since it sits to the side of the button that was actually
              clicked. */}
          {justSaved && (
            <p className="progression-strip__save-status" role="status">Progression saved</p>
          )}

          {isPro ? (
            <button
              className={`progression-strip__pro-btn ${exportStatus === 'error' ? 'progression-strip__pro-btn--error' : ''}`}
              onClick={handleExportClick}
              disabled={exportStatus === 'exporting' || progression.length === 0}
            >
              {exportStatus === 'exporting' ? 'Exporting…'
                : exportStatus === 'success' ? 'Exported!'
                  : exportStatus === 'error' ? 'Export failed'
                    : 'Export'}
            </button>
          ) : (
            <button className="progression-strip__pro-btn progression-strip__pro-btn--locked" disabled>
              Export <span className="progression-strip__pro-badge">PRO</span>
            </button>
          )}

          {exportStatus === 'error' && (
            <p className="progression-strip__export-error" role="status">{exportError}</p>
          )}

          {isPro && (
            <button
              className="progression-strip__saved-toggle"
              onClick={() => setShowSavedPanel(o => !o)}
            >
              Saved ({savedProgressions.length}) {showSavedPanel ? '▲' : '▼'}
            </button>
          )}
        </div>

        {progression.length > 0 && (
          <div className="progression-strip__clear-group">
            <button
              className="progression-strip__clear-btn"
              onClick={onRemoveLast}
            >
              Clear
            </button>
            <button
              className="progression-strip__clear-btn"
              onClick={onClear}
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {isPro && showSavedPanel && (
        <>
          <div className="progression-strip__saved-panel">
            {savedProgressions.length === 0 ? (
              <p className="progression-strip__saved-empty">No saved progressions yet — build one and tap Save</p>
            ) : (
            <ul className="progression-strip__saved-list">
              {savedProgressions.map((saved, i) => (
                <li key={i} className="progression-strip__saved-item">
                  <div className="progression-strip__saved-info">
                    {savedEditingIndex === i ? (
                      <input
                        ref={savedEditInputRef}
                        type="text"
                        className="progression-strip__save-input progression-strip__saved-edit-input"
                        value={savedEditName}
                        onChange={e => setSavedEditName(e.target.value)}
                        onKeyDown={e => handleSavedRenameKeyDown(e, i)}
                        maxLength={60}
                      />
                    ) : (
                      <span className="progression-strip__saved-name">{saved.name}</span>
                    )}
                    <span className="progression-strip__saved-chords">{formatProgressionText(saved.chords)}</span>
                  </div>
                  <div className="progression-strip__saved-actions">
                    {savedEditingIndex === i ? (
                      <>
                        <button
                          className="progression-strip__save-confirm-btn"
                          onClick={() => confirmSavedRename(i)}
                          disabled={!savedEditName.trim()}
                          aria-label="Confirm rename"
                        >
                          ✓
                        </button>
                        <button
                          className="progression-strip__save-cancel-btn"
                          onClick={cancelSavedRename}
                          aria-label="Cancel rename"
                        >
                          ✕
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className="progression-strip__saved-load-btn"
                          onClick={() => handleLoadSaved(saved.chords)}
                        >
                          Load
                        </button>
                        <button
                          className="progression-strip__saved-rename-btn"
                          onClick={() => startSavedRename(i, saved.name)}
                          aria-label={`Rename ${saved.name}`}
                        >
                          Rename
                        </button>
                        <button
                          className="progression-strip__saved-delete-btn"
                          onClick={() => handleDeleteSaved(i)}
                          aria-label={`Delete ${saved.name}`}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
            )}
          </div>

          {/* Same self-clearing role="status" toast the Save button uses
              above, reused here for rename/delete instead of a third
              feedback mechanism. */}
          {savedListStatus && (
            <p className="progression-strip__save-status" role="status">{savedListStatus}</p>
          )}
        </>
      )}
      </div>
    </div>
  )
}
