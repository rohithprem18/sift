import Icon from './Icon.jsx'

export default function SearchBar({
  value,
  onChange,
  onSubmit,
  onClear,
  inputRef,
  placeholder = 'Type to search',
  autoFocus = false,
}) {
  return (
    <div className="search-bar">
      <Icon name="search" size={18} />
      <label className="sr-only" htmlFor="sift-query">
        Search query
      </label>
      <input
        id="sift-query"
        ref={inputRef}
        type="text"
        value={value}
        placeholder={placeholder}
        autoComplete="off"
        autoCorrect="off"
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
      {value.length > 0 && (
        <button type="button" className="search-clear" aria-label="Clear search" onClick={onClear}>
          <Icon name="x" size={16} />
        </button>
      )}
    </div>
  )
}
