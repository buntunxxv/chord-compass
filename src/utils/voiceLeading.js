// Explicit .js extension (unlike this codebase's usual extensionless local
// imports): this module is also imported directly by the Node-run
// verification script, and plain Node's ESM resolver -- unlike Vite's --
// requires it.
import { applySelectedVoicing } from './pianoVoicings.js'

// Chord-to-chord voice leading (re-voicing each chord's upper notes to the
// octave closest to the PREVIOUS chord's own already-voiced notes) used to
// run here before applySelectedVoicing. Removed: chaining each chord's
// output into the next chord's reference compounds any small bias in the
// nearest-octave search, so long progressions drifted steadily toward one
// register over many chords, and it made a chord sound different in
// progression playback than it did in single-chord preview (ChordOutputPanel
// plays entry.notes directly, untouched). Every chord now plays back exactly
// as stored -- applySelectedVoicing (Close/Drop-2/Split) is a legitimate
// per-chord transform since it only ever looks at that one chord's own
// notes, not a neighbor's, so it stays.
//
// Full playback pipeline for a progression: layer the selected Keys voicing
// (Close/Drop-2/Split) on top of each chord's own stored notes, unmodified
// otherwise. This is exactly what ProgressionStrip's Play button builds per
// chord -- pulled out here as a pure function so MIDI export can reuse the
// identical computation and always agree with playback on what "the
// currently active voicing" actually sounds like, rather than risking a
// second, subtly different implementation. rootNote is captured before the
// voicing transform runs, since Drop-2 can re-sort notes so index 0 is no
// longer the true root.
export function computePlaybackProgression(progression, activeKeysIndex) {
  return progression.map(entry => ({
    ...entry,
    rootNote: entry.notes[0],
    notes: applySelectedVoicing(entry.notes, activeKeysIndex, entry.chord.includes('/')),
  }))
}
