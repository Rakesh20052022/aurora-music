import { useEffect, useState } from "react"
import { usersApi } from "../services/endpoints.js"
import { SongList } from "../components/music/SongList.jsx"
import { Loader, EmptyState } from "../components/ui/Feedback.jsx"
import { AddToPlaylist } from "../components/music/AddToPlaylist.jsx"
import "./pages.css"

export default function RecentlyPlayed() {
  const [songs, setSongs] = useState([])
  const [loading, setLoading] = useState(true)
  const [pickSong, setPickSong] = useState(null)

  useEffect(() => {
    let active = true
    usersApi
      .recent()
      .then(({ data }) => active && setSongs(data))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [])

  if (loading) return <Loader />

  return (
    <div className="page fade-in">
      <div className="page-head">
        <div>
          <h1>Recently played</h1>
          <p>Your listening history, most recent first.</p>
        </div>
      </div>

      {songs.length === 0 ? (
        <EmptyState
          icon="clock"
          title="Nothing here yet"
          message="Songs you play will show up here so you can jump back in."
        />
      ) : (
        <SongList songs={songs} onAddToPlaylist={setPickSong} showIndex={false} />
      )}

      {pickSong && <AddToPlaylist song={pickSong} onClose={() => setPickSong(null)} />}
    </div>
  )
}
