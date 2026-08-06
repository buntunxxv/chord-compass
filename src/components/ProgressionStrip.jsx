import { useState, useRef, useEffect } from 'react'
import * as Tone from 'tone'
import { createKeysSynth, startAudioContext } from '../audio/synth'
import { voiceLeadProgression } from '../utils/voiceLeading'
import { applyDrop2, applyLeftHandSplit } from '../utils/pianoVoicings'
import InstrumentDock from './InstrumentDock'
import './ProgressionStrip.css'

const BPM_MIN = 60
const BPM_MAX = 140
const BPM_MID = 100
const SNAP_THRESHOLD = 4
const CHORDS_PER_ROW = 4
const SAVED_STORAGE_KEY = 'chordCompassSavedProgressions'
const CONFIRMATION_MS = 1500
// Below this many pixels of pointer travel, a press-and-release on a chip is
// treated as a tap (select), not a drag (reorder) -- keeps an ordinary tap
// from being misread as a zero-distance "drag" that does nothing.
const DRAG_THRESHOLD_PX = 6

function formatProgressionText(progression) {
  return progression
    .map(entry => (entry.degree ? `${entry.chord} (${entry.degree})` : entry.chord))
    .join(' – ')
}

function snapBpm(val) {
  return Math.abs(val - BPM_MID) <= SNAP_THRESHOLD ? BPM_MID : val
}

function chunkIntoRows(items, size) {
  const rows = []
  for (let i = 0; i < items.length; i += size) {
    rows.push(items.slice(i, i + size))
  }
  return rows
}

// Layers the selected Keys voicing (Close/Drop-2/Split) on top of whatever
// voice-leading already produced for this chord -- Close is a no-op (voice
// leading is already correct on its own), Drop-2 only protects the bass from
// inversion for entries that are genuinely slash/inversion chords (same
// isSlashChord signal App.jsx derives from hasSlashBass, here read off the
// entry's own display chord name), and Split isolates the bass exactly as it
// does in the live builder.
function applySelectedVoicing(notes, activeKeysIndex, isSlashChord) {
  if (activeKeysIndex === 1) return applyDrop2(notes, isSlashChord)
  if (activeKeysIndex === 2) return applyLeftHandSplit(notes)
  return notes
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

  function nearestChipIndex(x, y) {
    let best = null
    let bestDist = Infinity
    chipRefs.current.forEach((el, idx) => {
      if (!el) return
      const rect = el.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const dist = (cx - x) ** 2 + (cy - y) ** 2
      if (dist < bestDist) {
        bestDist = dist
        best = idx
      }
    })
    return best
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
    const idx = nearestChipIndex(e.clientX, e.clientY)
    if (idx !== null) setDragOverIndex(idx)
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
  const [justCopied, setJustCopied] = useState(false)
  const [showSavedPanel, setShowSavedPanel] = useState(false)
  const saveInputRef = useRef(null)

  useEffect(() => {
    localStorage.setItem(SAVED_STORAGE_KEY, JSON.stringify(savedProgressions))
  }, [savedProgressions])

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

  async function handleExportClick() {
    if (!isPro || progression.length === 0) return
    const text = formatProgressionText(progression)
    try {
      await navigator.clipboard.writeText(text)
      setJustCopied(true)
      setTimeout(() => setJustCopied(false), CONFIRMATION_MS)
    } catch {
      // Clipboard access denied or unavailable — nothing more we can do here
    }
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
    // post-processing applied per chord.
    const activeKeysIndex = Math.min(keysPositionIndex, isPro ? 2 : 0)
    // rootNote is captured before the voicing transform runs -- Drop-2 can
    // re-sort notes so index 0 is no longer the true root, so callers that
    // need the real root (PianoDisplay's gold highlight) need it passed
    // separately rather than read back off the transformed array.
    const voicedProgression = voiceLeadProgression(progression).map(entry => ({
      ...entry,
      rootNote: entry.notes[0],
      notes: applySelectedVoicing(entry.notes, activeKeysIndex, entry.chord.includes('/')),
    }))

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
        <span className="progression-strip__collapsed-chord-name">{activeChordName || '—'}</span>
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
            {chunkIntoRows(progression, CHORDS_PER_ROW).map((row, rowIndex) => (
              <div className="progression-strip__chart" key={rowIndex}>
                {row.map((entry, i) => {
                  const globalIndex = rowIndex * CHORDS_PER_ROW + i
                  // Every chip is tappable (and draggable) now, not just the
                  // last one -- Session 11's "last chip only" restriction is
                  // lifted here; the same generalization also makes chords
                  // with accidental roots (e.g. F#m7) fully tappable, since
                  // the exclusion was never really about accidentals, just
                  // about position, and chordNameToSelection already parses
                  // sharps/flats correctly (Session 18).
                  const tappable = !isPlaying
                  const isDragSource = dragFromIndex === globalIndex
                  const isDropTarget = dragOverIndex === globalIndex && dragFromIndex !== null && dragOverIndex !== dragFromIndex
                  return (
                    <span
                      key={globalIndex}
                      ref={el => { chipRefs.current[globalIndex] = el }}
                      className={`progression-strip__slot ${activeIndex === globalIndex ? 'progression-strip__slot--active' : ''} ${tappable ? 'progression-strip__slot--tappable' : ''} ${isDragSource ? 'progression-strip__slot--dragging' : ''} ${isDropTarget ? 'progression-strip__slot--drag-over' : ''}`}
                      onPointerDown={tappable ? e => handleChipPointerDown(e, globalIndex) : undefined}
                      onPointerMove={tappable ? handleChipPointerMove : undefined}
                      onPointerUp={tappable ? e => endDrag(e, globalIndex, entry.chord, true) : undefined}
                      onPointerCancel={tappable ? e => endDrag(e, globalIndex, entry.chord, false) : undefined}
                      title={tappable ? `${entry.chord} — tap to select, drag to reorder` : undefined}
                    >
                      {entry.chord}
                    </span>
                  )
                })}
              </div>
            ))}
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
              className="progression-strip__pro-btn"
              onClick={handleExportClick}
              disabled={progression.length === 0}
            >
              {justCopied ? 'Copied!' : 'Export'}
            </button>
          ) : (
            <button className="progression-strip__pro-btn progression-strip__pro-btn--locked" disabled>
              Export <span className="progression-strip__pro-badge">PRO</span>
            </button>
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
