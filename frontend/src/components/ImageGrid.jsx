export default function ImageGrid({ images }) {
  if (!images?.length) return null
  return (
    <div className="image-grid">
      {images.map((img, i) => (
        <a
          key={`${img.link}-${i}`}
          className="image-tile"
          href={img.link}
          target="_blank"
          rel="noopener noreferrer"
        >
          <img src={img.thumbnailUrl ?? img.imageUrl} alt={img.title ?? ''} loading="lazy" />
          {img.source && <span className="image-caption">{img.source}</span>}
        </a>
      ))}
    </div>
  )
}
