import { useState, useRef } from 'react'
import * as Tone from 'tone'
import { createKeysSynth } from '../audio/synth'
import './PlaybackControls.css'

// A single chord preview doesn't need a tempo — just hold it long enough to hear
const HOLD_SECONDS = 1.5

export default function PlaybackControls({ notes }) {
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

  return (
    <div className="playback-controls">
      <button
        className={`playback-controls__play-btn ${playing ? 'playback-controls__play-btn--playing' : ''}`}
        onClick={handlePlay}
        disabled={playing || !notes || notes.length === 0}
        aria-label="Play chord"
      >
        {playing ? (
          <span className="playback-controls__icon">♪</span>
        ) : (
          <span className="playback-controls__icon">▶</span>
        )}
        <span>{playing ? 'Playing…' : 'Play Chord'}</span>
      </button>
    </div>
  )
}
