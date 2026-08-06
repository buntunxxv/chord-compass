import './GuitarDisplay.css'

// Standard tuning, low string to high: E A D G B e
const STRING_COUNT = 6
const OPEN_PITCH_CLASS = [4, 9, 2, 7, 11, 4]
const ROOT_PITCH_CLASS = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }
const STRING_LABELS = ['E', 'A', 'D', 'G', 'B', 'e']

const WINDOW_SIZE = 5
const STRING_SPACING = 40
const FRET_HEIGHT = 34
const MARKER_AREA = 26
const DOT_RADIUS = 10
const TOP_PAD = 10
const SIDE_PAD = 36
const BOTTOM_PAD = 22

const GRID_WIDTH = STRING_SPACING * (STRING_COUNT - 1)
const SVG_WIDTH = GRID_WIDTH + SIDE_PAD * 2
const SVG_HEIGHT = TOP_PAD + MARKER_AREA + FRET_HEIGHT * WINDOW_SIZE + BOTTOM_PAD

function stringX(i) {
  return SIDE_PAD + i * STRING_SPACING
}

function fretRowY(row) {
  // row 0 = the nut/top line, row 1..WINDOW_SIZE = fret lines below it
  return TOP_PAD + MARKER_AREA + row * FRET_HEIGHT
}

const PITCH_CLASS_BY_LETTER = { C: 0, 'C#': 1, Db: 1, D: 2, 'D#': 3, Eb: 3, E: 4, F: 5, 'F#': 6, Gb: 6, G: 7, 'G#': 8, Ab: 8, A: 9, 'A#': 10, Bb: 10, B: 11 }
const FALLBACK_SHARP_NAMES = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B']

// Match the piano's approach: label a pitch class using whichever spelling
// (sharp or flat) the chord's own notes array actually uses, rather than a
// fixed sharp-only convention
function findSpelling(pitchClass, notes) {
  for (const note of notes || []) {
    const m = note.match(/^([A-G][#b]?)/)
    if (!m) continue
    if (PITCH_CLASS_BY_LETTER[m[1]] === pitchClass) {
      return m[1].replace('#', '♯').replace('b', '♭')
    }
  }
  return FALLBACK_SHARP_NAMES[pitchClass]
}

export default function GuitarDisplay({ root, shape, notes, compact }) {
  if (!shape) return null

  const rootPc = ROOT_PITCH_CLASS[root]
  const frets = shape.frets

  const numericFrets = frets.filter(f => f !== 'x').map(Number)
  const maxFret = Math.max(...numericFrets, 0)
  const positiveFrets = numericFrets.filter(f => f > 0)
  const minPositiveFret = positiveFrets.length ? Math.min(...positiveFrets) : 1
  const baseFret = maxFret <= WINDOW_SIZE ? 1 : minPositiveFret

  return (
    <div className={`guitar-display ${compact ? 'guitar-display--compact' : ''}`} id="wt-guitar">
      {!compact && <h2 className="guitar-display__title">On the Fretboard</h2>}
      <svg
        viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
        xmlns="http://www.w3.org/2000/svg"
        className="guitar-display__svg"
        role="img"
        aria-label={`Guitar chord diagram${root ? `, root ${root}` : ''}${baseFret > 1 ? `, starting at fret ${baseFret}` : ''}`}
      >
        {/* Fretboard body stays a fixed light tone regardless of app theme,
            same as the piano's white/black keys, so the grid lines always
            have contrast to sit on */}
        <rect
          x={stringX(0)}
          y={fretRowY(0)}
          width={GRID_WIDTH}
          height={FRET_HEIGHT * WINDOW_SIZE}
          fill="#faf7f2"
        />

        {/* Nut or fret-position label */}
        {baseFret === 1 ? (
          <rect
            x={stringX(0)}
            y={fretRowY(0)}
            width={GRID_WIDTH}
            height={4}
            fill="#1a1a1a"
          />
        ) : (
          <>
            <rect
              x={stringX(0)}
              y={fretRowY(0)}
              width={GRID_WIDTH}
              height={1.5}
              fill="#c8c8c8"
            />
            <text
              x={stringX(0) - 10}
              y={fretRowY(1) + FRET_HEIGHT / 2}
              textAnchor="end"
              dominantBaseline="middle"
              fontSize={11}
              fontFamily="Inter, sans-serif"
              fill="#888"
            >
              {baseFret}fr
            </text>
          </>
        )}

        {/* Fret lines */}
        {Array.from({ length: WINDOW_SIZE }, (_, i) => i + 1).map(row => (
          <rect
            key={row}
            x={stringX(0)}
            y={fretRowY(row)}
            width={GRID_WIDTH}
            height={1.5}
            fill="#c8c8c8"
          />
        ))}

        {/* Strings */}
        {STRING_LABELS.map((_, i) => (
          <rect
            key={i}
            x={stringX(i) - 0.75}
            y={fretRowY(0)}
            width={1.5}
            height={FRET_HEIGHT * WINDOW_SIZE}
            fill="#c8c8c8"
          />
        ))}

        {/* Barre */}
        {shape.barre && (
          <rect
            x={stringX(shape.barre.from) - DOT_RADIUS}
            y={fretRowY(shape.barre.fret - baseFret + 1) - FRET_HEIGHT / 2 - DOT_RADIUS}
            width={stringX(shape.barre.to) - stringX(shape.barre.from) + DOT_RADIUS * 2}
            height={DOT_RADIUS * 2}
            rx={DOT_RADIUS}
            fill="rgba(17,147,146,0.35)"
          />
        )}

        {/* Open / muted markers above the nut */}
        {frets.map((f, i) => {
          if (f === 'x') {
            return (
              <text
                key={i}
                x={stringX(i)}
                y={TOP_PAD + MARKER_AREA * 0.62}
                textAnchor="middle"
                fontSize={13}
                fontWeight="700"
                fontFamily="Inter, sans-serif"
                fill="#999"
              >
                ✕
              </text>
            )
          }
          if (f === 0) {
            const pitchClass = OPEN_PITCH_CLASS[i]
            const isRoot = rootPc !== undefined && pitchClass === rootPc
            const color = isRoot ? '#F5B82E' : '#119392'
            return (
              <g key={i}>
                <circle
                  cx={stringX(i)}
                  cy={TOP_PAD + MARKER_AREA * 0.5}
                  r={8}
                  fill="none"
                  stroke={color}
                  strokeWidth={2}
                />
                <text
                  x={stringX(i)}
                  y={TOP_PAD + MARKER_AREA * 0.5}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={7.5}
                  fontWeight="700"
                  fontFamily="Inter, sans-serif"
                  fill={color}
                >
                  {findSpelling(pitchClass, notes)}
                </text>
              </g>
            )
          }
          return null
        })}

        {/* Fretted note dots */}
        {frets.map((f, i) => {
          if (f === 'x' || f === 0) return null
          const row = f - baseFret + 1
          const pitchClass = (OPEN_PITCH_CLASS[i] + f) % 12
          const isRoot = pitchClass === rootPc
          return (
            <g key={i}>
              <circle
                cx={stringX(i)}
                cy={fretRowY(row) - FRET_HEIGHT / 2}
                r={DOT_RADIUS}
                fill={isRoot ? '#F5B82E' : '#119392'}
                stroke="#fff"
                strokeWidth={1.5}
              />
              <text
                x={stringX(i)}
                y={fretRowY(row) - FRET_HEIGHT / 2}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={9}
                fontWeight="700"
                fontFamily="Inter, sans-serif"
                fill={isRoot ? '#7a5500' : '#ffffff'}
              >
                {findSpelling(pitchClass, notes)}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
