import { createContext, useContext, useEffect, useRef, useState, useCallback } from "react"
import { songsApi, usersApi } from "../services/endpoints.js"
import { mediaUrl } from "../services/api.js"
import { useAuth } from "./AuthContext.jsx"

const PlayerContext = createContext(null)

export function PlayerProvider({ children }) {
  const { isAuthenticated, user } = useAuth()
  const audioRef = useRef(null)
  if (!audioRef.current && typeof Audio !== "undefined") {
    audioRef.current = new Audio()
  }

  // Playback queue and index into it.
  const [queue, setQueue] = useState([])
  const [index, setIndex] = useState(-1)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(user?.preferences?.volume ?? 0.8)
  const [muted, setMuted] = useState(user?.preferences?.muted ?? false)
  const [shuffle, setShuffle] = useState(() => {
    const s = user?.preferences?.shuffle;
    if (typeof s === "string") return s;
    return s ? "normal" : "off";
  })
  const [repeat, setRepeat] = useState(user?.preferences?.repeat ?? "off")
  const [history, setHistory] = useState([])
  const isFetchingSmart = useRef(false)

  const current = index >= 0 && index < queue.length ? queue[index] : null

  // Sync preferences from the loaded user profile once available.
  useEffect(() => {
    if (user?.preferences) {
      setVolume(user.preferences.volume ?? 0.8)
      setMuted(user.preferences.muted ?? false)
      const s = user.preferences.shuffle;
      setShuffle(typeof s === "string" ? s : (s ? "normal" : "off"))
      setRepeat(user.preferences.repeat ?? "off")
    }
  }, [user])

  // Load and play whenever the current track changes.
  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !current) return

    setHistory((prev) => {
      if (!prev.includes(current._id)) {
        return [...prev, String(current._id)];
      }
      return prev;
    })

    const loadAudio = async () => {
      let src = current.audioUrl ? mediaUrl(current.audioUrl) : ""
      
      if (current.isAudius) {
        const { getStreamUrl } = await import("../utils/audius.js")
        const audiusUrl = await getStreamUrl(current._id)
        if (audiusUrl) src = audiusUrl
      }

      if (!src) return

      audio.src = src
      audio.load()
      const playPromise = audio.play()
      if (playPromise?.catch) playPromise.catch(() => setIsPlaying(false))
      setIsPlaying(true)
    }

    loadAudio()

    // Record the play (increments count + recently played).
    if (!current.isAudius) {
      songsApi.registerPlay(current._id).catch(() => {})
      if (isAuthenticated) usersApi.pushRecent(current._id).catch(() => {})
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current?._id])

  // Volume / mute wiring.
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.volume = volume
    audio.muted = muted
  }, [volume, muted])

  // Smart Recommendation Queue Manager
  useEffect(() => {
    if (shuffle === "smart" && current && !isFetchingSmart.current) {
      const remaining = queue.length - 1 - index;
      if (remaining < 3) {
        isFetchingSmart.current = true;
        import("../utils/audius.js")
          .then(({ getSmartRecommendations, mapAudiusToTrack }) => {
            return getSmartRecommendations(current, history).then((tracks) => {
              if (tracks && tracks.length > 0) {
                const mapped = tracks.map(mapAudiusToTrack);
                setQueue((q) => {
                  const newTracks = mapped.filter((t) => !q.find((qt) => String(qt._id) === String(t._id)));
                  return [...q, ...newTracks];
                });
              }
            });
          })
          .catch((err) => console.error("Failed to load recommendations", err))
          .finally(() => {
            isFetchingSmart.current = false;
          });
      }
    }
  }, [shuffle, current, index, queue.length, history])

  const playNext = useCallback(() => {
    setIndex((i) => {
      if (queue.length === 0) return -1
      if (shuffle === "normal" || shuffle === true) {
        if (queue.length === 1) return i
        let next = i
        while (next === i) next = Math.floor(Math.random() * queue.length)
        return next
      }
      if (i + 1 < queue.length) return i + 1
      return repeat === "all" ? 0 : i
    })
  }, [queue.length, shuffle, repeat])

  const playPrev = useCallback(() => {
    const audio = audioRef.current
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0
      return
    }
    setIndex((i) => (i - 1 >= 0 ? i - 1 : i))
  }, [])

  // Audio element event wiring.
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const onTime = () => setProgress(audio.currentTime)
    const onMeta = () => setDuration(audio.duration || 0)
    const onEnd = () => {
      if (repeat === "one") {
        audio.currentTime = 0
        audio.play()
        return
      }
      const isLast = index + 1 >= queue.length
      if (isLast && repeat === "off" && shuffle !== "normal" && shuffle !== true) {
        // If smart shuffle is on, playNext will handle it if queue got extended.
        // If it didn't get extended, playNext will just do nothing, we should stop playing.
        if (shuffle === "smart" && index + 1 < queue.length) {
          playNext()
          return
        }
        if (shuffle !== "smart") {
          setIsPlaying(false)
          return
        }
      }
      playNext()
    }
    const onPlay = () => setIsPlaying(true)
    const onPause = () => setIsPlaying(false)

    audio.addEventListener("timeupdate", onTime)
    audio.addEventListener("loadedmetadata", onMeta)
    audio.addEventListener("ended", onEnd)
    audio.addEventListener("play", onPlay)
    audio.addEventListener("pause", onPause)
    return () => {
      audio.removeEventListener("timeupdate", onTime)
      audio.removeEventListener("loadedmetadata", onMeta)
      audio.removeEventListener("ended", onEnd)
      audio.removeEventListener("play", onPlay)
      audio.removeEventListener("pause", onPause)
    }
  }, [repeat, shuffle, index, queue.length, playNext])

  // Play a list of songs, starting at startIndex.
  const playQueue = useCallback((songs, startIndex = 0) => {
    if (!songs || songs.length === 0) return
    setQueue(songs)
    setIndex(startIndex)
  }, [])

  // Play a single song immediately (replaces queue).
  const playSong = useCallback((song, contextQueue) => {
    if (contextQueue && contextQueue.length) {
      const at = contextQueue.findIndex((s) => s._id === song._id)
      setQueue(contextQueue)
      setIndex(at >= 0 ? at : 0)
    } else {
      setQueue([song])
      setIndex(0)
    }
  }, [])

  const togglePlay = useCallback(() => {
    const audio = audioRef.current
    if (!audio || !current) return
    if (audio.paused) audio.play()
    else audio.pause()
  }, [current])

  const seek = useCallback((time) => {
    const audio = audioRef.current
    if (audio) audio.currentTime = time
  }, [])

  const addToQueue = useCallback((song) => {
    setQueue((q) => [...q, song])
  }, [])

  // Persist preferences (debounced-ish: fire on change when authenticated).
  const persistPrefs = useCallback(
    (patch) => {
      if (isAuthenticated) usersApi.updatePreferences(patch).catch(() => {})
    },
    [isAuthenticated],
  )

  const changeVolume = useCallback(
    (v) => {
      setVolume(v)
      if (v > 0 && muted) setMuted(false)
      persistPrefs({ volume: v })
    },
    [muted, persistPrefs],
  )

  const toggleMute = useCallback(() => {
    setMuted((m) => {
      persistPrefs({ muted: !m })
      return !m
    })
  }, [persistPrefs])

  const toggleShuffle = useCallback(() => {
    setShuffle((s) => {
      let next = "off";
      if (s === "off" || s === false) next = "normal";
      else if (s === "normal" || s === true) next = "smart";
      else if (s === "smart") next = "off";
      
      persistPrefs({ shuffle: next })
      return next
    })
  }, [persistPrefs])

  const cycleRepeat = useCallback(() => {
    setRepeat((r) => {
      const next = r === "off" ? "all" : r === "all" ? "one" : "off"
      persistPrefs({ repeat: next })
      return next
    })
  }, [persistPrefs])

  const value = {
    queue,
    current,
    index,
    isPlaying,
    progress,
    duration,
    volume,
    muted,
    shuffle,
    repeat,
    playQueue,
    playSong,
    togglePlay,
    playNext,
    playPrev,
    seek,
    addToQueue,
    changeVolume,
    toggleMute,
    toggleShuffle,
    cycleRepeat,
  }

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>
}

export function usePlayer() {
  const ctx = useContext(PlayerContext)
  if (!ctx) throw new Error("usePlayer must be used within PlayerProvider")
  return ctx
}
