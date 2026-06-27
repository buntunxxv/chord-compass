import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import * as Tone from 'tone'
import { LABEL_COLORS } from '../chordData'
import './NextChordSuggestions.css'

function getSynthRef(ref) {
  if (!ref.current) {
    ref.current = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.02, decay: 0.3, sustain: 0.4, release: 1.2 },
      volume: -8,
    }).toDestination()
  }
  return ref.current
}

export default function NextChordSuggestions({ suggestions, currentNotes, bpm }) {
  const [playingIndex, setPlayingIndex] = useState(null)
  const synthRef = useRef(null)

  async function handleHear(index, nextNotes) {
    if (playingIndex !== null) return
    setPlayingIndex(index)

    await Tone.start()
    Tone.getTransport().bpm.value = bpm

    const synth = getSynthRef(synthRef)
    const beatDuration = 60 / bpm // seconds per beat
    const barDuration = beatDuration * 4 // one bar = 4 beats
    const chordDuration = '1m' // one measure per chord

    const now = Tone.now()
    // Play current chord
    if (currentNotes && currentNotes.length > 0) {
      synth.triggerAttackRelease(currentNotes, chordDuration, now)
    }
    // Play next chord one bar later
    synth.triggerAttackRelease(nextNotes, chordDuration, now + barDuration)

    const totalMs = (barDuration * 2) * 1000 + 500
    setTimeout(() => setPlayingIndex(null), totalMs)
  }

  if (!suggestions || suggestions.length === 0) {
    return null
  }

  return (
    <div className="next-chords">
      <h2 className="next-chords__title">Where could this chord go?</h2>
      <div className="next-chords__cards">
        {suggestions.map((s, i) => {
          const labelStyle = LABEL_COLORS[s.label] || { bg: '#f0f0f0', text: '#555' }
          const isPlaying = playingIndex === i

          return (
            <div className="next-chords__card" key={i}>
              <div className="next-chords__card-top">
                <span className="next-chords__chord-name">{s.chord}</span>
                <span
                  className="next-chords__label-badge"
                  style={{ background: labelStyle.bg, color: labelStyle.text }}
                >
                  {s.label}
                </span>
              </div>
              <button
                className={`next-chords__hear-btn ${isPlaying ? 'next-chords__hear-btn--playing' : ''}`}
                onClick={() => handleHear(i, s.notes)}
                disabled={playingIndex !== null}
                aria-label={`Hear movement to ${s.chord}`}
              >
                {isPlaying ? '♪ Playing…' : 'Hear →'}
              </button>
            </div>
          )
        })}
      </div>

      <Link to="/upgrade" className="next-chords__upgrade-cta">
        <span className="next-chords__upgrade-lock">🔒</span>
        <span>Unlock 2 more directions — <strong>Chord Compass Pro</strong></span>
      </Link>
    </div>
  )
}
