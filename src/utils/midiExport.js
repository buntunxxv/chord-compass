// MIDI file export -- Pro-gated, matching the existing plain-text Export
// button pattern (ProgressionStrip) but producing a real playable .mid file
// via @tonejs/midi instead of clipboard text. Same deep-import rationale as
// src/utils/midiChordMoments.js: @tonejs/midi's "main" entry is a UMD
// bundle whose named exports Node can't statically discover, so this
// resolves its "module" entry directly, which works under both Node (the
// verification script) and Vite.
import { Midi } from '@tonejs/midi/dist/Midi.js'

const VELOCITY = 0.8

// One bar per chord, in sequence -- the same "seconds per chord" formula
// ProgressionStrip's own Play button already uses (60/bpm * 4 = one bar at
// 4/4), so an exported file's chord durations exactly match what Play
// actually plays. `progression` is expected to already be voiced (see
// computePlaybackProgression in voiceLeading.js) -- this function just
// lays out whatever notes it's given, one chord per bar; it doesn't decide
// what those notes are.
export function buildProgressionMidiBytes(progression, bpm) {
  const midi = new Midi()
  midi.header.setTempo(bpm)
  const track = midi.addTrack()
  const barSeconds = (60 / bpm) * 4
  progression.forEach((entry, i) => {
    const time = i * barSeconds
    entry.notes.forEach(name => {
      track.addNote({ name, time, duration: barSeconds, velocity: VELOCITY })
    })
  })
  return midi.toArray()
}

// A single chord/voicing as one simultaneous note-on group -- every note
// starts at time 0 and holds for `durationSeconds`.
export function buildChordMidiBytes(notes, durationSeconds) {
  const midi = new Midi()
  const track = midi.addTrack()
  notes.forEach(name => {
    track.addNote({ name, time: 0, duration: durationSeconds, velocity: VELOCITY })
  })
  return midi.toArray()
}

// Browser-only: turns MIDI bytes into an actual file download via a
// throwaway object URL + anchor click -- there's no server endpoint to hit,
// so this is the standard client-side "download this generated file"
// pattern.
export function downloadMidiFile(bytes, filename) {
  const blob = new Blob([bytes], { type: 'audio/midi' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

// Strips characters that are illegal (Windows) or awkward (everywhere) in a
// filename -- chord names routinely contain "/" (slash chords like "C/E"),
// which would otherwise be read as a path separator.
export function sanitizeFilename(name) {
  return name.replace(/[\\/:*?"<>|]/g, '-')
}
