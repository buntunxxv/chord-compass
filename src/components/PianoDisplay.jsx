import './PianoDisplay.css'

// Layout for one octave C4–B4
// White keys: C D E F G A B (7 keys)
// Black keys: C# D# F# G# A# (5 keys)

const WHITE_KEYS = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4']
const WHITE_KEY_LABELS = ['C', 'D', 'E', 'F', 'G', 'A', 'B']

// black key position: index in white keys array (left edge as fraction of white key width)
// C#=between C(0) and D(1), D#=between D(1) and E(2), F#=between F(3) and G(4), G#=between G(4) and A(5), A#=between A(5) and B(6)
const BLACK_KEYS = [
  { note: 'C#4', display: 'C♯', whiteIndex: 0 },
  { note: 'D#4', display: 'D♯', whiteIndex: 1 },
  { note: 'F#4', display: 'F♯', whiteIndex: 3 },
  { note: 'G#4', display: 'G♯', whiteIndex: 4 },
  { note: 'A#4', display: 'A♯', whiteIndex: 5 },
]

const WHITE_KEY_WIDTH = 52
const WHITE_KEY_HEIGHT = 160
const BLACK_KEY_WIDTH = 32
const BLACK_KEY_HEIGHT = 100
const SVG_WIDTH = WHITE_KEY_WIDTH * 7
const SVG_HEIGHT = WHITE_KEY_HEIGHT + 24

// Resolve enharmonic equivalents to sharp form for comparison
const ENHARMONIC = { 'Cb': 'B', 'Db': 'C#', 'Eb': 'D#', 'Fb': 'E', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#' }

function normalizeNote(note) {
  const pitch = note.replace(/\d+$/, '').replace('♯', '#').replace('♭', 'b')
  return ENHARMONIC[pitch] ?? pitch
}

function noteMatches(keyNote, chordNotes) {
  const keyPitch = normalizeNote(keyNote)
  return chordNotes.some(n => normalizeNote(n) === keyPitch)
}

function isRoot(keyNote, rootNote) {
  return normalizeNote(keyNote) === normalizeNote(rootNote)
}

export default function PianoDisplay({ chordNotes, rootNote }) {
  const notes = chordNotes || []
  const root = rootNote || ''

  return (
    <div className="piano-display">
      <svg
        viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
        xmlns="http://www.w3.org/2000/svg"
        className="piano-display__svg"
        role="img"
        aria-label="Piano keyboard showing chord tones"
      >
        {/* White keys */}
        {WHITE_KEYS.map((note, i) => {
          const x = i * WHITE_KEY_WIDTH
          const active = noteMatches(note, notes)
          const isRootKey = isRoot(note, root)
          let fill = '#ffffff'
          if (isRootKey && active) fill = '#F5B82E'
          else if (active) fill = '#119392'

          return (
            <g key={note}>
              <rect
                x={x + 1}
                y={0}
                width={WHITE_KEY_WIDTH - 2}
                height={WHITE_KEY_HEIGHT}
                rx={4}
                fill={fill}
                stroke="#c8c8c8"
                strokeWidth={1.5}
              />
              {active && (
                <text
                  x={x + WHITE_KEY_WIDTH / 2}
                  y={WHITE_KEY_HEIGHT - 14}
                  textAnchor="middle"
                  fontSize={11}
                  fontWeight="600"
                  fontFamily="Inter, sans-serif"
                  fill={isRootKey ? '#7a5500' : '#ffffff'}
                >
                  {WHITE_KEY_LABELS[i]}
                </text>
              )}
              {!active && (
                <text
                  x={x + WHITE_KEY_WIDTH / 2}
                  y={WHITE_KEY_HEIGHT - 14}
                  textAnchor="middle"
                  fontSize={11}
                  fontWeight="500"
                  fontFamily="Inter, sans-serif"
                  fill="#aaaaaa"
                >
                  {WHITE_KEY_LABELS[i]}
                </text>
              )}
            </g>
          )
        })}

        {/* Black keys — rendered on top */}
        {BLACK_KEYS.map(({ note, display, whiteIndex }) => {
          const x = whiteIndex * WHITE_KEY_WIDTH + WHITE_KEY_WIDTH - BLACK_KEY_WIDTH / 2 - 1
          const active = noteMatches(note, notes)
          const isRootKey = isRoot(note, root)
          let fill = '#1a1a1a'
          if (isRootKey && active) fill = '#F5B82E'
          else if (active) fill = '#119392'

          return (
            <g key={note}>
              <rect
                x={x}
                y={0}
                width={BLACK_KEY_WIDTH}
                height={BLACK_KEY_HEIGHT}
                rx={3}
                fill={fill}
                stroke="#000"
                strokeWidth={1}
              />
              {active && (
                <text
                  x={x + BLACK_KEY_WIDTH / 2}
                  y={BLACK_KEY_HEIGHT - 10}
                  textAnchor="middle"
                  fontSize={9}
                  fontWeight="600"
                  fontFamily="Inter, sans-serif"
                  fill={isRootKey ? '#7a5500' : '#ffffff'}
                >
                  {display}
                </text>
              )}
            </g>
          )
        })}

        {/* Octave label */}
        <text
          x={SVG_WIDTH - 6}
          y={SVG_HEIGHT - 4}
          textAnchor="end"
          fontSize={10}
          fill="#aaaaaa"
          fontFamily="Inter, sans-serif"
        >
          C4 – B4
        </text>
      </svg>
    </div>
  )
}
