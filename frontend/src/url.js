function parse(link) {
  try {
    return new URL(link)
  } catch {
    return null
  }
}

function safeDecode(segment) {
  try {
    return decodeURIComponent(segment)
  } catch {
    return segment
  }
}

/** Host with a leading `www.` stripped, or '' when the link can't be parsed. */
export function hostOf(link) {
  const url = parse(link)
  return url ? url.hostname.replace(/^www\./, '') : ''
}

/** `example.com › docs › guide`, the first two path segments at most. */
export function breadcrumbOf(link) {
  const url = parse(link)
  if (!url) return ''
  const segments = url.pathname
    .split('/')
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => safeDecode(s).replace(/\.(html?|php|aspx?)$/i, ''))
    .map((s) => (s.length > 28 ? `${s.slice(0, 27)}…` : s))
  return segments.length ? ` › ${segments.join(' › ')}` : ''
}

export function faviconUrl(host) {
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=64`
}
