import Icon from './Icon.jsx'

const TABS = [
  { id: 'web', label: 'All', icon: 'globe' },
  { id: 'images', label: 'Images', icon: 'image' },
  { id: 'news', label: 'News', icon: 'news' },
  { id: 'videos', label: 'Videos', icon: 'video' },
]

export default function Tabs({ active, onChange }) {
  return (
    <nav className="tabs" aria-label="Search type">
      {TABS.map((t) => (
        <button
          key={t.id}
          type="button"
          className={`tab${active === t.id ? ' active' : ''}`}
          aria-current={active === t.id ? 'page' : undefined}
          onClick={() => onChange(t.id)}
        >
          <Icon name={t.icon} size={16} />
          {t.label}
        </button>
      ))}
    </nav>
  )
}
