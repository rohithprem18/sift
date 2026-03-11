export default function RelatedSearches({ items, onPick }) {
  if (!items?.length) return null
  return (
    <div className="related">
      <p className="related-title">Related searches</p>
      <div className="related-chips">
        {items.map((q) => (
          <button key={q} type="button" className="chip" onClick={() => onPick(q)}>
            {q}
          </button>
        ))}
      </div>
    </div>
  )
}
