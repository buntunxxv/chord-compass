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
// Full playback pipeline for a progression: layer EACH chord's OWN stored
// Keys voicing (Close/Drop-2/Split -- entry.keysPositionIndex, set at
// add-time and independently editable per chord, not one setting applied
// uniformly across the whole progression) on top of that chord's own stored
// notes, unmodified otherwise. This is exactly what ProgressionStrip's Play
// button builds per chord -- pulled out here as a pure function so MIDI
// export can reuse the identical computation and always agree with playback
// on what "the currently active voicing" actually sounds like, rather than
// risking a second, subtly different implementation. rootNote is captured
// before the voicing transform runs, since Drop-2 can re-sort notes so
// index 0 is no longer the true root.
//
// `isPro` re-clamps each entry's stored keysPositionIndex the same way the
// live builder does (Math.min(index, isPro ? 2 : 0)) -- defense-in-depth so
// a Pro-only voicing stored while subscribed can't still play back for a
// since-downgraded free account. `entry.keysPositionIndex ?? 0` covers
// progressions persisted before this field existed (older localStorage
// progressions, saved progressions, template loads), which default to the
// same Close/position-1 they always implicitly used.
export function computePlaybackProgression(progression, isPro) {
  return progression.map(entry => {
    const activeKeysIndex = Math.min(entry.keysPositionIndex ?? 0, isPro ? 2 : 0)
    return {
      ...entry,
      rootNote: entry.notes[0],
      notes: applySelectedVoicing(entry.notes, activeKeysIndex, entry.chord.includes('/')),
    }
  })
}
