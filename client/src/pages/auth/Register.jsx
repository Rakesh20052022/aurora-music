import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext.jsx"
import { Icon } from "../../components/Icon.jsx"
import { AuthVisual } from "./AuthVisual.jsx"
import "./auth.css"
import "../../components/ui/ui.css"

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: "", email: "", password: "" })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    setError("")
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }
    setLoading(true)
    try {
      await register(form)
      navigate("/", { replace: true })
    } catch (err) {
      setError(err.message || "Unable to create account")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-screen">
      <AuthVisual />
      <div className="auth-form-side">
        <div className="auth-card fade-in">
          <h2>Create your account</h2>
          <p className="sub">Start building your personal library in minutes.</p>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={onSubmit}>
            <div className="field">
              <label htmlFor="name">Display name</label>
              <input
                id="name"
                className="input"
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
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
                autoComplete="new-password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
            <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
              {loading ? <Icon name="disc" className="spin" size={18} /> : "Create account"}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
