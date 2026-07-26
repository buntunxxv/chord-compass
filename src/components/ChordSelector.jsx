import { useState } from 'react'
import { Chord } from 'tonal'
import { Link } from 'react-router-dom'
import { CHORD_DATA } from '../chordData'
import { logEvent } from '../analytics/events'
import Dropdown from './Dropdown'
import './ChordSelector.css'

function toDataKey(root, quality, extension) {
  if (quality === 'major'     && extension === 'none')  return `${root} major`
  if (quality === 'minor'     && extension === 'none')  return `${root} minor`
  if (quality === 'major'     && extension === '7')     return `${root}7`
  if (quality === 'major'     && extension === 'maj7')  return `${root}maj7`
  if (quality === 'minor'     && extension === '7')     return `${root}m7`
  if (quality === 'major'     && extension === 'add9')  return `${root}add9`
  if (quality === 'sus2'      && extension === 'none')  return `${root}sus2`
  if (quality === 'sus4'      && extension === 'none')  return `${root}sus4`
  return null
}

function hasData(root, quality, extension) {
  const key = toDataKey(root, quality, extension)
  return key !== null && key in CHORD_DATA
}

const ROOTS = ['C', 'D', 'E', 'F', 'G', 'A', 'B']
const ROOT_DISPLAY = ['C', 'D', 'E', 'F', 'G', 'A', 'B']

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

// Hint sentences matter most on the first few chord changes (round-1
// feedback: beginners didn't understand Root/Quality/Extension). Once
// someone's changed the chord a handful of times they've likely learned
// the controls, so the hints step aside to save space permanently for
// that visitor (tracked in localStorage, not just this session).
const HINT_STORAGE_KEY = 'kcc_selector_interactions'
const HINT_THRESHOLD = 4

export default function ChordSelector({ root, quality, extension, onChange }) {
  const symbol = buildChordSymbol(root, quality, extension)
  const chord = symbol ? Chord.get(symbol) : null

  const [interactionCount, setInteractionCount] = useState(() => {
    const stored = Number(localStorage.getItem(HINT_STORAGE_KEY))
    return Number.isFinite(stored) ? stored : 0
  })
  const showHints = interactionCount < HINT_THRESHOLD

  function handleChange(field, value) {
    onChange({ root, quality, extension, [field]: value })
    setInteractionCount(prev => {
      const next = prev + 1
      localStorage.setItem(HINT_STORAGE_KEY, String(next))
      return next
    })
  }

  const rootOptions = ROOTS.map((r, i) => ({
    value: r,
    label: ROOT_DISPLAY[i],
    disabled: !hasData(r, quality, extension),
  }))
  const qualityOptions = QUALITIES.map(q => ({
    value: q.value,
    label: q.label,
    disabled: !hasData(root, q.value, extension),
  }))
  const extensionOptions = EXTENSIONS.map(e => ({
    value: e.value,
    label: e.label,
    disabled: !hasData(root, quality, e.value),
  }))

  return (
    <div className="chord-selector">
      <h2 className="chord-selector__title">Build a Chord</h2>
      <div className="chord-selector__fields">
        <div className="chord-selector__field" id="wt-root">
          <div className="chord-selector__field-row">
            {showHints && <span className="chord-selector__hint">The note the chord is named after</span>}
            <Dropdown
              label="Root"
              value={root}
              options={rootOptions}
              onChange={v => handleChange('root', v)}
            />
          </div>
          <Link
            to="/upgrade"
            className="chord-selector__pro-lock"
            title="Sharp and flat root notes are available in Chord Compass Pro"
            onClick={() => logEvent('upgrade_cta_click', { source: 'root_selector' })}
          >
            <span className="chord-selector__pro-lock-icon">🔒</span>
            C♯ D♯ F♯ G♯ A♯ + flats — Pro
          </Link>
        </div>

        <div className="chord-selector__field" id="wt-quality">
          <div className="chord-selector__field-row">
            {showHints && <span className="chord-selector__hint">Major sounds bright, minor is darker</span>}
            <Dropdown
              label="Quality"
              value={quality}
              options={qualityOptions}
              onChange={v => handleChange('quality', v)}
            />
          </div>
        </div>

        <div className="chord-selector__field">
          <div className="chord-selector__field-row">
            {showHints && <span className="chord-selector__hint">Extra notes that add colour — start with None</span>}
            <Dropdown
              label="Extension"
              value={extension}
              options={extensionOptions}
              onChange={v => handleChange('extension', v)}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export { buildChordSymbol, ROOTS, ROOT_DISPLAY, QUALITIES, EXTENSIONS }
