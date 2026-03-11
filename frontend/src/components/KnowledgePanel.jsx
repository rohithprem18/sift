export default function KnowledgePanel({ knowledge }) {
  if (!knowledge) return null
  const attrs = knowledge.attributes ? Object.entries(knowledge.attributes) : []

  return (
    <aside className="knowledge-panel" aria-label="About this result">
      {knowledge.imageUrl && (
        <img className="knowledge-image" src={knowledge.imageUrl} alt="" loading="lazy" />
      )}
      {knowledge.title && <h2 className="knowledge-title">{knowledge.title}</h2>}
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
    </aside>
  )
}
