import { useEffect, useState, useCallback } from "react"
import { useSearchParams } from "react-router-dom"
import { searchApi } from "../services/endpoints.js"
import { SongList } from "../components/music/SongList.jsx"
import { MediaCard } from "../components/music/MediaCard.jsx"
import { Loader, EmptyState } from "../components/ui/Feedback.jsx"
import { AddToPlaylist } from "../components/music/AddToPlaylist.jsx"
import "./pages.css"

const FILTERS = [
  { key: "all", label: "All" },
  { key: "songs", label: "Songs" },
  { key: "artists", label: "Artists" },
  { key: "albums", label: "Albums" },
]

export default function Search() {
  const [params, setParams] = useSearchParams()
  const q = params.get("q") || ""
  const [type, setType] = useState("all")
  const [results, setResults] = useState({ songs: [], artists: [], albums: [] })
  const [loading, setLoading] = useState(false)
  const [pickSong, setPickSong] = useState(null)

  const runSearch = useCallback(async () => {
    if (!q.trim()) {
      setResults({ songs: [], artists: [], albums: [] })
      return
    }
    setLoading(true)
    try {
      const { data } = await searchApi.query(q, type)
      
      let audiusSongs = []
      if (type === "all" || type === "songs") {
        const { searchTracks, mapAudiusToTrack } = await import("../utils/audius.js")
        const audiusResults = await searchTracks(q)
        audiusSongs = audiusResults.map(mapAudiusToTrack)
      }
      
      setResults({
        ...data,
        songs: [...(data.songs || []), ...audiusSongs]
      })
    } finally {
      setLoading(false)
    }
  }, [q, type])

  useEffect(() => {
    const t = setTimeout(runSearch, 250)
    return () => clearTimeout(t)
  }, [runSearch])

  const { songs, artists, albums } = results
  const hasResults = songs.length || artists.length || albums.length

  return (
    <div className="page fade-in">
      <div className="page-head">
        <div>
          <h1>Search</h1>
          <p>{q ? `Results for “${q}”` : "Find songs, artists, and albums."}</p>
        </div>
      </div>

      <div className="pill-row">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            className={`pill ${type === f.key ? "active" : ""}`}
            onClick={() => setType(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <Loader label="Searching" />
      ) : !q ? (
        <EmptyState icon="search" title="Start typing to search" message="Use the search bar above to explore the catalog." />
      ) : !hasResults ? (
        <EmptyState icon="search" title="No results" message={`We couldn't find anything for “${q}”.`} />
      ) : (
        <>
          {(type === "all" || type === "artists") && artists.length > 0 && (
            <section className="section">
              <div className="section-head">
                <h2>Artists</h2>
              </div>
              <div className="media-grid">
                {artists.map((a) => (
                  <MediaCard key={a._id} to={`/artists/${a._id}`} image={a.image} title={a.name} subtitle="Artist" rounded />
                ))}
              </div>
            </section>
          )}

          {(type === "all" || type === "albums") && albums.length > 0 && (
            <section className="section">
              <div className="section-head">
                <h2>Albums</h2>
              </div>
              <div className="media-grid">
                {albums.map((al) => (
                  <MediaCard key={al._id} to={`/albums/${al._id}`} image={al.coverUrl} title={al.title} subtitle={al.artist?.name} />
                ))}
              </div>
            </section>
          )}

          {(type === "all" || type === "songs") && songs.length > 0 && (
            <section className="section">
              <div className="section-head">
                <h2>Songs</h2>
              </div>
              <SongList songs={songs} onAddToPlaylist={setPickSong} />
            </section>
          )}
        </>
      )}

      {pickSong && <AddToPlaylist song={pickSong} onClose={() => setPickSong(null)} />}
    </div>
  )
}
