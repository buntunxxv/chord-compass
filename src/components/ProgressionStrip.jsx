import { useState, useRef } from 'react'
import * as Tone from 'tone'
import { createKeysSynth } from '../audio/synth'
import './ProgressionStrip.css'

const BPM_MIN = 60
const BPM_MAX = 140
const BPM_MID = 100
const SNAP_THRESHOLD = 4

function snapBpm(val) {
  return Math.abs(val - BPM_MID) <= SNAP_THRESHOLD ? BPM_MID : val
}

export default function ProgressionStrip({ progression, bpm, onBpmChange, onClear, teaserMessage, onPlayingChordChange }) {
  const [activeIndex, setActiveIndex] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const synthRef = useRef(null)

  async function handlePlay() {
    if (isPlaying || progression.length === 0) return
    setIsPlaying(true)

    await Tone.start()
    Tone.getTransport().bpm.value = bpm

    if (!synthRef.current) {
      synthRef.current = createKeysSynth()
    }
    const synth = synthRef.current
    const barDuration = (60 / bpm) * 4 // seconds per chord (one bar)
    const now = Tone.now()

    progression.forEach((entry, i) => {
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
    <div className="progression-strip">
      {teaserMessage && (
        <div className="progression-strip__teaser">🔒 {teaserMessage}</div>
      )}

      <div className="progression-strip__bar">
        <span className="progression-strip__label">Progression</span>

        {progression.length === 0 ? (
          <p className="progression-strip__empty">Add chords above to build a sequence</p>
        ) : (
          <div className="progression-strip__chart">
            {progression.map((entry, i) => (
              <span
                key={i}
                className={`progression-strip__slot ${activeIndex === i ? 'progression-strip__slot--active' : ''}`}
              >
                {entry.chord}
              </span>
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
        <button
          className="progression-strip__clear-btn"
          onClick={onClear}
          disabled={progression.length === 0}
        >
          Clear
        </button>
      </div>
    </div>
  )
}
