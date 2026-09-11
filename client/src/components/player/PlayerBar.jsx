import { Icon } from "../Icon.jsx"
import { usePlayer } from "../../context/PlayerContext.jsx"
import { useLibrary } from "../../context/LibraryContext.jsx"
import { mediaUrl } from "../../services/api.js"
import { formatDuration, artistName } from "../../utils/format.js"
import "./PlayerBar.css"

export function PlayerBar() {
  const {
    current,
    isPlaying,
    progress,
    duration,
    volume,
    muted,
    shuffle,
    repeat,
    togglePlay,
    playNext,
    playPrev,
    seek,
    changeVolume,
    toggleMute,
    toggleShuffle,
    cycleRepeat,
  } = usePlayer()
  const { isLiked, toggleLike } = useLibrary()

  const liked = current ? isLiked(current._id) : false

  return (
    <footer className="player" aria-label="Now playing">
      <div className="player-track">
        {current ? (
          <>
            {current.coverUrl ? (
              <img className="player-cover" src={mediaUrl(current.coverUrl) || "/placeholder.svg"} alt="" />
            ) : (
              <span className="player-cover">
                <Icon name="music" size={20} />
              </span>
            )}
            <div className="player-meta">
              <div className="player-title">{current.title}</div>
              <div className="player-artist">{artistName(current)}</div>
            </div>
            <button
              className={`player-like ${liked ? "liked" : ""}`}
              onClick={() => toggleLike(current._id)}
              aria-label={liked ? "Unlike" : "Like"}
            >
              <Icon name="heart" size={18} filled={liked} />
            </button>
          </>
        ) : (
          <span className="player-empty">Select a song to start listening</span>
        )}
      </div>

      <div className="player-center">
        <div className="player-controls">
          <button
            className={`control-btn shuffle-btn ${shuffle !== "off" ? "active" : ""} ${shuffle === "smart" ? "smart-active" : ""}`}
            onClick={toggleShuffle}
            aria-label={`Shuffle: ${shuffle}`}
            aria-pressed={shuffle !== "off"}
          >
            <Icon name={shuffle === "smart" ? "smart-shuffle" : "shuffle"} size={18} />
          </button>
          <button className="control-btn" onClick={playPrev} aria-label="Previous">
            <Icon name="prev" size={20} />
          </button>
          <button className="play-btn" onClick={togglePlay} aria-label={isPlaying ? "Pause" : "Play"}>
            <Icon name={isPlaying ? "pause" : "play"} size={20} />
          </button>
          <button className="control-btn" onClick={playNext} aria-label="Next">
            <Icon name="next" size={20} />
          </button>
          <button
            className={`control-btn ${repeat !== "off" ? "active" : ""}`}
            onClick={cycleRepeat}
            aria-label={`Repeat: ${repeat}`}
          >
            <Icon name="repeat" size={18} />
            {repeat === "one" && (
              <span style={{ fontSize: "0.6rem", marginLeft: -6, marginTop: -8 }}>1</span>
            )}
          </button>
        </div>

        <div className="player-progress">
          <span className="time">{formatDuration(progress)}</span>
          <input
            className="seek"
            type="range"
            min={0}
            max={duration || 0}
            value={progress}
            onChange={(e) => seek(Number(e.target.value))}
            aria-label="Seek"
          />
          <span className="time">{formatDuration(duration)}</span>
        </div>
      </div>

      <div className="player-right">
        <button className="control-btn" onClick={toggleMute} aria-label={muted ? "Unmute" : "Mute"}>
          <Icon name={muted ? "mute" : "volume"} size={18} />
        </button>
        <input
          className="seek volume"
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={muted ? 0 : volume}
          onChange={(e) => changeVolume(Number(e.target.value))}
          aria-label="Volume"
        />
      </div>
    </footer>
  )
}
