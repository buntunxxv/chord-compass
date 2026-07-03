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
          <h2 className="om-title" id="om-title">Find your next chord.</h2>
        </div>
        <div className="om-body">
          <p className="om-text">Chord Compass helps you explore where your song could go next.</p>
          <p className="om-text">Choose a starting chord, then follow different musical directions — smooth, emotional, dark, bright, tense, or surprising.</p>
          <p className="om-text">There is no single correct answer. Listen, compare, and choose the chord that fits your song.</p>
        </div>
        <div className="om-footer">
          <button className="om-dismiss" onClick={handleDismiss}>Start exploring</button>
        </div>
      </div>
    </div>
  )
}
