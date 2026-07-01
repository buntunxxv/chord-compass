import { useState, useRef } from 'react'
import * as Tone from 'tone'
import { createKeysSynth } from '../audio/synth'
import './ProgressionStrip.css'

export default function ProgressionStrip({ progression, bpm, onClear, teaserMessage }) {
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
      setTimeout(() => setActiveIndex(i), i * barDuration * 1000)
    })

    const totalMs = progression.length * barDuration * 1000 + 300
    setTimeout(() => {
      setActiveIndex(null)
      setIsPlaying(false)
    }, totalMs)
  }

  return (
    <div className="progression-strip">
      <h2 className="progression-strip__title">Your progression</h2>

      {progression.length === 0 ? (
        <p className="progression-strip__empty">
          Add chords with "Add current chord" or "Add to progression" to build a simple sequence.
        </p>
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

      {teaserMessage && (
        <p className="progression-strip__teaser">🔒 {teaserMessage}</p>
      )}

      <div className="progression-strip__actions">
        <button
          className={`progression-strip__play-btn ${isPlaying ? 'progression-strip__play-btn--playing' : ''}`}
          onClick={handlePlay}
          disabled={isPlaying || progression.length === 0}
        >
          {isPlaying ? '♪ Playing…' : '▶ Play progression'}
        </button>
        <button
          className="progression-strip__clear-btn"
          onClick={onClear}
          disabled={progression.length === 0}
        >
          Clear progression
        </button>
      </div>
    </div>
  )
}
