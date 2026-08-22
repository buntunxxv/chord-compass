import { useEffect, useMemo, useRef, useState } from 'react'
import { PROGRESSION_TEMPLATES } from '../progressionTemplates'
import { resolveTemplate } from '../utils/resolveTemplate'
import { getAdjacentTabIndex } from '../utils/tabsKeyboardNav'
import { ROOTS, ROOT_DISPLAY } from './ChordSelector'
import Dropdown from './Dropdown'
import './ProgressionTemplates.css'

// Below this width the cards are a one-at-a-time swipeable deck; from here up
// they stay the wrapping grid, where every card is on screen at once and the
// deck nav has nothing to navigate. ProgressionTemplates.css branches on the
// same number -- the two have to move together.
const DECK_QUERY = '(max-width: 760px)'

const STEP_KEYS = ['ArrowLeft', 'ArrowRight', 'Home', 'End']

export default function ProgressionTemplates({ keyRoot, keyMode, onKeyRootChange, onKeyModeChange, onLoad }) {
  // Only the templates written in the selected key's mode. That is what makes
  // a position counter meaningful: every card in the deck can actually be
  // loaded, so "2 of 4" counts real choices. The old list rendered all seven
  // at every setting and left the three off-mode ones permanently disabled
  // as "Needs a minor key" -- three cards of a seven-card scroll that existed
  // only to be skipped.
  const templates = useMemo(() => PROGRESSION_TEMPLATES.filter(t => t.mode === keyMode), [keyMode])

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

  // Major and minor hold different templates (four and three), so a surviving
  // index would point at an unrelated card or past the end of the deck.
  useEffect(() => {
    setIndex(0)
    trackRef.current?.scrollTo({ left: 0 })
  }, [keyMode])

  // A swipe moves the track without going through goTo(), so position has to
  // follow the scroll rather than only drive it -- otherwise the counter and
  // the active chip silently disagree with what is on screen. Confined to the
  // deck layout: in the grid every card intersects at once and the observer
  // would just report whichever fired last.
  useEffect(() => {
    const track = trackRef.current
    cardRefs.current.length = templates.length
    chipRefs.current.length = templates.length
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
  }, [isDeck, templates])

  // Wraps at both ends, matching the arrow-key behaviour getAdjacentTabIndex
  // gives the chips -- a deck of three or four is small enough that running
  // off the end and stopping feels like a fault rather than a boundary.
  function goTo(next) {
    const count = templates.length
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
    const next = getAdjacentTabIndex(templates, from === -1 ? index : from, event.key)
    goTo(next)
    chipRefs.current[next]?.focus()
  }

  function handleLoad(template, entries) {
    if (entries) onLoad(entries, template)
  }

  const current = templates[index]

  return (
    <div className="progression-templates" id="wt-progression-templates">
      {/* No heading here: OverlayPage already renders "Templates / Start with
          a proven progression" above this. The hint stays -- that title does
          not tell you the key comes first. */}
      <p className="progression-templates__hint">Pick a key, then load a named progression built from it</p>

      <div className="progression-templates__key">
        <div className="progression-templates__key-field">
          <label className="progression-templates__label">Key</label>
          <Dropdown
            value={keyRoot}
            onChange={onKeyRootChange}
            options={ROOTS.map((r, i) => ({ value: r, label: ROOT_DISPLAY[i] }))}
          />
        </div>
        <div className="progression-templates__mode-toggle" role="group" aria-label="Key mode">
          <button
            type="button"
            className={`progression-templates__mode-btn ${keyMode === 'major' ? 'progression-templates__mode-btn--active' : ''}`}
            onClick={() => onKeyModeChange('major')}
          >
            Major
          </button>
          <button
            type="button"
            className={`progression-templates__mode-btn ${keyMode === 'minor' ? 'progression-templates__mode-btn--active' : ''}`}
            onClick={() => onKeyModeChange('minor')}
          >
            Minor
          </button>
        </div>
      </div>

      {/* Deck-only, hidden by the stylesheet at grid widths. The mood chips
          were a filter before, but every template has a distinct mood, so
          picking one could only ever narrow seven cards to one. As jump-to
          controls the same chips name each card and double as the position
          indicator the deck would otherwise need dots for. */}
      <div className="progression-templates__deck-nav">
        <div className="progression-templates__deck-steps">
          <button
            type="button"
            className="progression-templates__deck-arrow"
            onClick={() => goTo(index - 1)}
            aria-label="Previous template"
          >
            ←
          </button>
          <p className="progression-templates__deck-count" aria-live="polite">
            <span className="progression-templates__deck-position">{index + 1}/{templates.length}</span>
            {current && <span className="progression-templates__deck-name">{current.name}</span>}
          </p>
          <button
            type="button"
            className="progression-templates__deck-arrow"
            onClick={() => goTo(index + 1)}
            aria-label="Next template"
          >
            →
          </button>
        </div>
        <div className="progression-templates__deck-chips" role="group" aria-label="Jump to template">
          {templates.map((template, i) => (
            <button
              key={template.name}
              ref={el => { chipRefs.current[i] = el }}
              type="button"
              className={`progression-templates__mood-chip ${i === index ? 'progression-templates__mood-chip--active' : ''}`}
              aria-current={i === index ? 'true' : undefined}
              onClick={() => goTo(i)}
              onKeyDown={handleChipKeyDown}
            >
              {template.mood}
            </button>
          ))}
        </div>
      </div>

      <div className="progression-templates__deck" ref={trackRef}>
        {templates.map((template, i) => {
          const resolved = resolveTemplate(template, keyRoot, keyMode)
          return (
            <article
              key={template.name}
              ref={el => { cardRefs.current[i] = el }}
              className="progression-templates__card"
              aria-label={isDeck ? `${template.name}, ${i + 1} of ${templates.length}` : undefined}
            >
              <div className="progression-templates__card-header">
                <span className="progression-templates__card-name">{template.name}</span>
                <span className="progression-templates__mood-badge">{template.mood}</span>
              </div>
              {/* resolveTemplate still returns null on a key whose diatonic
                  table is missing a degree. Mode-matching makes that
                  unreachable for the seven templates shipped today -- all 119
                  template/key pairs resolve -- but the fallback costs nothing
                  and keeps a new template from rendering a blank card. */}
              {resolved ? (
                <div className="progression-templates__degrees">
                  {resolved.map((entry, j) => (
                    <span key={j} className="progression-templates__resolved-chord">
                      <span className="progression-templates__resolved-chord-name">{entry.chord}</span>
                      <span className="progression-templates__degree-pill">{entry.degree}</span>
                    </span>
                  ))}
                </div>
              ) : (
                <span className="progression-templates__degrees progression-templates__degrees--plain">{template.degrees.join(' – ')}</span>
              )}
              <p className="progression-templates__description">{template.description}</p>
              <button
                type="button"
                className="progression-templates__load-btn"
                onClick={() => handleLoad(template, resolved)}
                disabled={!resolved}
              >
                Load
              </button>
            </article>
          )
        })}
      </div>
    </div>
  )
}
