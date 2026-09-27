import { useState } from 'react'

export default function KnowledgePanel({ knowledge }) {
  const [imageFailed, setImageFailed] = useState(false)
  if (!knowledge?.title) return null
  const attrs = knowledge.attributes ? Object.entries(knowledge.attributes) : []

  return (
    <aside className="knowledge-panel" aria-label={`About ${knowledge.title}`}>
      {knowledge.imageUrl && !imageFailed && (
        <div className="knowledge-image">
          <img src={knowledge.imageUrl} alt="" loading="lazy" onError={() => setImageFailed(true)} />
        </div>
      )}
      <div className="knowledge-body">
        <h2 className="knowledge-title">{knowledge.title}</h2>
        {knowledge.type && <p className="knowledge-type">{knowledge.type}</p>}
        {knowledge.description && <p className="knowledge-desc">{knowledge.description}</p>}
        {attrs.length > 0 && (
          <dl className="knowledge-attrs">
            {attrs.map(([key, value]) => (
              <div key={key}>
                <dt>{key}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </aside>
  )
}
