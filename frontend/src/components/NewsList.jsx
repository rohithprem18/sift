import { useState } from 'react'
import Favicon from './Favicon.jsx'
import { hostOf } from '../url.js'

function NewsItem({ item }) {
  const [thumbFailed, setThumbFailed] = useState(false)
  const host = hostOf(item.link)

  return (
    <li className="news-item">
      <div className="news-body">
        <div className="news-meta">
          <Favicon host={host} size={20} />
          <span className="news-source">{item.source || host}</span>
          {item.date && <span className="news-date">{item.date}</span>}
        </div>
        <a className="news-title" href={item.link} target="_blank" rel="noopener noreferrer">
          {item.title}
        </a>
        {item.snippet && <p className="news-snippet">{item.snippet}</p>}
      </div>
      {item.imageUrl && !thumbFailed && (
        <img className="news-thumb" src={item.imageUrl} alt="" loading="lazy" onError={() => setThumbFailed(true)} />
      )}
    </li>
  )
}

export default function NewsList({ news }) {
  if (!news?.length) return null
  return (
    <ul className="news-list">
      {news.map((n, i) => (
        <NewsItem key={`${n.link}-${i}`} item={n} />
      ))}
    </ul>
  )
}
