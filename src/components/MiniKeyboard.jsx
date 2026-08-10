import { getNoteColors } from '../utils/noteColors'
import { resolveKeyStyle } from '../utils/pianoKeyStyle'
import './MiniKeyboard.css'

const WHITE_KEY_WIDTH = 16
const WHITE_KEY_HEIGHT = 34
const BLACK_KEY_WIDTH = 10
const BLACK_KEY_HEIGHT = 21
const SVG_WIDTH = WHITE_KEY_WIDTH * 7
const SVG_HEIGHT = WHITE_KEY_HEIGHT

const WHITE_LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B']
// black key position: index in the white-key array (sits to the right of that key)
const BLACK_KEY_SLOTS = [
  { letter: 'C', whiteIndex: 0 },
  { letter: 'D', whiteIndex: 1 },
  { letter: 'F', whiteIndex: 3 },
  { letter: 'G', whiteIndex: 4 },
  { letter: 'A', whiteIndex: 5 },
]

// PianoDisplay's own matching (resolveKeyStyle/noteMatches) compares full
// note+octave, not just pitch class, so this single rendered octave only
// lights up notes that literally fall within it. To keep that octave as
// useful as possible without reimplementing note matching, the window
// follows the current chord's root -- since the root is always part of the
// chord, this guarantees at least the root itself (and typically most of
// the chord's other tones, which in this app's data cluster near the root's
// own octave) render lit, rather than a fixed octave that could easily miss
// the current chord entirely.
function rootOctave(rootNote) {
  const m = rootNote && rootNote.match(/(\d)$/)
  return m ? parseInt(m[1], 10) : 4
}

// Purely a visual echo of whatever's highlighted on the main keyboard --
// no tap targets, no legend of its own (the expanded keyboard already has
// one). Reuses resolveKeyStyle (src/utils/pianoKeyStyle.js) and
// getNoteColors (src/utils/noteColors.js), the exact same logic and colors
// PianoDisplay and GuitarDisplay use, so this can never show a different
// answer than the real keyboard for the same chord state.
export default function MiniKeyboard({ chordNotes, previewNotes, bassHighlightNote, rootNote }) {
  const notes = chordNotes || []
  const root = rootNote ?? (notes.length > 0 ? notes[0] : null)
  const noteColors = getNoteColors()
  const octave = rootOctave(root)

  const whiteKeys = WHITE_LETTERS.map(letter => `${letter}${octave}`)
  const blackKeys = BLACK_KEY_SLOTS.map(({ letter, whiteIndex }) => ({ note: `${letter}#${octave}`, whiteIndex }))

  return (
    <svg
      viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
      className="mini-keyboard"
      aria-hidden="true"
      focusable="false"
    >
      {whiteKeys.map((note, i) => {
        const x = i * WHITE_KEY_WIDTH
        const style = resolveKeyStyle(note, notes, root, previewNotes, '#ffffff', bassHighlightNote, noteColors)
        return (
          <rect
            key={note}
            x={x + 0.5}
            y={0}
            width={WHITE_KEY_WIDTH - 1}
            height={WHITE_KEY_HEIGHT}
            fill={style.fill}
            stroke="#c8c8c8"
            strokeWidth={0.5}
          />
        )
      })}
      {blackKeys.map(({ note, whiteIndex }) => {
        const x = whiteIndex * WHITE_KEY_WIDTH + WHITE_KEY_WIDTH - BLACK_KEY_WIDTH / 2
        const style = resolveKeyStyle(note, notes, root, previewNotes, '#1a1a1a', bassHighlightNote, noteColors)
        return (
          <rect
            key={note}
            x={x}
            y={0}
            width={BLACK_KEY_WIDTH}
            height={BLACK_KEY_HEIGHT}
            fill={style.fill}
          />
        )
      })}
    </svg>
  )
}
