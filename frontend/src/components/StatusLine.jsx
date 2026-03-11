import { useEffect, useState } from 'react'

const LABELS = {
  web: 'results',
  images: 'images',
  news: 'articles',
  videos: 'videos',
}

/**
 * Two things live here: the query gauge — the one animated signature
 * moment, under the search bar — and the plain status text (count ·
 * latency · cached) that persists after the gauge has settled and faded.
 */
export default function StatusLine({ gaugeState, type, count, tookMs, cached }) {
  const [showGaugeLatency, setShowGaugeLatency] = useState(false)

  useEffect(() => {
    setShowGaugeLatency(gaugeState === 'settled')
  }, [gaugeState])

  return (
    <div>
      <div className="gauge-row">
        <div className={`gauge is-${gaugeState}`}>
          <div className="gauge-fill" />
        </div>
        <span className={`gauge-latency${showGaugeLatency ? ' visible' : ''}`} aria-hidden="true">
          {tookMs != null ? `${tookMs} ms` : ''}
        </span>
      </div>

      {count != null && (
        <p className="status-line" role="status" aria-live="polite">
          <span>
            {count} {LABELS[type] ?? 'results'}
          </span>
          <span>{tookMs} ms</span>
          {cached && <span className="status-chip">Cached</span>}
        </p>
      )}
    </div>
  )
}
