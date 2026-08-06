import { useState, useRef } from 'react'
import { createKeysSynth, startAudioContext } from '../audio/synth'
import { formatNoteNames } from '../utils/formatNotes'
import { buildChordMidiBytes, downloadMidiFile, sanitizeFilename } from '../utils/midiExport'
import './ChordOutputPanel.css'

const INTERVAL_NAMES = {
  '1P': 'Root',
  '3M': '3',
  '3m': '♭3',
  '5P': '5',
  '5d': '♭5',
  '5A': '♯5',
  '7m': '♭7',
  '7d': '♭♭7',
  '7M': '7',
  '9M': '9',
  '4P': '4',
  '2M': '2',
}

function formatInterval(interval) {
  return INTERVAL_NAMES[interval] || interval
}

// A single chord preview doesn't need a tempo — just hold it long enough to hear
const HOLD_SECONDS = 1.5
const CONFIRMATION_MS = 1500

export default function ChordOutputPanel({ chordName, notes, intervals, available, onAddToProgression, isPro }) {
  const [playing, setPlaying] = useState(false)
  const [justExported, setJustExported] = useState(false)
  const synthRef = useRef(null)

  async function handlePlay() {
    if (playing || !notes || notes.length === 0) return
    setPlaying(true)

    await startAudioContext()

    if (!synthRef.current) {
      synthRef.current = createKeysSynth()
    }

    synthRef.current.triggerAttackRelease(notes, HOLD_SECONDS)
    setTimeout(() => setPlaying(false), HOLD_SECONDS * 1000 + 200)
  }

  // Exports the currently displayed voicing (already Close/Drop-2/Split and
  // slash/inversion-aware -- `notes` is the exact array Play itself sounds,
  // App.jsx resolves it once for both) as one simultaneous note-on group in
  // a real playable .mid file, held for the same duration the live preview
  // plays.
  function handleExportMidi() {
    if (!isPro || !notes || notes.length === 0) return
    const bytes = buildChordMidiBytes(notes, HOLD_SECONDS)
    downloadMidiFile(bytes, `${sanitizeFilename(chordName)}.mid`)
    setJustExported(true)
    setTimeout(() => setJustExported(false), CONFIRMATION_MS)
  }

  if (!available) {
    return (
      <div className="chord-output">
        <h2 className="chord-output__title">Your Chord</h2>
        <div className="chord-output--unavailable">
          <p className="chord-output__unavailable-msg">Chord not available in Stage 1</p>
        </div>
      </div>
    )
  }

  const noteNames = formatNoteNames(notes)

  return (
    <div className="chord-output" id="wt-chord-output">
      <h2 className="chord-output__title">Your Chord</h2>
      <div className="chord-output__top">
        <div className="chord-output__name">{chordName}</div>
        <button
          id="wt-play-btn"
          className={`chord-output__play-btn ${playing ? 'chord-output__play-btn--playing' : ''}`}
          onClick={handlePlay}
          disabled={playing || !notes || notes.length === 0}
          aria-label="Play chord"
        >
          <span className="chord-output__play-icon">{playing ? '♪' : '▶'}</span>
          {playing ? 'Playing…' : 'Play Chord'}
        </button>
      </div>
      <div className="chord-output__add-row">
        <button
          id="wt-add-btn"
          className="chord-output__add-btn"
          onClick={() => onAddToProgression(chordName, notes)}
          aria-label={`Add ${chordName} to progression`}
        >
          + Add current chord
        </button>
        {isPro ? (
          <button
            type="button"
            className="chord-output__export-btn"
            onClick={handleExportMidi}
            disabled={!notes || notes.length === 0}
          >
            {justExported ? 'Exported!' : 'Export MIDI'}
          </button>
        ) : (
          <button type="button" className="chord-output__export-btn chord-output__export-btn--locked" disabled>
            Export MIDI <span className="chord-output__pro-badge">PRO</span>
          </button>
        )}
      </div>
      <div className="chord-output__row">
        <span className="chord-output__row-label">Notes</span>
        <span className="chord-output__row-value">
          {noteNames.join(' · ')}
        </span>
        {intervals && intervals.length > 0 && (
          <>
            <span className="chord-output__row-label chord-output__row-label--inline" title="The distance between each note — Root is the tonic, 3 is the third, 5 is the fifth">Intervals</span>
            <span className="chord-output__row-value">
              {intervals.map(formatInterval).join(' · ')}
            </span>
          </>
        )}
      </div>
    </div>
  )
}
