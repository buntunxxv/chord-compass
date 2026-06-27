import { useState, useRef } from 'react'
import * as Tone from 'tone'
import './PlaybackControls.css'

export default function PlaybackControls({ notes, bpm, onBpmChange }) {
  const [playing, setPlaying] = useState(false)
  const synthRef = useRef(null)

  async function handlePlay() {
    if (playing || !notes || notes.length === 0) return
    setPlaying(true)

    await Tone.start()
    Tone.getTransport().bpm.value = bpm

    if (!synthRef.current) {
      synthRef.current = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'triangle' },
        envelope: { attack: 0.02, decay: 0.3, sustain: 0.4, release: 1.2 },
        volume: -8,
      }).toDestination()
    }

    const duration = '2n'
    synthRef.current.triggerAttackRelease(notes, duration)

    const durationMs = (60 / bpm) * 2 * 1000
    setTimeout(() => setPlaying(false), durationMs + 200)
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

      <div className="playback-controls__bpm">
        <label className="playback-controls__bpm-label">
          <span className="playback-controls__bpm-title">BPM</span>
          <span className="playback-controls__bpm-value">{bpm}</span>
        </label>
        <input
          type="range"
          min={60}
          max={140}
          value={bpm}
          onChange={e => onBpmChange(Number(e.target.value))}
          className="playback-controls__slider"
          aria-label="Tempo in BPM"
        />
        <div className="playback-controls__bpm-range">
          <span>60</span>
          <span>140</span>
        </div>
      </div>
    </div>
  )
}
