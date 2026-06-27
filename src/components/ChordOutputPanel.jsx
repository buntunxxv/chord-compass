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

export default function ChordOutputPanel({ chordName, notes, intervals, available }) {
  if (!available) {
    return (
      <div className="chord-output chord-output--unavailable">
        <p className="chord-output__unavailable-msg">Chord not available in Stage 1</p>
      </div>
    )
  }

  const noteNames = notes
    .map(n => n.replace(/\d+$/, '').replace('b', '♭').replace('#', '♯'))
    .filter((n, i, arr) => arr.indexOf(n) === i)

  return (
    <div className="chord-output">
      <div className="chord-output__name">{chordName}</div>
      <div className="chord-output__row">
        <span className="chord-output__row-label">Notes</span>
        <span className="chord-output__row-value">
          {noteNames.join(' · ')}
        </span>
      </div>
      {intervals && intervals.length > 0 && (
        <div className="chord-output__row">
          <span className="chord-output__row-label">Intervals</span>
          <span className="chord-output__row-value">
            {intervals.map(formatInterval).join(' · ')}
          </span>
        </div>
      )}
    </div>
  )
}
