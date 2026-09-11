import { Routes, Route, Navigate } from "react-router-dom"
import { ProtectedRoute } from "./components/ProtectedRoute.jsx"
import { Layout } from "./components/layout/Layout.jsx"

import Login from "./pages/auth/Login.jsx"
import Register from "./pages/auth/Register.jsx"
import Home from "./pages/Home.jsx"
import Search from "./pages/Search.jsx"
import Library from "./pages/Library.jsx"
import LikedSongs from "./pages/LikedSongs.jsx"
import RecentlyPlayed from "./pages/RecentlyPlayed.jsx"
import PlaylistDetail from "./pages/PlaylistDetail.jsx"
import AlbumsList from "./pages/AlbumsList.jsx"
import AlbumDetail from "./pages/AlbumDetail.jsx"
import ArtistDetail from "./pages/ArtistDetail.jsx"
import Profile from "./pages/Profile.jsx"
import AdminCatalog from "./pages/admin/AdminCatalog.jsx"
import NotFound from "./pages/NotFound.jsx"

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<Search />} />
        <Route path="/library" element={<Library />} />
        <Route path="/liked" element={<LikedSongs />} />
        <Route path="/recent" element={<RecentlyPlayed />} />
        <Route path="/playlists/:id" element={<PlaylistDetail />} />
        <Route path="/albums" element={<AlbumsList />} />
        <Route path="/albums/:id" element={<AlbumDetail />} />
        <Route path="/artists/:id" element={<ArtistDetail />} />
        <Route path="/profile" element={<Profile />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly>
              <AdminCatalog />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
