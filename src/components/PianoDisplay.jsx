import './PianoDisplay.css'

// Two octaves, C3–D5, so a chord's notes render at their real pitch
// height instead of being wrapped into a single octave — wrapping made
// some voicings look like unexplained inversions. The extra D5 (beyond
// a clean two octaves) is needed so a 9th (e.g. Cadd9) can render as a
// true 9th — an octave above the root's 2nd — rather than collapsing
// into a 2nd within the same octave.
const WHITE_KEYS = [
  'C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3',
  'C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4',
  'C5', 'D5',
]

// black key position: index in the white-key array (sits to the right of that key)
const BLACK_KEYS = [
  { note: 'C#3', display: 'C♯', whiteIndex: 0 },
  { note: 'D#3', display: 'D♯', whiteIndex: 1 },
  { note: 'F#3', display: 'F♯', whiteIndex: 3 },
  { note: 'G#3', display: 'G♯', whiteIndex: 4 },
  { note: 'A#3', display: 'A♯', whiteIndex: 5 },
  { note: 'C#4', display: 'C♯', whiteIndex: 7 },
  { note: 'D#4', display: 'D♯', whiteIndex: 8 },
  { note: 'F#4', display: 'F♯', whiteIndex: 10 },
  { note: 'G#4', display: 'G♯', whiteIndex: 11 },
  { note: 'A#4', display: 'A♯', whiteIndex: 12 },
  { note: 'C#5', display: 'C♯', whiteIndex: 14 },
]

const WHITE_KEY_WIDTH = 42
const WHITE_KEY_HEIGHT = 160
const BLACK_KEY_WIDTH = 26
const BLACK_KEY_HEIGHT = 100
const SVG_WIDTH = WHITE_KEY_WIDTH * WHITE_KEYS.length
const SVG_HEIGHT = WHITE_KEY_HEIGHT + 24

// A "C" key also shows its octave number so students can read the anchor points
function whiteKeyLabel(note) {
  return note[0] === 'C' ? note : note[0]
}

// Resolve enharmonic equivalents to sharp form, keeping the octave correct
// (Cb sits in the octave below the C it borrows its number from)
const ENHARMONIC = { Cb: 'B', Db: 'C#', Eb: 'D#', Fb: 'E', Gb: 'F#', Ab: 'G#', Bb: 'A#' }
const ENHARMONIC_OCTAVE_SHIFT = { Cb: -1 }

function normalizeNote(note) {
  const m = note.replace('♯', '#').replace('♭', 'b').match(/^([A-G][#b]?)(\d)$/)
  if (!m) return note
  const [, pitch, octaveStr] = m
  const mappedPitch = ENHARMONIC[pitch] ?? pitch
  const octave = parseInt(octaveStr, 10) + (ENHARMONIC_OCTAVE_SHIFT[pitch] ?? 0)
  return `${mappedPitch}${octave}`
}

function noteMatches(keyNote, chordNotes) {
  const normalizedKey = normalizeNote(keyNote)
  return chordNotes.some(n => normalizeNote(n) === normalizedKey)
}

function isRoot(keyNote, rootNote) {
  return !!rootNote && normalizeNote(keyNote) === normalizeNote(rootNote)
}

const SUGGEST_FILL = '#8B5CF6'

// Work out fill + whether the key gets a "shared" ring for a single key
function resolveKeyStyle(note, notes, root, previewNotes, defaultFill) {
  const inCurrent = noteMatches(note, notes)
  const inPreview = previewNotes && previewNotes.length > 0 && noteMatches(note, previewNotes)
  const isCurrentRoot = isRoot(note, root)

  if (inCurrent) {
    return {
      fill: isCurrentRoot ? '#F5B82E' : '#119392',
      active: true,
      shared: inPreview,
      textFill: isCurrentRoot ? '#7a5500' : '#ffffff',
    }
  }
  if (inPreview) {
    return { fill: SUGGEST_FILL, active: true, shared: false, textFill: '#ffffff' }
  }
  return { fill: defaultFill, active: false, shared: false, textFill: '#aaaaaa' }
}

export default function PianoDisplay({ chordNotes, previewNotes }) {
  const notes = chordNotes || []
  // The first note in a chord's data is always its root (by convention)
  const root = notes.length > 0 ? notes[0] : null
  const hasPreview = !!(previewNotes && previewNotes.length > 0)

  return (
    <div className="piano-display">
      <svg
        viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
        xmlns="http://www.w3.org/2000/svg"
        className="piano-display__svg"
        role="img"
        aria-label="Piano keyboard showing chord tones across two octaves"
      >
        {/* White keys */}
        {WHITE_KEYS.map((note, i) => {
          const x = i * WHITE_KEY_WIDTH
          const style = resolveKeyStyle(note, notes, root, previewNotes, '#ffffff')

          return (
            <g key={note}>
              <rect
                x={x + 1}
                y={0}
                width={WHITE_KEY_WIDTH - 2}
                height={WHITE_KEY_HEIGHT}
                rx={4}
                fill={style.fill}
                stroke="#c8c8c8"
                strokeWidth={1.5}
              />
              {style.shared && (
                <rect
                  x={x + 4}
                  y={4}
                  width={WHITE_KEY_WIDTH - 8}
                  height={WHITE_KEY_HEIGHT - 8}
                  rx={3}
                  fill="none"
                  stroke={SUGGEST_FILL}
                  strokeWidth={2.5}
                  strokeDasharray="4 3"
                />
              )}
              <text
                x={x + WHITE_KEY_WIDTH / 2}
                y={WHITE_KEY_HEIGHT - 14}
                textAnchor="middle"
                fontSize={note[0] === 'C' ? 9.5 : 11}
                fontWeight={style.active ? '600' : '500'}
                fontFamily="Inter, sans-serif"
                fill={style.textFill}
              >
                {whiteKeyLabel(note)}
              </text>
            </g>
          )
        })}

        {/* Black keys — rendered on top */}
        {BLACK_KEYS.map(({ note, display, whiteIndex }) => {
          const x = whiteIndex * WHITE_KEY_WIDTH + WHITE_KEY_WIDTH - BLACK_KEY_WIDTH / 2 - 1
          const style = resolveKeyStyle(note, notes, root, previewNotes, '#1a1a1a')

          return (
            <g key={note}>
              <rect
                x={x}
                y={0}
                width={BLACK_KEY_WIDTH}
                height={BLACK_KEY_HEIGHT}
                rx={3}
                fill={style.fill}
                stroke="#000"
                strokeWidth={1}
              />
              {style.shared && (
                <rect
                  x={x + 3}
                  y={3}
                  width={BLACK_KEY_WIDTH - 6}
                  height={BLACK_KEY_HEIGHT - 6}
                  rx={2}
                  fill="none"
                  stroke={SUGGEST_FILL}
                  strokeWidth={2}
                  strokeDasharray="3 2"
                />
              )}
              {style.active && (
                <text
                  x={x + BLACK_KEY_WIDTH / 2}
                  y={BLACK_KEY_HEIGHT - 10}
                  textAnchor="middle"
                  fontSize={8}
                  fontWeight="600"
                  fontFamily="Inter, sans-serif"
                  fill={style.textFill}
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
          C3 – D5
        </text>
      </svg>

      {hasPreview && (
        <div className="piano-display__legend">
          <span className="piano-display__legend-item">
            <span className="piano-display__legend-dot piano-display__legend-dot--current" /> Current chord
          </span>
          <span className="piano-display__legend-item">
            <span className="piano-display__legend-dot piano-display__legend-dot--suggested" /> Suggested chord
          </span>
          <span className="piano-display__legend-item">
            <span className="piano-display__legend-dot piano-display__legend-dot--shared" /> Shared note
          </span>
        </div>
      )}
    </div>
  )
}
