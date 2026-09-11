import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useLibrary } from "../context/LibraryContext.jsx"
import { MediaCard } from "../components/music/MediaCard.jsx"
import { Modal } from "../components/ui/Modal.jsx"
import { EmptyState } from "../components/ui/Feedback.jsx"
import { Icon } from "../components/Icon.jsx"
import "./pages.css"
import "../components/ui/ui.css"

export default function Library() {
  const { playlists, createPlaylist } = useLibrary()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ name: "", description: "" })
  const [cover, setCover] = useState(null)
  const [busy, setBusy] = useState(false)

  const onCreate = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    setBusy(true)
    try {
      const fd = new FormData()
      fd.append("name", form.name.trim())
      fd.append("description", form.description)
      if (cover) fd.append("cover", cover)
      const playlist = await createPlaylist(fd)
      setOpen(false)
      setForm({ name: "", description: "" })
      setCover(null)
      navigate(`/playlists/${playlist._id}`)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="page fade-in">
      <div className="page-head">
        <div>
          <h1>Your Library</h1>
          <p>Playlists you have created.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setOpen(true)}>
          <Icon name="plus" size={18} /> New playlist
        </button>
      </div>

      {playlists.length === 0 ? (
        <EmptyState
          icon="library"
          title="Your library is empty"
          message="Create your first playlist to start organizing your music."
          action={
            <button className="btn btn-primary" onClick={() => setOpen(true)}>
              <Icon name="plus" size={18} /> Create playlist
            </button>
          }
        />
      ) : (
        <div className="media-grid">
          {playlists.map((p) => (
            <MediaCard
              key={p._id}
              to={`/playlists/${p._id}`}
              image={p.coverUrl}
              title={p.name}
              subtitle={`${p.songs?.length || 0} songs`}
            />
          ))}
        </div>
      )}

      {open && (
        <Modal title="Create playlist" onClose={() => setOpen(false)}>
          <form onSubmit={onCreate}>
            <div className="field">
              <label htmlFor="name">Name</label>
              <input
                id="name"
                className="input"
                value={form.name}
                autoFocus
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="field">
              <label htmlFor="desc">Description (optional)</label>
              <textarea
                id="desc"
                className="textarea"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div className="field">
              <label htmlFor="cover">Cover image (optional)</label>
              <label className="file-drop" htmlFor="cover">
                {cover ? cover.name : "Click to choose an image"}
              </label>
              <input
                id="cover"
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => setCover(e.target.files?.[0] || null)}
              />
            </div>
            <button className="btn btn-primary btn-block" type="submit" disabled={busy}>
              {busy ? "Creating…" : "Create playlist"}
            </button>
          </form>
        </Modal>
      )}
    </div>
  )
}
