import { useEffect, useState } from "react"
import { albumsApi } from "../services/endpoints.js"
import { MediaCard } from "../components/music/MediaCard.jsx"
import { Loader, EmptyState } from "../components/ui/Feedback.jsx"
import "./pages.css"

export default function AlbumsList() {
  const [albums, setAlbums] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    albumsApi
      .list()
      .then(({ data }) => active && setAlbums(data))
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
          <h1>Albums</h1>
          <p>Every album in the Aurora catalog.</p>
        </div>
      </div>

      {albums.length === 0 ? (
        <EmptyState icon="disc" title="No albums yet" message="Albums added by an admin will appear here." />
      ) : (
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
      )}
    </div>
  )
}
