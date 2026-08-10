import { useState, useRef, useCallback, useEffect } from 'react'
import { createKeysSynth, startAudioContext } from '../audio/synth'
import { getNoteColors } from '../utils/noteColors'
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

// Find how a note is actually spelled (flat or sharp) within a chord's note
// list, e.g. for keyNote "D#4" this returns "E♭" if the chord spells it that
// way, so the piano matches how the chord is actually written, not a fixed
// sharp-only convention
function findSpelling(keyNote, chordNotes) {
  const normalizedKey = normalizeNote(keyNote)
  const match = chordNotes.find(n => normalizeNote(n) === normalizedKey)
  if (!match) return null
  return match.replace(/\d+$/, '').replace('#', '♯').replace('b', '♭')
}

// Work out fill + whether the key gets a "shared" ring for a single key.
// The four highlight colors (root gold, chord-tone teal, suggested purple,
// split-bass rose) all come from noteColors -- see src/utils/noteColors.js
// and index.css's --note-color-* custom properties, the single source of
// truth both this component and GuitarDisplay read from.
function resolveKeyStyle(note, notes, root, previewNotes, defaultFill, bassHighlightNote, noteColors) {
  const inCurrent = noteMatches(note, notes)
  const inPreview = previewNotes && previewNotes.length > 0 && noteMatches(note, previewNotes)
  const isCurrentRoot = isRoot(note, root)
  const isBassSplit = !!bassHighlightNote && isRoot(note, bassHighlightNote)

  if (inCurrent) {
    return {
      fill: isBassSplit ? noteColors.splitBass : isCurrentRoot ? noteColors.root : noteColors.chordTone,
      active: true,
      shared: inPreview,
      textFill: isBassSplit ? '#ffffff' : isCurrentRoot ? '#7a5500' : '#ffffff',
      spelling: findSpelling(note, notes),
    }
  }
  if (inPreview) {
    return { fill: noteColors.suggested, active: true, shared: false, textFill: '#ffffff', spelling: findSpelling(note, previewNotes) }
  }
  return { fill: defaultFill, active: false, shared: false, textFill: '#aaaaaa', spelling: null }
}

export default function PianoDisplay({ chordNotes, previewNotes, bassHighlightNote, rootNote, compact }) {
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

  return (
    <div className={`piano-display ${compact ? 'piano-display--compact' : ''}`} id="wt-piano">
      {!compact && <h2 className="piano-display__title">On the Keys</h2>}
      {/* Real 44px keys are wider than most phone screens for a full
          octave-plus keyboard -- that's the accepted tradeoff for a genuine
          44px touch target (see WHITE_KEY_WIDTH above), so the keyboard
          scrolls horizontally inside its own container rather than the SVG
          shrinking itself back down to fit. */}
      <div className="piano-display__keys-scroll">
        <svg
          viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
          width={SVG_WIDTH}
          height={SVG_HEIGHT}
          xmlns="http://www.w3.org/2000/svg"
          className="piano-display__svg"
          role="group"
          aria-label="Piano keyboard showing chord tones across two octaves"
        >
        {/* White keys */}
        {WHITE_KEYS.map((note, i) => {
          const x = i * WHITE_KEY_WIDTH
          const style = resolveKeyStyle(note, notes, root, previewNotes, '#ffffff', bassHighlightNote, noteColors)
          const isPressed = pressedNote === note

          return (
            <g
              key={note}
              onClick={() => playNote(note)}
              style={{ cursor: 'pointer' }}
              role="button"
              aria-label={`Play ${note}`}
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') playNote(note) }}
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
              {style.shared && (
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
              <text
                x={x + WHITE_KEY_WIDTH / 2}
                y={WHITE_KEY_HEIGHT - 14}
                textAnchor="middle"
                fontSize={note[0] === 'C' ? 9.5 : 11}
                fontWeight={style.active ? '600' : '500'}
                fontFamily="Inter, sans-serif"
                fill={style.textFill}
                style={{ pointerEvents: 'none' }}
              >
                {whiteKeyLabel(note)}
              </text>
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
              onClick={() => playNote(note)}
              style={{ cursor: 'pointer' }}
              role="button"
              aria-label={`Play ${note}`}
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') playNote(note) }}
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
              {style.shared && (
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
              {style.active && (
                <text
                  x={x + BLACK_KEY_WIDTH / 2}
                  y={BLACK_KEY_HEIGHT - 10}
                  textAnchor="middle"
                  fontSize={8}
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
