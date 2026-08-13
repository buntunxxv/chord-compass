import { useRef, useState } from 'react'
import ToolShell from '../../app/ToolShell'
import { useMetronome } from './useMetronome'
import { calculateTapBpm } from './tapTempo'
import './Metronome.css'

const SIGNATURES = [
  { label: '2/4', beats: 2, unit: 4 },
  { label: '3/4', beats: 3, unit: 4 },
  { label: '4/4', beats: 4, unit: 4 },
  { label: '6/8', beats: 6, unit: 8 },
]

function initialBpm() {
  const stored = Number(localStorage.getItem('kyndaTools.metronome.bpm'))
  return Number.isFinite(stored) && stored >= 40 && stored <= 240 ? stored : 100
}

export default function Metronome() {
  const [bpm, setBpmState] = useState(initialBpm)
  const [signature, setSignature] = useState(SIGNATURES[2])
  const [tapCount, setTapCount] = useState(0)
  const tapsRef = useRef([])
  const { isPlaying, currentBeat, toggle } = useMetronome({
    bpm,
    beatsPerMeasure: signature.beats,
    beatUnit: signature.unit,
  })

  function setBpm(next) {
    const clamped = Math.max(40, Math.min(240, Math.round(Number(next))))
    setBpmState(clamped)
    localStorage.setItem('kyndaTools.metronome.bpm', String(clamped))
  }

  function tapTempo() {
    const now = performance.now()
    const previous = tapsRef.current.at(-1)
    const taps = !previous || now - previous > 2000
      ? [now]
      : [...tapsRef.current, now].slice(-8)

    tapsRef.current = taps
    setTapCount(taps.length)
    if (taps.length < 2) return

    const tappedBpm = calculateTapBpm(taps)
    if (tappedBpm) setBpm(tappedBpm)
  }

  return (
    <ToolShell title="Metronome" eyebrow="Practise with a steady pulse">
      <p className="metronome__lede">
        Choose a tempo or tap the rhythm you already hear. The first beat of every bar is accented.
      </p>

      <section className="metronome" aria-label="Metronome controls">
        <div className="metronome__display" aria-live="polite">
          <span className="metronome__number">{bpm}</span>
          <span className="metronome__unit">BPM</span>
        </div>

        <div className="metronome__stepper">
          <button type="button" onClick={() => setBpm(bpm - 1)} aria-label="Decrease tempo">−</button>
          <input
            type="range"
            min="40"
            max="240"
            value={bpm}
            onChange={event => setBpm(event.target.value)}
            aria-label="Tempo in beats per minute"
          />
          <button type="button" onClick={() => setBpm(bpm + 1)} aria-label="Increase tempo">+</button>
        </div>

        <div className="metronome__beats" aria-label={`Beat ${currentBeat >= 0 ? currentBeat + 1 : 0} of ${signature.beats}`}>
          {Array.from({ length: signature.beats }, (_, beat) => (
            <span
              key={beat}
              className={`metronome__beat ${currentBeat === beat ? 'metronome__beat--active' : ''} ${beat === 0 ? 'metronome__beat--downbeat' : ''}`}
            />
          ))}
        </div>

        <button
          type="button"
          className={`metronome__play ${isPlaying ? 'metronome__play--active' : ''}`}
          onClick={toggle}
        >
          <span aria-hidden="true">{isPlaying ? '■' : '▶'}</span>
          {isPlaying ? 'Stop' : 'Start'}
        </button>

        <div className="metronome__section">
          <p className="metronome__section-label">Time signature</p>
          <div className="metronome__signatures" role="group" aria-label="Time signature">
            {SIGNATURES.map(option => (
              <button
                type="button"
                key={option.label}
                className={signature.label === option.label ? 'metronome__signature--active' : ''}
                aria-pressed={signature.label === option.label}
                onClick={() => setSignature(option)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="metronome__tap-panel">
          <div>
            <h2>Find your tempo</h2>
            <p>Tap at least twice. A pause resets the count.</p>
          </div>
          <button type="button" className="metronome__tap" onClick={tapTempo}>
            Tap tempo
            <span>{tapCount > 1 ? `${tapCount} taps` : 'Tap to begin'}</span>
          </button>
        </div>
      </section>
    </ToolShell>
  )
}
