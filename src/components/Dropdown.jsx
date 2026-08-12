import { useState, useRef, useEffect, useId } from 'react'
import { scrollRevealIntoView } from '../utils/scrollReveal'
import './Dropdown.css'

// APG "listbox popup" keyboard model: DOM focus stays on the listbox (ul)
// itself while open, and aria-activedescendant tracks which option is
// highlighted -- so options never need their own tabIndex/focus handling.
function firstEnabledIndex(options) {
  return options.findIndex(o => !o.disabled)
}

function lastEnabledIndex(options) {
  for (let i = options.length - 1; i >= 0; i--) {
    if (!options[i].disabled) return i
  }
  return -1
}

// No wrapping -- ArrowDown/ArrowUp stop at the last/first enabled option,
// matching native <select> behavior. Disabled options are stepped over
// entirely, never landing as a (merely greyed-out) stop along the way.
function nextEnabledIndex(options, from, dir) {
  let i = from
  while (true) {
    i += dir
    if (i < 0 || i >= options.length) return from
    if (!options[i].disabled) return i
  }
}

export default function Dropdown({ id, value, options, onChange, disabled }) {
  const [open, setOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const rootRef = useRef(null)
  const triggerRef = useRef(null)
  const listRef = useRef(null)
  const optionRefs = useRef([])
  const wasOpenRef = useRef(false)
  const reactId = useId()
  const listboxId = `${id || reactId}-listbox`

  useEffect(() => {
    if (disabled) setOpen(false)
  }, [disabled])

  // Single source of truth for both opening (set initial highlight, move
  // DOM focus into the listbox) and closing (return focus to the trigger)
  // -- every close path (Escape, Enter/Space selecting, and the existing
  // click-outside handler) just sets `open` to false and lands here, so
  // focus never gets left behind on an element that's about to unmount.
  useEffect(() => {
    if (open) {
      const selectedIndex = options.findIndex(o => o.value === value)
      const startIndex = selectedIndex >= 0 && !options[selectedIndex].disabled
        ? selectedIndex
        : firstEnabledIndex(options)
      setHighlightedIndex(startIndex)
      listRef.current?.focus()
      scrollRevealIntoView(listRef.current)
    } else if (wasOpenRef.current) {
      triggerRef.current?.focus()
    }
    wasOpenRef.current = open
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  useEffect(() => {
    if (!open) return

    function handlePointerDown(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [open])

  useEffect(() => {
    if (open && highlightedIndex >= 0) {
      optionRefs.current[highlightedIndex]?.scrollIntoView({ block: 'nearest' })
    }
  }, [open, highlightedIndex])

  const selected = options.find(o => o.value === value)

  function selectHighlighted() {
    const opt = options[highlightedIndex]
    if (!opt || opt.disabled) return
    onChange(opt.value)
    setOpen(false)
  }

  function handleTriggerKeyDown(e) {
    if (disabled) return
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
      e.preventDefault()
      setOpen(true)
    }
  }

  function handleListKeyDown(e) {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlightedIndex(idx => nextEnabledIndex(options, idx, 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlightedIndex(idx => nextEnabledIndex(options, idx, -1))
        break
      case 'Home':
        e.preventDefault()
        setHighlightedIndex(firstEnabledIndex(options))
        break
      case 'End':
        e.preventDefault()
        setHighlightedIndex(lastEnabledIndex(options))
        break
      case 'Enter':
      case ' ':
        e.preventDefault()
        selectHighlighted()
        break
      case 'Escape':
        e.preventDefault()
        setOpen(false)
        break
      default:
        break
    }
  }

  return (
    <div className="dropdown" ref={rootRef} id={id}>
      <button
        type="button"
        ref={triggerRef}
        className={`dropdown__trigger ${open ? 'dropdown__trigger--open' : ''}`}
        onClick={() => setOpen(o => !o)}
        onKeyDown={handleTriggerKeyDown}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
      >
        <span className="dropdown__value">{selected ? selected.label : ''}</span>
        <svg className="dropdown__chevron" width="12" height="8" viewBox="0 0 12 8" aria-hidden="true">
          <path d="M1 1l5 5 5-5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </svg>
      </button>

      {open && (
        <ul
          id={listboxId}
          ref={listRef}
          className="dropdown__panel"
          role="listbox"
          tabIndex={-1}
          aria-activedescendant={highlightedIndex >= 0 ? `${listboxId}-option-${highlightedIndex}` : undefined}
          onKeyDown={handleListKeyDown}
        >
          {options.map((opt, index) => (
            <li
              key={opt.value}
              id={`${listboxId}-option-${index}`}
              ref={el => { optionRefs.current[index] = el }}
              role="option"
              aria-selected={opt.value === value}
              aria-disabled={opt.disabled || undefined}
              className={`dropdown__option ${opt.value === value ? 'dropdown__option--selected' : ''} ${opt.disabled ? 'dropdown__option--disabled' : ''} ${index === highlightedIndex ? 'dropdown__option--highlighted' : ''}`}
              onMouseEnter={() => { if (!opt.disabled) setHighlightedIndex(index) }}
              onClick={() => {
                if (opt.disabled) return
                onChange(opt.value)
                setOpen(false)
              }}
            >
              <span className="dropdown__option-label">
                {opt.label}
                {opt.badge && <span className="dropdown__pro-badge">{opt.badge}</span>}
              </span>
              {opt.value === value && (
                <svg className="dropdown__check" width="13" height="10" viewBox="0 0 14 10" aria-hidden="true">
                  <path d="M1 5l4 4 8-8" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
