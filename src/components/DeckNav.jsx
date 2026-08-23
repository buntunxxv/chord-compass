import './DeckNav.css'

// The controls for a useCardDeck track: previous/next, an "n/m" counter with
// the current card's name, and a chip per card that jumps straight to it.
// Deck-only -- the stylesheet hides the whole thing at grid widths, where
// every card is already on screen.
//
// `noun` names what is being paged through ("template", "shape"); it only
// reaches screen readers, via the arrows and the chip group. `chipLabels`
// has to be as long as the deck and distinct enough to tell the cards apart
// -- Templates uses each template's mood, Identify each shape's rank.
export default function DeckNav({ count, index, name, chipLabels, noun, onGoTo, onChipKeyDown, chipRefs }) {
  // One card is not a deck: there is nowhere to go, and an arrow that wraps
  // to the card you are already on is worse than no arrow.
  if (count < 2) return null

  return (
    <div className="deck-nav">
      <div className="deck-nav__steps">
        <button
          type="button"
          className="deck-nav__arrow"
          onClick={() => onGoTo(index - 1)}
          aria-label={`Previous ${noun}`}
        >
          ←
        </button>
        <p className="deck-nav__count" aria-live="polite">
          <span className="deck-nav__position">{index + 1}/{count}</span>
          {name && <span className="deck-nav__name">{name}</span>}
        </p>
        <button
          type="button"
          className="deck-nav__arrow"
          onClick={() => onGoTo(index + 1)}
          aria-label={`Next ${noun}`}
        >
          →
        </button>
      </div>
      <div className="deck-nav__chips" role="group" aria-label={`Jump to ${noun}`}>
        {chipLabels.map((label, i) => (
          <button
            key={label}
            ref={el => { chipRefs.current[i] = el }}
            type="button"
            className={`deck-nav__chip ${i === index ? 'deck-nav__chip--active' : ''}`}
            aria-current={i === index ? 'true' : undefined}
            onClick={() => onGoTo(i)}
            onKeyDown={onChipKeyDown}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}
