// ASCII accidentals -> Unicode glyphs. Global, not just the first match --
// a bare note name only ever has one accidental, but callers formatting a
// full chord symbol (root + suffix) can have two (e.g. "Ebm7b5").
export function toUnicodeAccidentals(str) {
  return str.replace(/#/g, '♯').replace(/b/g, '♭')
}

// Turn note names like "C#4" into display form "C♯", deduped and octave-stripped
export function formatNoteNames(notes) {
  return (notes || [])
    .map(n => toUnicodeAccidentals(n.replace(/\d+$/, '')))
    .filter((n, i, arr) => arr.indexOf(n) === i)
}
