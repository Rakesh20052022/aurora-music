import axios from "axios"

const baseURL = import.meta.env.VITE_API_URL || ""

export const api = axios.create({
  baseURL: `${baseURL}/api`,
})

const TOKEN_KEY = "aurora.token"

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

// Attach the JWT to every request when present.
api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Normalize error messages coming from the API.
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const message =
      error.response?.data?.message || error.message || "Something went wrong. Please try again."
    const details = error.response?.data?.details || null
    return Promise.reject({ message, details, status: error.response?.status })
  },
)

// Build an absolute media URL for locally-served files.
export function mediaUrl(url) {
  if (!url) return ""
  if (url.startsWith("http")) return url
  return `${baseURL}${url}`
}
