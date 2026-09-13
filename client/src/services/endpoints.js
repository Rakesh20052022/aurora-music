import { api } from "./api.js"

export const authApi = {
  register: (payload) => api.post("/auth/register", payload).then((r) => r.data),
  login: (payload) => api.post("/auth/login", payload).then((r) => r.data),
  me: () => api.get("/auth/me").then((r) => r.data),
}

export const songsApi = {
  list: (params) => api.get("/songs", { params }).then((r) => r.data),
  get: (id) => api.get(`/songs/${id}`).then((r) => r.data),
  create: (formData) =>
    api.post("/songs", formData, { headers: { "Content-Type": "multipart/form-data" } }).then((r) => r.data),
  update: (id, formData) =>
    api.put(`/songs/${id}`, formData, { headers: { "Content-Type": "multipart/form-data" } }).then((r) => r.data),
  remove: (id) => api.delete(`/songs/${id}`).then((r) => r.data),
  registerPlay: (id) => api.post(`/songs/${id}/play`).then((r) => r.data),
}

export const playlistsApi = {
  listMine: () => api.get("/playlists").then((r) => r.data),
  get: (id) => api.get(`/playlists/${id}`).then((r) => r.data),
  create: (formData) =>
    api.post("/playlists", formData, { headers: { "Content-Type": "multipart/form-data" } }).then((r) => r.data),
  update: (id, formData) =>
    api.put(`/playlists/${id}`, formData, { headers: { "Content-Type": "multipart/form-data" } }).then((r) => r.data),
  remove: (id) => api.delete(`/playlists/${id}`).then((r) => r.data),
  addSong: (id, songId) => api.post(`/playlists/${id}/songs`, { songId }).then((r) => r.data),
  removeSong: (id, songId) => api.delete(`/playlists/${id}/songs/${songId}`).then((r) => r.data),
}

export const usersApi = {
  updateProfile: (payload) => api.put("/users/me", payload).then((r) => r.data),
  updatePreferences: (payload) => api.put("/users/me/preferences", payload).then((r) => r.data),
  liked: () => api.get("/users/me/liked").then((r) => r.data),
  like: (songId, songData) => api.post(`/users/me/liked/${songId}`, songData).then((r) => r.data),
  unlike: (songId) => api.delete(`/users/me/liked/${songId}`).then((r) => r.data),
  recent: () => api.get("/users/me/recent").then((r) => r.data),
  pushRecent: (songId, songData) => api.post(`/users/me/recent/${songId}`, songData).then((r) => r.data),
}

export const artistsApi = {
  list: () => api.get("/artists").then((r) => r.data),
  get: (id) => api.get(`/artists/${id}`).then((r) => r.data),
  create: (formData) =>
    api.post("/artists", formData, { headers: { "Content-Type": "multipart/form-data" } }).then((r) => r.data),
  update: (id, formData) =>
    api.put(`/artists/${id}`, formData, { headers: { "Content-Type": "multipart/form-data" } }).then((r) => r.data),
  remove: (id) => api.delete(`/artists/${id}`).then((r) => r.data),
}

export const albumsApi = {
  list: () => api.get("/albums").then((r) => r.data),
  get: (id) => api.get(`/albums/${id}`).then((r) => r.data),
  create: (formData) =>
    api.post("/albums", formData, { headers: { "Content-Type": "multipart/form-data" } }).then((r) => r.data),
  update: (id, formData) =>
    api.put(`/albums/${id}`, formData, { headers: { "Content-Type": "multipart/form-data" } }).then((r) => r.data),
  remove: (id) => api.delete(`/albums/${id}`).then((r) => r.data),
}

export const searchApi = {
  query: (q, type = "all") => api.get("/search", { params: { q, type } }).then((r) => r.data),
}
