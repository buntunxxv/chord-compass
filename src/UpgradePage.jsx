import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { logEvent } from './analytics/events'
import { useTheme } from './hooks/useTheme'
import ThemeToggle from './components/ThemeToggle'
import './UpgradePage.css'

// The Stripe payment link for Founder Access (GBP 9, one-time). It is the
// same link api/stripe-webhook.js gates on: only checkout sessions whose
// payment_link is plink_1TtvPlLfFLqligjkwk3HdZKE grant an entitlement, so
// this URL and that ID have to stay a matched pair. Sending buyers anywhere
// else takes their money and unlocks nothing.
const CHECKOUT_URL = 'https://buy.stripe.com/14A7sMgxD0qLaWm1wgbAs0o'

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
            {/* A link, not a button: this navigates to Stripe's hosted
                checkout rather than doing anything in the app. New tab so
                this page stays open behind it -- unlocking Pro means coming
                back here and entering the purchase email, and a same-tab
                checkout would leave the buyer with nowhere obvious to
                return to. */}
            <a
              className="upgrade-page__cta-btn"
              href={CHECKOUT_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => logEvent('upgrade_checkout_click')}
            >
              Back the build — £9
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
            {/* Stripe's own confirmation screen says to check your email,
                but the unlock actually happens below, in this app. Without
                this line a buyer pays and then waits for something that
                never arrives. */}
            <p className="upgrade-page__plan-after">
              Then come back to this page and unlock with the email you paid with.
            </p>
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
            <div className="upgrade-page__unlock-success" role="status">
              Pro unlocked — welcome aboard. <Link to="/">Go back to the app →</Link>
            </div>
          ) : (
            <form className="upgrade-page__unlock-form" onSubmit={handleUnlock}>
              <label htmlFor="upgrade-unlock-email" className="upgrade-page__unlock-label">
                Email
              </label>
              <input
                id="upgrade-unlock-email"
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
              {/* Same role="status" pattern ProgressionStrip's save/export
                  toasts use -- announced to screen readers rather than only
                  a silent visual change. */}
              {unlockState === 'error' && (
                <p className="upgrade-page__unlock-error" role="status">
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
