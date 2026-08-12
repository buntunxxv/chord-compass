import './LearnPath.css'

export default function LearnPath({ onBackToBuild }) {
  return (
    <div className="learn-path">
      <div className="learn-path__inner">
        <p className="learn-path__message">
          Learn mode is coming soon — switch back to Build to keep using Chord Compass.
        </p>
        <button type="button" className="learn-path__back-btn" onClick={onBackToBuild}>
          Back to Build
        </button>
      </div>
    </div>
  )
}
