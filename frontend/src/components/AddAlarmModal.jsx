import { useState, useEffect } from 'react'

const SEVERITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']

export default function AddAlarmModal({ open, onClose, onSubmit }) {
  const [form, setForm] = useState({ code: '', message: '', severity: 'MEDIUM' })
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      setForm({ code: '', message: '', severity: 'MEDIUM' })
      setError(null)
      setLoading(false)
    }
  }, [open])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  const validate = () => {
    if (!form.code.trim() || form.code.length < 2) return 'Code must be at least 2 characters'
    if (!/^[A-Z0-9_-]+$/.test(form.code))           return 'Code must be uppercase letters, digits, _ or -'
    if (!form.message.trim() || form.message.length < 3) return 'Message must be at least 3 characters'
    if (!SEVERITIES.includes(form.severity))        return 'Invalid severity'
    return null
  }

  const submit = async (e) => {
    e.preventDefault()
    setError(null)
    const v = validate()
    if (v) { setError(v); return }

    setLoading(true)
    try {
      await onSubmit({
        code: form.code.trim().toUpperCase(),
        message: form.message.trim(),
        severity: form.severity,
      })
      onClose()
    } catch (err) {
      setError(err.message || 'Failed to add alarm')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="add-alarm-title">
        <h3 id="add-alarm-title">Define new alarm</h3>
        <p className="modal-sub">A new entry in the alarm catalogue. Validation enforced server-side.</p>

        {error && <div className="auth-error" role="alert"><span>⚠</span><span>{error}</span></div>}

        <form onSubmit={submit} noValidate>
          <div className="field">
            <label htmlFor="al-code">Code</label>
            <input
              id="al-code"
              value={form.code}
              onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })}
              placeholder="e.g. PUMP_OVERLOAD"
              maxLength={30}
              autoFocus
              disabled={loading}
            />
          </div>

          <div className="field">
            <label htmlFor="al-msg">Message</label>
            <input
              id="al-msg"
              value={form.message}
              onChange={e => setForm({ ...form, message: e.target.value })}
              placeholder="Human-readable description"
              maxLength={500}
              disabled={loading}
            />
          </div>

          <div className="field">
            <label htmlFor="al-sev">Severity</label>
            <select
              id="al-sev"
              value={form.severity}
              onChange={e => setForm({ ...form, severity: e.target.value })}
              disabled={loading}
            >
              {SEVERITIES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="actions">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
            <button type="submit" className="btn-primary compact" disabled={loading}>
              {loading ? <><span className="spinner" /> Saving</> : 'Add alarm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
