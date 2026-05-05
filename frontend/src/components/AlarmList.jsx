import AckButton from './AckButton.jsx'

/**
 * AlarmList — Week 2 spec.
 * Stable keys (using alarm.id), badge color consistency through severity classes.
 * Pagination handled by parent (Dashboard).
 */
export default function AlarmList({
  alarms,
  loading,
  onAck,
  onDelete,
  isAdmin,
}) {
  if (loading) {
    return (
      <div className="state-loading">
        <div className="spinner-lg" />
        Loading alarms…
      </div>
    )
  }

  if (!alarms || alarms.length === 0) {
    return (
      <div className="state-empty">
        No alarms match the current filter.
      </div>
    )
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="alarm-table">
        <thead>
          <tr>
            <th className="col-sev"></th>
            <th>Code</th>
            <th>Message</th>
            <th>Severity</th>
            <th>State</th>
            <th>Last event</th>
            <th>Ack’d by</th>
            <th style={{ textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {alarms.map(a => (
            <AlarmRow
              key={a.id}            /* ← stable key (Week 2 fix) */
              alarm={a}
              onAck={onAck}
              onDelete={onDelete}
              isAdmin={isAdmin}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}

function AlarmRow({ alarm, onAck, onDelete, isAdmin }) {
  const sevClass = `sev-${alarm.severity.toLowerCase()}`
  const stateClass = `state-${(alarm.currentState || 'CLEARED').toLowerCase()}`

  return (
    <tr className={`alarm-row ${sevClass}`}>
      <td className="col-sev"><span className="bar" /></td>
      <td><span className="code">{alarm.code}</span></td>
      <td><span className="msg" title={alarm.message}>{alarm.message}</span></td>
      <td>
        <span className={`sev-badge ${sevClass}`}>{alarm.severity}</span>
      </td>
      <td>
        <span className={`state-pill ${stateClass}`}>
          {alarm.currentState || 'CLEARED'}
        </span>
      </td>
      <td className="ts-cell">{formatTs(alarm.latestEventTs)}</td>
      <td className="ts-cell">{alarm.acknowledgedBy || '—'}</td>
      <td>
        <div className="row-actions">
          <AckButton alarm={alarm} onAck={onAck} />
          {isAdmin && (
            <button
              type="button"
              className="btn-row-icon danger"
              onClick={() => onDelete(alarm)}
              title="Delete alarm (admin only)"
              aria-label="Delete alarm"
            >
              <TrashIcon />
            </button>
          )}
        </div>
      </td>
    </tr>
  )
}

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
    </svg>
  )
}

function formatTs(ts) {
  if (!ts) return '—'
  const d = new Date(ts)
  if (isNaN(d.getTime())) return '—'

  const now = new Date()
  const sameDay = d.toDateString() === now.toDateString()
  const opts = sameDay
    ? { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }
    : { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }

  return d.toLocaleString(undefined, opts)
}
