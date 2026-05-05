/**
 * DonutChart — percentage active vs cleared (per Week 2 spec).
 * Pure SVG, no chart library. Animated stroke-dasharray reveal.
 */
export default function DonutChart({ stats }) {
  const active = stats?.active || 0
  const ack    = stats?.acknowledged || 0
  const cleared = stats?.cleared || 0
  const total = active + ack + cleared

  const pctActive   = total ? (active / total) * 100 : 0
  const pctAck      = total ? (ack    / total) * 100 : 0
  const pctCleared  = total ? (cleared / total) * 100 : 0

  // Big number = % active (most operationally meaningful metric)
  const headlinePct = total ? Math.round(pctActive) : 0

  const C = 2 * Math.PI * 80   // radius 80, circumference

  // Stroke offsets for layered arcs
  const segActiveLen   = (pctActive   / 100) * C
  const segAckLen      = (pctAck      / 100) * C
  const segClearedLen  = (pctCleared  / 100) * C

  // Cumulative offsets so arcs don't overlap
  const offsetAck     = segActiveLen
  const offsetCleared = segActiveLen + segAckLen

  return (
    <div className="donut-wrap">
      <div className="donut-shell">
        <svg className="donut-svg" width="220" height="220" viewBox="0 0 220 220">
          {/* Track */}
          <circle cx="110" cy="110" r="80"
                  fill="none"
                  stroke="var(--bg-elevated)"
                  strokeWidth="22" />

          {/* Cleared (green) */}
          {pctCleared > 0 && (
            <circle cx="110" cy="110" r="80"
                    fill="none"
                    stroke="var(--state-cleared)"
                    strokeWidth="22"
                    strokeDasharray={`${segClearedLen} ${C - segClearedLen}`}
                    strokeDashoffset={-offsetCleared}
                    strokeLinecap="butt"
                    transform="rotate(-90 110 110)" />
          )}

          {/* Acknowledged (amber) */}
          {pctAck > 0 && (
            <circle cx="110" cy="110" r="80"
                    fill="none"
                    stroke="var(--state-acknowledged)"
                    strokeWidth="22"
                    strokeDasharray={`${segAckLen} ${C - segAckLen}`}
                    strokeDashoffset={-offsetAck}
                    strokeLinecap="butt"
                    transform="rotate(-90 110 110)" />
          )}

          {/* Active (red) — drawn last so its glow is on top */}
          {pctActive > 0 && (
            <circle cx="110" cy="110" r="80"
                    fill="none"
                    stroke="var(--state-active)"
                    strokeWidth="22"
                    strokeDasharray={`${segActiveLen} ${C - segActiveLen}`}
                    strokeDashoffset={0}
                    strokeLinecap="butt"
                    transform="rotate(-90 110 110)"
                    style={{ filter: 'drop-shadow(0 0 6px rgba(239,68,68,0.6))' }} />
          )}

          {/* Empty state ring */}
          {total === 0 && (
            <circle cx="110" cy="110" r="80"
                    fill="none"
                    stroke="var(--border)"
                    strokeWidth="22"
                    strokeDasharray="2 4" />
          )}
        </svg>

        <div className="donut-center">
          <div className="donut-pct">{headlinePct}<span style={{ fontSize: '1.25rem', color: 'var(--text-muted)' }}>%</span></div>
          <div className="donut-lbl">Active load</div>
        </div>
      </div>

      <div className="donut-legend">
        <LegendItem color="var(--state-active)"        label="Active"  value={active} />
        <LegendItem color="var(--state-acknowledged)"  label="Ack’d"   value={ack} />
        <LegendItem color="var(--state-cleared)"       label="Cleared" value={cleared} />
        <LegendItem color="var(--border-strong)"       label="Total"   value={total} />
      </div>
    </div>
  )
}

function LegendItem({ color, label, value }) {
  return (
    <div className="item">
      <span className="swatch" style={{ background: color }} />
      <span className="lbl-name">{label}</span>
      <span className="val mono">{value}</span>
    </div>
  )
}
