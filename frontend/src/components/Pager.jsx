/**
 * Pager — server-side pagination control. Renders smart page numbers
 * (current ± 1, plus first/last with ellipsis) and a page-size selector.
 */
export default function Pager({
  page, totalPages, totalElements, pageSize,
  onPageChange, onSizeChange,
}) {
  if (totalElements === 0) return null

  const pages = buildPageList(page, totalPages)

  const start = page * pageSize + 1
  const end = Math.min((page + 1) * pageSize, totalElements)

  return (
    <div className="pager">
      <div>
        Showing <span style={{ color: 'var(--text-primary)' }}>{start}–{end}</span>
        &nbsp;of <span style={{ color: 'var(--text-primary)' }}>{totalElements}</span>
      </div>

      <div className="pager-controls">
        <button className="pager-btn" onClick={() => onPageChange(0)} disabled={page === 0} title="First">«</button>
        <button className="pager-btn" onClick={() => onPageChange(page - 1)} disabled={page === 0} title="Previous">‹</button>

        {pages.map((p, i) => (
          p === '…'
            ? <span key={`e${i}`} style={{ padding: '0 0.3rem' }}>…</span>
            : (
              <button
                key={p}
                className={`pager-btn ${p === page ? 'current' : ''}`}
                onClick={() => onPageChange(p)}
              >
                {p + 1}
              </button>
            )
        ))}

        <button className="pager-btn" onClick={() => onPageChange(page + 1)} disabled={page >= totalPages - 1} title="Next">›</button>
        <button className="pager-btn" onClick={() => onPageChange(totalPages - 1)} disabled={page >= totalPages - 1} title="Last">»</button>

        <select
          className="page-size-select"
          value={pageSize}
          onChange={e => onSizeChange(Number(e.target.value))}
          title="Page size"
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
      </div>
    </div>
  )
}

function buildPageList(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i)
  const out = []
  out.push(0)
  if (current > 2) out.push('…')
  for (let p = Math.max(1, current - 1); p <= Math.min(total - 2, current + 1); p++) out.push(p)
  if (current < total - 3) out.push('…')
  out.push(total - 1)
  return out
}
