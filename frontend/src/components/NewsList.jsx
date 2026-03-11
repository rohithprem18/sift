export default function NewsList({ news }) {
  if (!news?.length) return null
  return (
    <ul className="news-list">
      {news.map((n, i) => (
        <li key={`${n.link}-${i}`} className="news-item">
          <div className="result-body">
            <span className="news-meta">
              {n.source && <span>{n.source}</span>}
              {n.date && <span>{n.date}</span>}
            </span>
            <a className="news-title" href={n.link} target="_blank" rel="noopener noreferrer">
              {n.title}
            </a>
            {n.snippet && <p className="news-snippet">{n.snippet}</p>}
          </div>
          {n.imageUrl && <img className="news-thumb" src={n.imageUrl} alt="" loading="lazy" />}
        </li>
      ))}
    </ul>
  )
}
