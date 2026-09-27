import { useState } from 'react'

/**
 * Thumbnails load first (Google-hosted, fast, reliable). If one fails we try
 * the original, and if that fails too the tile is dropped rather than shown
 * as a broken image.
 */
function ImageTile({ img }) {
  const sources = [img.thumbnailUrl, img.imageUrl].filter(Boolean)
  const [attempt, setAttempt] = useState(0)

  if (attempt >= sources.length) return null

  return (
    <a className="image-tile" href={img.link} target="_blank" rel="noopener noreferrer">
      <img
        src={sources[attempt]}
        alt={img.title ?? ''}
        loading="lazy"
        onError={() => setAttempt((a) => a + 1)}
      />
      <span className="image-overlay">
        {img.title && <span className="image-title">{img.title}</span>}
        {img.source && <span className="image-source">{img.source}</span>}
      </span>
    </a>
  )
}

export default function ImageGrid({ images }) {
  if (!images?.length) return null
  return (
    <div className="image-grid">
      {images.map((img, i) => (
        <ImageTile key={`${img.link}-${i}`} img={img} />
      ))}
    </div>
  )
}
