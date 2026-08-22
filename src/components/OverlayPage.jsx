import { useEffect, useId, useRef } from 'react'
import './OverlayPage.css'

export default function OverlayPage({ isOpen, onClose, eyebrow, title, children, intro = false, wide = false, docked = false }) {
  const titleId = useId()
  const closeRef = useRef(null)

  useEffect(() => {
    if (!isOpen) return undefined
    const previouslyFocused = document.activeElement
    const handleKeyDown = event => {
      if (event.key === 'Escape' && !intro) onClose?.()
    }
    document.addEventListener('keydown', handleKeyDown)
    closeRef.current?.focus()
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      previouslyFocused?.focus?.()
    }
  }, [isOpen, intro, onClose])

  if (!isOpen) return null

  return (
    <div
      className={`overlay-page ${docked ? 'overlay-page--docked' : ''}`}
      role="presentation"
      onMouseDown={event => {
        if (!intro && event.target === event.currentTarget) onClose?.()
      }}
    >
      <section
        className={`overlay-page__panel ${wide ? 'overlay-page__panel--wide' : ''} ${intro ? 'overlay-page__panel--intro' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        {!intro && (
          <button ref={closeRef} type="button" className="overlay-page__close" onClick={onClose} aria-label={`Close ${title}`}>
            ×
          </button>
        )}
        <header className="overlay-page__header">
          {eyebrow && <p className="overlay-page__eyebrow">{eyebrow}</p>}
          <h2 id={titleId}>{title}</h2>
        </header>
        <div className="overlay-page__content">{children}</div>
      </section>
    </div>
  )
}
