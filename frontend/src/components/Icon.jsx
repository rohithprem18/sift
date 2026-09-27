import { useId } from 'react'

const paths = {
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </>
  ),
  x: (
    <>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </>
  ),
  external: (
    <>
      <line x1="7" y1="17" x2="17" y2="7" />
      <polyline points="7 7 17 7 17 17" />
    </>
  ),
  play: <polygon points="7 4 20 12 7 20 7 4" fill="currentColor" />,
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <path d="M12 3a14 14 0 0 1 3.6 9A14 14 0 0 1 12 21a14 14 0 0 1-3.6-9A14 14 0 0 1 12 3z" />
    </>
  ),
  image: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </>
  ),
  news: (
    <>
      <path d="M4 21h15a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v14a2 2 0 0 1-2 2zm0 0a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2" />
      <line x1="10" y1="7" x2="17" y2="7" />
      <line x1="10" y1="11" x2="17" y2="11" />
      <line x1="10" y1="15" x2="14" y2="15" />
    </>
  ),
  video: (
    <>
      <rect x="2" y="5" width="14" height="14" rx="2" />
      <polygon points="22 7 16 12 22 17 22 7" />
    </>
  ),
  alert: (
    <>
      <circle cx="12" cy="12" r="9" />
      <line x1="12" y1="8" x2="12" y2="12.5" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </>
  ),
  'search-off': (
    <>
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
      <line x1="8.5" y1="8.5" x2="13.5" y2="13.5" />
      <line x1="13.5" y1="8.5" x2="8.5" y2="13.5" />
    </>
  ),
  chevron: <polyline points="6 9 12 15 18 9" />,
  refresh: (
    <>
      <polyline points="21 4 21 10 15 10" />
      <path d="M20.5 15a8.5 8.5 0 1 1-2-8.9L21 10" />
    </>
  ),
}

export default function Icon({ name, size = 18, className = '' }) {
  const path = paths[name]
  if (!path) return null
  return (
    <svg
      className={`icon ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {path}
    </svg>
  )
}

/** The Sift mark: three bars narrowing as they fall through a sieve. */
export function Mark({ size = 28 }) {
  const id = `mark-${useId().replace(/:/g, '')}`
  return (
    <svg className="mark" width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#ff9f5a" />
          <stop offset=".45" stopColor="#e93d9a" />
          <stop offset="1" stopColor="#533afd" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill={`url(#${id})`} />
      <rect x="8" y="9" width="16" height="3" rx="1.5" fill="#fff" />
      <rect x="10.5" y="14.5" width="11" height="3" rx="1.5" fill="#fff" opacity=".92" />
      <rect x="13" y="20" width="6" height="3" rx="1.5" fill="#fff" opacity=".84" />
    </svg>
  )
}
