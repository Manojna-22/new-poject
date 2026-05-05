import { useEffect, useState, useCallback, useRef } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { alarmApi, eventApi, extractError } from '../services/api.js'
import AlarmList from '../components/AlarmList.jsx'
import SeverityLegend from '../components/SeverityLegend.jsx'
import DonutChart from '../components/DonutChart.jsx'
import Pager from '../components/Pager.jsx'
import AddAlarmModal from '../components/AddAlarmModal.jsx'
import { ToastProvider, useToast } from '../components/Toast.jsx'
import '../styles/dashboard.css'

const SEVERITIES = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']
const POLL_MS = 10000  // real-time poll every 10s (per spec line 1)

export default function DashboardWrapper() {
  return (
    <ToastProvider>
      <Dashboard />
    </ToastProvider>
  )
}

function Dashboard() {
  const { user, signout, isAdmin } = useAuth()
  const toast = useToast()

  const [alarms, setAlarms] = useState([])
  const [loadingList, setLoadingList] = useState(true)
  const [stats, setStats] = useState(null)

  const [page, setPage] = useState(0)
  const [size, setSize] = useState(10)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [severity, setSeverity] = useState(null)

  const [showAdd, setShowAdd] = useState(false)
  const [now, setNow] = useState(new Date())

  // Track polling visibility — pause when tab hidden
  const visibleRef = useRef(true)

  /* ---------- Fetchers ---------- */

  const fetchAlarms = useCallback(async (silent = false) => {
    if (!silent) setLoadingList(true)
    try {
      const params = { page, size, sortBy: 'id', sortDir: 'desc' }
      if (severity) params.severity = severity
      const { data } = await alarmApi.list(params)
      setAlarms(data.content || [])
      setTotalPages(data.totalPages || 0)
      setTotalElements(data.totalElements || 0)
    } catch (err) {
      if (!silent) toast.error(extractError(err))
    } finally {
      if (!silent) setLoadingList(false)
    }
  }, [page, size, severity, toast])

  const fetchStats = useCallback(async () => {
    try {
      const { data } = await alarmApi.stats()
      setStats(data)
    } catch (err) {
      // silently ignore stats failures (chart will just show empty)
    }
  }, [])

  /* ---------- Initial load + filter/page change ---------- */

  useEffect(() => {
    fetchAlarms()
    fetchStats()
  }, [fetchAlarms, fetchStats])

  /* ---------- Polling ---------- */

  useEffect(() => {
    const onVis = () => { visibleRef.current = !document.hidden }
    document.addEventListener('visibilitychange', onVis)

    const id = setInterval(() => {
      if (visibleRef.current) {
        fetchAlarms(true)
        fetchStats()
      }
    }, POLL_MS)

    return () => {
      clearInterval(id)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [fetchAlarms, fetchStats])

  /* ---------- Live clock ---------- */

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  /* ---------- Actions ---------- */

  const handleAck = async (alarm) => {
    try {
      await eventApi.acknowledge(alarm.id)
      toast.success(`Acknowledged ${alarm.code}`)
      await Promise.all([fetchAlarms(true), fetchStats()])
    } catch (err) {
      toast.error(extractError(err))
    }
  }

  const handleDelete = async (alarm) => {
    if (!isAdmin) {
      toast.error('Only administrators can delete alarms')
      return
    }
    if (!window.confirm(`Delete alarm ${alarm.code}? This also removes its event history.`)) return
    try {
      await alarmApi.delete(alarm.id)
      toast.success(`Deleted ${alarm.code}`)
      // If we just emptied the current page, step back one
      if (alarms.length === 1 && page > 0) setPage(page - 1)
      else { await fetchAlarms(true); await fetchStats() }
    } catch (err) {
      toast.error(extractError(err))
    }
  }

  const handleAdd = async (payload) => {
    try {
      await alarmApi.create(payload)
      toast.success(`Added ${payload.code}`)
      setPage(0)
      await Promise.all([fetchAlarms(true), fetchStats()])
    } catch (err) {
      throw new Error(extractError(err))
    }
  }

  const onSignout = async () => {
    await signout()
    // Router will redirect via the protected route
  }

  /* ---------- Render ---------- */

  const sevCounts = stats?.bySeverity || {}

  return (
    <div className="dash-shell">
      <Topbar user={user} now={now} onSignout={onSignout} />

      <main className="dash-main">
        <aside className="sidebar">
          <section className="panel">
            <div className="panel-header">
              <span className="panel-title">Status overview</span>
              <span className="panel-sub">{stats?.total ?? 0} alarms</span>
            </div>
            <DonutChart stats={stats || {}} />
            <div className="kpi-row">
              <div className="kpi active"><div className="num">{stats?.active ?? 0}</div><div className="lbl">Active</div></div>
              <div className="kpi ack"><div className="num">{stats?.acknowledged ?? 0}</div><div className="lbl">Ack’d</div></div>
              <div className="kpi cleared"><div className="num">{stats?.cleared ?? 0}</div><div className="lbl">Cleared</div></div>
            </div>
          </section>

          <section className="panel">
            <div className="panel-header">
              <span className="panel-title">Severity legend</span>
              <span className="panel-sub">By severity</span>
            </div>
            <SeverityLegend counts={sevCounts} />
          </section>
        </aside>

        <section className="panel">
          <div className="panel-header">
            <span className="panel-title">Alarm board</span>
            <button
              className="add-alarm-btn"
              onClick={() => setShowAdd(true)}
              title="Define a new alarm"
            >
              <span className="plus">+</span> New alarm
            </button>
          </div>

          <div className="filter-bar">
            <button
              className={`filter-chip ${severity === null ? 'active' : ''}`}
              onClick={() => { setSeverity(null); setPage(0) }}
            >
              All <span className="ct">{stats?.total ?? 0}</span>
            </button>
            {SEVERITIES.map(s => (
              <button
                key={s}
                className={`filter-chip ${severity === s ? 'active' : ''}`}
                onClick={() => { setSeverity(s); setPage(0) }}
              >
                {s} <span className="ct">{sevCounts[s] ?? 0}</span>
              </button>
            ))}
          </div>

          <AlarmList
            alarms={alarms}
            loading={loadingList}
            onAck={handleAck}
            onDelete={handleDelete}
            isAdmin={isAdmin}
          />

          <Pager
            page={page}
            totalPages={totalPages}
            totalElements={totalElements}
            pageSize={size}
            onPageChange={setPage}
            onSizeChange={(n) => { setSize(n); setPage(0) }}
          />
        </section>
      </main>

      <AddAlarmModal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        onSubmit={handleAdd}
      />
    </div>
  )
}

function Topbar({ user, now, onSignout }) {
  const initials = (user?.username || 'U').slice(0, 2).toUpperCase()
  const isAdmin = user?.role === 'ROLE_ADMIN'

  return (
    <header className="topbar">
      <div className="brand">
        <span className="dot" />
        <span>HMI<span style={{ color: 'var(--accent)' }}>·</span>BOARD</span>
      </div>

      <span className="live-tag">
        <span className="blink" /> Live · poll 10s
      </span>

      <span className="grow" />

      <span className="clock mono">{formatClock(now)}</span>

      <div className="user-chip">
        <div className="avatar">{initials}</div>
        <div className="who">
          <span className="uname">{user?.username}</span>
          <span className={`role-tag ${isAdmin ? 'admin' : ''}`}>
            {isAdmin ? 'ADMIN' : 'OPERATOR'}
          </span>
        </div>
      </div>

      <button className="btn-ghost danger" onClick={onSignout} title="Sign out">
        Sign out
      </button>
    </header>
  )
}

function formatClock(d) {
  const pad = (n) => String(n).padStart(2, '0')
  const date = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
  const time = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
  return `${date}  ${time}`
}
