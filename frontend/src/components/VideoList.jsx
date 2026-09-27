import { useState } from 'react'
import Icon from './Icon.jsx'
import { hostOf } from '../url.js'

function VideoCard({ video }) {
  const [thumbFailed, setThumbFailed] = useState(false)
  const showThumb = video.imageUrl && !thumbFailed

  return (
    <a className="video-card" href={video.link} target="_blank" rel="noopener noreferrer">
      <div className={`video-thumb${showThumb ? '' : ' is-empty'}`}>
        {showThumb && <img src={video.imageUrl} alt="" loading="lazy" onError={() => setThumbFailed(true)} />}
        <span className="video-play">
          <Icon name="play" size={18} />
        </span>
        {video.duration && <span className="video-duration">{video.duration}</span>}
      </div>
      <div className="video-body">
        <p className="video-title">{video.title}</p>
        <p className="video-meta">
          {video.channel && <span>{video.channel}</span>}
          <span>{hostOf(video.link)}</span>
        </p>
      </div>
    </a>
  )
}

export default function VideoList({ videos }) {
  if (!videos?.length) return null
  return (
    <div className="video-grid">
      {videos.map((v, i) => (
        <VideoCard key={`${v.link}-${i}`} video={v} />
      ))}
    </div>
  )
}
