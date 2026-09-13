import { useState } from "react"
import { Link } from "react-router-dom"
import { Icon } from "../Icon.jsx"
import { usePlayer } from "../../context/PlayerContext.jsx"
import { useLibrary } from "../../context/LibraryContext.jsx"
import { mediaUrl } from "../../services/api.js"
import { formatDuration } from "../../utils/format.js"
import "./music.css"

export function SongRow({ song, index, queue, onAddToPlaylist, onRemove, showAlbum = true }) {
  const { playSong, current, isPlaying, togglePlay } = usePlayer()
  const { isLiked, toggleLike } = useLibrary()
  const [menuOpen, setMenuOpen] = useState(false)

  const isCurrent = current?._id === song._id
  const liked = isLiked(song._id)

  const onPlay = () => {
    if (isCurrent) togglePlay()
    else playSong(song, queue)
  }

  return (
    <div className={`song-row ${isCurrent ? "current" : ""}`}>
      <button className="song-index" onClick={onPlay} aria-label={isCurrent && isPlaying ? "Pause" : "Play"}>
        {isCurrent && isPlaying ? (
          <Icon name="pause" size={16} />
        ) : (
          <>
            <span className="idx-num">{index != null ? index + 1 : <Icon name="play" size={14} />}</span>
            <span className="idx-play">
              <Icon name="play" size={14} />
            </span>
          </>
        )}
      </button>

      <div className="song-main" onClick={onPlay}>
        {song.coverUrl ? (
          <img className="song-cover" src={mediaUrl(song.coverUrl) || "/placeholder.svg"} alt="" />
        ) : (
          <span className="song-cover">
            <Icon name="music" size={16} />
          </span>
        )}
        <div className="song-text">
          <span className={`song-title ${isCurrent ? "accent" : ""}`}>{song.title}</span>
          <span className="song-artist">
            {song.artist?._id ? (
              <Link to={`/artists/${song.artist._id}`} onClick={(e) => e.stopPropagation()}>
                {song.artist.name}
              </Link>
            ) : (
              song.artist?.name || "Unknown Artist"
            )}
          </span>
        </div>
      </div>

      {showAlbum && (
        <div className="song-album">
          {song.album?._id ? <Link to={`/albums/${song.album._id}`}>{song.album.title}</Link> : "—"}
        </div>
      )}

      <button
        className={`song-like ${liked ? "liked" : ""}`}
        onClick={(e) => {
          e.stopPropagation()
          toggleLike(song)
        }}
        aria-label={liked ? "Unlike" : "Like"}
      >
        <Icon name="heart" size={16} filled={liked} />
      </button>

      <span className="song-duration">{formatDuration(song.duration)}</span>

      <div className="song-actions">
        <button onClick={() => setMenuOpen((v) => !v)} aria-label="More options" className="song-menu-btn">
          <Icon name="dots" size={18} />
        </button>
        {menuOpen && (
          <div className="song-menu" onMouseLeave={() => setMenuOpen(false)}>
            {onAddToPlaylist && (
              <button
                onClick={() => {
                  setMenuOpen(false)
                  onAddToPlaylist(song)
                }}
              >
                <Icon name="plus" size={16} /> Add to playlist
              </button>
            )}
            <button
              onClick={() => {
                setMenuOpen(false)
                toggleLike(song)
              }}
            >
              <Icon name="heart" size={16} filled={liked} /> {liked ? "Remove like" : "Like"}
            </button>
            {onRemove && (
              <button
                style={{ color: "var(--danger)" }}
                onClick={() => {
                  setMenuOpen(false)
                  onRemove(song)
                }}
              >
                <Icon name="trash" size={16} /> Remove
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
