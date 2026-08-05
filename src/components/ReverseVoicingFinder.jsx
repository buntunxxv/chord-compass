import { useMemo, useState } from 'react'
import GuitarDisplay from './GuitarDisplay'
import NotePicker from './NotePicker'
import { findVoicings, PITCH_CLASS_NAMES } from '../utils/reverseVoicingLookup'
import './ReverseVoicingFinder.css'

const STRING_COUNT = 6
const RESULT_LABELS = ['Best match', '2nd best', '3rd best']

function statsLine({ muted, span, avgFret }) {
  const mutedText = muted === 0 ? 'no muted strings' : `${muted} muted string${muted === 1 ? '' : 's'}`
  const spanText = `${span} fret${span === 1 ? '' : 's'} span`
  return `${mutedText} · ${spanText} · avg fret ${avgFret.toFixed(1)}`
}

// Phase 1: ease/playability-only ranking, no voice-leading context and no
// MIDI import (Phase 2/3). Free for every user for now -- there's no
// Pro gate here yet, same way the rest of this app gates a feature only
// once it actually needs to (this one has no reason to yet).
export default function ReverseVoicingFinder() {
  const [selected, setSelected] = useState([])

  const results = useMemo(() => {
    if (selected.length === 0 || selected.length > STRING_COUNT) return []
    return findVoicings(selected, { maxResults: 3 })
  }, [selected])

  const selectedNoteNames = selected
    .slice()
    .sort((a, b) => a - b)
    .map(pc => PITCH_CLASS_NAMES[pc])

  return (
    <div className="reverse-finder">
      <h2 className="reverse-finder__title">Find Shapes by Notes</h2>
      <p className="reverse-finder__hint">
        Tap the notes you want to hear, then see the best playable guitar shapes that contain them.
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
            results.map((result, i) => (
              <div className="reverse-finder__result" key={result.frets.join('-')}>
                <div className="reverse-finder__result-label">{RESULT_LABELS[i] || `#${i + 1}`}</div>
                <GuitarDisplay shape={{ frets: result.frets }} notes={selectedNoteNames} compact />
                <div className="reverse-finder__result-stats">{statsLine(result)}</div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
