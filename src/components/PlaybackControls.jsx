import { useState, useRef } from 'react'
import * as Tone from 'tone'
import './PlaybackControls.css'

const BPM_MIN = 60
const BPM_MAX = 140
const BPM_MID = 100
const SNAP_THRESHOLD = 4

function snapBpm(val) {
  return Math.abs(val - BPM_MID) <= SNAP_THRESHOLD ? BPM_MID : val
}

export default function PlaybackControls({ notes, bpm, onBpmChange }) {
  const [playing, setPlaying] = useState(false)
  const synthRef = useRef(null)

  const needlePct = ((bpm - BPM_MIN) / (BPM_MAX - BPM_MIN)) * 100

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
          onChange={e => onBpmChange(snapBpm(Number(e.target.value)))}
          className="playback-controls__slider"
          aria-label="Tempo in BPM"
          style={{ '--pct': `${needlePct}%` }}
        />
        <div className="playback-controls__tempo-track">
          <div className="playback-controls__tempo-center" />
          <div
            className={`playback-controls__tempo-needle ${bpm === BPM_MID ? 'playback-controls__tempo-needle--snapped' : ''}`}
            style={{ left: `calc(9px + ${needlePct / 100} * (100% - 18px))` }}
          />
        </div>
        <div className="playback-controls__bpm-range">
          <span>{BPM_MIN}</span>
          <span>{BPM_MID}</span>
          <span>{BPM_MAX}</span>
        </div>
      </div>
    </div>
  )
}
