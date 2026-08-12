// Shared "scroll the minimum amount to reveal newly-opened content" rule
// (Field Test, 12 Aug 2026). Any control that reveals/expands content
// beyond the currently visible viewport -- a dropdown panel opening, a
// suggestion's detail panel expanding, and any future one -- calls this
// instead of inventing its own scroll behavior, so the rule stays
// consistent everywhere it's needed rather than being fixed per-control.
//
// Accounts for the fixed-position bottom progression drawer (open or
// collapsed) by measuring its live on-screen height at call time rather
// than a hardcoded constant, so this stays correct if that height ever
// changes on either side, and works identically whether the drawer is
// expanded or collapsed.

const REVEAL_MARGIN_PX = 12

function findScrollParent(el) {
  let node = el.parentElement
  while (node) {
    const style = getComputedStyle(node)
    if (/(auto|scroll)/.test(style.overflowY) && node.scrollHeight > node.clientHeight) {
      return node
    }
    node = node.parentElement
  }
  return document.scrollingElement || document.documentElement
}

// Scrolls `el`'s nearest scrollable ancestor just enough to bring `el`
// fully into the visible area -- the area between that ancestor's own
// on-screen top edge and the top of the fixed bottom progression drawer
// (whatever its current height is), not the raw window height. A no-op
// when `el` is already fully within that area.
export function scrollRevealIntoView(el) {
  if (!el || typeof el.getBoundingClientRect !== 'function') return
  const scrollParent = findScrollParent(el)
  if (!scrollParent) return

  const drawer = document.querySelector('.progression-strip')
  const drawerHeight = drawer ? drawer.getBoundingClientRect().height : 0

  const parentRect = scrollParent.getBoundingClientRect()
  const viewportTop = Math.max(parentRect.top, 0)
  const viewportBottom = Math.min(parentRect.bottom, window.innerHeight - drawerHeight)

  const rect = el.getBoundingClientRect()

  let delta = 0
  if (rect.top < viewportTop) {
    delta = rect.top - viewportTop - REVEAL_MARGIN_PX
  } else if (rect.bottom > viewportBottom) {
    delta = rect.bottom - viewportBottom + REVEAL_MARGIN_PX
  }
  if (delta !== 0) {
    // Instant, not smooth: several of these reveal triggers (a dropdown
    // opening) sit right next to a native browser scroll (focusing the
    // newly-opened listbox, or the trigger again on close) that always
    // happens instantly -- an animated scroll here can still be mid-flight
    // when that native jump fires a beat later, and the two competing
    // scroll positions can paint a torn/ghosted frame for an instant.
    // Resolving in one deterministic jump avoids the two ever overlapping.
    scrollParent.scrollBy({ top: delta, behavior: 'auto' })
  }
}
