const TABS = [
  { id: 'web', label: 'Web' },
  { id: 'images', label: 'Images' },
  { id: 'news', label: 'News' },
  { id: 'videos', label: 'Videos' },
]

export default function Tabs({ active, onChange }) {
  return (
    <nav className="tabs" aria-label="Search type">
      {TABS.map((t) => (
        <button
          key={t.id}
          type="button"
          className={`tab${active === t.id ? ' active' : ''}`}
          aria-current={active === t.id ? 'true' : undefined}
          onClick={() => onChange(t.id)}
        >
          {t.label}
        </button>
      ))}
    </nav>
  )
}
