import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { authApi } from "../services/endpoints.js"
import { setToken, getToken } from "../services/api.js"

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Restore session on load if a token exists.
  useEffect(() => {
    let active = true
    async function restore() {
      if (!getToken()) {
        setLoading(false)
        return
      }
      try {
        const { user } = await authApi.me()
        if (active) setUser(user)
      } catch {
        setToken(null)
      } finally {
        if (active) setLoading(false)
      }
    }
    restore()
    return () => {
      active = false
    }
  }, [])

  const login = useCallback(async (credentials) => {
    const { token, user } = await authApi.login(credentials)
    setToken(token)
    setUser(user)
    return user
  }, [])

  const register = useCallback(async (payload) => {
    const { token, user } = await authApi.register(payload)
    setToken(token)
    setUser(user)
    return user
  }, [])

  const logout = useCallback(() => {
    setToken(null)
    setUser(null)
  }, [])

  const refreshUser = useCallback(async () => {
    const { user } = await authApi.me()
    setUser(user)
    return user
  }, [])

  const value = {
    user,
    loading,
    isAuthenticated: Boolean(user),
    isAdmin: user?.role === "admin",
    login,
    register,
    logout,
    refreshUser,
    setUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
