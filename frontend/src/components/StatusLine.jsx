const LABELS = {
  web: ['result', 'results'],
  images: ['image', 'images'],
  news: ['article', 'articles'],
  videos: ['video', 'videos'],
}

/**
 * The query gauge — the one animated signature moment, a hairline under
 * the search bar that sweeps while a request is in flight, settles when
 * it lands, and prints the latency at its right end.
 */
export function Gauge({ state, tookMs }) {
  return (
    <div className="gauge-row" aria-hidden="true">
      <div className={`gauge is-${state}`}>
        <div className="gauge-fill" />
      </div>
      <span className={`gauge-latency${state === 'settled' ? ' visible' : ''}`}>
        {tookMs != null ? `${tookMs} ms` : ''}
      </span>
    </div>
  )
}

/** count · latency · cached — stays on screen while the next search runs. */
export default function StatusLine({ loading, type, count, tookMs, cached }) {
  const [one, many] = LABELS[type] ?? LABELS.web

  return (
    <p className="status-line" role="status" aria-live="polite">
      {count != null && (
        <>
          <span className="status-count">
            {count} {count === 1 ? one : many}
          </span>
          {tookMs != null && <span className="status-dot">{tookMs} ms</span>}
          {cached && <span className="status-chip">Cached</span>}
        </>
      )}
      {loading && <span className="status-loading">Searching</span>}
    </p>
  )
}
