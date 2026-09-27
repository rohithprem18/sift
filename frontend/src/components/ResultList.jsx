import Favicon from './Favicon.jsx'
import { breadcrumbOf, hostOf } from '../url.js'

function ResultItem({ result }) {
  const host = result.displayLink || hostOf(result.link)

  return (
    <li className="result">
      <div className="result-source">
        <Favicon host={host} size={24} />
        <p className="result-source-text">
          <span className="result-host">{host}</span>
          <span className="result-crumb">{breadcrumbOf(result.link)}</span>
        </p>
        <span className="result-rank">{String(result.position).padStart(2, '0')}</span>
      </div>
      <a className="result-title" href={result.link} target="_blank" rel="noopener noreferrer">
        {result.title}
      </a>
      {result.snippet && (
        <p className="result-snippet">
          {result.date && <span className="result-date">{result.date} — </span>}
          {result.snippet}
        </p>
      )}
      {result.sitelinks?.length > 0 && (
        <ul className="sitelinks">
          {result.sitelinks.map((s, i) => (
            <li key={i}>
              <a className="sitelink" href={s.link} target="_blank" rel="noopener noreferrer">
                {s.title}
              </a>
            </li>
          ))}
        </ul>
      )}
    </li>
  )
}

export default function ResultList({ results }) {
  if (!results?.length) return null
  return (
    <ol className="result-list">
      {results.map((r, i) => (
        <ResultItem key={`${r.position}-${r.link}-${i}`} result={r} />
      ))}
    </ol>
  )
}
