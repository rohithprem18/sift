import Icon from './Icon.jsx'
import { hostOf } from '../url.js'

export default function Questions({ items }) {
  if (!items?.length) return null
  return (
    <section className="questions" aria-labelledby="questions-title">
      <h2 id="questions-title" className="section-title">People also ask</h2>
      <div className="questions-list">
        {items.map((q, i) => (
          <details key={i} className="question">
            <summary>
              <span>{q.question}</span>
              <Icon name="chevron" size={18} className="question-chevron" />
            </summary>
            <div className="question-body">
              {q.snippet && <p>{q.snippet}</p>}
              {q.link && (
                <a href={q.link} target="_blank" rel="noopener noreferrer">
                  Read more on {hostOf(q.link)}
                </a>
              )}
            </div>
          </details>
        ))}
      </div>
    </section>
  )
}
