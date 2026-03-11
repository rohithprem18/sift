function SkeletonItem() {
  return (
    <li className="skeleton-item" aria-hidden="true">
      <span className="skeleton skeleton-line" style={{ height: 12 }} />
      <div className="skeleton-lines">
        <span className="skeleton skeleton-line domain" />
        <span className="skeleton skeleton-line title" />
        <span className="skeleton skeleton-line snippet" />
        <span className="skeleton skeleton-line snippet" />
      </div>
    </li>
  )
}

export default function Skeleton({ count = 6 }) {
  return (
    <ul className="result-list" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonItem key={i} />
      ))}
    </ul>
  )
}
