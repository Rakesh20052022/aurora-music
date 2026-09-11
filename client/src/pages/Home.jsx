import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { songsApi, albumsApi, artistsApi, usersApi } from "../services/endpoints.js"
import { useAuth } from "../context/AuthContext.jsx"
import { usePlayer } from "../context/PlayerContext.jsx"
import { MediaCard } from "../components/music/MediaCard.jsx"
import { SongRow } from "../components/music/SongRow.jsx"
import { Loader } from "../components/ui/Feedback.jsx"
import { AddToPlaylist } from "../components/music/AddToPlaylist.jsx"
import "./pages.css"

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return "Good morning"
  if (h < 18) return "Good afternoon"
  return "Good evening"
}

export default function Home() {
  const { user } = useAuth()
  const { playQueue } = usePlayer()
  const [trending, setTrending] = useState([])
  const [albums, setAlbums] = useState([])
  const [artists, setArtists] = useState([])
  const [recent, setRecent] = useState([])
  const [loading, setLoading] = useState(true)
  const [pickSong, setPickSong] = useState(null)

  useEffect(() => {
    let active = true
    Promise.all([
      songsApi.list({ sort: "trending", limit: 8 }),
      albumsApi.list(),
      artistsApi.list(),
      usersApi.recent().catch(() => ({ data: [] })),
      import("../utils/audius.js").then((mod) => 
        mod.getTrendingTracks().then(tracks => tracks.map(mod.mapAudiusToTrack))
      ).catch(() => [])
    ])
      .then(([t, al, ar, rc, audiusTrending]) => {
        if (!active) return
        setTrending([...t.data, ...audiusTrending].slice(0, 16))
        setAlbums(al.data.slice(0, 8))
        setArtists(ar.data.slice(0, 8))
        setRecent(rc.data.slice(0, 6))
      })
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [])

  if (loading) return <Loader />

  return (
    <div className="page fade-in">
      <div className="hero">
        <h1 className="text-balance">
          {greeting()}, {user?.name?.split(" ")[0]}
        </h1>
        <p className="text-pretty">
          Jump back into your library or discover something new from the Aurora catalog.
        </p>
      </div>

      {recent.length > 0 && (
        <section className="section">
          <div className="section-head">
            <h2>Recently played</h2>
            <Link to="/recent">See all</Link>
          </div>
          <div className="media-grid">
            {recent.map((song) => (
              <MediaCard
                key={song._id}
                image={song.coverUrl}
                title={song.title}
                subtitle={song.artist?.name}
                onPlay={() => playQueue([song], 0)}
              />
            ))}
          </div>
        </section>
      )}

      <section className="section">
        <div className="section-head">
          <h2>Trending now</h2>
        </div>
        <div className="song-list">
          {trending.map((song, i) => (
            <SongRow
              key={song._id}
              song={song}
              index={i}
              queue={trending}
              onAddToPlaylist={setPickSong}
            />
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <h2>Albums</h2>
          <Link to="/albums">See all</Link>
        </div>
        <div className="media-grid">
          {albums.map((album) => (
            <MediaCard
              key={album._id}
              to={`/albums/${album._id}`}
              image={album.coverUrl}
              title={album.title}
              subtitle={album.artist?.name}
            />
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <h2>Artists</h2>
        </div>
        <div className="media-grid">
          {artists.map((artist) => (
            <MediaCard
              key={artist._id}
              to={`/artists/${artist._id}`}
              image={artist.image}
              title={artist.name}
              subtitle="Artist"
              rounded
            />
          ))}
        </div>
      </section>

      {pickSong && <AddToPlaylist song={pickSong} onClose={() => setPickSong(null)} />}
    </div>
  )
}
