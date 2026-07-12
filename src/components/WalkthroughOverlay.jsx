import { useState, useEffect } from 'react'
import './WalkthroughOverlay.css'

const PAD = 6

const STEPS = [
  {
    selector: '#wt-root',
    text: 'Start here — choose your Root. This is the note your chord is built from and named after.',
    action: false,
  },
  {
    selector: '#wt-quality',
    text: 'Quality sets the mood. Major sounds bright and open, minor is darker and more emotional.',
    action: false,
  },
  {
    selector: '#wt-chord-output',
    text: 'Your current chord appears here — its name, the notes it contains, and the intervals between them.',
    action: false,
  },
  {
    selector: '#wt-piano',
    text: 'The keyboard shows your chord in real pitch position across two octaves.',
    action: false,
  },
  {
    selector: '#wt-play-btn',
    text: 'Tap Play Chord to hear how it sounds.',
    action: true,
  },
  {
    selector: '#wt-next-chords',
    text: 'These suggestion cards show where your song could go next — each moves in a different musical direction.',
    action: false,
  },
  {
    selector: '#wt-add-btn',
    text: 'Add the current chord to start building a progression. Tap it now to try.',
    action: true,
  },
  {
    selector: '#wt-progression',
    text: 'Your progression builds here. Tap Play to hear the chords move together in sequence.',
    action: false,
  },
]

export default function WalkthroughOverlay({ isOpen, onClose }) {
  const [step, setStep] = useState(0)
  const [rect, setRect] = useState(null)

  useEffect(() => {
    if (isOpen) setStep(0)
    else setRect(null)
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return

    const stepDef = STEPS[step]

    function updateRect() {
      const el = document.querySelector(stepDef.selector)
      setRect(el ? el.getBoundingClientRect() : null)
    }

    const el = document.querySelector(stepDef.selector)
    if (el) {
      const pos = getComputedStyle(el).position
      if (pos !== 'fixed' && pos !== 'sticky') {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }

    requestAnimationFrame(updateRect)

    window.addEventListener('resize', updateRect)
    window.addEventListener('scroll', updateRect, { passive: true })
    return () => {
      window.removeEventListener('resize', updateRect)
      window.removeEventListener('scroll', updateRect)
    }
  }, [isOpen, step])

  // Auto-advance when user taps the spotlighted element on action steps
  useEffect(() => {
    if (!isOpen || !STEPS[step]?.action) return
    const el = document.querySelector(STEPS[step].selector)
    if (!el) return

    let done = false
    function onAction() {
      if (done) return
      done = true
      setTimeout(() => setStep(s => s + 1), 350)
    }
    el.addEventListener('click', onAction)
    return () => el.removeEventListener('click', onAction)
  }, [isOpen, step])

  function advance() {
    if (step >= STEPS.length - 1) close()
    else setStep(s => s + 1)
  }

  function close() {
    localStorage.setItem('kcc_seen_intro', '1')
    onClose()
  }

  if (!isOpen) return null

  const stepDef = STEPS[step]
  const isLast = step === STEPS.length - 1
  const isAction = stepDef.action

  const spotlightStyle = rect
    ? {
        left: rect.left - PAD,
        top: rect.top - PAD,
        width: rect.width + PAD * 2,
        height: rect.height + PAD * 2,
      }
    : { opacity: 0, pointerEvents: 'none' }

  // Position tooltip below spotlight, above if too close to bottom
  let tooltipStyle = { opacity: 0 }
  if (rect) {
    const TW = 280
    const M = 12
    const left = Math.max(M, Math.min(rect.left + rect.width / 2 - TW / 2, window.innerWidth - TW - M))
    const spaceBelow = window.innerHeight - (rect.bottom + PAD + M)
    tooltipStyle = spaceBelow >= 150
      ? { left, top: rect.bottom + PAD + M, opacity: 1 }
      : { left, bottom: window.innerHeight - rect.top + PAD + M, opacity: 1 }
  }

  return (
    <>
      <div className="wt-spotlight" style={spotlightStyle} />
      {rect && (
        <div className="wt-tooltip" style={tooltipStyle} role="dialog" aria-label={`Walkthrough step ${step + 1} of ${STEPS.length}`}>
          <div className="wt-tooltip__meta">
            <span className="wt-tooltip__counter">{step + 1} / {STEPS.length}</span>
            <button className="wt-skip" onClick={close}>Skip</button>
          </div>
          <p className="wt-tooltip__text">{stepDef.text}</p>
          {isAction && (
            <p className="wt-tooltip__hint">Tap the highlighted element to continue</p>
          )}
          {(!isAction || isLast) && (
            <div className="wt-tooltip__footer">
              <button className="wt-next" onClick={advance}>
                {isLast ? 'Done' : 'Next →'}
              </button>
            </div>
          )}
        </div>
      )}
    </>
  )
}
