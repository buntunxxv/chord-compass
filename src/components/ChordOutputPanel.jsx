import { useState, useRef } from 'react'
import * as Tone from 'tone'
import { createKeysSynth } from '../audio/synth'
import { formatNoteNames } from '../utils/formatNotes'
import './ChordOutputPanel.css'

const INTERVAL_NAMES = {
  '1P': 'Root',
  '3M': '3',
  '3m': '♭3',
  '5P': '5',
  '5d': '♭5',
  '5A': '♯5',
  '7m': '♭7',
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

export default function ChordOutputPanel({ chordName, notes, intervals, available, onAddToProgression }) {
  const [playing, setPlaying] = useState(false)
  const synthRef = useRef(null)

  async function handlePlay() {
    if (playing || !notes || notes.length === 0) return
    setPlaying(true)

    // Use playback audio session on iOS so sound follows device volume
    // rather than the ringer/silent switch (requires iOS 16.4+)
    if (navigator.audioSession) {
      navigator.audioSession.type = 'playback'
    }
    await Tone.start()

    if (!synthRef.current) {
      synthRef.current = createKeysSynth()
    }

    synthRef.current.triggerAttackRelease(notes, HOLD_SECONDS)
    setTimeout(() => setPlaying(false), HOLD_SECONDS * 1000 + 200)
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
        <div className="chord-output__actions">
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
          <button
            id="wt-add-btn"
            className="chord-output__add-btn"
            onClick={() => onAddToProgression(chordName, notes)}
            aria-label={`Add ${chordName} to progression`}
          >
            + Add current chord
          </button>
        </div>
      </div>
      <div className="chord-output__row">
        <span className="chord-output__row-label">Notes</span>
        <span className="chord-output__row-value">
          {noteNames.join(' · ')}
        </span>
      </div>
      {intervals && intervals.length > 0 && (
        <div className="chord-output__row">
          <span className="chord-output__row-label" title="The distance between each note — Root is the tonic, 3 is the third, 5 is the fifth">Intervals</span>
          <span className="chord-output__row-value">
            {intervals.map(formatInterval).join(' · ')}
          </span>
        </div>
      )}
    </div>
  )
}
