import { useState } from "react"
import { useAuth } from "../context/AuthContext.jsx"
import { useLibrary } from "../context/LibraryContext.jsx"
import { usersApi } from "../services/endpoints.js"
import { Icon } from "../components/Icon.jsx"
import "./pages.css"
import "../components/ui/ui.css"

export default function Profile() {
  const { user, setUser, logout } = useAuth()
  const { playlists, likedIds } = useLibrary()
  const [name, setName] = useState(user?.name || "")
  const [status, setStatus] = useState("")
  const [busy, setBusy] = useState(false)

  const onSave = async (e) => {
    e.preventDefault()
    setBusy(true)
    setStatus("")
    try {
      const { user: updated } = await usersApi.updateProfile({ name })
      setUser(updated)
      setStatus("Profile updated")
    } catch (err) {
      setStatus(err.message || "Could not update profile")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="page fade-in" style={{ maxWidth: 720 }}>
      <div className="detail-head">
        <span className="detail-art rounded" style={{ fontSize: "3rem" }}>
          {(user?.name || "?").charAt(0).toUpperCase()}
        </span>
        <div>
          <span className="detail-kind">Profile</span>
          <h1 className="detail-title">{user?.name}</h1>
          <div className="detail-meta">
            <span>{user?.email}</span>
            {user?.role === "admin" && <span className="chip">Admin</span>}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 16, marginBottom: 32, flexWrap: "wrap" }}>
        <div className="chip">
          <Icon name="library" size={16} /> {playlists.length} playlists
        </div>
        <div className="chip">
          <Icon name="heart" size={16} /> {likedIds.size} liked songs
        </div>
      </div>

      <section className="section" style={{ maxWidth: 440 }}>
        <div className="section-head">
          <h2>Account settings</h2>
        </div>
        <form onSubmit={onSave}>
          <div className="field">
            <label htmlFor="name">Display name</label>
            <input id="name" className="input" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" className="input" value={user?.email || ""} disabled />
          </div>
          {status && <p style={{ color: "var(--accent)", marginBottom: 12, fontSize: "0.88rem" }}>{status}</p>}
          <div style={{ display: "flex", gap: 12 }}>
            <button className="btn btn-primary" type="submit" disabled={busy}>
              {busy ? "Saving…" : "Save changes"}
            </button>
            <button type="button" className="btn btn-danger" onClick={logout}>
              <Icon name="logout" size={18} /> Log out
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
