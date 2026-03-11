import Icon from './Icon.jsx'

export default function VideoList({ videos }) {
  if (!videos?.length) return null
  return (
    <div className="video-grid">
      {videos.map((v, i) => (
        <a
          key={`${v.link}-${i}`}
          className="video-item"
          href={v.link}
          target="_blank"
          rel="noopener noreferrer"
        >
          <div className="video-thumb-wrap">
            {v.imageUrl && <img src={v.imageUrl} alt="" loading="lazy" />}
            <span className="video-play">
              <Icon name="play" size={28} />
            </span>
            {v.duration && <span className="video-duration">{v.duration}</span>}
          </div>
          <p className="video-title">{v.title}</p>
          {v.channel && <p className="video-channel">{v.channel}</p>}
        </a>
      ))}
    </div>
  )
}
