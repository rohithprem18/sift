import Icon from './Icon.jsx'
import { hostOf } from '../url.js'

export default function AnswerCard({ answerBox }) {
  if (!answerBox) return null
  const text = answerBox.answer ?? answerBox.snippet
  if (!text) return null
  const host = hostOf(answerBox.link)

  return (
    <section className="answer-card" aria-label="Answer">
      <p className="eyebrow">{answerBox.title || 'Answer'}</p>
      <p className={`answer-text${text.length > 140 ? ' is-long' : ''}`}>{text}</p>
      {answerBox.link && host && (
        <a className="answer-link" href={answerBox.link} target="_blank" rel="noopener noreferrer">
          {host}
          <Icon name="external" size={14} />
        </a>
      )}
    </section>
  )
}
