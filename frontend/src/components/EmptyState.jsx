import Icon from './Icon.jsx'

export default function EmptyState({ variant = 'empty', query, message, hint, onRetry }) {
  const isError = variant === 'error'

  return (
    <div className={`state-block${isError ? ' is-error' : ''}`} role={isError ? 'alert' : 'status'}>
      <span className="state-icon">
        <Icon name={isError ? 'alert' : 'search-off'} size={22} />
      </span>
      {isError ? (
        <p className="state-title">{message}</p>
      ) : (
        <p className="state-title">
          No results for <em>{query}</em>.
        </p>
      )}
      <p className="state-hint">{isError ? hint : 'Check the spelling, or try fewer words.'}</p>
      {isError && (
        <button type="button" className="button-primary" onClick={onRetry}>
          <Icon name="refresh" size={16} />
          Try again
        </button>
      )}
    </div>
  )
}
