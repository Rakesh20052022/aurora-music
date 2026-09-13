import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { playlistsApi, usersApi } from "../services/endpoints.js"
import { useAuth } from "./AuthContext.jsx"

const LibraryContext = createContext(null)

export function LibraryProvider({ children }) {
  const { isAuthenticated } = useAuth()
  const [playlists, setPlaylists] = useState([])
  const [likedIds, setLikedIds] = useState(new Set())
  const [loading, setLoading] = useState(false)

  const refreshPlaylists = useCallback(async () => {
    const { data } = await playlistsApi.listMine()
    setPlaylists(data)
    return data
  }, [])

  const refreshLiked = useCallback(async () => {
    const { data } = await usersApi.liked()
    setLikedIds(new Set(data.map((s) => s._id)))
    return data
  }, [])

  // Load library whenever auth state flips to authenticated.
  useEffect(() => {
    if (!isAuthenticated) {
      setPlaylists([])
      setLikedIds(new Set())
      return
    }
    let active = true
    setLoading(true)
    Promise.all([refreshPlaylists(), refreshLiked()])
      .catch(() => {})
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [isAuthenticated, refreshPlaylists, refreshLiked])

  const isLiked = useCallback((songId) => likedIds.has(songId), [likedIds])

  const toggleLike = useCallback(
    async (song) => {
      const songId = typeof song === "string" ? song : song._id
      const songData = typeof song === "object" ? song : undefined
      const currentlyLiked = likedIds.has(songId)
      // Optimistic update.
      setLikedIds((prev) => {
        const next = new Set(prev)
        if (currentlyLiked) next.delete(songId)
        else next.add(songId)
        return next
      })
      try {
        if (currentlyLiked) await usersApi.unlike(songId)
        else await usersApi.like(songId, songData)
      } catch {
        // Revert on failure.
        setLikedIds((prev) => {
          const next = new Set(prev)
          if (currentlyLiked) next.add(songId)
          else next.delete(songId)
          return next
        })
      }
    },
    [likedIds],
  )

  const createPlaylist = useCallback(
    async (formData) => {
      const { data } = await playlistsApi.create(formData)
      await refreshPlaylists()
      return data
    },
    [refreshPlaylists],
  )

  const deletePlaylist = useCallback(
    async (id) => {
      await playlistsApi.remove(id)
      await refreshPlaylists()
    },
    [refreshPlaylists],
  )

  const value = {
    playlists,
    likedIds,
    loading,
    isLiked,
    toggleLike,
    refreshPlaylists,
    refreshLiked,
    createPlaylist,
    deletePlaylist,
  }

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>
}

export function useLibrary() {
  const ctx = useContext(LibraryContext)
  if (!ctx) throw new Error("useLibrary must be used within LibraryProvider")
  return ctx
}
