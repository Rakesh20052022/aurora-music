import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "../context/AuthContext.jsx"
import { Loader } from "./ui/Feedback.jsx"

export function ProtectedRoute({ children, adminOnly = false }) {
  const { isAuthenticated, isAdmin, loading } = useAuth()
  const location = useLocation()

  if (loading) return <Loader label="Restoring session" />
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />
  if (adminOnly && !isAdmin) return <Navigate to="/" replace />

  return children
}
