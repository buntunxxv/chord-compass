import './OnboardingModal.css'

export default function OnboardingModal({ isOpen, onClose }) {
  function handleDismiss() {
    localStorage.setItem('kcc_seen_intro', '1')
    onClose()
  }

  return (
    <div
      className={`om-backdrop${isOpen ? ' om-backdrop--open' : ''}`}
      onClick={handleDismiss}
      aria-hidden={!isOpen}
    >
      <div
        className="om-card"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal={isOpen}
        aria-labelledby="om-title"
      >
        <div className="om-header">
          <h2 className="om-title" id="om-title">Welcome to Chord Compass</h2>
          <p className="om-subtitle">Build chord progressions by ear — no theory knowledge needed.</p>
        </div>
        <div className="om-body">
          <div className="om-item">
            <span className="om-label">1 · Pick your chord</span>
            <p className="om-text">Choose a Root note and Quality. The piano lights up to show you exactly which notes are in that chord.</p>
          </div>
          <div className="om-item">
            <span className="om-label">2 · See where it can go</span>
            <p className="om-text">Scroll down to "Where could this chord go?" — these are chords that naturally follow yours, drawn from real music theory.</p>
          </div>
          <div className="om-item">
            <span className="om-label">3 · Hear the transition</span>
            <p className="om-text">Tap <strong>Hear →</strong> on any suggestion to hear your chord move into it. Add the ones you like to build a progression at the bottom.</p>
          </div>
        </div>
        <div className="om-footer">
          <button className="om-dismiss" onClick={handleDismiss}>Got it, let's explore</button>
        </div>
      </div>
    </div>
  )
}
