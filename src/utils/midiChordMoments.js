// MIDI file import for the reverse voicing lookup (Find Shapes) feature --
// parses an uploaded .mid/.midi file with @tonejs/midi (same ecosystem as
// the `tone` dependency already used for playback elsewhere in this app;
// hand-rolling a binary MIDI parser would be pure risk for something a
// well-established library already does) and segments it into "chord
// moments."
//
// A chord moment is a maximal time window where a stable SET of MIDI note
// numbers is sounding -- a new moment starts the instant any note starts or
// stops, so this is a pitch-set change detector, not a fixed-clock/beat
// quantizer. A whole-note block chord is one moment; a fast arpeggio is
// many short moments, one per newly-added note.
//
// Deep import, not `from '@tonejs/midi'`: the package's "main" field (its
// entry point under plain Node resolution, which the Node-run verification
// script in scripts/ also needs to work with) is a minified UMD bundle
// whose named exports aren't statically discoverable. Its "module" field --
// dist/Midi.js, resolved here directly -- is plain CJS with ordinary
// `exports.Midi = ...` assignments that both Vite/esbuild's bundling and
// Node's own static analysis handle correctly.
import { Midi } from '@tonejs/midi/dist/Midi.js'

// Thin wrapper so callers (and the verification script) don't need to know
// @tonejs/midi's constructor signature or that it throws on malformed data.
export function parseMidiArrayBuffer(arrayBuffer) {
  return new Midi(arrayBuffer)
}

// Segment a parsed Midi object into chord moments across every track --
// segmentation only cares about which pitches are sounding when, not which
// track/channel produced them, so a multi-track piano-roll export is
// exactly the kind of file this is for.
//
// Returns [] for a file with no notes at all. Silent gaps (no notes
// sounding) are not emitted as moments -- there's nothing to detect a
// chord from during silence.
export function segmentChordMoments(midi) {
  const events = []
  midi.tracks.forEach(track => {
    track.notes.forEach(note => {
      events.push({ ticks: note.ticks, kind: 'on', midi: note.midi, name: note.name })
      events.push({ ticks: note.ticks + note.durationTicks, kind: 'off', midi: note.midi })
    })
  })
  if (events.length === 0) return []

  // Ticks are integers, so grouping simultaneous on/off events by exact
  // tick value is exact -- no floating-point time epsilon to fudge. Note
  // ends are applied before note starts at the same tick, so a note that
  // ends the instant another begins nets to one clean transition instead
  // of a flickering zero-length moment in between.
  events.sort((a, b) => a.ticks - b.ticks || (a.kind === 'off' ? -1 : 1))

  const sounding = new Map() // midi note number -> note name, currently sounding
  const moments = []
  let momentStartTicks = null
  let momentNotes = null
  let i = 0

  while (i < events.length) {
    const t = events[i].ticks
    while (i < events.length && events[i].ticks === t) {
      const e = events[i]
      if (e.kind === 'on') sounding.set(e.midi, e.name)
      else sounding.delete(e.midi)
      i++
    }

    if (momentStartTicks !== null && t > momentStartTicks) {
      moments.push(buildMoment(midi, momentStartTicks, t, momentNotes))
    }
    if (sounding.size > 0) {
      momentStartTicks = t
      momentNotes = new Map(sounding)
    } else {
      momentStartTicks = null
      momentNotes = null
    }
  }

  return moments
}

function buildMoment(midi, startTicks, endTicks, notesMap) {
  // Sorted low-to-high by actual MIDI pitch (not insertion order) so
  // notes[0] is always the moment's bass note -- the same "lowest note
  // first" convention soundingNotes() uses for guitar shapes, since
  // ProgressionStrip reads entry.notes[0] as the root for playback
  // highlighting.
  const notes = [...notesMap.entries()]
    .map(([midiNum, name]) => ({ midi: midiNum, name }))
    .sort((a, b) => a.midi - b.midi)
  const pitchClasses = [...new Set(notes.map(n => n.midi % 12))].sort((a, b) => a - b)
  return {
    startTime: midi.header.ticksToSeconds(startTicks),
    endTime: midi.header.ticksToSeconds(endTicks),
    notes,
    pitchClasses,
  }
}
