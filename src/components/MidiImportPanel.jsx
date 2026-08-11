import { useState } from 'react'
import { parseMidiArrayBuffer, segmentChordMoments } from '../utils/midiChordMoments'
import { detectChordNameFromPitchClasses } from '../utils/reverseVoicingLookup'
import { formatChordName } from '../utils/formatChordName'
import './MidiImportPanel.css'

function formatTime(seconds) {
  const m = Math.floor(seconds / 60)
  const s = (seconds % 60).toFixed(2).padStart(5, '0')
  return `${m}:${s}`
}

// Pro-only alternative to the note picker: upload a .mid/.midi file, see it
// segmented into "chord moments" (Session 37's detectChordName logic run
// against each moment's raw note set -- see detectChordNameFromPitchClasses),
// and either tap one moment to load it into the note picker (feeds Phase
// 1's shape-matching flow directly) or check several to import them as an
// ordered progression. Gating itself lives one level up in
// ReverseVoicingFinder (this component is only ever mounted for Pro users),
// so there's nothing to lock here.
export default function MidiImportPanel({ onLoadMoment, onImportSequence, onImportError }) {
  const [fileName, setFileName] = useState(null)
  const [moments, setMoments] = useState(null)
  const [error, setError] = useState(null)
  const [checked, setChecked] = useState(() => new Set())

  async function handleFileChange(e) {
    const file = e.target.files?.[0]
    e.target.value = '' // allow re-choosing the same file name after a fix
    if (!file) return

    setFileName(file.name)
    setMoments(null)
    setChecked(new Set())
    setError(null)

    try {
      const buffer = await file.arrayBuffer()
      const midi = parseMidiArrayBuffer(buffer)
      const segmented = segmentChordMoments(midi)
      if (segmented.length === 0) {
        setError('No notes found in this MIDI file.')
        // A prior successful import's tapped-moment notes (and the guitar
        // shapes ranked from them, in ReverseVoicingFinder) live one level
        // up and outlive this component's own moments/checked reset above
        // -- without this, they'd sit there below a fresh error, looking
        // like results for the file that just failed.
        onImportError?.()
        return
      }
      setMoments(segmented)
    } catch {
      setError('Could not read this file — make sure it’s a standard .mid/.midi file.')
      onImportError?.()
    }
  }

  function toggleChecked(index) {
    setChecked(prev => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }

  function handleImportSelected() {
    const ordered = [...checked].sort((a, b) => a - b).map(i => {
      const m = moments[i]
      const detected = detectChordNameFromPitchClasses(m.pitchClasses)
      return { chord: formatChordName(detected.name), notes: m.notes.map(n => n.name) }
    })
    onImportSequence?.(ordered)
    setChecked(new Set())
  }

  return (
    <div className="midi-import">
      <label className="midi-import__file-btn">
        Choose MIDI file
        <input
          type="file"
          accept=".mid,.midi,audio/midi,audio/x-midi"
          onChange={handleFileChange}
          className="midi-import__file-input"
        />
      </label>
      {fileName && <span className="midi-import__filename">{fileName}</span>}

      {error && <p className="midi-import__notice">{error}</p>}

      {moments && (
        <>
          <p className="midi-import__hint">
            Tap a chord to load it into the note picker, or check several to import them as a progression in order.
          </p>
          <ul className="midi-import__list">
            {moments.map((m, i) => {
              const detected = detectChordNameFromPitchClasses(m.pitchClasses)
              const name = formatChordName(detected.name)
              return (
                <li className="midi-import__row" key={i}>
                  <input
                    type="checkbox"
                    className="midi-import__checkbox"
                    checked={checked.has(i)}
                    onChange={() => toggleChecked(i)}
                    aria-label={`Select chord moment ${i + 1} (${name}) for progression import`}
                  />
                  <button
                    type="button"
                    className="midi-import__moment-btn"
                    onClick={() => onLoadMoment?.(m.pitchClasses)}
                  >
                    <span className="midi-import__moment-index">#{i + 1}</span>
                    <span className={`midi-import__moment-name ${detected.isDetected ? '' : 'midi-import__moment-name--fallback'}`}>
                      {name}
                    </span>
                    <span className="midi-import__moment-time">
                      {formatTime(m.startTime)}–{formatTime(m.endTime)}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>

          {checked.size > 0 && (
            <button type="button" className="midi-import__import-btn" onClick={handleImportSelected}>
              + Add {checked.size} chord{checked.size === 1 ? '' : 's'} to progression
            </button>
          )}
        </>
      )}
    </div>
  )
}
