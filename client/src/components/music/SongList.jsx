import { SongRow } from "./SongRow.jsx"
import { Icon } from "../Icon.jsx"

// Renders a table-like list of songs with a header row.
export function SongList({ songs, queue, onAddToPlaylist, onRemove, showAlbum = true, showIndex = true }) {
  const list = queue || songs
  return (
    <div className="song-list">
      <div className="song-list-head">
        <span>#</span>
        <span>Title</span>
        {showAlbum && <span>Album</span>}
        <span />
        <span style={{ textAlign: "right" }}>
          <Icon name="clock" size={15} />
        </span>
        <span />
      </div>
      {songs.map((song, i) => (
        <SongRow
          key={song._id}
          song={song}
          index={showIndex ? i : null}
          queue={list}
          onAddToPlaylist={onAddToPlaylist}
          onRemove={onRemove}
          showAlbum={showAlbum}
        />
      ))}
    </div>
  )
}
