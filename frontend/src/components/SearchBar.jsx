import Icon from './Icon.jsx'

export default function SearchBar({
  value,
  onChange,
  onSubmit,
  onClear,
  inputRef,
  placeholder = 'Search the web',
  autoFocus = false,
}) {
  return (
    <div className="search-bar">
      <Icon name="search" size={19} className="search-icon" />
      <label className="sr-only" htmlFor="sift-query">
        Search query
      </label>
      <input
        id="sift-query"
        ref={inputRef}
        type="search"
        enterKeyHint="search"
        value={value}
        placeholder={placeholder}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck="false"
        autoFocus={autoFocus}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            onSubmit?.()
          }
          if (e.key === 'Escape') {
            e.preventDefault()
            onClear?.()
          }
        }}
      />
      {value.length > 0 ? (
        <button type="button" className="search-clear" aria-label="Clear search" onClick={onClear}>
          <Icon name="x" size={16} />
        </button>
      ) : (
        <kbd className="search-kbd" aria-hidden="true">/</kbd>
      )}
    </div>
  )
}
