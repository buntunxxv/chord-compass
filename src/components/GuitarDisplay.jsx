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

export default function GuitarDisplay({ root, shape }) {
  if (!shape) return null

  const rootPc = ROOT_PITCH_CLASS[root]
  const frets = shape.frets

  const numericFrets = frets.filter(f => f !== 'x').map(Number)
  const maxFret = Math.max(...numericFrets, 0)
  const positiveFrets = numericFrets.filter(f => f > 0)
  const minPositiveFret = positiveFrets.length ? Math.min(...positiveFrets) : 1
  const baseFret = maxFret <= WINDOW_SIZE ? 1 : minPositiveFret

  return (
    <div className="guitar-display">
      <h2 className="guitar-display__title">On the Fretboard</h2>
      <svg
        viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
        xmlns="http://www.w3.org/2000/svg"
        className="guitar-display__svg"
        role="img"
        aria-label={`Guitar chord diagram, root ${root}${baseFret > 1 ? `, starting at fret ${baseFret}` : ''}`}
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
            return (
              <circle
                key={i}
                cx={stringX(i)}
                cy={TOP_PAD + MARKER_AREA * 0.5}
                r={5.5}
                fill="none"
                stroke={rootPc !== undefined && OPEN_PITCH_CLASS[i] === rootPc ? '#F5B82E' : '#119392'}
                strokeWidth={2}
              />
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
            <circle
              key={i}
              cx={stringX(i)}
              cy={fretRowY(row) - FRET_HEIGHT / 2}
              r={DOT_RADIUS}
              fill={isRoot ? '#F5B82E' : '#119392'}
              stroke="#fff"
              strokeWidth={1.5}
            />
          )
        })}
      </svg>
    </div>
  )
}
