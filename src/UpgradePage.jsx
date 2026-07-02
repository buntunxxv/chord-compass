import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { logEvent } from './analytics/events'
import { useTheme } from './hooks/useTheme'
import ThemeToggle from './components/ThemeToggle'
import './UpgradePage.css'

export default function UpgradePage() {
  const { preference: themePreference, setPreference: setThemePreference } = useTheme()

  useEffect(() => {
    logEvent('upgrade_page_view')
  }, [])

  return (
    <div className="upgrade-page">
      <header className="upgrade-page__header">
        <div className="upgrade-page__header-inner">
          <div className="upgrade-page__logo">
            <a href="https://www.kyndalearning.co.uk">
              <img src="/kynda-logo-full.png" alt="Kynda Learning" />
            </a>
          </div>
          <div className="upgrade-page__header-tool">
            <div className="upgrade-page__header-divider" />
            <span className="upgrade-page__header-tool-name">Chord Compass</span>
            <ThemeToggle preference={themePreference} onChange={setThemePreference} />
          </div>
        </div>
      </header>

      <main className="upgrade-page__main">
        <div className="upgrade-page__hero">
          <h1 className="upgrade-page__title">Chord Compass Pro</h1>
          <p className="upgrade-page__subtitle">More directions. More movement. More song.</p>
        </div>

        <div className="upgrade-page__plans">
          <div className="upgrade-page__plan upgrade-page__plan--highlight">
            <div className="upgrade-page__plan-badge">Founder Access</div>
            <div className="upgrade-page__plan-price">
              <span className="upgrade-page__plan-amount">£9–£19</span>
            </div>
            <p className="upgrade-page__plan-note">One-time payment — final price TBD</p>
            <p className="upgrade-page__plan-blurb">You're backing the build, not paying for a finished product.</p>
            <button className="upgrade-page__cta-btn" disabled>
              Coming soon
            </button>
          </div>
        </div>

        <ul className="upgrade-page__features">
          <li>5 next-chord suggestions per chord</li>
          <li>Extended chord types — 9th, 11th, 13th, altered</li>
          <li>Slash chords and inversions</li>
          <li>Longer progressions — no 4-chord limit</li>
          <li>Save and export progressions</li>
          <li>Multiple piano voicings</li>
          <li>"Explain this like I'm writing a song" mode</li>
        </ul>

        <Link to="/" className="upgrade-page__back">← Back to Chord Compass</Link>
      </main>
    </div>
  )
}
