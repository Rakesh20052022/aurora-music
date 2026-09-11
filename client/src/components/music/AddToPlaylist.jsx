import { useState } from "react"
import { Modal } from "../ui/Modal.jsx"
import { Icon } from "../Icon.jsx"
import { useLibrary } from "../../context/LibraryContext.jsx"
import { playlistsApi } from "../../services/endpoints.js"
import "../../pages/pages.css"

export function AddToPlaylist({ song, onClose }) {
  const { playlists, createPlaylist, refreshPlaylists } = useLibrary()
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState("")
  const [status, setStatus] = useState("")
  const [busyId, setBusyId] = useState(null)

  const addTo = async (playlist) => {
    setBusyId(playlist._id)
    setStatus("")
    try {
      await playlistsApi.addSong(playlist._id, song._id)
      setStatus(`Added to "${playlist.name}"`)
      setTimeout(onClose, 700)
    } catch (err) {
      setStatus(err.message || "Could not add song")
    } finally {
      setBusyId(null)
    }
  }

  const onCreate = async (e) => {
    e.preventDefault()
    if (!newName.trim()) return
    const fd = new FormData()
    fd.append("name", newName.trim())
    const playlist = await createPlaylist(fd)
    await playlistsApi.addSong(playlist._id, song._id)
    await refreshPlaylists()
    setStatus(`Created "${playlist.name}" and added the song`)
    setTimeout(onClose, 800)
  }

  return (
    <Modal title="Add to playlist" onClose={onClose}>
      <p style={{ color: "var(--text-muted)", marginBottom: 16, fontSize: "0.9rem" }}>
        Adding <strong style={{ color: "var(--text)" }}>{song.title}</strong>
      </p>

      {status && (
        <p style={{ color: "var(--accent)", marginBottom: 12, fontSize: "0.88rem" }}>{status}</p>
      )}

      {creating ? (
        <form onSubmit={onCreate}>
          <div className="field">
            <label htmlFor="pl-name">New playlist name</label>
            <input
              id="pl-name"
              className="input"
              value={newName}
              autoFocus
              onChange={(e) => setNewName(e.target.value)}
            />
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button type="submit" className="btn btn-primary btn-block">
              Create & add
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => setCreating(false)}>
              Back
            </button>
          </div>
        </form>
      ) : (
        <>
          <button className="btn btn-ghost btn-block" onClick={() => setCreating(true)} style={{ marginBottom: 14 }}>
            <Icon name="plus" size={18} /> New playlist
          </button>
          <div className="playlist-pick">
            {playlists.length === 0 && (
              <p style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>
                You have no playlists yet. Create one above.
              </p>
            )}
            {playlists.map((p) => (
              <button key={p._id} onClick={() => addTo(p)} disabled={busyId === p._id}>
                <Icon name="music" size={18} />
                {p.name}
              </button>
            ))}
          </div>
        </>
      )}
    </Modal>
  )
}
