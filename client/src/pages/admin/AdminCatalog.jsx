import { useCallback, useEffect, useState } from "react"
import { Icon } from "../../components/Icon.jsx"
import { Modal } from "../../components/ui/Modal.jsx"
import { Loader, EmptyState, ErrorText } from "../../components/ui/Feedback.jsx"
import { mediaUrl } from "../../services/api.js"
import { songsApi, albumsApi, artistsApi } from "../../services/endpoints.js"
import { formatDuration } from "../../utils/format.js"
import "../pages.css"
import "./admin.css"

const TABS = [
  { key: "songs", label: "Songs", icon: "music" },
  { key: "albums", label: "Albums", icon: "disc" },
  { key: "artists", label: "Artists", icon: "user" },
]

export default function AdminCatalog() {
  const [tab, setTab] = useState("songs")

  const [songs, setSongs] = useState([])
  const [songPagination, setSongPagination] = useState({ page: 1, pages: 1, total: 0 })
  const [albums, setAlbums] = useState([])
  const [artists, setArtists] = useState([])

  const [loading, setLoading] = useState(true)
  const [banner, setBanner] = useState("")
  const [modal, setModal] = useState(null) // { kind: "song" | "album" | "artist", item: object | null }

  const loadArtists = useCallback(async () => {
    const res = await artistsApi.list()
    setArtists(res.data)
    return res.data
  }, [])

  const loadAlbums = useCallback(async () => {
    const res = await albumsApi.list()
    setAlbums(res.data)
    return res.data
  }, [])

  const loadSongs = useCallback(async (page = 1) => {
    const res = await songsApi.list({ page, limit: 20, sort: "newest" })
    setSongs(res.data)
    setSongPagination(res.pagination)
    return res.data
  }, [])

  useEffect(() => {
    let active = true
    setLoading(true)
    Promise.all([loadArtists(), loadAlbums(), loadSongs(1)])
      .catch((err) => active && setBanner(err.message || "Could not load the catalog"))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [loadArtists, loadAlbums, loadSongs])

  const closeModal = () => setModal(null)

  const onSaved = async () => {
    setBanner("")
    closeModal()
    try {
      if (modal?.kind === "song") await loadSongs(songPagination.page)
      if (modal?.kind === "album") await Promise.all([loadAlbums(), loadSongs(songPagination.page)])
      if (modal?.kind === "artist") await Promise.all([loadArtists(), loadAlbums()])
    } catch {
      // lists will simply show stale data until the next successful fetch
    }
  }

  const onDeleteSong = async (song) => {
    if (!confirm(`Delete "${song.title}"? This cannot be undone.`)) return
    setBanner("")
    try {
      await songsApi.remove(song._id)
      await loadSongs(songPagination.page)
    } catch (err) {
      setBanner(err.message || "Could not delete song")
    }
  }

  const onDeleteAlbum = async (album) => {
    if (!confirm(`Delete "${album.title}"? Songs on this album will be kept but unlinked.`)) return
    setBanner("")
    try {
      await albumsApi.remove(album._id)
      await Promise.all([loadAlbums(), loadSongs(songPagination.page)])
    } catch (err) {
      setBanner(err.message || "Could not delete album")
    }
  }

  const onDeleteArtist = async (artist) => {
    if (!confirm(`Delete "${artist.name}"? This only works if they have no songs left.`)) return
    setBanner("")
    try {
      await artistsApi.remove(artist._id)
      await loadArtists()
    } catch (err) {
      setBanner(err.message || "Could not delete artist")
    }
  }

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Manage catalog</h1>
          <p>Add, edit, and remove songs, albums, and artists.</p>
        </div>
      </div>

      <div className="pill-row">
        {TABS.map((t) => (
          <button key={t.key} className={`pill ${tab === t.key ? "active" : ""}`} onClick={() => setTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {banner && (
        <div className="admin-banner">
          <Icon name="close" size={16} />
          <span>{banner}</span>
          <button onClick={() => setBanner("")} aria-label="Dismiss">
            <Icon name="close" size={14} />
          </button>
        </div>
      )}

      {loading ? (
        <Loader label="Loading catalog" />
      ) : (
        <>
          {tab === "songs" && (
            <SongsPanel
              songs={songs}
              pagination={songPagination}
              onPage={loadSongs}
              onAdd={() => setModal({ kind: "song", item: null })}
              onEdit={(song) => setModal({ kind: "song", item: song })}
              onDelete={onDeleteSong}
            />
          )}
          {tab === "albums" && (
            <AlbumsPanel
              albums={albums}
              onAdd={() => setModal({ kind: "album", item: null })}
              onEdit={(album) => setModal({ kind: "album", item: album })}
              onDelete={onDeleteAlbum}
            />
          )}
          {tab === "artists" && (
            <ArtistsPanel
              artists={artists}
              onAdd={() => setModal({ kind: "artist", item: null })}
              onEdit={(artist) => setModal({ kind: "artist", item: artist })}
              onDelete={onDeleteArtist}
            />
          )}
        </>
      )}

      {modal?.kind === "song" && (
        <SongFormModal item={modal.item} artists={artists} albums={albums} onClose={closeModal} onSaved={onSaved} />
      )}
      {modal?.kind === "album" && (
        <AlbumFormModal item={modal.item} artists={artists} onClose={closeModal} onSaved={onSaved} />
      )}
      {modal?.kind === "artist" && <ArtistFormModal item={modal.item} onClose={closeModal} onSaved={onSaved} />}
    </div>
  )
}

/* ---------------------------------- Songs ---------------------------------- */

function SongsPanel({ songs, pagination, onPage, onAdd, onEdit, onDelete }) {
  return (
    <div className="section">
      <div className="admin-toolbar">
        <div>
          <h2 style={{ fontSize: "1.1rem" }}>Songs</h2>
          <p className="admin-count">{pagination.total} total</p>
        </div>
        <button className="btn btn-primary" onClick={onAdd}>
          <Icon name="plus" size={16} /> Add song
        </button>
      </div>

      {songs.length === 0 ? (
        <EmptyState
          icon="music"
          title="No songs yet"
          message="Upload your first track to get the catalog started."
          action={
            <button className="btn btn-primary" onClick={onAdd}>
              <Icon name="plus" size={16} /> Add song
            </button>
          }
        />
      ) : (
        <>
          <div className="admin-list-head">
            <span style={{ flex: "1 1 260px" }}>Title</span>
            <span className="admin-meta">Album</span>
            <span className="admin-meta">Duration</span>
            <span style={{ width: 76 }} />
          </div>
          <div className="admin-list">
            {songs.map((song) => (
              <div className="admin-row" key={song._id}>
                <div className="admin-main">
                  {song.coverUrl ? (
                    <img className="admin-thumb" src={mediaUrl(song.coverUrl) || "/placeholder.svg"} alt="" />
                  ) : (
                    <span className="admin-thumb">
                      <Icon name="music" size={18} />
                    </span>
                  )}
                  <div style={{ minWidth: 0 }}>
                    <div className="admin-title">{song.title}</div>
                    <div className="admin-sub">{song.artist?.name || "Unknown artist"}</div>
                  </div>
                </div>
                <div className="admin-meta">{song.album?.title || "—"}</div>
                <div className="admin-meta">{formatDuration(song.duration)}</div>
                <div className="admin-actions">
                  <button className="admin-icon-btn" onClick={() => onEdit(song)} aria-label="Edit song">
                    <Icon name="edit" size={16} />
                  </button>
                  <button className="admin-icon-btn danger" onClick={() => onDelete(song)} aria-label="Delete song">
                    <Icon name="trash" size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {pagination.pages > 1 && (
            <div className="admin-pagination">
              <button
                className="btn btn-ghost"
                disabled={pagination.page <= 1}
                onClick={() => onPage(pagination.page - 1)}
              >
                Previous
              </button>
              <span>
                Page {pagination.page} of {pagination.pages}
              </span>
              <button
                className="btn btn-ghost"
                disabled={pagination.page >= pagination.pages}
                onClick={() => onPage(pagination.page + 1)}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

/* ---------------------------------- Albums ---------------------------------- */

function AlbumsPanel({ albums, onAdd, onEdit, onDelete }) {
  return (
    <div className="section">
      <div className="admin-toolbar">
        <div>
          <h2 style={{ fontSize: "1.1rem" }}>Albums</h2>
          <p className="admin-count">{albums.length} total</p>
        </div>
        <button className="btn btn-primary" onClick={onAdd}>
          <Icon name="plus" size={16} /> Add album
        </button>
      </div>

      {albums.length === 0 ? (
        <EmptyState
          icon="disc"
          title="No albums yet"
          message="Create an album to group songs by an artist and release year."
          action={
            <button className="btn btn-primary" onClick={onAdd}>
              <Icon name="plus" size={16} /> Add album
            </button>
          }
        />
      ) : (
        <>
          <div className="admin-list-head">
            <span style={{ flex: "1 1 260px" }}>Title</span>
            <span className="admin-meta">Year</span>
            <span className="admin-meta">Songs</span>
            <span style={{ width: 76 }} />
          </div>
          <div className="admin-list">
            {albums.map((album) => (
              <div className="admin-row" key={album._id}>
                <div className="admin-main">
                  {album.coverUrl ? (
                    <img className="admin-thumb" src={mediaUrl(album.coverUrl) || "/placeholder.svg"} alt="" />
                  ) : (
                    <span className="admin-thumb">
                      <Icon name="disc" size={18} />
                    </span>
                  )}
                  <div style={{ minWidth: 0 }}>
                    <div className="admin-title">{album.title}</div>
                    <div className="admin-sub">{album.artist?.name || "Unknown artist"}</div>
                  </div>
                </div>
                <div className="admin-meta">{album.releaseYear || "—"}</div>
                <div className="admin-meta">{album.songs?.length ?? 0}</div>
                <div className="admin-actions">
                  <button className="admin-icon-btn" onClick={() => onEdit(album)} aria-label="Edit album">
                    <Icon name="edit" size={16} />
                  </button>
                  <button className="admin-icon-btn danger" onClick={() => onDelete(album)} aria-label="Delete album">
                    <Icon name="trash" size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

/* ---------------------------------- Artists ---------------------------------- */

function ArtistsPanel({ artists, onAdd, onEdit, onDelete }) {
  return (
    <div className="section">
      <div className="admin-toolbar">
        <div>
          <h2 style={{ fontSize: "1.1rem" }}>Artists</h2>
          <p className="admin-count">{artists.length} total</p>
        </div>
        <button className="btn btn-primary" onClick={onAdd}>
          <Icon name="plus" size={16} /> Add artist
        </button>
      </div>

      {artists.length === 0 ? (
        <EmptyState
          icon="user"
          title="No artists yet"
          message="Add an artist before uploading their songs or albums."
          action={
            <button className="btn btn-primary" onClick={onAdd}>
              <Icon name="plus" size={16} /> Add artist
            </button>
          }
        />
      ) : (
        <>
          <div className="admin-list-head">
            <span style={{ flex: "1 1 260px" }}>Name</span>
            <span className="admin-meta">Bio</span>
            <span style={{ width: 76 }} />
          </div>
          <div className="admin-list">
            {artists.map((artist) => (
              <div className="admin-row" key={artist._id}>
                <div className="admin-main">
                  {artist.image ? (
                    <img
                      className="admin-thumb rounded"
                      src={mediaUrl(artist.image) || "/placeholder.svg"}
                      alt=""
                    />
                  ) : (
                    <span className="admin-thumb rounded">
                      <Icon name="user" size={18} />
                    </span>
                  )}
                  <div style={{ minWidth: 0 }}>
                    <div className="admin-title">{artist.name}</div>
                  </div>
                </div>
                <div className="admin-meta">{artist.bio ? artist.bio : "—"}</div>
                <div className="admin-actions">
                  <button className="admin-icon-btn" onClick={() => onEdit(artist)} aria-label="Edit artist">
                    <Icon name="edit" size={16} />
                  </button>
                  <button
                    className="admin-icon-btn danger"
                    onClick={() => onDelete(artist)}
                    aria-label="Delete artist"
                  >
                    <Icon name="trash" size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

/* -------------------------------- Song form -------------------------------- */

function SongFormModal({ item, artists, albums, onClose, onSaved }) {
  const isEdit = Boolean(item)
  const [form, setForm] = useState({
    title: item?.title || "",
    artist: item?.artist?._id || "",
    album: item?.album?._id || "",
    genre: item?.genre || "",
    year: item?.year ?? "",
    duration: item?.duration ?? "",
    lyrics: item?.lyrics || "",
  })
  const [audioFile, setAudioFile] = useState(null)
  const [coverFile, setCoverFile] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")

  const filteredAlbums = form.artist ? albums.filter((a) => a.artist?._id === form.artist) : albums

  const set = (patch) => setForm((f) => ({ ...f, ...patch }))

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) return setError("Title is required")
    if (!form.artist) return setError("Please choose an artist")
    if (!isEdit && !audioFile) return setError("An audio file is required")

    setBusy(true)
    setError("")
    try {
      const fd = new FormData()
      fd.append("title", form.title.trim())
      fd.append("artist", form.artist)
      fd.append("album", form.album)
      fd.append("genre", form.genre)
      fd.append("year", form.year)
      fd.append("duration", form.duration)
      fd.append("lyrics", form.lyrics)
      if (audioFile) fd.append("audio", audioFile)
      if (coverFile) fd.append("cover", coverFile)

      if (isEdit) await songsApi.update(item._id, fd)
      else await songsApi.create(fd)
      onSaved()
    } catch (err) {
      setError(err.message || "Could not save song")
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal title={isEdit ? "Edit song" : "Add song"} onClose={onClose} wide>
      <form onSubmit={onSubmit}>
        <div className="field">
          <label htmlFor="s-title">Title</label>
          <input
            id="s-title"
            className="input"
            autoFocus
            value={form.title}
            onChange={(e) => set({ title: e.target.value })}
          />
        </div>

        <div className="admin-form-grid">
          <div className="field">
            <label htmlFor="s-artist">Artist</label>
            <select
              id="s-artist"
              className="select"
              value={form.artist}
              onChange={(e) => set({ artist: e.target.value, album: "" })}
            >
              <option value="">Select artist…</option>
              {artists.map((a) => (
                <option key={a._id} value={a._id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="s-album">Album (optional)</label>
            <select id="s-album" className="select" value={form.album} onChange={(e) => set({ album: e.target.value })}>
              <option value="">No album</option>
              {filteredAlbums.map((al) => (
                <option key={al._id} value={al._id}>
                  {al.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="admin-form-grid">
          <div className="field">
            <label htmlFor="s-genre">Genre (optional)</label>
            <input id="s-genre" className="input" value={form.genre} onChange={(e) => set({ genre: e.target.value })} />
          </div>
          <div className="field">
            <label htmlFor="s-year">Year (optional)</label>
            <input
              id="s-year"
              type="number"
              className="input"
              value={form.year}
              onChange={(e) => set({ year: e.target.value })}
            />
          </div>
        </div>

        <div className="field">
          <label htmlFor="s-duration">Duration in seconds (optional)</label>
          <input
            id="s-duration"
            type="number"
            min="0"
            className="input"
            value={form.duration}
            onChange={(e) => set({ duration: e.target.value })}
          />
        </div>

        <div className="field">
          <label htmlFor="s-lyrics">Lyrics (optional)</label>
          <textarea id="s-lyrics" className="textarea" value={form.lyrics} onChange={(e) => set({ lyrics: e.target.value })} />
        </div>

        <div className="admin-file-row">
          <div className="field">
            <label htmlFor="s-audio">{isEdit ? "Replace audio (optional)" : "Audio file"}</label>
            <label className="file-drop" htmlFor="s-audio">
              {audioFile ? audioFile.name : isEdit ? "Keep current audio" : "Click to choose a file"}
            </label>
            <input
              id="s-audio"
              type="file"
              accept="audio/*"
              hidden
              onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
            />
          </div>
          <div className="field">
            <label htmlFor="s-cover">Cover art (optional)</label>
            <label className="file-drop" htmlFor="s-cover">
              {coverFile ? coverFile.name : isEdit ? "Keep current cover" : "Click to choose an image"}
            </label>
            <input
              id="s-cover"
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
            />
          </div>
        </div>
        <p className="admin-hint">Leave cover art blank to use the album's cover, if one is set.</p>

        <ErrorText>{error}</ErrorText>

        <button className="btn btn-primary btn-block" type="submit" disabled={busy}>
          {busy ? "Saving…" : isEdit ? "Save changes" : "Add song"}
        </button>
      </form>
    </Modal>
  )
}

/* -------------------------------- Album form -------------------------------- */

function AlbumFormModal({ item, artists, onClose, onSaved }) {
  const isEdit = Boolean(item)
  const [form, setForm] = useState({
    title: item?.title || "",
    artist: item?.artist?._id || "",
    releaseYear: item?.releaseYear ?? "",
  })
  const [coverFile, setCoverFile] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")

  const set = (patch) => setForm((f) => ({ ...f, ...patch }))

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) return setError("Title is required")
    if (!form.artist) return setError("Please choose an artist")

    setBusy(true)
    setError("")
    try {
      const fd = new FormData()
      fd.append("title", form.title.trim())
      fd.append("artist", form.artist)
      fd.append("releaseYear", form.releaseYear)
      if (coverFile) fd.append("cover", coverFile)

      if (isEdit) await albumsApi.update(item._id, fd)
      else await albumsApi.create(fd)
      onSaved()
    } catch (err) {
      setError(err.message || "Could not save album")
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal title={isEdit ? "Edit album" : "Add album"} onClose={onClose}>
      <form onSubmit={onSubmit}>
        <div className="field">
          <label htmlFor="al-title">Title</label>
          <input
            id="al-title"
            className="input"
            autoFocus
            value={form.title}
            onChange={(e) => set({ title: e.target.value })}
          />
        </div>

        <div className="field">
          <label htmlFor="al-artist">Artist</label>
          <select id="al-artist" className="select" value={form.artist} onChange={(e) => set({ artist: e.target.value })}>
            <option value="">Select artist…</option>
            {artists.map((a) => (
              <option key={a._id} value={a._id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="al-year">Release year (optional)</label>
          <input
            id="al-year"
            type="number"
            className="input"
            value={form.releaseYear}
            onChange={(e) => set({ releaseYear: e.target.value })}
          />
        </div>

        <div className="field">
          <label htmlFor="al-cover">Cover art (optional)</label>
          <label className="file-drop" htmlFor="al-cover">
            {coverFile ? coverFile.name : isEdit ? "Keep current cover" : "Click to choose an image"}
          </label>
          <input
            id="al-cover"
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
          />
        </div>

        <ErrorText>{error}</ErrorText>

        <button className="btn btn-primary btn-block" type="submit" disabled={busy}>
          {busy ? "Saving…" : isEdit ? "Save changes" : "Add album"}
        </button>
      </form>
    </Modal>
  )
}

/* -------------------------------- Artist form -------------------------------- */

function ArtistFormModal({ item, onClose, onSaved }) {
  const isEdit = Boolean(item)
  const [form, setForm] = useState({ name: item?.name || "", bio: item?.bio || "" })
  const [imageFile, setImageFile] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")

  const set = (patch) => setForm((f) => ({ ...f, ...patch }))

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return setError("Name is required")

    setBusy(true)
    setError("")
    try {
      const fd = new FormData()
      fd.append("name", form.name.trim())
      fd.append("bio", form.bio)
      if (imageFile) fd.append("image", imageFile)

      if (isEdit) await artistsApi.update(item._id, fd)
      else await artistsApi.create(fd)
      onSaved()
    } catch (err) {
      setError(err.message || "Could not save artist")
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal title={isEdit ? "Edit artist" : "Add artist"} onClose={onClose}>
      <form onSubmit={onSubmit}>
        <div className="field">
          <label htmlFor="ar-name">Name</label>
          <input
            id="ar-name"
            className="input"
            autoFocus
            value={form.name}
            onChange={(e) => set({ name: e.target.value })}
          />
        </div>

        <div className="field">
          <label htmlFor="ar-bio">Bio (optional)</label>
          <textarea id="ar-bio" className="textarea" value={form.bio} onChange={(e) => set({ bio: e.target.value })} />
        </div>

        <div className="field">
          <label htmlFor="ar-image">Photo (optional)</label>
          <label className="file-drop" htmlFor="ar-image">
            {imageFile ? imageFile.name : isEdit ? "Keep current photo" : "Click to choose an image"}
          </label>
          <input
            id="ar-image"
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
          />
        </div>

        <ErrorText>{error}</ErrorText>

        <button className="btn btn-primary btn-block" type="submit" disabled={busy}>
          {busy ? "Saving…" : isEdit ? "Save changes" : "Add artist"}
        </button>
      </form>
    </Modal>
  )
}
