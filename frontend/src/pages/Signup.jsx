import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import '../styles/auth.css'

export default function Signup() {
  const { signup, loading } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirm: '',
    role: 'ROLE_OPERATOR',
  })
  const [error, setError] = useState(null)

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const validate = () => {
    if (!form.username.trim() || form.username.length < 3) return 'Username must be at least 3 characters'
    if (!/^[a-zA-Z0-9_.-]+$/.test(form.username))            return 'Username may only contain letters, digits, _ . -'
    if (!form.email.trim())                                  return 'Email is required'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))      return 'Email must be valid'
    if (!form.password || form.password.length < 6)          return 'Password must be at least 6 characters'
    if (form.password !== form.confirm)                      return 'Passwords do not match'
    if (!form.role)                                          return 'Role is required'
    return null
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    const v = validate()
    if (v) { setError(v); return }

    try {
      await signup({
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role,
      })
      navigate('/', { replace: true })
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="auth-shell">
      <aside className="auth-side">
        <div className="brand-mark">
          <span className="dot" />
          <span className="name">HMI<span>·</span>BOARD</span>
        </div>
        <div className="auth-headline">
          <h1>Provision a new<br /><em>operator account.</em></h1>
          <p>
            Create credentials with a clear role. <strong>Operators</strong> view the board and acknowledge
            active alarms. <strong>Administrators</strong> additionally curate the alarm catalogue and prune
            historical events.
          </p>
        </div>
        <div className="auth-meta">
          <span><b>POLICY</b>JWT · 24h tokens</span>
          <span><b>HASH</b>BCrypt</span>
          <span><b>STORAGE</b>Encrypted at rest</span>
        </div>
      </aside>

      <section className="auth-pane">
        <div className="auth-card">
          <h2>Create account</h2>
          <p className="auth-sub">All fields are required. Choose a role appropriate to your duties.</p>

          {error && (
            <div className="auth-error" role="alert">
              <span>⚠</span><span>{error}</span>
            </div>
          )}

          <form onSubmit={onSubmit} noValidate>
            <div className="field">
              <label htmlFor="username">Username</label>
              <input
                id="username" name="username" type="text" autoComplete="username"
                placeholder="e.g. j.lee"
                value={form.username} onChange={onChange} disabled={loading}
                minLength={3} maxLength={50}
              />
            </div>

            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                id="email" name="email" type="email" autoComplete="email"
                placeholder="you@plant.local"
                value={form.email} onChange={onChange} disabled={loading}
              />
            </div>

            <div className="field">
              <label htmlFor="password">Password</label>
              <input
                id="password" name="password" type="password" autoComplete="new-password"
                placeholder="At least 6 characters"
                value={form.password} onChange={onChange} disabled={loading}
                minLength={6} maxLength={100}
              />
            </div>

            <div className="field">
              <label htmlFor="confirm">Confirm password</label>
              <input
                id="confirm" name="confirm" type="password" autoComplete="new-password"
                placeholder="Repeat password"
                value={form.confirm} onChange={onChange} disabled={loading}
              />
            </div>

            <div className="field">
              <label>Role</label>
              <div className="role-pick">
                <button
                  type="button"
                  className={form.role === 'ROLE_OPERATOR' ? 'active' : ''}
                  onClick={() => setForm({ ...form, role: 'ROLE_OPERATOR' })}
                >
                  <span className="rp-name">Operator</span>
                  <span className="rp-desc">VIEW · ACK</span>
                </button>
                <button
                  type="button"
                  className={form.role === 'ROLE_ADMIN' ? 'active' : ''}
                  onClick={() => setForm({ ...form, role: 'ROLE_ADMIN' })}
                >
                  <span className="rp-name">Admin</span>
                  <span className="rp-desc">FULL CONTROL</span>
                </button>
              </div>
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? <><span className="spinner" /> Creating</> : 'Create account'}
            </button>
          </form>

          <p className="auth-bottom">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </section>
    </div>
  )
}
