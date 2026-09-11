import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import { albumsApi } from "../services/endpoints.js"
import { usePlayer } from "../context/PlayerContext.jsx"
import { mediaUrl } from "../services/api.js"
import { SongList } from "../components/music/SongList.jsx"
import { Loader, EmptyState } from "../components/ui/Feedback.jsx"
import { AddToPlaylist } from "../components/music/AddToPlaylist.jsx"
import { Icon } from "../components/Icon.jsx"
import { formatDuration } from "../utils/format.js"
import "./pages.css"

export default function AlbumDetail() {
  const { id } = useParams()
  const { playQueue } = usePlayer()
  const [album, setAlbum] = useState(null)
  const [loading, setLoading] = useState(true)
  const [pickSong, setPickSong] = useState(null)

  useEffect(() => {
    let active = true
    setLoading(true)
    albumsApi
      .get(id)
      .then(({ data }) => active && setAlbum(data))
      .catch(() => active && setAlbum(null))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [id])

  if (loading) return <Loader />
  if (!album) return <EmptyState icon="disc" title="Album not found" />

  const songs = album.songs || []
  const totalSeconds = songs.reduce((sum, s) => sum + (s.duration || 0), 0)

  return (
    <div className="page fade-in">
      <div className="detail-head">
        {album.coverUrl ? (
          <img className="detail-art" src={mediaUrl(album.coverUrl) || "/placeholder.svg"} alt="" />
        ) : (
          <span className="detail-art">
            <Icon name="disc" size={64} />
          </span>
        )}
        <div>
          <span className="detail-kind">Album</span>
          <h1 className="detail-title">{album.title}</h1>
          <div className="detail-meta">
            {album.artist?._id && (
              <Link to={`/artists/${album.artist._id}`} style={{ color: "var(--text)", fontWeight: 600 }}>
                {album.artist.name}
              </Link>
            )}
            {album.releaseYear && (
              <>
                <span>•</span>
                <span>{album.releaseYear}</span>
              </>
            )}
            <span>•</span>
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
              aria-label="Play album"
            >
              <Icon name="play" size={24} />
            </button>
          </div>
        </div>
      </div>

      {songs.length === 0 ? (
        <EmptyState icon="music" title="No songs in this album yet" />
      ) : (
        <SongList songs={songs} onAddToPlaylist={setPickSong} showAlbum={false} />
      )}

      {pickSong && <AddToPlaylist song={pickSong} onClose={() => setPickSong(null)} />}
    </div>
  )
}
