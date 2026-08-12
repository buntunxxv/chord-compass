import { useState, useRef, useCallback, useEffect } from 'react'
import { createKeysSynth, startAudioContext } from '../audio/synth'
import { getNoteColors } from '../utils/noteColors'
import { resolveKeyStyle } from '../utils/pianoKeyStyle'
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
// no fixed display spelling here — a black key can be a chord's sharp or its
// flat depending on the chord (e.g. C minor's E♭ vs B major's D♯), so the
// label is derived per-render from whichever note actually lit it up
const BLACK_KEYS = [
  { note: 'C#3', whiteIndex: 0 },
  { note: 'D#3', whiteIndex: 1 },
  { note: 'F#3', whiteIndex: 3 },
  { note: 'G#3', whiteIndex: 4 },
  { note: 'A#3', whiteIndex: 5 },
  { note: 'C#4', whiteIndex: 7 },
  { note: 'D#4', whiteIndex: 8 },
  { note: 'F#4', whiteIndex: 10 },
  { note: 'G#4', whiteIndex: 11 },
  { note: 'A#4', whiteIndex: 12 },
  { note: 'C#5', whiteIndex: 14 },
]

// White keys render at their true intrinsic size (see the svg's explicit
// width/height attributes below, and piano-display__svg's CSS -- no
// container-relative scaling), so these viewBox units map 1:1 to real CSS
// px. 46 gives a genuine 44px-wide tappable rect once the 1px visual gap on
// each side is subtracted out (see the white-key rect's `x={x+1}` / `width=
// {WHITE_KEY_WIDTH - 2}` below) -- a real 44x44 minimum touch target, not
// just a scaled-up appearance. Black keys grow deliberately past their old
// visual ratio to 32px (not just proportionally with the white-key bump) so
// they stay comfortably tappable as a secondary target, while remaining
// visibly narrower than a white key per standard piano key convention.
const WHITE_KEY_WIDTH = 46
const WHITE_KEY_HEIGHT = 160
const BLACK_KEY_WIDTH = 32
const BLACK_KEY_HEIGHT = 100
const SVG_WIDTH = WHITE_KEY_WIDTH * WHITE_KEYS.length
const SVG_HEIGHT = WHITE_KEY_HEIGHT + 24

// The collapsed bottom bar's mini-keyboard strip: same C3-D5 range and same
// note-matching/color logic as the full keyboard above (so nothing gets
// clipped for wide multi-octave voicings -- see Session 30's extended/
// altered chords), just drawn at a fraction of the size. Scaling the SVG's
// own width/height down while keeping its viewBox unchanged is what does
// that -- every rect, stroke and radius shrinks proportionally with it, so
// this is a real scale-down, not a crop. A collapsed bar has more spare
// horizontal room than vertical, so trading width for a short, fixed height
// is the right tradeoff there.
const MINIATURE_HEIGHT = 34
const MINIATURE_WIDTH = Math.round((SVG_WIDTH / SVG_HEIGHT) * MINIATURE_HEIGHT)

// A "C" key also shows its octave number so students can read the anchor points
function whiteKeyLabel(note) {
  return note[0] === 'C' ? note : note[0]
}

export default function PianoDisplay({ chordNotes, previewNotes, bassHighlightNote, rootNote, compact, miniature }) {
  const notes = chordNotes || []
  // The first note in a chord's data is always its root, by convention --
  // but Drop-2 deliberately re-sorts by pitch height, so whichever note
  // ends up at notes[0] after that isn't reliably the actual root anymore
  // (it's just whatever's lowest). Callers that apply a voicing transform
  // pass the true root/bass explicitly via rootNote; anything that doesn't
  // (e.g. progression playback, whose notes are never reordered) falls
  // back to the original notes[0] convention unchanged.
  const root = rootNote ?? (notes.length > 0 ? notes[0] : null)
  const noteColors = getNoteColors()

  const synthRef = useRef(null)
  const timerRef = useRef(null)
  const [pressedNote, setPressedNote] = useState(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      if (synthRef.current) synthRef.current.dispose()
    }
  }, [])

  const playNote = useCallback(async (note) => {
    await startAudioContext()
    if (!synthRef.current) {
      synthRef.current = createKeysSynth()
    }
    if (timerRef.current) clearTimeout(timerRef.current)
    setPressedNote(note)
    synthRef.current.triggerAttackRelease(note, '8n')
    timerRef.current = setTimeout(() => setPressedNote(null), 150)
  }, [])

  // The mini strip in the collapsed bottom bar: purely a decorative echo of
  // whatever's lit up on the real keyboard, so it gets none of the tap
  // targets/labels/legend below -- see MINIATURE_HEIGHT/MINIATURE_WIDTH
  // above for how it still covers the same C3-D5 range without clipping.
  const keySvg = (
    <svg
      viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
      width={miniature ? MINIATURE_WIDTH : SVG_WIDTH}
      height={miniature ? MINIATURE_HEIGHT : SVG_HEIGHT}
      xmlns="http://www.w3.org/2000/svg"
      className={`piano-display__svg ${miniature ? 'piano-display__svg--miniature' : ''}`}
      {...(miniature
        ? { 'aria-hidden': true, focusable: false }
        : { role: 'group', 'aria-label': 'Piano keyboard showing chord tones across two octaves' })}
    >
      {/* White keys */}
      {WHITE_KEYS.map((note, i) => {
        const x = i * WHITE_KEY_WIDTH
        const style = resolveKeyStyle(note, notes, root, previewNotes, '#ffffff', bassHighlightNote, noteColors)
        const isPressed = pressedNote === note

        return (
          <g
            key={note}
            {...(miniature
              ? {}
              : {
                  onClick: () => playNote(note),
                  style: { cursor: 'pointer' },
                  role: 'button',
                  'aria-label': `Play ${note}`,
                  tabIndex: 0,
                  onKeyDown: (e) => { if (e.key === 'Enter' || e.key === ' ') playNote(note) },
                })}
          >
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
            {isPressed && (
              <rect
                x={x + 1}
                y={0}
                width={WHITE_KEY_WIDTH - 2}
                height={WHITE_KEY_HEIGHT}
                rx={4}
                fill="rgba(17,147,146,0.18)"
                style={{ pointerEvents: 'none' }}
              />
            )}
            {style.shared && !miniature && (
              <rect
                x={x + 4}
                y={4}
                width={WHITE_KEY_WIDTH - 8}
                height={WHITE_KEY_HEIGHT - 8}
                rx={3}
                fill="none"
                stroke={noteColors.suggested}
                strokeWidth={2.5}
                strokeDasharray="4 3"
              />
            )}
            {!miniature && (
              <text
                x={x + WHITE_KEY_WIDTH / 2}
                y={WHITE_KEY_HEIGHT - 14}
                textAnchor="middle"
                fontSize={note[0] === 'C' ? 13 : 14}
                fontWeight={style.active ? '600' : '500'}
                fontFamily="Inter, sans-serif"
                fill={style.textFill}
                style={{ pointerEvents: 'none' }}
              >
                {whiteKeyLabel(note)}
              </text>
            )}
          </g>
        )
      })}

      {/* Black keys — rendered on top */}
      {BLACK_KEYS.map(({ note, whiteIndex }) => {
        const x = whiteIndex * WHITE_KEY_WIDTH + WHITE_KEY_WIDTH - BLACK_KEY_WIDTH / 2 - 1
        const style = resolveKeyStyle(note, notes, root, previewNotes, '#1a1a1a', bassHighlightNote, noteColors)
        const isPressed = pressedNote === note

        return (
          <g
            key={note}
            {...(miniature
              ? {}
              : {
                  onClick: () => playNote(note),
                  style: { cursor: 'pointer' },
                  role: 'button',
                  'aria-label': `Play ${note}`,
                  tabIndex: 0,
                  onKeyDown: (e) => { if (e.key === 'Enter' || e.key === ' ') playNote(note) },
                })}
          >
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
            {isPressed && (
              <rect
                x={x}
                y={0}
                width={BLACK_KEY_WIDTH}
                height={BLACK_KEY_HEIGHT}
                rx={3}
                fill="rgba(255,255,255,0.25)"
                style={{ pointerEvents: 'none' }}
              />
            )}
            {style.shared && !miniature && (
              <rect
                x={x + 3}
                y={3}
                width={BLACK_KEY_WIDTH - 6}
                height={BLACK_KEY_HEIGHT - 6}
                rx={2}
                fill="none"
                stroke={noteColors.suggested}
                strokeWidth={2}
                strokeDasharray="3 2"
              />
            )}
            {style.active && !miniature && (
              <text
                x={x + BLACK_KEY_WIDTH / 2}
                y={BLACK_KEY_HEIGHT - 10}
                textAnchor="middle"
                fontSize={13}
                fontWeight="600"
                fontFamily="Inter, sans-serif"
                fill={style.textFill}
                style={{ pointerEvents: 'none' }}
              >
                {style.spelling}
              </text>
            )}
          </g>
        )
      })}

      {/* Octave label */}
      {!miniature && (
        <text
          x={SVG_WIDTH - 6}
          y={SVG_HEIGHT - 4}
          textAnchor="end"
          fontSize={13}
          fill="#aaaaaa"
          fontFamily="Inter, sans-serif"
        >
          C3 – D5
        </text>
      )}
    </svg>
  )

  if (miniature) {
    return <div className="piano-display piano-display--miniature" id="wt-piano">{keySvg}</div>
  }

  return (
    <div className={`piano-display ${compact ? 'piano-display--compact' : ''}`} id="wt-piano">
      {!compact && <h2 className="piano-display__title">On the Keys</h2>}
      {/* Real 44px keys are wider than most phone screens for a full
          octave-plus keyboard -- that's the accepted tradeoff for a genuine
          44px touch target (see WHITE_KEY_WIDTH above), so the keyboard
          scrolls horizontally inside its own container rather than the SVG
          shrinking itself back down to fit. */}
      <div className="piano-display__keys-scroll">
        {keySvg}
      </div>

      {/* Documents all four note-highlight colors -- shown wherever the
          piano itself is shown (not gated behind compact/preview state),
          since root and chord-tone highlighting is relevant to every chord
          the piano displays, not just while a suggestion preview is active. */}
      <div className="piano-display__legend">
        <span className="piano-display__legend-item">
          <span className="piano-display__legend-dot piano-display__legend-dot--root" /> Root
        </span>
        <span className="piano-display__legend-item">
          <span className="piano-display__legend-dot piano-display__legend-dot--chord-tone" /> Chord tone
        </span>
        <span className="piano-display__legend-item">
          <span className="piano-display__legend-dot piano-display__legend-dot--suggested" /> Suggested chord
        </span>
        <span className="piano-display__legend-item">
          <span className="piano-display__legend-dot piano-display__legend-dot--split-bass" /> Split bass
        </span>
      </div>
    </div>
  )
}
