// Reads the note-highlight colors from the CSS custom properties defined
// once in index.css (--note-color-root etc.) -- this is the ONE place any
// component's JS reads them from, so there's never a second hardcoded copy
// of these hex values drifting out of sync with the CSS. Cached after the
// first read since they're fixed (non-theme-aware) for the lifetime of the
// page; any component that needs these colors for an inline SVG fill
// (PianoDisplay, GuitarDisplay, and any future compact mini-keyboard) can
// import this instead of redefining its own constants.
let cached = null

export function getNoteColors() {
  if (!cached) {
    const styles = getComputedStyle(document.documentElement)
    cached = {
      root: styles.getPropertyValue('--note-color-root').trim(),
      chordTone: styles.getPropertyValue('--note-color-chord-tone').trim(),
      suggested: styles.getPropertyValue('--note-color-suggested').trim(),
      splitBass: styles.getPropertyValue('--note-color-split-bass').trim(),
    }
  }
  return cached
}
