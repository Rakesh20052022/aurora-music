import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { artistsApi } from "../services/endpoints.js"
import { usePlayer } from "../context/PlayerContext.jsx"
import { mediaUrl } from "../services/api.js"
import { SongList } from "../components/music/SongList.jsx"
import { MediaCard } from "../components/music/MediaCard.jsx"
import { Loader, EmptyState } from "../components/ui/Feedback.jsx"
import { AddToPlaylist } from "../components/music/AddToPlaylist.jsx"
import { Icon } from "../components/Icon.jsx"
import "./pages.css"

export default function ArtistDetail() {
  const { id } = useParams()
  const { playQueue } = usePlayer()
  const [artist, setArtist] = useState(null)
  const [loading, setLoading] = useState(true)
  const [pickSong, setPickSong] = useState(null)

  useEffect(() => {
    let active = true
    setLoading(true)
    artistsApi
      .get(id)
      .then(({ data }) => active && setArtist(data))
      .catch(() => active && setArtist(null))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [id])

  if (loading) return <Loader />
  if (!artist) return <EmptyState icon="user" title="Artist not found" />

  const songs = artist.songs || []
  const albums = artist.albums || []
  const topSongs = songs.slice(0, 5)

  return (
    <div className="page fade-in">
      <div className="detail-head">
        {artist.image ? (
          <img className="detail-art rounded" src={mediaUrl(artist.image) || "/placeholder.svg"} alt="" />
        ) : (
          <span className="detail-art rounded">
            <Icon name="user" size={64} />
          </span>
        )}
        <div>
          <span className="detail-kind">Artist</span>
          <h1 className="detail-title">{artist.name}</h1>
          {artist.bio && <p style={{ color: "var(--text-muted)", maxWidth: 520 }}>{artist.bio}</p>}
          <div className="detail-meta">
            <span>{songs.length} songs</span>
            <span>•</span>
            <span>{albums.length} albums</span>
          </div>
          <div className="detail-actions">
            <button
              className="play-fab"
              onClick={() => playQueue(songs, 0)}
              disabled={songs.length === 0}
              aria-label="Play artist"
            >
              <Icon name="play" size={24} />
            </button>
          </div>
        </div>
      </div>

      {topSongs.length > 0 && (
        <section className="section">
          <div className="section-head">
            <h2>Popular</h2>
          </div>
          <SongList songs={topSongs} queue={songs} onAddToPlaylist={setPickSong} />
        </section>
      )}

      {albums.length > 0 && (
        <section className="section">
          <div className="section-head">
            <h2>Albums</h2>
          </div>
          <div className="media-grid">
            {albums.map((album) => (
              <MediaCard
                key={album._id}
                to={`/albums/${album._id}`}
                image={album.coverUrl}
                title={album.title}
                subtitle={album.releaseYear ? String(album.releaseYear) : "Album"}
              />
            ))}
          </div>
        </section>
      )}

      {pickSong && <AddToPlaylist song={pickSong} onClose={() => setPickSong(null)} />}
    </div>
  )
}
