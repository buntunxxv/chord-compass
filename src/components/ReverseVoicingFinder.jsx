import { useEffect, useMemo, useState } from 'react'
import { Chord } from 'tonal'
import GuitarDisplay from './GuitarDisplay'
import NotePicker from './NotePicker'
import MidiImportPanel from './MidiImportPanel'
import { findVoicings, soundingNotes, detectChordName, PITCH_CLASS_NAMES } from '../utils/reverseVoicingLookup'
import { formatChordName } from '../utils/formatChordName'
import './ReverseVoicingFinder.css'

const STRING_COUNT = 6
const RESULT_LABELS = ['Best match', '2nd best', '3rd best']

function statsLine(result) {
  const mutedText = result.muted === 0 ? 'no muted strings' : `${result.muted} muted string${result.muted === 1 ? '' : 's'}`
  const spanText = `${result.span} fret${result.span === 1 ? '' : 's'} span`
  const ease = `${mutedText} · ${spanText} · avg fret ${result.avgFret.toFixed(1)}`
  if (result.distance == null) return ease
  return `${result.distance} fret${result.distance === 1 ? '' : 's'} from last chord · ${ease}`
}

// Phase 1: ease/playability-only ranking, no MIDI import (Phase 3). Free
// for every user for now -- there's no Pro gate here yet, same way the
// rest of this app gates a feature only once it actually needs to (this
// one has no reason to yet).
//
// Phase 2: once the progression already has a chord in it, proximity to
// that last chord's own currently-displayed guitar shape REPLACES ease as
// the ranking (not blended with it) -- see reverseVoicingLookup.js's
// findVoicings for why. referenceGuitarShape is resolved by App.jsx
// (which already owns the lookup logic for every chord's guitar shape);
// this component only needs progression for the "closest to X" hint text.
// MIDI import (alongside the note picker) is Pro-gated -- unlike Phase 1's
// note-picker matching itself, which stays free (see the comment above).
// `isPro`/`onImportSequence` are new; both are threaded straight through
// from App.jsx (isPro is the same tier flag every other Pro-gated control
// in this app already reads, onImportSequence is addProgressionSequence,
// the bulk sibling of onAddToProgression -- see its own comment in App.jsx
// for why a range import needs a dedicated bulk function rather than
// calling onAddToProgression once per chord in a loop).
export default function ReverseVoicingFinder({ onAddToProgression, onImportSequence, progression, referenceGuitarShape, isPro }) {
  const [selected, setSelected] = useState([])
  const [inputMode, setInputMode] = useState('notes') // 'notes' | 'midi'

  // Defense-in-depth, same pattern InstrumentDock uses for its own tabs:
  // even if inputMode somehow held 'midi' while isPro was/became false,
  // this snaps back to the note picker rather than leaving the locked
  // panel showing.
  useEffect(() => {
    if (!isPro && inputMode === 'midi') setInputMode('notes')
  }, [isPro, inputMode])

  const results = useMemo(() => {
    if (selected.length === 0 || selected.length > STRING_COUNT) return []
    return findVoicings(selected, { maxResults: 3, referenceShape: referenceGuitarShape?.frets ?? null })
  }, [selected, referenceGuitarShape])

  const selectedNoteNames = selected
    .slice()
    .sort((a, b) => a - b)
    .map(pc => PITCH_CLASS_NAMES[pc])

  const lastChordName = progression && progression.length > 0 ? progression[progression.length - 1].chord : null

  return (
    <div className="reverse-finder">
      <h2 className="reverse-finder__title">Find Shapes by Notes</h2>
      <p className="reverse-finder__hint">
        {referenceGuitarShape
          ? `Tap the notes you want to hear, then see the best shapes near ${lastChordName} on the neck.`
          : 'Tap the notes you want to hear, then see the best playable guitar shapes that contain them.'}
      </p>

      <div className="reverse-finder__input-tabs" role="tablist" aria-label="Note input method">
        <button
          type="button"
          role="tab"
          aria-selected={inputMode === 'notes'}
          className={`reverse-finder__input-tab ${inputMode === 'notes' ? 'reverse-finder__input-tab--active' : ''}`}
          onClick={() => setInputMode('notes')}
        >
          Pick Notes
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={inputMode === 'midi'}
          className={`reverse-finder__input-tab ${inputMode === 'midi' ? 'reverse-finder__input-tab--active' : ''}`}
          disabled={!isPro}
          onClick={() => { if (isPro) setInputMode('midi') }}
        >
          Import MIDI
          {!isPro && <span className="reverse-finder__pro-badge">PRO</span>}
        </button>
      </div>

      {inputMode === 'notes' ? (
        <NotePicker selected={selected} onChange={setSelected} />
      ) : (
        isPro && (
          <MidiImportPanel
            onLoadMoment={pitchClasses => setSelected(pitchClasses)}
            onImportSequence={chords => onImportSequence?.(chords)}
            onImportError={() => setSelected([])}
          />
        )
      )}

      <div className="reverse-finder__selection-row">
        <span className="reverse-finder__selection">
          {selectedNoteNames.length > 0 ? `Selected: ${selectedNoteNames.join(', ')}` : 'No notes selected yet'}
        </span>
        {selected.length > 0 && (
          <button type="button" className="reverse-finder__clear-btn" onClick={() => setSelected([])}>
            Clear
          </button>
        )}
      </div>

      {selected.length > STRING_COUNT && (
        <p className="reverse-finder__notice">
          A guitar only has 6 strings — pick {STRING_COUNT} notes or fewer so a shape can sound all of them.
        </p>
      )}

      {selected.length > 0 && selected.length <= STRING_COUNT && (
        <div className="reverse-finder__results">
          {results.length === 0 ? (
            <p className="reverse-finder__notice">
              No playable shape found for these notes within a 15-fret range.
            </p>
          ) : (
            results.map((result, i) => {
              // Detected per-result, not once for the whole picked set --
              // this specific shape's actual sounding notes (doublings/an
              // extra tone) can genuinely differ from another ranked
              // shape's, so they can legitimately deserve different names.
              const detected = detectChordName(result.frets)
              const name = formatChordName(detected.name)
              // Root for GuitarDisplay's highlight/aria-label: derived from
              // the RAW detected name (Chord.get needs tonal's own naming,
              // not formatChordName's display-only "M"-tag stripping), same
              // Chord.get(...).tonic pattern App.jsx already uses. Falls
              // back to the first picked note when detection found no
              // confident match (detected.name is then just a plain note
              // list, which Chord.get can't resolve a tonic from).
              const root = Chord.get(detected.name).tonic || selectedNoteNames[0]
              return (
                <div className="reverse-finder__result" key={result.frets.join('-')}>
                  <div className="reverse-finder__result-label">{RESULT_LABELS[i] || `#${i + 1}`}</div>
                  <div className={`reverse-finder__result-name ${detected.isDetected ? '' : 'reverse-finder__result-name--fallback'}`}>
                    {name}
                  </div>
                  {detected.isDetected && detected.alternates.length > 0 && (
                    <div className="reverse-finder__result-alt">also: {detected.alternates.map(formatChordName).join(', ')}</div>
                  )}
                  <GuitarDisplay shape={{ frets: result.frets }} notes={selectedNoteNames} root={root} compact />
                  <div className="reverse-finder__result-stats">{statsLine(result)}</div>
                  <button
                    type="button"
                    className="reverse-finder__add-btn"
                    onClick={() => onAddToProgression?.(name, soundingNotes(result.frets))}
                    aria-label={`Add ${name} to progression`}
                  >
                    + Add to progression
                  </button>
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
