import { useEffect, useRef, useState } from 'react'
import { searchApi } from './api.js'
import SearchBar from './components/SearchBar.jsx'
import Tabs from './components/Tabs.jsx'
import StatusLine, { Gauge } from './components/StatusLine.jsx'
import AnswerCard from './components/AnswerCard.jsx'
import KnowledgePanel from './components/KnowledgePanel.jsx'
import ResultList from './components/ResultList.jsx'
import Questions from './components/Questions.jsx'
import ImageGrid from './components/ImageGrid.jsx'
import NewsList from './components/NewsList.jsx'
import VideoList from './components/VideoList.jsx'
import RelatedSearches from './components/RelatedSearches.jsx'
import Skeleton from './components/Skeleton.jsx'
import EmptyState from './components/EmptyState.jsx'
import { Mark } from './components/Icon.jsx'

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

function clearUrl() {
  window.history.replaceState(null, '', window.location.pathname)
}

function isEmptyResponse(data, type) {
  switch (type) {
    case 'images':
      return !data.images?.length
    case 'news':
      return !data.news?.length
    case 'videos':
      return !data.videos?.length
    default:
      return !data.results?.length && !data.answerBox && !data.knowledge
  }
}

function countFor(data, type) {
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
  const [status, setStatus] = useState(initial.q.trim().length >= MIN_CHARS ? 'loading' : 'idle')
  const [data, setData] = useState(null)
  const [errorInfo, setErrorInfo] = useState(null)
  const [gaugeState, setGaugeState] = useState('idle')
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
    clearTimeout(debounceRef.current)
    debounceRef.current = null
  }

  function clearSettle() {
    clearTimeout(settleRef.current)
    settleRef.current = null
  }

  async function performSearch(q, t) {
    updateUrl(q, t)
    abortInFlight()
    clearSettle()
    const controller = new AbortController()
    controllerRef.current = controller

    setStatus('loading')
    setGaugeState('loading')

    try {
      const res = await searchApi(q, t, 1, controller.signal)
      if (controller.signal.aborted) return

      const resolved = { ...res, type: t }
      setData(resolved)
      setErrorInfo(null)
      setStatus(isEmptyResponse(resolved, t) ? 'empty' : 'success')
      setGaugeState('settled')
      settleRef.current = setTimeout(() => setGaugeState('idle'), SETTLE_HOLD_MS)
    } catch (e) {
      if (e.name === 'AbortError' || controller.signal.aborted) return
      setErrorInfo({ message: e.message, hint: e.hint })
      setStatus('error')
      setGaugeState('idle')
    }
  }

  // A shared or reloaded URL searches once, immediately.
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
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // `/` focuses the search input from anywhere, unless already typing somewhere.
  useEffect(() => {
    function onKeyDown(e) {
      if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey) return
      const active = document.activeElement
      const isTyping =
        active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.isContentEditable)
      if (isTyping) return
      e.preventDefault()
      inputRef.current?.focus()
      inputRef.current?.select()
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
    clearUrl()
    window.scrollTo(0, 0)
    if (focus) inputRef.current?.focus()
  }

  function handleQueryChange(value) {
    setQuery(value)
    abortInFlight()
    clearDebounce()

    const trimmed = value.trim()
    if (trimmed.length === 0) {
      resetToIdle()
      return
    }
    if (trimmed.length < MIN_CHARS) {
      setGaugeState('idle')
      if (status === 'loading') setStatus(data ? (isEmptyResponse(data, data.type) ? 'empty' : 'success') : 'idle')
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

  function handleTabChange(nextType) {
    if (nextType === type) return
    setType(nextType)
    clearDebounce()
    const q = query.trim()
    if (q.length >= MIN_CHARS) {
      performSearch(q, nextType)
    } else if (q.length > 0) {
      updateUrl(q, nextType)
    }
  }

  function handlePick(q) {
    setQuery(q)
    clearDebounce()
    window.scrollTo(0, 0)
    performSearch(q, type)
  }

  function handleLogoClick(e) {
    e.preventDefault()
    resetToIdle({ focus: false })
  }

  const isIdle = status === 'idle'
  const loading = status === 'loading'
  // Content always renders with the type it was fetched for, so a tab switch
  // never paints the previous response through the wrong component.
  const shown = data && data.type === type ? data : null
  const showSkeleton = loading && !shown
  const hasSidePanel = type === 'web' && !!shown?.knowledge?.title

  return (
    <div className={`app ${isIdle ? 'is-idle' : 'is-results'}`}>
      {isIdle && <div className="mesh" aria-hidden="true" />}

      <header className={`topbar${scrolled && !isIdle ? ' scrolled' : ''}`}>
        <div className="topbar-inner">
          {isIdle ? (
            <div className="hero">
              <h1 className="hero-title">
                <Mark size={52} />
                Sift
              </h1>
              <p className="hero-tagline">Type to search. Results arrive as you go.</p>
            </div>
          ) : (
            <a className="wordmark" href="/" onClick={handleLogoClick} aria-label="Sift, back to start">
              <Mark size={30} />
              <span>Sift</span>
            </a>
          )}

          <div className="search-slot">
            <SearchBar
              value={query}
              onChange={handleQueryChange}
              onSubmit={handleSubmit}
              onClear={() => resetToIdle()}
              inputRef={inputRef}
              autoFocus={isIdle}
            />
            {!isIdle && <Gauge state={gaugeState} tookMs={data?.tookMs} />}
            {isIdle && (
              <div className="hero-examples">
                <span className="hero-examples-label">Try</span>
                {EXAMPLES.map((ex) => (
                  <button key={ex} type="button" className="chip" onClick={() => handlePick(ex)}>
                    {ex}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {!isIdle && (
          <div className="topbar-tabs">
            <Tabs active={type} onChange={handleTabChange} />
          </div>
        )}
      </header>

      {isIdle && (
        <p className="hero-keys">
          <kbd>/</kbd> to focus <span aria-hidden="true">·</span> <kbd>Enter</kbd> to search now{' '}
          <span aria-hidden="true">·</span> <kbd>Esc</kbd> to clear
        </p>
      )}

      {!isIdle && (
        <main className="page">
          <StatusLine
            loading={loading}
            type={type}
            count={shown && status !== 'error' ? countFor(shown, type) : null}
            tookMs={shown?.tookMs}
            cached={shown?.cached}
          />

          {status === 'error' && (
            <EmptyState
              variant="error"
              message={errorInfo.message}
              hint={errorInfo.hint}
              onRetry={() => performSearch(query.trim(), type)}
            />
          )}

          {status === 'empty' && <EmptyState variant="empty" query={shown?.query ?? query.trim()} />}

          {showSkeleton && <Skeleton type={type} />}

          {!showSkeleton && (status === 'loading' || status === 'success') && shown && (
            <div className={`layout layout-${type}${hasSidePanel ? ' has-panel' : ''}`}>
              <div className={`results-col${loading ? ' dimmed' : ''}`}>
                {type === 'web' && (
                  <>
                    <AnswerCard answerBox={shown.answerBox} />
                    <ResultList results={shown.results} />
                    <Questions items={shown.questions} />
                    <RelatedSearches items={shown.relatedSearches} onPick={handlePick} />
                  </>
                )}
                {type === 'images' && <ImageGrid images={shown.images} />}
                {type === 'news' && <NewsList news={shown.news} />}
                {type === 'videos' && <VideoList videos={shown.videos} />}
              </div>

              {hasSidePanel && (
                <div className={`side-col${loading ? ' dimmed' : ''}`}>
                  <KnowledgePanel key={shown.knowledge.title} knowledge={shown.knowledge} />
                </div>
              )}
            </div>
          )}
        </main>
      )}
    </div>
  )
}
