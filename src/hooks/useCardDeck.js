import { useEffect, useRef, useState } from 'react'
import { getAdjacentTabIndex } from '../utils/tabsKeyboardNav'

// Below this width a set of cards is a one-at-a-time swipeable deck; from
// here up it stays whatever grid or row its own stylesheet lays out, where
// every card is on screen at once and there is nothing to navigate.
// DeckNav.css branches on the same number, and deliberately as another
// `max-width: 760px` rather than a paired `min-width: 761px` -- that pairing
// leaves one width at which this hook thinks it is driving a deck while the
// CSS is still laying out a grid.
export const DECK_QUERY = '(max-width: 760px)'

const STEP_KEYS = ['ArrowLeft', 'ArrowRight', 'Home', 'End']

// Shared behaviour behind the Templates and Identify decks: which card is
// current, how the arrows/chips move it, and how a finger swipe moves it
// back. `items` has to be referentially stable between renders that don't
// change the deck -- both callers pass a useMemo'd array -- because its
// identity is what resets the deck and rebinds the observer.
export function useCardDeck(items) {
  const [index, setIndex] = useState(0)
  const [isDeck, setIsDeck] = useState(() => window.matchMedia(DECK_QUERY).matches)
  const trackRef = useRef(null)
  const cardRefs = useRef([])
  const chipRefs = useRef([])

  useEffect(() => {
    const media = window.matchMedia(DECK_QUERY)
    const onChange = event => setIsDeck(event.matches)
    setIsDeck(media.matches)
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  // A new set of cards is a different deck -- a surviving index would point
  // at an unrelated card, or past the end of a shorter one.
  useEffect(() => {
    setIndex(0)
    trackRef.current?.scrollTo({ left: 0 })
  }, [items])

  // A swipe moves the track without going through goTo(), so position has to
  // follow the scroll rather than only drive it -- otherwise the counter and
  // the active chip silently disagree with what is on screen. Confined to the
  // deck layout: in a grid every card intersects at once and the observer
  // would just report whichever fired last.
  useEffect(() => {
    const track = trackRef.current
    cardRefs.current.length = items.length
    chipRefs.current.length = items.length
    if (!isDeck || !track) return undefined

    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          const position = cardRefs.current.indexOf(entry.target)
          if (position !== -1) setIndex(position)
        }
      },
      { root: track, threshold: 0.6 },
    )
    cardRefs.current.forEach(card => { if (card) observer.observe(card) })
    return () => observer.disconnect()
  }, [isDeck, items])

  // Wraps at both ends: these decks hold a handful of cards, few enough that
  // running off the end and stopping reads as a fault rather than a boundary.
  function goTo(next) {
    const count = items.length
    if (count === 0) return
    const wrapped = ((next % count) + count) % count
    setIndex(wrapped)
    cardRefs.current[wrapped]?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  }

  // Steps from the chip that has focus, not from the deck's current index.
  // Tab reaches every chip (this is a plain button group, not a roving
  // tabindex), so the two can differ -- landing on the first chip while the
  // deck sits on the third and having ArrowRight jump to the fourth would
  // read as a fault.
  function handleChipKeyDown(event) {
    if (!STEP_KEYS.includes(event.key)) return
    event.preventDefault()
    const from = chipRefs.current.indexOf(event.currentTarget)
    const next = getAdjacentTabIndex(items, from === -1 ? index : from, event.key)
    goTo(next)
    chipRefs.current[next]?.focus()
  }

  return { index, isDeck, trackRef, cardRefs, chipRefs, goTo, handleChipKeyDown }
}
