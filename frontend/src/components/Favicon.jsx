import { useState } from 'react'
import { faviconUrl } from '../url.js'

export default function Favicon({ host, size = 28 }) {
  const [failed, setFailed] = useState(false)
  const initial = (host || '?').charAt(0).toUpperCase()

  return (
    <span className="favicon" style={{ width: size, height: size }} aria-hidden="true">
      {host && !failed ? (
        <img src={faviconUrl(host)} alt="" width={size / 2 + 2} height={size / 2 + 2} loading="lazy" onError={() => setFailed(true)} />
      ) : (
        <span className="favicon-letter">{initial}</span>
      )}
    </span>
  )
}
