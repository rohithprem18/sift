/**
 * Talks to Sift's own backend only — never to Serper directly. The API
 * key never enters this file, or any file under frontend/.
 */
export class SearchApiError extends Error {
  constructor(message, hint, status) {
    super(message)
    this.hint = hint
    this.status = status
  }
}

export async function searchApi(q, type, page, signal) {
  const params = new URLSearchParams({ q, type, page: String(page) })
  const res = await fetch(`/api/search?${params.toString()}`, { signal })

  let body = null
  try {
    body = await res.json()
  } catch {
    // no JSON body at all — fall through to the generic error below
  }

  if (!res.ok) {
    const message = body?.message ?? 'The search took too long to come back.'
    const hint = body?.hint ?? 'Try that query again.'
    throw new SearchApiError(message, hint, res.status)
  }

  if (!body || typeof body !== 'object') {
    throw new SearchApiError(
      'Sift got an unreadable answer from the server.',
      'Try that query again.',
      res.status
    )
  }

  return body
}
