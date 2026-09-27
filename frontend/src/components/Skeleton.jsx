const IMAGE_HEIGHTS = [180, 240, 150, 210, 260, 170, 220, 190, 150, 240, 200, 170]

function WebSkeleton() {
  return (
    <ul className="skeleton-list">
      {Array.from({ length: 6 }).map((_, i) => (
        <li key={i} className="skeleton-result">
          <div className="skeleton-source">
            <span className="skeleton skeleton-circle" />
            <span className="skeleton skeleton-line" style={{ width: 140 }} />
          </div>
          <span className="skeleton skeleton-line skeleton-title" />
          <span className="skeleton skeleton-line" style={{ width: '94%' }} />
          <span className="skeleton skeleton-line" style={{ width: '72%' }} />
        </li>
      ))}
    </ul>
  )
}

function ImageSkeleton() {
  return (
    <div className="image-grid">
      {IMAGE_HEIGHTS.map((h, i) => (
        <span key={i} className="skeleton skeleton-tile" style={{ height: h }} />
      ))}
    </div>
  )
}

function NewsSkeleton() {
  return (
    <ul className="skeleton-list">
      {Array.from({ length: 5 }).map((_, i) => (
        <li key={i} className="skeleton-news">
          <div className="skeleton-news-body">
            <span className="skeleton skeleton-line" style={{ width: 160 }} />
            <span className="skeleton skeleton-line skeleton-title" />
            <span className="skeleton skeleton-line" style={{ width: '88%' }} />
          </div>
          <span className="skeleton skeleton-thumb" />
        </li>
      ))}
    </ul>
  )
}

function VideoSkeleton() {
  return (
    <div className="video-grid">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i}>
          <span className="skeleton skeleton-video" />
          <span className="skeleton skeleton-line skeleton-title" />
          <span className="skeleton skeleton-line" style={{ width: '40%' }} />
        </div>
      ))}
    </div>
  )
}

export default function Skeleton({ type }) {
  return (
    <div className="skeleton-wrap" aria-hidden="true">
      {type === 'images' && <ImageSkeleton />}
      {type === 'news' && <NewsSkeleton />}
      {type === 'videos' && <VideoSkeleton />}
      {type === 'web' && <WebSkeleton />}
    </div>
  )
}
