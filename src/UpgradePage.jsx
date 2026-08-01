import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { logEvent } from './analytics/events'
import { useTheme } from './hooks/useTheme'
import ThemeToggle from './components/ThemeToggle'
import './UpgradePage.css'

export default function UpgradePage() {
  const { preference: themePreference, resolvedTheme, setPreference: setThemePreference } = useTheme()
  const [unlockEmail, setUnlockEmail] = useState('')
  const [unlockState, setUnlockState] = useState('idle') // idle | loading | success | error

  useEffect(() => {
    logEvent('upgrade_page_view')
  }, [])

  async function handleUnlock(e) {
    e.preventDefault()
    if (!unlockEmail.trim() || unlockState === 'loading') return
    setUnlockState('loading')
    try {
      const res = await fetch('/api/check-entitlement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: unlockEmail.trim() }),
      })
      const data = await res.json()
      if (data.isPro) {
        localStorage.setItem('kcc_tier', 'pro')
        setUnlockState('success')
        logEvent('pro_unlock_success')
      } else {
        setUnlockState('error')
        logEvent('pro_unlock_not_found')
      }
    } catch {
      setUnlockState('error')
    }
  }

  return (
    <div className="upgrade-page">
      <header className="upgrade-page__header">
        <div className="upgrade-page__header-inner">
          <div className="upgrade-page__logo">
            <a href="https://www.kyndalearning.co.uk">
              <img src={resolvedTheme === 'dark' ? '/kynda-logo-white.png' : '/kynda-logo-full.png'} alt="Kynda Learning" />
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
              <span className="upgrade-page__plan-amount">£9</span>
            </div>
            <p className="upgrade-page__plan-note">One-time payment — £9</p>
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

        <div className="upgrade-page__unlock">
          <h2 className="upgrade-page__unlock-title">Already backed the project?</h2>
          <p className="upgrade-page__unlock-hint">Enter the email you used at checkout to unlock Pro features.</p>
          {unlockState === 'success' ? (
            <div className="upgrade-page__unlock-success">
              Pro unlocked — welcome aboard. <Link to="/">Go back to the app →</Link>
            </div>
          ) : (
            <form className="upgrade-page__unlock-form" onSubmit={handleUnlock}>
              <input
                className="upgrade-page__unlock-input"
                type="email"
                placeholder="you@example.com"
                value={unlockEmail}
                onChange={e => { setUnlockEmail(e.target.value); if (unlockState === 'error') setUnlockState('idle') }}
                required
                autoComplete="email"
              />
              <button
                className="upgrade-page__unlock-btn"
                type="submit"
                disabled={unlockState === 'loading'}
              >
                {unlockState === 'loading' ? 'Checking…' : 'Unlock Pro'}
              </button>
              {unlockState === 'error' && (
                <p className="upgrade-page__unlock-error">
                  We couldn't find that email — check for typos, or wait a few minutes after payment and try again.
                </p>
              )}
            </form>
          )}
        </div>

        <Link to="/" className="upgrade-page__back">← Back to Chord Compass</Link>
      </main>
    </div>
  )
}
