import { useEffect, useState } from "react"
import { usersApi } from "../services/endpoints.js"
import { usePlayer } from "../context/PlayerContext.jsx"
import { useLibrary } from "../context/LibraryContext.jsx"
import { SongList } from "../components/music/SongList.jsx"
import { Loader, EmptyState } from "../components/ui/Feedback.jsx"
import { AddToPlaylist } from "../components/music/AddToPlaylist.jsx"
import { Icon } from "../components/Icon.jsx"
import "./pages.css"

export default function LikedSongs() {
  const { playQueue } = usePlayer()
  const { likedIds } = useLibrary()
  const [songs, setSongs] = useState([])
  const [loading, setLoading] = useState(true)
  const [pickSong, setPickSong] = useState(null)

  useEffect(() => {
    let active = true
    usersApi
      .liked()
      .then(({ data }) => active && setSongs(data))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [])

  // Keep the list in sync when a song is unliked from within this page.
  useEffect(() => {
    setSongs((prev) => prev.filter((s) => likedIds.has(s._id)))
  }, [likedIds])

  if (loading) return <Loader />

  return (
    <div className="page fade-in">
      <div className="detail-head">
        <span className="detail-art">
          <Icon name="heart" size={64} filled />
        </span>
        <div>
          <span className="detail-kind">Playlist</span>
          <h1 className="detail-title">Liked Songs</h1>
          <div className="detail-meta">
            <span>{songs.length} songs you love</span>
          </div>
          <div className="detail-actions">
            <button
              className="play-fab"
              onClick={() => playQueue(songs, 0)}
              disabled={songs.length === 0}
              aria-label="Play liked songs"
            >
              <Icon name="play" size={24} />
            </button>
          </div>
        </div>
      </div>

      {songs.length === 0 ? (
        <EmptyState
          icon="heart"
          title="No liked songs yet"
          message="Tap the heart on any song to save it here."
        />
      ) : (
        <SongList songs={songs} onAddToPlaylist={setPickSong} />
      )}

      {pickSong && <AddToPlaylist song={pickSong} onClose={() => setPickSong(null)} />}
    </div>
  )
}
