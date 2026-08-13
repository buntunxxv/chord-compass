import { useMemo, useState } from 'react'
import ToolShell from '../../app/ToolShell'
import { useKeysPreview } from '../../shared/audio/useKeysPreview'
import {
  CHORD_TYPES,
  ROOTS,
  SCALE_TYPES,
  getChordsInScale,
  getCompatibleScales,
  pitchesFromIntervals,
} from './compatibility'
import './ChordScaleExplorer.css'

export default function ChordScaleExplorer() {
  const [direction, setDirection] = useState('chord-to-scale')
  const [root, setRoot] = useState('C')
  const [chordType, setChordType] = useState(CHORD_TYPES[0])
  const [scaleType, setScaleType] = useState(SCALE_TYPES[0])
  const { playSequence, playChord } = useKeysPreview()

  const results = useMemo(() => (
    direction === 'chord-to-scale'
      ? getCompatibleScales(root, chordType)
      : getChordsInScale(root, scaleType)
  ), [direction, root, chordType, scaleType])

  function hear(result) {
    if (direction === 'chord-to-scale') {
      playSequence(pitchesFromIntervals(root, result.intervals), 0.3)
    } else {
      const chordRoot = result.name.match(/^[A-G](?:#|b)?/)?.[0] || root
      playChord(pitchesFromIntervals(chordRoot, result.intervals))
    }
  }

  return (
    <ToolShell title="Chord–Scale Explorer" eyebrow="Connect harmony and melody">
      <p className="chord-scales__lede">
        Start with a chord to find scales for improvising, or start with a scale to find chords for writing.
      </p>

      <section className="chord-scales">
        <div className="chord-scales__tabs" role="tablist" aria-label="Explorer direction">
          <button
            type="button"
            role="tab"
            aria-selected={direction === 'chord-to-scale'}
            className={direction === 'chord-to-scale' ? 'chord-scales__tab--active' : ''}
            onClick={() => setDirection('chord-to-scale')}
          >
            Chord → scales
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={direction === 'scale-to-chord'}
            className={direction === 'scale-to-chord' ? 'chord-scales__tab--active' : ''}
            onClick={() => setDirection('scale-to-chord')}
          >
            Scale → chords
          </button>
        </div>

        <div className="chord-scales__picker">
          <label>
            Root
            <select value={root} onChange={event => setRoot(event.target.value)}>
              {ROOTS.map(note => <option key={note}>{note}</option>)}
            </select>
          </label>

          {direction === 'chord-to-scale' ? (
            <label>
              Chord
              <select
                value={chordType.symbol}
                onChange={event => setChordType(CHORD_TYPES.find(type => type.symbol === event.target.value))}
              >
                {CHORD_TYPES.map(type => <option key={type.label} value={type.symbol}>{type.label}</option>)}
              </select>
            </label>
          ) : (
            <label>
              Scale
              <select
                value={scaleType.name}
                onChange={event => setScaleType(SCALE_TYPES.find(type => type.name === event.target.value))}
              >
                {SCALE_TYPES.map(type => <option key={type.name} value={type.name}>{type.label}</option>)}
              </select>
            </label>
          )}
        </div>

        <div className="chord-scales__summary">
          <span>{results.length}</span>
          <p>
            {direction === 'chord-to-scale'
              ? `same-root scales containing every note in ${root}${chordType.symbol}`
              : `triads built entirely from ${root} ${scaleType.label}`}
          </p>
        </div>

        <div className="chord-scales__results">
          {results.map(result => (
            <article key={result.name} className="chord-scales__result">
              <div>
                <h2>{result.name}</h2>
                <p className="chord-scales__notes">{result.notes.join(' · ')}</p>
                <p className="chord-scales__why">
                  {direction === 'chord-to-scale'
                    ? `Contains ${result.sharedNotes.join(', ')}; sounds ${result.character}.`
                    : `A ${result.quality} chord using only notes from the selected scale.`}
                </p>
              </div>
              <button type="button" onClick={() => hear(result)} aria-label={`Hear ${result.name}`}>
                Hear
              </button>
            </article>
          ))}
        </div>
      </section>
    </ToolShell>
  )
}
