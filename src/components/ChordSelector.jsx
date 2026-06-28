import { Chord } from 'tonal'
import { CHORD_DATA } from '../chordData'
import './ChordSelector.css'

function toDataKey(root, quality, extension) {
  if (quality === 'major'     && extension === 'none')  return `${root} major`
  if (quality === 'minor'     && extension === 'none')  return `${root} minor`
  if (quality === 'major'     && extension === '7')     return `${root}7`
  if (quality === 'major'     && extension === 'maj7')  return `${root}maj7`
  if (quality === 'minor'     && extension === '7')     return `${root}m7`
  if (quality === 'major'     && extension === 'add9')  return `${root}add9`
  if (quality === 'sus4'      && extension === 'none')  return `${root}sus4`
  return null
}

function hasData(root, quality, extension) {
  const key = toDataKey(root, quality, extension)
  return key !== null && key in CHORD_DATA
}

const ROOTS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
const ROOT_DISPLAY = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B']

const QUALITIES = [
  { value: 'major', label: 'Major', tonal: 'M' },
  { value: 'minor', label: 'Minor', tonal: 'm' },
  { value: 'diminished', label: 'Diminished', tonal: 'dim' },
  { value: 'augmented', label: 'Augmented', tonal: 'aug' },
  { value: 'sus2', label: 'Sus2', tonal: 'sus2' },
  { value: 'sus4', label: 'Sus4', tonal: 'sus4' },
]

const EXTENSIONS = [
  { value: 'none', label: 'None', tonal: '' },
  { value: '7', label: '7', tonal: '7' },
  { value: 'maj7', label: 'maj7', tonal: 'maj7' },
  { value: 'add9', label: 'add9', tonal: 'add9' },
]

// Map our selection to a Tonal chord symbol
function buildChordSymbol(root, quality, extension) {
  const q = QUALITIES.find(q => q.value === quality)
  const e = EXTENSIONS.find(e => e.value === extension)
  if (!q || !e) return null

  if (quality === 'major') {
    if (extension === 'none') return root
    if (extension === '7') return root + '7'
    if (extension === 'maj7') return root + 'maj7'
    if (extension === 'add9') return root + 'add9'
  }
  if (quality === 'minor') {
    if (extension === 'none') return root + 'm'
    if (extension === '7') return root + 'm7'
    if (extension === 'maj7') return root + 'mM7'
    if (extension === 'add9') return root + 'madd9'
  }
  if (quality === 'diminished') {
    if (extension === 'none') return root + 'dim'
    if (extension === '7') return root + 'dim7'
    return root + 'dim'
  }
  if (quality === 'augmented') {
    if (extension === 'none') return root + 'aug'
    if (extension === '7') return root + 'aug7'
    return root + 'aug'
  }
  if (quality === 'sus2') return root + 'sus2'
  if (quality === 'sus4') return root + 'sus4'
  return root
}

export default function ChordSelector({ root, quality, extension, onChange }) {
  const symbol = buildChordSymbol(root, quality, extension)
  const chord = symbol ? Chord.get(symbol) : null

  function handleChange(field, value) {
    onChange({ root, quality, extension, [field]: value })
  }

  return (
    <div className="chord-selector">
      <div className="chord-selector__dropdowns">
        <div className="chord-selector__field">
          <label className="chord-selector__label">Root</label>
          <select
            className="chord-selector__select"
            value={root}
            onChange={e => handleChange('root', e.target.value)}
          >
            {ROOTS.map((r, i) => (
              <option key={r} value={r} disabled={!hasData(r, quality, extension)}>
                {ROOT_DISPLAY[i]}
              </option>
            ))}
          </select>
        </div>

        <div className="chord-selector__field">
          <label className="chord-selector__label">Quality</label>
          <select
            className="chord-selector__select"
            value={quality}
            onChange={e => handleChange('quality', e.target.value)}
          >
            {QUALITIES.map(q => (
              <option key={q.value} value={q.value} disabled={!hasData(root, q.value, extension)}>
                {q.label}
              </option>
            ))}
          </select>
        </div>

        <div className="chord-selector__field">
          <label className="chord-selector__label">Extension</label>
          <select
            className="chord-selector__select"
            value={extension}
            onChange={e => handleChange('extension', e.target.value)}
          >
            {EXTENSIONS.map(e => (
              <option key={e.value} value={e.value} disabled={!hasData(root, quality, e.value)}>
                {e.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}

export { buildChordSymbol, ROOTS, ROOT_DISPLAY, QUALITIES, EXTENSIONS }
