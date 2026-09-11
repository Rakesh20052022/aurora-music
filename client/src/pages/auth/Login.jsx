import { useState } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../../context/AuthContext.jsx"
import { Icon } from "../../components/Icon.jsx"
import { ErrorText } from "../../components/ui/Feedback.jsx"
import { AuthVisual } from "./AuthVisual.jsx"
import "./auth.css"
import "../../components/ui/ui.css"

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ email: "", password: "" })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const from = location.state?.from?.pathname || "/"

  const onSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      await login(form)
      navigate(from, { replace: true })
    } catch (err) {
      setError(err.message || "Unable to log in")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-screen">
      <AuthVisual />
      <div className="auth-form-side">
        <div className="auth-card fade-in">
          <h2>Welcome back</h2>
          <p className="sub">Log in to pick up where you left off.</p>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={onSubmit}>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                className="input"
                type="email"
                autoComplete="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                className="input"
                type="password"
                autoComplete="current-password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
            <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
              {loading ? <Icon name="disc" className="spin" size={18} /> : "Log in"}
            </button>
          </form>

          <p className="auth-switch">
            New to Aurora? <Link to="/register">Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
