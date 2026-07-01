// Turn note names like "C#4" into display form "C♯", deduped and octave-stripped
export function formatNoteNames(notes) {
  return (notes || [])
    .map(n => n.replace(/\d+$/, '').replace('b', '♭').replace('#', '♯'))
    .filter((n, i, arr) => arr.indexOf(n) === i)
}
