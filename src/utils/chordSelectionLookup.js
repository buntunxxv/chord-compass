// Pure chord-name <-> selector-state <-> guitar-shape lookup helpers, split
// out of App.jsx so they can be reused (App.jsx's live builder selection,
// the reverse-lookup's reference shape, and progression-playback's
// currently-sounding chord all need the exact same pipeline) and unit
// tested directly (App.jsx itself can't be imported outside a JSX-aware
// bundler, since it renders markup) -- see scripts/verify-preview-and-
// playback.mjs.
//
// Explicit .js extensions (unlike this codebase's usual extensionless local
// imports, e.g. slashChord.js's own imports): this module is also imported
// directly by that Node-run verification script, and plain Node's ESM
// resolver -- unlike Vite's -- requires them (same reasoning as
// voiceLeading.js).
import { GUITAR_SHAPES } from '../guitarData.js'
import { GUITAR_INVERSION_SHAPES } from '../guitarInversions.js'
import { GUITAR_ALT_POSITIONS } from '../guitarPositions.js'
import { GUITAR_INVERSION_ALT_POSITIONS } from '../guitarInversionPositions.js'
import { isInChordTone } from './slashChord.js'

// Map selector state to CHORD_DATA key
export function toDataKey(root, quality, extension) {
  if (quality === 'major' && extension === 'none') return `${root} major`
  if (quality === 'minor' && extension === 'none') return `${root} minor`
  if (quality === 'diminished' && extension === 'none') return `${root} diminished`
  if (quality === 'augmented' && extension === 'none') return `${root} augmented`
  if (quality === 'major' && extension === '7') return `${root}7`
  if (quality === 'major' && extension === 'maj7') return `${root}maj7`
  if (quality === 'minor' && extension === '7') return `${root}m7`
  if (quality === 'diminished' && extension === '7') return `${root}m7b5`
  if (quality === 'diminished' && extension === 'dim7') return `${root}dim7`
  if (quality === 'major' && extension === 'add9') return `${root}add9`
  if (quality === 'sus2' && extension === 'none') return `${root}sus2`
  if (quality === 'sus4' && extension === 'none') return `${root}sus4`
  if (quality === 'major' && extension === '9') return `${root}9`
  if (quality === 'major' && extension === 'maj9') return `${root}maj9`
  if (quality === 'minor' && extension === '9') return `${root}m9`
  if (quality === 'major' && extension === '11') return `${root}11`
  if (quality === 'minor' && extension === '11') return `${root}m11`
  if (quality === 'major' && extension === '13') return `${root}13`
  if (quality === 'major' && extension === 'maj13') return `${root}maj13`
  if (quality === 'minor' && extension === '13') return `${root}m13`
  if (quality === 'major' && extension === '7#9') return `${root}7#9`
  if (quality === 'major' && extension === '7b9') return `${root}7b9`
  if (quality === 'major' && extension === '7#5') return `${root}7#5`
  if (quality === 'major' && extension === '7b5') return `${root}7b5`
  if (quality === 'major' && extension === '7#11') return `${root}7#11`
  return null
}

// Parse a chord DISPLAY NAME (e.g. a progression chip's or a suggestion's
// "chord" field -- "C", "Dm7", "Cmaj7", "Csus2"...) back into selector
// state. Only covers the 8 base types the free-tier suggestion engine can
// ever produce (see Chord Data Reference) -- extended/altered qualities
// never appear as a suggestion or progression-addable name, so they don't
// need a case here. Returns null for anything else (including slash
// chords -- a bare display string can't recover a slash bass).
export function chordNameToSelection(name) {
  const m = name.match(/^([A-G][#b]?)(m7|maj7|m|add9|sus2|sus4|7|)$/)
  if (!m) return null
  const [, root, suffix] = m
  const map = {
    '': { quality: 'major', extension: 'none' },
    'm': { quality: 'minor', extension: 'none' },
    '7': { quality: 'major', extension: '7' },
    'maj7': { quality: 'major', extension: 'maj7' },
    'm7': { quality: 'minor', extension: '7' },
    'add9': { quality: 'major', extension: 'add9' },
    'sus2': { quality: 'sus2', extension: 'none' },
    'sus4': { quality: 'sus4', extension: 'none' },
  }
  const qual = map[suffix]
  if (!qual) return null
  return { root, ...qual }
}

// Guitar-shape/position resolution for a chord identified by its own
// dataKey + (optional) slash bass. Root-position lookup (hasSlashBass:
// false) is what both the reverse-lookup's reference shape and
// progression-playback's currently-sounding chord use, since neither has a
// slash bass to recover from a bare display name.
export function resolveGuitarPositions(dataKey, hasSlashBass, effectiveBassNote, chordNotes) {
  if (!dataKey) return null
  if (hasSlashBass) {
    const isInversion = isInChordTone(chordNotes, effectiveBassNote)
    const inversionShape = isInversion ? GUITAR_INVERSION_SHAPES[dataKey]?.[effectiveBassNote] : null
    if (!isInversion || !inversionShape) return null
    const alt = GUITAR_INVERSION_ALT_POSITIONS[dataKey]?.[effectiveBassNote] || []
    return [inversionShape, ...alt.filter(Boolean)]
  }
  if (!GUITAR_SHAPES[dataKey]) return null
  const alt = GUITAR_ALT_POSITIONS[dataKey] || []
  return [GUITAR_SHAPES[dataKey], ...alt.filter(Boolean)]
}

// Full pipeline: chord display name -> its own root-position guitar shape
// (always position 1 -- there's no "selected position" for an arbitrary
// chord referenced only by name) + root pitch letter, or null if the name
// doesn't parse or has no curated shape.
export function guitarShapeForChordName(name) {
  const selection = chordNameToSelection(name)
  if (!selection) return null
  const dataKey = toDataKey(selection.root, selection.quality, selection.extension)
  const positions = resolveGuitarPositions(dataKey, false, 'none', null)
  if (!positions) return null
  return { shape: positions[0], root: selection.root }
}
