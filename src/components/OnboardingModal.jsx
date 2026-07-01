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
        </div>
        <div className="om-body">
          <div className="om-item">
            <span className="om-label">Root</span>
            <p className="om-text">The starting note your chord is built on — try C, F♯, or B♭.</p>
          </div>
          <div className="om-item">
            <span className="om-label">Quality</span>
            <p className="om-text">Major sounds bright, minor sounds moody — quality shapes the emotion.</p>
          </div>
          <div className="om-item">
            <span className="om-label">Hear →</span>
            <p className="om-text">Tap any suggested chord to preview how it flows from the one you're on.</p>
          </div>
        </div>
        <div className="om-footer">
          <button className="om-dismiss" onClick={handleDismiss}>Got it, let's go</button>
        </div>
      </div>
    </div>
  )
}
