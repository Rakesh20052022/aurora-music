import { NavLink } from "react-router-dom"
import { Icon } from "../Icon.jsx"
import { useAuth } from "../../context/AuthContext.jsx"

export function Sidebar({ playlists = [], open, onClose }) {
  const { isAdmin } = useAuth()

  return (
    <>
      {open && <div className="sidebar-backdrop" onClick={onClose} />}
      <aside className={`sidebar ${open ? "open" : ""}`}>
        <div className="brand">
          <span className="brand-mark">
            <Icon name="music" size={18} />
          </span>
          Aurora
        </div>

        <nav className="nav-group" onClick={onClose}>
          <NavLink to="/" end className="nav-item">
            <Icon name="home" /> Home
          </NavLink>
          <NavLink to="/search" className="nav-item">
            <Icon name="search" /> Search
          </NavLink>
          <NavLink to="/library" className="nav-item">
            <Icon name="library" /> Your Library
          </NavLink>
          <NavLink to="/albums" className="nav-item">
            <Icon name="disc" /> Albums
          </NavLink>
        </nav>

        <div className="nav-group" onClick={onClose}>
          <span className="nav-label">Your Music</span>
          <NavLink to="/liked" className="nav-item">
            <Icon name="heart" /> Liked Songs
          </NavLink>
          <NavLink to="/recent" className="nav-item">
            <Icon name="clock" /> Recently Played
          </NavLink>
        </div>

        {isAdmin && (
          <div className="nav-group" onClick={onClose}>
            <span className="nav-label">Admin</span>
            <NavLink to="/admin" className="nav-item">
              <Icon name="upload" /> Manage Catalog
            </NavLink>
          </div>
        )}

        {playlists.length > 0 && (
          <>
            <span className="nav-label">Playlists</span>
            <div className="sidebar-playlists" onClick={onClose}>
              {playlists.map((p) => (
                <NavLink key={p._id} to={`/playlists/${p._id}`} className="sidebar-playlist">
                  {p.name}
                </NavLink>
              ))}
            </div>
          </>
        )}
      </aside>
    </>
  )
}
