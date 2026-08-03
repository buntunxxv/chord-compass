import { useState, useRef, useEffect } from 'react'
import * as Tone from 'tone'
import { createKeysSynth, startAudioContext } from '../audio/synth'
import { voiceLeadProgression } from '../utils/voiceLeading'
import InstrumentDock from './InstrumentDock'
import './ProgressionStrip.css'

const BPM_MIN = 60
const BPM_MAX = 140
const BPM_MID = 100
const SNAP_THRESHOLD = 4
const CHORDS_PER_ROW = 4
const SAVED_STORAGE_KEY = 'chordCompassSavedProgressions'
const CONFIRMATION_MS = 1500

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

export default function ProgressionStrip({ progression, bpm, onBpmChange, onClear, onRemoveLast, onSelectLastChord, onLoadSaved, teaserMessage, onPlayingChordChange, chordNotes, previewNotes, root, guitarShape, templateInfo, isPro }) {
  const [activeIndex, setActiveIndex] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const synthRef = useRef(null)

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
    // doesn't jump registers every chord without ever using an inversion
    const voicedProgression = voiceLeadProgression(progression)

    voicedProgression.forEach((entry, i) => {
      synth.triggerAttackRelease(entry.notes, '1m', now + i * barDuration)
      setTimeout(() => {
        setActiveIndex(i)
        onPlayingChordChange?.(entry.notes)
      }, i * barDuration * 1000)
    })

    const totalMs = progression.length * barDuration * 1000 + 300
    setTimeout(() => {
      setActiveIndex(null)
      setIsPlaying(false)
      onPlayingChordChange?.(null)
    }, totalMs)
  }

  return (
    <div className="progression-strip" id="wt-progression">
      <InstrumentDock
        chordNotes={chordNotes}
        previewNotes={previewNotes}
        root={root}
        guitarShape={guitarShape}
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
                  const isLast = globalIndex === progression.length - 1
                  const tappable = isLast && !isPlaying
                  return (
                    <span
                      key={globalIndex}
                      className={`progression-strip__slot ${activeIndex === globalIndex ? 'progression-strip__slot--active' : ''} ${tappable ? 'progression-strip__slot--tappable' : ''}`}
                      onClick={tappable ? () => onSelectLastChord?.(entry.chord) : undefined}
                      title={tappable ? `Set ${entry.chord} as active chord` : undefined}
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
  )
}
