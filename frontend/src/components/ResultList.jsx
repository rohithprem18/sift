function ResultItem({ result }) {
  return (
    <li className="result-item">
      <span className="result-rank">{String(result.position).padStart(2, '0')}</span>
      <div className="result-body">
        {result.displayLink && <span className="result-domain">{result.displayLink}</span>}
        <a
          className="result-title"
          href={result.link}
          target="_blank"
          rel="noopener noreferrer"
        >
          {result.title}
          {result.date && <span className="result-date"> — {result.date}</span>}
        </a>
        {result.snippet && <p className="result-snippet">{result.snippet}</p>}
        {result.sitelinks?.length > 0 && (
          <ul className="result-sitelinks">
            {result.sitelinks.map((s, i) => (
              <li key={i}>
                <a href={s.link} target="_blank" rel="noopener noreferrer">
                  {s.title}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </li>
  )
}

export default function ResultList({ results }) {
  if (!results?.length) return null
  return (
    <ul className="result-list">
      {results.map((r) => (
        <ResultItem key={`${r.position}-${r.link}`} result={r} />
      ))}
    </ul>
  )
}
