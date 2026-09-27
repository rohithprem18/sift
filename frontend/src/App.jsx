import { useEffect, useRef, useState } from 'react'
import { searchApi } from './api.js'
import SearchBar from './components/SearchBar.jsx'
import Tabs from './components/Tabs.jsx'
import StatusLine from './components/StatusLine.jsx'
import AnswerCard from './components/AnswerCard.jsx'
import KnowledgePanel from './components/KnowledgePanel.jsx'
import ResultList from './components/ResultList.jsx'
import ImageGrid from './components/ImageGrid.jsx'
import NewsList from './components/NewsList.jsx'
import VideoList from './components/VideoList.jsx'
import RelatedSearches from './components/RelatedSearches.jsx'
import Skeleton from './components/Skeleton.jsx'
import EmptyState from './components/EmptyState.jsx'

const VALID_TYPES = ['web', 'images', 'news', 'videos']
const EXAMPLES = ['chennai metro phase 2', 'spring boot 3.3 release notes', 'who won today']
const DEBOUNCE_MS = 350
const SETTLE_HOLD_MS = 400
const MIN_CHARS = 2

function readUrl() {
  const params = new URLSearchParams(window.location.search)
  const q = params.get('q') ?? ''
  const rawType = params.get('type') ?? 'web'
  return { q, type: VALID_TYPES.includes(rawType) ? rawType : 'web' }
}

function updateUrl(q, type) {
  const params = new URLSearchParams()
  params.set('q', q)
  if (type !== 'web') params.set('type', type)
  window.history.replaceState(null, '', `${window.location.pathname}?${params.toString()}`)
}

function isEmptyResponse(data, type) {
  switch (type) {
    case 'images':
      return !(data.images?.length)
    case 'news':
      return !(data.news?.length)
    case 'videos':
      return !(data.videos?.length)
    default:
      return !(data.results?.length) && !data.answerBox && !data.knowledge
  }
}

function countFor(data, type) {
  if (!data) return null
  switch (type) {
    case 'images':
      return data.images?.length ?? 0
    case 'news':
      return data.news?.length ?? 0
    case 'videos':
      return data.videos?.length ?? 0
    default:
      return data.results?.length ?? 0
  }
}

export default function App() {
  const initial = useRef(readUrl()).current

  const [query, setQuery] = useState(initial.q)
  const [type, setType] = useState(initial.type)
  const [status, setStatus] = useState(
    initial.q.trim().length >= MIN_CHARS ? 'loading' : 'idle'
  )
  const [data, setData] = useState(null)
  const [errorInfo, setErrorInfo] = useState(null)
  const [gaugeState, setGaugeState] = useState('idle')
  const [everSearched, setEverSearched] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  const inputRef = useRef(null)
  const controllerRef = useRef(null)
  const debounceRef = useRef(null)
  const settleRef = useRef(null)

  function abortInFlight() {
    controllerRef.current?.abort()
    controllerRef.current = null
  }

  function clearDebounce() {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
      debounceRef.current = null
    }
  }

  function clearSettle() {
    if (settleRef.current) {
      clearTimeout(settleRef.current)
      settleRef.current = null
    }
  }

  async function performSearch(q, t) {
    updateUrl(q, t)
    abortInFlight()
    const controller = new AbortController()
    controllerRef.current = controller

    setStatus('loading')
    setGaugeState('loading')

    try {
      const res = await searchApi(q, t, 1, controller.signal)
      if (controller.signal.aborted) return

      setEverSearched(true)
      setData(res)
      setErrorInfo(null)
      setStatus(isEmptyResponse(res, t) ? 'empty' : 'success')
      setGaugeState('settled')
      clearSettle()
      settleRef.current = setTimeout(() => setGaugeState('idle'), SETTLE_HOLD_MS)
    } catch (e) {
      if (e.name === 'AbortError') return
      setErrorInfo({ message: e.message, hint: e.hint })
      setStatus('error')
      setGaugeState('idle')
    }
  }

  // Initial load from a shared/reloaded URL — fires once, immediately.
  useEffect(() => {
    if (initial.q.trim().length >= MIN_CHARS) {
      performSearch(initial.q.trim(), initial.type)
    }
    return () => {
      abortInFlight()
      clearDebounce()
      clearSettle()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 4)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // `/` focuses the search input from anywhere, unless already typing somewhere.
  useEffect(() => {
    function onKeyDown(e) {
      if (e.key !== '/') return
      const active = document.activeElement
      const isTyping = active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA')
      if (isTyping) return
      e.preventDefault()
      inputRef.current?.focus()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  function resetToIdle({ focus = true } = {}) {
    abortInFlight()
    clearDebounce()
    clearSettle()
    setQuery('')
    setStatus('idle')
    setData(null)
    setErrorInfo(null)
    setGaugeState('idle')
    window.history.replaceState(null, '', window.location.pathname)
    if (focus) inputRef.current?.focus()
  }

  function handleQueryChange(value) {
    setQuery(value)
    abortInFlight()
    clearDebounce()

    const trimmed = value.trim()
    if (trimmed.length === 0) {
      clearSettle()
      setStatus('idle')
      setData(null)
      setErrorInfo(null)
      setGaugeState('idle')
      window.history.replaceState(null, '', window.location.pathname)
      return
    }
    if (trimmed.length < MIN_CHARS) {
      setGaugeState('idle')
      return
    }
    debounceRef.current = setTimeout(() => performSearch(trimmed, type), DEBOUNCE_MS)
  }

  function handleSubmit() {
    const q = query.trim()
    if (q.length === 0) return
    clearDebounce()
    performSearch(q, type)
  }

  function handleClear() {
    resetToIdle()
  }

  function handleTabChange(nextType) {
    if (nextType === type) return
    setType(nextType)
    clearDebounce()
    const q = query.trim()
    if (q.length >= MIN_CHARS) {
      performSearch(q, nextType)
    } else {
      updateUrl(q, nextType)
    }
  }

  function handleChipPick(q) {
    setQuery(q)
    clearDebounce()
    performSearch(q, type)
  }

  function handleLogoClick(e) {
    e.preventDefault()
    resetToIdle({ focus: false })
  }

  const skeletonVisible = status === 'loading' && !everSearched
  const dimmed = status === 'loading' && everSearched
  const hasSidePanel = type === 'web' && !!data?.knowledge

  if (status === 'idle') {
    return (
      <div className="app">
        <div className="idle-screen">
          <span className="idle-eyebrow">Google, straight through</span>
          <h1 className="idle-wordmark">Sift</h1>
          <p className="idle-tagline">Type to search. Results arrive as you go.</p>
          <div className="idle-search">
            <SearchBar
              value={query}
              onChange={handleQueryChange}
              onSubmit={handleSubmit}
              onClear={handleClear}
              inputRef={inputRef}
              autoFocus
            />
          </div>
          <div className="idle-examples">
            {EXAMPLES.map((ex) => (
              <button key={ex} type="button" className="chip" onClick={() => handleChipPick(ex)}>
                {ex}
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <header className={`header${scrolled ? ' scrolled' : ''}`}>
        <div className="header-inner">
          <a className="wordmark" href="/" onClick={handleLogoClick}>
            Sift
          </a>
          <div className="header-search">
            <SearchBar
              value={query}
              onChange={handleQueryChange}
              onSubmit={handleSubmit}
              onClear={handleClear}
              inputRef={inputRef}
            />
            <StatusLine
              gaugeState={gaugeState}
              type={type}
              count={status === 'success' || status === 'empty' ? countFor(data, type) : null}
              tookMs={data?.tookMs}
              cached={data?.cached}
            />
          </div>
        </div>
      </header>

      <div className="page">
        <Tabs active={type} onChange={handleTabChange} />

        {status === 'error' && (
          <EmptyState
            variant="error"
            message={errorInfo.message}
            hint={errorInfo.hint}
            onRetry={() => performSearch(query.trim(), type)}
          />
        )}

        {status === 'empty' && <EmptyState variant="empty" query={query} />}

        {(status === 'loading' || status === 'success') && (
          <div className={`layout${hasSidePanel ? '' : ' no-panel'}`}>
            <div className={`results-col${dimmed ? ' dimmed' : ''}`}>
              {skeletonVisible ? (
                <Skeleton />
              ) : (
                <>
                  {type === 'web' && <AnswerCard answerBox={data?.answerBox} />}
                  {type === 'web' && <ResultList results={data?.results} />}

                  {type === 'web' && data?.questions?.length > 0 && (
                    <ul className="questions">
                      {data.questions.map((q, i) => (
                        <li key={i} className="question-item">
                          <p className="question-text">{q.question}</p>
                          {q.snippet && <p className="question-snippet">{q.snippet}</p>}
                        </li>
                      ))}
                    </ul>
                  )}

                  {type === 'images' && <ImageGrid images={data?.images} />}
                  {type === 'news' && <NewsList news={data?.news} />}
                  {type === 'videos' && <VideoList videos={data?.videos} />}

                  {type === 'web' && (
                    <RelatedSearches items={data?.relatedSearches} onPick={handleChipPick} />
                  )}
                </>
              )}
            </div>

            {hasSidePanel && (
              <div className="side-col">
                <KnowledgePanel knowledge={data.knowledge} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
