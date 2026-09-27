import Icon from './Icon.jsx'

export default function RelatedSearches({ items, onPick }) {
  if (!items?.length) return null
  return (
    <section className="related" aria-labelledby="related-title">
      <h2 id="related-title" className="section-title">Related searches</h2>
      <div className="related-grid">
        {items.map((q, i) => (
          <button key={`${q}-${i}`} type="button" className="related-item" onClick={() => onPick(q)}>
            <Icon name="search" size={15} />
            <span>{q}</span>
          </button>
        ))}
      </div>
    </section>
  )
}
