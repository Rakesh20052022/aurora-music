import { Icon } from "../../components/Icon.jsx"

export function AuthVisual() {
  return (
    <div className="auth-visual">
      <div className="auth-brand">
        <span className="brand-mark">
          <Icon name="music" size={22} />
        </span>
        Aurora
      </div>

      <div className="auth-tagline">
        <h1 className="text-balance">Your sound, streaming beautifully.</h1>
        <p className="text-pretty">
          Build playlists, follow artists, and pick up exactly where you left off — Aurora keeps your
          whole library in sync.
        </p>
      </div>

      <div className="auth-stats">
        <div className="auth-stat">
          <b className="gradient-text">Unlimited</b>
          <span>playlists</span>
        </div>
        <div className="auth-stat">
          <b className="gradient-text">Lossless</b>
          <span>playback queue</span>
        </div>
        <div className="auth-stat">
          <b className="gradient-text">Anywhere</b>
          <span>synced sessions</span>
        </div>
      </div>
    </div>
  )
}
