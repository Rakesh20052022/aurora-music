import { useNavigate } from "react-router-dom"
import { Icon } from "../Icon.jsx"
import { mediaUrl } from "../../services/api.js"
import "./music.css"

export function MediaCard({ to, image, title, subtitle, rounded = false, onPlay }) {
  const navigate = useNavigate()

  return (
    <div className="media-card fade-in" onClick={() => to && navigate(to)} role="button" tabIndex={0}>
      <div className={`media-art ${rounded ? "rounded" : ""}`}>
        {image ? (
          <img src={mediaUrl(image) || "/placeholder.svg"} alt="" />
        ) : (
          <span className="media-art-fallback">
            <Icon name={rounded ? "user" : "music"} size={30} />
          </span>
        )}
        {onPlay && (
          <button
            className="media-play"
            onClick={(e) => {
              e.stopPropagation()
              onPlay()
            }}
            aria-label={`Play ${title}`}
          >
            <Icon name="play" size={20} />
          </button>
        )}
      </div>
      <div className="media-title">{title}</div>
      {subtitle && <div className="media-subtitle">{subtitle}</div>}
    </div>
  )
}
