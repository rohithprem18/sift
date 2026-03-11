// Vercel serverless function. Lets the frontend be deployed to Vercel as a
// static site while still calling same-origin `/api/*` — this file forwards
// those requests to the real Sift backend (Spring Boot, deployed separately
// on Render/Railway/Fly, see README). The Serper key never touches Vercel:
// it lives only in the backend's own environment.
export default async function handler(req, res) {
  const backendUrl = process.env.BACKEND_URL

  if (!backendUrl) {
    res.status(502).json({
      message: "Sift can't reach the search index.",
      hint: 'BACKEND_URL is not configured on Vercel.',
      status: 502,
    })
    return
  }

  const segments = Array.isArray(req.query.path) ? req.query.path : [req.query.path].filter(Boolean)
  const queryIndex = req.url.indexOf('?')
  const search = queryIndex >= 0 ? req.url.slice(queryIndex) : ''
  const target = `${backendUrl.replace(/\/$/, '')}/api/${segments.join('/')}${search}`

  try {
    const upstream = await fetch(target, {
      method: 'GET',
      headers: { accept: 'application/json' },
      signal: AbortSignal.timeout(10000),
    })
    const body = await upstream.text()
    res.status(upstream.status)
    res.setHeader('content-type', upstream.headers.get('content-type') ?? 'application/json')
    res.send(body)
  } catch {
    res.status(504).json({
      message: 'The search took too long to come back.',
      hint: 'Try that query again.',
      status: 504,
    })
  }
}
