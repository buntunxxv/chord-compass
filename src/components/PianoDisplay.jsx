import { useState, useRef, useCallback, useEffect } from 'react'
import * as Tone from 'tone'
import { createKeysSynth } from '../audio/synth'
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
      spelling: findSpelling(note, notes),
    }
  }
  if (inPreview) {
    return { fill: SUGGEST_FILL, active: true, shared: false, textFill: '#ffffff', spelling: findSpelling(note, previewNotes) }
  }
  return { fill: defaultFill, active: false, shared: false, textFill: '#aaaaaa', spelling: null }
}

export default function PianoDisplay({ chordNotes, previewNotes }) {
  const notes = chordNotes || []
  // The first note in a chord's data is always its root (by convention)
  const root = notes.length > 0 ? notes[0] : null
  const hasPreview = !!(previewNotes && previewNotes.length > 0)

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
    await Tone.start()
    if (!synthRef.current) {
      synthRef.current = createKeysSynth()
    }
    if (timerRef.current) clearTimeout(timerRef.current)
    setPressedNote(note)
    synthRef.current.triggerAttackRelease(note, '8n')
    timerRef.current = setTimeout(() => setPressedNote(null), 150)
  }, [])

  return (
    <div className="piano-display" id="wt-piano">
      <h2 className="piano-display__title">On the Keys</h2>
      <svg
        viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
        xmlns="http://www.w3.org/2000/svg"
        className="piano-display__svg"
        role="group"
        aria-label="Piano keyboard showing chord tones across two octaves"
      >
        {/* White keys */}
        {WHITE_KEYS.map((note, i) => {
          const x = i * WHITE_KEY_WIDTH
          const style = resolveKeyStyle(note, notes, root, previewNotes, '#ffffff')
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
          const style = resolveKeyStyle(note, notes, root, previewNotes, '#1a1a1a')
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
