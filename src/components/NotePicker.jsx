import { PITCH_CLASS_NAMES } from '../utils/reverseVoicingLookup'
import './NotePicker.css'

// A plain 12-pitch-class toggle -- no octave input. Octave doesn't matter
// much for a guitar-shape search (voice-leading/register choices are
// limited by the instrument itself), so this stays pitch-class-only rather
// than asking for specific octaves the search wouldn't use anyway.
export default function NotePicker({ selected, onChange }) {
  function toggle(pc) {
    onChange(selected.includes(pc) ? selected.filter(p => p !== pc) : [...selected, pc])
  }

  return (
    <div className="note-picker" role="group" aria-label="Select notes">
      {PITCH_CLASS_NAMES.map((name, pc) => (
        <button
          key={name}
          type="button"
          className={`note-picker__key ${selected.includes(pc) ? 'note-picker__key--active' : ''}`}
          aria-pressed={selected.includes(pc)}
          onClick={() => toggle(pc)}
        >
          {name.replace('#', '♯')}
        </button>
      ))}
    </div>
  )
}
