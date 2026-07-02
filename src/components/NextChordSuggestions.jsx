import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import * as Tone from 'tone'
import { LABEL_COLORS, LABEL_COLORS_DARK, LABEL_EXPLANATIONS } from '../chordData'
import { createKeysSynth } from '../audio/synth'
import { formatNoteNames } from '../utils/formatNotes'
import { logEvent } from '../analytics/events'
import './NextChordSuggestions.css'

export default function NextChordSuggestions({ suggestions, currentNotes, bpm, previewIndex, onPreviewChange, onAddToProgression, theme }) {
  const labelColors = theme === 'dark' ? LABEL_COLORS_DARK : LABEL_COLORS
  const labelFallback = theme === 'dark' ? { bg: '#2a2a2a', text: '#bbb' } : { bg: '#f0f0f0', text: '#555' }
  const [playingIndex, setPlayingIndex] = useState(null)
  const synthRef = useRef(null)

  async function handleHear(index, nextNotes) {
    onPreviewChange(index)
    if (playingIndex !== null) return
    setPlayingIndex(index)

    await Tone.start()
    Tone.getTransport().bpm.value = bpm

    if (!synthRef.current) {
      synthRef.current = createKeysSynth()
    }
    const synth = synthRef.current
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

  function handleCardClick(index) {
    onPreviewChange(previewIndex === index ? null : index)
  }

  if (!suggestions || suggestions.length === 0) {
    return null
  }

  return (
    <div className="next-chords">
      <h2 className="next-chords__title">Where could this chord go?</h2>
      <div className="next-chords__cards">
        {suggestions.map((s, i) => {
          const labelStyle = labelColors[s.label] || labelFallback
          const explanation = LABEL_EXPLANATIONS[s.label] || ''
          const isPlaying = playingIndex === i
          const isSelected = previewIndex === i
          const noteNames = formatNoteNames(s.notes)

          return (
            <div
              className={`next-chords__card ${isSelected ? 'next-chords__card--selected' : ''}`}
              key={i}
              onClick={() => handleCardClick(i)}
              role="button"
              tabIndex={0}
              aria-pressed={isSelected}
              onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && handleCardClick(i)}
            >
              <div className="next-chords__card-top">
                <span className="next-chords__chord-name">{s.chord}</span>
                <span
                  className="next-chords__label-badge"
                  style={{ background: labelStyle.bg, color: labelStyle.text }}
                >
                  {s.label}
                </span>
              </div>

              <p className="next-chords__notes">{noteNames.join(' · ')}</p>

              {explanation && (
                <p className="next-chords__explanation">{explanation}</p>
              )}

              <div className="next-chords__card-actions">
                <button
                  className={`next-chords__hear-btn ${isPlaying ? 'next-chords__hear-btn--playing' : ''}`}
                  onClick={e => { e.stopPropagation(); handleHear(i, s.notes) }}
                  disabled={playingIndex !== null}
                  aria-label={`Hear movement to ${s.chord}`}
                >
                  {isPlaying ? '♪ Playing…' : 'Hear →'}
                </button>
                <button
                  className="next-chords__add-btn"
                  onClick={e => { e.stopPropagation(); onAddToProgression(s.chord, s.notes) }}
                  aria-label={`Add ${s.chord} to progression`}
                >
                  + Add to progression
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <Link
        to="/upgrade"
        className="next-chords__upgrade-cta"
        onClick={() => logEvent('upgrade_cta_click', { source: 'next_chords' })}
      >
        <span className="next-chords__upgrade-lock">🔒</span>
        <span>Future Pro: unlock more chord directions</span>
      </Link>
    </div>
  )
}
