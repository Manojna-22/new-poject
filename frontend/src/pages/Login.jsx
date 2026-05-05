import { useState } from 'react'
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import '../styles/auth.css'

export default function Login() {
  const { signin, loading } = useAuth()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const location = useLocation()
  const reason = params.get('reason')

  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState(null)

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const onSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!form.username.trim() || !form.password) {
      setError('Username and password are required')
      return
    }

    try {
      await signin(form.username.trim(), form.password)
      const redirectTo = location.state?.from?.pathname || '/'
      navigate(redirectTo, { replace: true })
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="auth-shell">
      <SidePane />
      <section className="auth-pane">
        <div className="auth-card">
          <h2>Sign in</h2>
          <p className="auth-sub">Authenticate to access the alarm acknowledgement board.</p>

          {reason === 'expired' && (
            <div className="auth-info">Your session expired. Please sign in again.</div>
          )}
          {error && (
            <div className="auth-error" role="alert">
              <span>⚠</span><span>{error}</span>
            </div>
          )}

          <form onSubmit={onSubmit} noValidate>
            <div className="field">
              <label htmlFor="username">Operator ID</label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                placeholder="e.g. admin"
                value={form.username}
                onChange={onChange}
                disabled={loading}
                autoFocus
              />
            </div>

            <div className="field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={form.password}
                onChange={onChange}
                disabled={loading}
              />
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? <><span className="spinner" /> Authenticating</> : 'Sign in'}
            </button>
          </form>

          <p className="auth-bottom">
            New here? <Link to="/signup">Create an account</Link>
          </p>

          <div className="help-creds">
            <b>SEEDED CREDENTIALS</b><br />
            ADMIN&nbsp;&nbsp;&nbsp; → admin / admin123<br />
            OPERATOR → operator / operator123
          </div>
        </div>
      </section>
    </div>
  )
}

function SidePane() {
  return (
    <aside className="auth-side">
      <div className="brand-mark">
        <span className="dot" />
        <span className="name">HMI<span>·</span>BOARD</span>
      </div>

      <div className="auth-headline">
        <h1>Alarm acknowledgement,<br /><em>without the noise.</em></h1>
        <p>
          A real-time view of plant-floor alarms — severity-coded, paginated, role-aware. Operators
          acknowledge active conditions; administrators curate the alarm catalogue.
        </p>
      </div>

      <div className="auth-meta">
        <span><b>SYSTEM</b>HMI/AAB v1.0</span>
        <span><b>BUILD</b>JDK 21 · Spring 3.3</span>
        <span><b>STATUS</b><span style={{ color: 'var(--state-cleared)' }}>● ONLINE</span></span>
      </div>
    </aside>
  )
}
