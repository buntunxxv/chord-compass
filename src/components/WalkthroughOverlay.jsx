import { useState, useEffect } from 'react'
import './WalkthroughOverlay.css'

const PAD = 6

// The core loop, one step per beat -- pick a chord, hear it, see a
// suggestion, add it to a progression. Trimmed from 8 steps down to these
// 4: the old version also spent a step each narrating the chord-output
// display, the piano diagram, and the progression strip without asking for
// any interaction, which just delayed getting to the first real action.
const STEPS = [
  {
    selector: '#wt-root',
    text: 'Pick a Root and Quality to build your chord.',
    action: false,
  },
  {
    selector: '#wt-play-btn',
    text: 'Tap Play Chord to hear how it sounds.',
    action: true,
  },
  {
    selector: '#wt-next-chords',
    text: 'These suggestion cards show where your song could go next.',
    action: false,
  },
  {
    selector: '#wt-add-btn',
    text: 'Add the current chord to start building a progression. Tap it now to try.',
    action: true,
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
      // advance() (not a raw setStep(s => s + 1)) so clicking the
      // spotlighted element on the FINAL step closes the walkthrough
      // instead of pushing step past the end of STEPS -- the last step is
      // itself action-gated now (Add to progression), which the original
      // 8-step version never had to handle since its last step was always
      // a plain narration screen.
      setTimeout(() => advance(), 350)
    }
    el.addEventListener('click', onAction)
    return () => el.removeEventListener('click', onAction)
  }, [isOpen, step])

  function advance() {
    if (step >= STEPS.length - 1) close()
    else setStep(s => s + 1)
  }

  function close() {
    localStorage.setItem('kcc_seen_intro_v2', '1')
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
