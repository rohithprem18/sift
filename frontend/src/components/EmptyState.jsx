export default function EmptyState({ variant = 'empty', query, message, hint, onRetry }) {
  const title = variant === 'error' ? message : `No results for "${query}".`
  const subtext = variant === 'error' ? hint : 'Check the spelling, or try fewer words.'

  return (
    <div className="state-block" role={variant === 'error' ? 'alert' : 'status'}>
      <p className="state-title">{title}</p>
      {subtext && <p className="state-hint">{subtext}</p>}
      {variant === 'error' && (
        <button type="button" className="state-retry" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  )
}
