import { useMemo, useState } from 'react'
import GuitarDisplay from './GuitarDisplay'
import NotePicker from './NotePicker'
import { findVoicings, soundingNotes, detectChordName, PITCH_CLASS_NAMES } from '../utils/reverseVoicingLookup'
import './ReverseVoicingFinder.css'

const STRING_COUNT = 6
const RESULT_LABELS = ['Best match', '2nd best', '3rd best']

function statsLine(result) {
  const mutedText = result.muted === 0 ? 'no muted strings' : `${result.muted} muted string${result.muted === 1 ? '' : 's'}`
  const spanText = `${result.span} fret${result.span === 1 ? '' : 's'} span`
  const ease = `${mutedText} · ${spanText} · avg fret ${result.avgFret.toFixed(1)}`
  if (result.distance == null) return ease
  return `${result.distance} fret${result.distance === 1 ? '' : 's'} from last chord · ${ease}`
}

// Phase 1: ease/playability-only ranking, no MIDI import (Phase 3). Free
// for every user for now -- there's no Pro gate here yet, same way the
// rest of this app gates a feature only once it actually needs to (this
// one has no reason to yet).
//
// Phase 2: once the progression already has a chord in it, proximity to
// that last chord's own currently-displayed guitar shape REPLACES ease as
// the ranking (not blended with it) -- see reverseVoicingLookup.js's
// findVoicings for why. referenceGuitarShape is resolved by App.jsx
// (which already owns the lookup logic for every chord's guitar shape);
// this component only needs progression for the "closest to X" hint text.
export default function ReverseVoicingFinder({ onAddToProgression, progression, referenceGuitarShape }) {
  const [selected, setSelected] = useState([])

  const results = useMemo(() => {
    if (selected.length === 0 || selected.length > STRING_COUNT) return []
    return findVoicings(selected, { maxResults: 3, referenceShape: referenceGuitarShape?.frets ?? null })
  }, [selected, referenceGuitarShape])

  const selectedNoteNames = selected
    .slice()
    .sort((a, b) => a - b)
    .map(pc => PITCH_CLASS_NAMES[pc])

  const lastChordName = progression && progression.length > 0 ? progression[progression.length - 1].chord : null

  return (
    <div className="reverse-finder">
      <h2 className="reverse-finder__title">Find Shapes by Notes</h2>
      <p className="reverse-finder__hint">
        {referenceGuitarShape
          ? `Tap the notes you want to hear, then see the best shapes near ${lastChordName} on the neck.`
          : 'Tap the notes you want to hear, then see the best playable guitar shapes that contain them.'}
      </p>

      <NotePicker selected={selected} onChange={setSelected} />

      <div className="reverse-finder__selection-row">
        <span className="reverse-finder__selection">
          {selectedNoteNames.length > 0 ? `Selected: ${selectedNoteNames.join(', ')}` : 'No notes selected yet'}
        </span>
        {selected.length > 0 && (
          <button type="button" className="reverse-finder__clear-btn" onClick={() => setSelected([])}>
            Clear
          </button>
        )}
      </div>

      {selected.length > STRING_COUNT && (
        <p className="reverse-finder__notice">
          A guitar only has 6 strings — pick {STRING_COUNT} notes or fewer so a shape can sound all of them.
        </p>
      )}

      {selected.length > 0 && selected.length <= STRING_COUNT && (
        <div className="reverse-finder__results">
          {results.length === 0 ? (
            <p className="reverse-finder__notice">
              No playable shape found for these notes within a 15-fret range.
            </p>
          ) : (
            results.map((result, i) => {
              // Detected per-result, not once for the whole picked set --
              // this specific shape's actual sounding notes (doublings/an
              // extra tone) can genuinely differ from another ranked
              // shape's, so they can legitimately deserve different names.
              const detected = detectChordName(result.frets)
              return (
                <div className="reverse-finder__result" key={result.frets.join('-')}>
                  <div className="reverse-finder__result-label">{RESULT_LABELS[i] || `#${i + 1}`}</div>
                  <div className={`reverse-finder__result-name ${detected.isDetected ? '' : 'reverse-finder__result-name--fallback'}`}>
                    {detected.name}
                  </div>
                  {detected.isDetected && detected.alternates.length > 0 && (
                    <div className="reverse-finder__result-alt">also: {detected.alternates.join(', ')}</div>
                  )}
                  <GuitarDisplay shape={{ frets: result.frets }} notes={selectedNoteNames} compact />
                  <div className="reverse-finder__result-stats">{statsLine(result)}</div>
                  <button
                    type="button"
                    className="reverse-finder__add-btn"
                    onClick={() => onAddToProgression?.(detected.name, soundingNotes(result.frets))}
                    aria-label={`Add ${detected.name} to progression`}
                  >
                    + Add to progression
                  </button>
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
