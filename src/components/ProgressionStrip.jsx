import { useState, useRef, useEffect } from 'react'
import * as Tone from 'tone'
import { createKeysSynth, startAudioContext } from '../audio/synth'
import { computePlaybackProgression } from '../utils/voiceLeading'
import { buildProgressionMidiBytes, downloadMidiFile } from '../utils/midiExport'
import InstrumentDock from './InstrumentDock'
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

export default function ProgressionStrip({ expanded, onExpandedChange, activeChordName, progression, bpm, onBpmChange, onClear, onRemoveLast, onSelectChord, onReorder, onLoadSaved, teaserMessage, onPlayingChordChange, chordNotes, previewNotes, bassHighlightNote, keysRootNote, keysPositionIndex, onKeysPositionChange, guitarPositionIndex, onGuitarPositionChange, root, guitarShape, guitarSlashNotice, guitarInversionUnavailable, guitarPositions, templateInfo, isPro }) {
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

  function handleChipPointerDown(e, index) {
    if (isPlaying) return
    e.currentTarget.setPointerCapture(e.pointerId)
    dragStartRef.current = { x: e.clientX, y: e.clientY }
    setDragFromIndex(index)
    setDragOverIndex(index)
  }

  function handleChipPointerMove(e) {
    if (dragFromIndex === null) return
    const idx = nearestChipIndex(e.clientX)
    if (idx !== null) setDragOverIndex(idx)
    autoScrollChartDuringDrag(e.clientX)
  }

  function endDrag(e, index, chordName, commit) {
    if (dragFromIndex === null) return
    if (commit) {
      const start = dragStartRef.current
      const moved = start ? Math.hypot(e.clientX - start.x, e.clientY - start.y) : 0
      if (moved < DRAG_THRESHOLD_PX) {
        onSelectChord?.(index, chordName)
      } else if (dragOverIndex !== null && dragOverIndex !== dragFromIndex) {
        onReorder?.(dragFromIndex, dragOverIndex)
      }
    }
    setDragFromIndex(null)
    setDragOverIndex(null)
    dragStartRef.current = null
  }

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
  const saveInputRef = useRef(null)
  const exportResetRef = useRef(null)

  useEffect(() => {
    localStorage.setItem(SAVED_STORAGE_KEY, JSON.stringify(savedProgressions))
  }, [savedProgressions])

  useEffect(() => () => {
    if (exportResetRef.current) clearTimeout(exportResetRef.current)
  }, [])

  useEffect(() => {
    if (showSaveInput) saveInputRef.current?.focus()
  }, [showSaveInput])

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
        onPlayingChordChange?.(entry.notes, entry.rootNote)
      }, i * barDuration * 1000)
    })

    const totalMs = progression.length * barDuration * 1000 + 300
    setTimeout(() => {
      setActiveIndex(null)
      setIsPlaying(false)
      onPlayingChordChange?.(null, null)
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

          {isPro && savedProgressions.length > 0 && (
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

      {isPro && showSavedPanel && savedProgressions.length > 0 && (
        <div className="progression-strip__saved-panel">
          <ul className="progression-strip__saved-list">
            {savedProgressions.map((saved, i) => (
              <li key={i} className="progression-strip__saved-item">
                <div className="progression-strip__saved-info">
                  <span className="progression-strip__saved-name">{saved.name}</span>
                  <span className="progression-strip__saved-chords">{formatProgressionText(saved.chords)}</span>
                </div>
                <button
                  className="progression-strip__saved-load-btn"
                  onClick={() => handleLoadSaved(saved.chords)}
                >
                  Load
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      </div>
    </div>
  )
}
