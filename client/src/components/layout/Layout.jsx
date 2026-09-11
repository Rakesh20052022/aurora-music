import { useState } from "react"
import { Outlet } from "react-router-dom"
import { Sidebar } from "./Sidebar.jsx"
import { Topbar } from "./Topbar.jsx"
import { PlayerBar } from "../player/PlayerBar.jsx"
import { useLibrary } from "../../context/LibraryContext.jsx"
import "./Layout.css"

export function Layout() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { playlists } = useLibrary()

  return (
    <div className="app-shell">
      <Sidebar playlists={playlists} open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="app-main">
        <Topbar onOpenMenu={() => setMenuOpen(true)} />
        <div className="app-scroll">
          <Outlet />
        </div>
      </div>
      <PlayerBar />
    </div>
  )
}
