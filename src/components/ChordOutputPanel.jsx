import { formatNoteNames } from '../utils/formatNotes'
import './ChordOutputPanel.css'

const INTERVAL_NAMES = {
  '1P': 'Root',
  '3M': '3',
  '3m': '♭3',
  '5P': '5',
  '5d': '♭5',
  '5A': '♯5',
  '7m': '♭7',
  '7M': '7',
  '9M': '9',
  '4P': '4',
  '2M': '2',
}

function formatInterval(interval) {
  return INTERVAL_NAMES[interval] || interval
}

export default function ChordOutputPanel({ chordName, notes, intervals, available, onAddToProgression }) {
  if (!available) {
    return (
      <div className="chord-output chord-output--unavailable">
        <p className="chord-output__unavailable-msg">Chord not available in Stage 1</p>
      </div>
    )
  }

  const noteNames = formatNoteNames(notes)

  return (
    <div className="chord-output">
      <div className="chord-output__top">
        <div className="chord-output__name">{chordName}</div>
        <button
          className="chord-output__add-btn"
          onClick={() => onAddToProgression(chordName, notes)}
          aria-label={`Add ${chordName} to progression`}
        >
          + Add current chord
        </button>
      </div>
      <div className="chord-output__row">
        <span className="chord-output__row-label">Notes</span>
        <span className="chord-output__row-value">
          {noteNames.join(' · ')}
        </span>
      </div>
      {intervals && intervals.length > 0 && (
        <div className="chord-output__row">
          <span className="chord-output__row-label" title="The distance between each note — Root is the tonic, 3 is the third, 5 is the fifth">Intervals</span>
          <span className="chord-output__row-value">
            {intervals.map(formatInterval).join(' · ')}
          </span>
        </div>
      )}
    </div>
  )
}
