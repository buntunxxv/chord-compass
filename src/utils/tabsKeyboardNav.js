// Shared APG "tabs" keyboard behavior for both the mode tabs (App.jsx) and
// the Keys/Guitar tabs (InstrumentDock.jsx): ArrowLeft/ArrowRight move to
// and activate the adjacent tab, wrapping at the ends; Home/End jump to the
// first/last tab. Disabled tabs are skipped entirely, never landed on.
export function getAdjacentTabIndex(tabs, currentIndex, key) {
  const enabled = []
  tabs.forEach((tab, i) => { if (!tab.disabled) enabled.push(i) })
  if (enabled.length === 0) return currentIndex

  if (key === 'Home') return enabled[0]
  if (key === 'End') return enabled[enabled.length - 1]

  const pos = enabled.indexOf(currentIndex)
  if (pos === -1) return currentIndex
  if (key === 'ArrowRight') return enabled[(pos + 1) % enabled.length]
  if (key === 'ArrowLeft') return enabled[(pos - 1 + enabled.length) % enabled.length]
  return currentIndex
}
