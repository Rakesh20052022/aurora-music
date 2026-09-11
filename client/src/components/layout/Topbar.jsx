import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Icon } from "../Icon.jsx"
import { useAuth } from "../../context/AuthContext.jsx"

export function Topbar({ onOpenMenu }) {
  const [q, setQ] = useState("")
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  const onSubmit = (e) => {
    e.preventDefault()
    if (q.trim()) navigate(`/search?q=${encodeURIComponent(q.trim())}`)
  }

  return (
    <header className="topbar">
      <button className="mobile-menu-btn" onClick={onOpenMenu} aria-label="Open menu">
        <Icon name="menu" />
      </button>

      <form className="topbar-search" onSubmit={onSubmit} role="search">
        <Icon name="search" size={18} />
        <input
          type="search"
          placeholder="Search songs, artists, albums"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Search"
        />
      </form>

      <div className="topbar-spacer" />

      <div className="topbar-actions" style={{ position: "relative" }}>
        <button className="avatar-btn" onClick={() => setMenuOpen((v) => !v)} aria-haspopup="menu">
          <span className="avatar">{(user?.name || "?").charAt(0).toUpperCase()}</span>
          <span style={{ fontSize: "0.9rem", fontWeight: 500 }}>{user?.name}</span>
        </button>

        {menuOpen && (
          <div
            role="menu"
            onMouseLeave={() => setMenuOpen(false)}
            style={{
              position: "absolute",
              top: "calc(100% + 8px)",
              right: 0,
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-sm)",
              minWidth: 180,
              padding: 6,
              zIndex: 40,
              boxShadow: "0 12px 30px rgba(0,0,0,0.4)",
            }}
          >
            <button
              className="nav-item"
              style={{ width: "100%" }}
              onClick={() => {
                setMenuOpen(false)
                navigate("/profile")
              }}
            >
              <Icon name="user" size={18} /> Profile
            </button>
            <button
              className="nav-item"
              style={{ width: "100%", color: "var(--danger)" }}
              onClick={logout}
            >
              <Icon name="logout" size={18} /> Log out
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
