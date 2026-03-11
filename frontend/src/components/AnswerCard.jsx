import Icon from './Icon.jsx'

export default function AnswerCard({ answerBox }) {
  if (!answerBox) return null
  const text = answerBox.answer ?? answerBox.snippet
  if (!text) return null

  return (
    <div className="answer-card">
      {answerBox.title && <p className="answer-title">{answerBox.title}</p>}
      <p className="answer-text">{text}</p>
      {answerBox.link && (
        <a className="answer-link" href={answerBox.link} target="_blank" rel="noopener noreferrer">
          {answerBox.link}
          <Icon name="external" size={12} />
        </a>
      )}
    </div>
  )
}
