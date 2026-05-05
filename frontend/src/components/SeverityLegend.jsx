/**
 * SeverityLegend — required by Week 2 spec.
 * Visual key for the four severity levels with consistent badge colors.
 */
const SEVERITIES = [
  { key: 'CRITICAL', label: 'Critical', desc: 'Immediate action' },
  { key: 'HIGH',     label: 'High',     desc: 'Urgent' },
  { key: 'MEDIUM',   label: 'Medium',   desc: 'Investigate' },
  { key: 'LOW',      label: 'Low',      desc: 'Informational' },
]

export default function SeverityLegend({ counts = {} }) {
  return (
    <div className="sev-legend">
      {SEVERITIES.map(s => (
        <div key={s.key} className={`item sev-${s.key.toLowerCase()}`}>
          <span className="indicator" />
          <span className="label">{s.label}</span>
          <span className="desc">{counts[s.key] != null ? `${counts[s.key]} alarms` : s.desc}</span>
        </div>
      ))}
    </div>
  )
}
