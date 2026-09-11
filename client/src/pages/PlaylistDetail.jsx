import { useEffect, useState, useCallback } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { playlistsApi } from "../services/endpoints.js"
import { usePlayer } from "../context/PlayerContext.jsx"
import { useLibrary } from "../context/LibraryContext.jsx"
import { mediaUrl } from "../services/api.js"
import { SongList } from "../components/music/SongList.jsx"
import { Loader, EmptyState } from "../components/ui/Feedback.jsx"
import { Modal } from "../components/ui/Modal.jsx"
import { Icon } from "../components/Icon.jsx"
import { formatDuration } from "../utils/format.js"
import "./pages.css"

export default function PlaylistDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { playQueue } = usePlayer()
  const { refreshPlaylists, deletePlaylist } = useLibrary()
  const [playlist, setPlaylist] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ name: "", description: "" })

  const load = useCallback(async () => {
    const { data } = await playlistsApi.get(id)
    setPlaylist(data)
    setForm({ name: data.name, description: data.description || "" })
  }, [id])

  useEffect(() => {
    let active = true
    setLoading(true)
    load()
      .catch(() => active && setPlaylist(null))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [load])

  const removeSong = async (song) => {
    await playlistsApi.removeSong(id, song._id)
    await load()
  }

  const onSaveEdit = async (e) => {
    e.preventDefault()
    const fd = new FormData()
    fd.append("name", form.name)
    fd.append("description", form.description)
    await playlistsApi.update(id, fd)
    await load()
    await refreshPlaylists()
    setEditing(false)
  }

  const onDelete = async () => {
    if (!confirm("Delete this playlist? This cannot be undone.")) return
    await deletePlaylist(id)
    navigate("/library")
  }

  if (loading) return <Loader />
  if (!playlist) return <EmptyState icon="library" title="Playlist not found" />

  const songs = playlist.songs || []
  const totalSeconds = songs.reduce((sum, s) => sum + (s.duration || 0), 0)

  return (
    <div className="page fade-in">
      <div className="detail-head">
        {playlist.coverUrl ? (
          <img className="detail-art" src={mediaUrl(playlist.coverUrl) || "/placeholder.svg"} alt="" />
        ) : (
          <span className="detail-art">
            <Icon name="library" size={64} />
          </span>
        )}
        <div>
          <span className="detail-kind">Playlist</span>
          <h1 className="detail-title">{playlist.name}</h1>
          {playlist.description && <p style={{ color: "var(--text-muted)" }}>{playlist.description}</p>}
          <div className="detail-meta">
            <span>{songs.length} songs</span>
            {totalSeconds > 0 && (
              <>
                <span>•</span>
                <span>{formatDuration(totalSeconds)}</span>
              </>
            )}
          </div>
          <div className="detail-actions">
            <button
              className="play-fab"
              onClick={() => playQueue(songs, 0)}
              disabled={songs.length === 0}
              aria-label="Play playlist"
            >
              <Icon name="play" size={24} />
            </button>
            <button className="btn btn-ghost" onClick={() => setEditing(true)}>
              <Icon name="edit" size={18} /> Edit
            </button>
            <button className="btn btn-danger" onClick={onDelete}>
              <Icon name="trash" size={18} /> Delete
            </button>
          </div>
        </div>
      </div>

      {songs.length === 0 ? (
        <EmptyState
          icon="music"
          title="This playlist is empty"
          message="Find songs across Aurora and use the menu to add them here."
        />
      ) : (
        <SongList songs={songs} onRemove={removeSong} />
      )}

      {editing && (
        <Modal title="Edit playlist" onClose={() => setEditing(false)}>
          <form onSubmit={onSaveEdit}>
            <div className="field">
              <label htmlFor="e-name">Name</label>
              <input
                id="e-name"
                className="input"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="field">
              <label htmlFor="e-desc">Description</label>
              <textarea
                id="e-desc"
                className="textarea"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <button className="btn btn-primary btn-block" type="submit">
              Save changes
            </button>
          </form>
        </Modal>
      )}
    </div>
  )
}
