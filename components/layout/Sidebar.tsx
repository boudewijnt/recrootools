import LogoutButton from './LogoutButton'

type ActiveItem = 'dashboard' | 'vacature-analyse' | 'ideeen' | 'admin'

type SidebarProps = {
  activeItem: ActiveItem
  isAdmin: boolean
}

const NAV_ITEMS: Array<{ key: ActiveItem; href: string; icon: string; label: string }> = [
  { key: 'dashboard',        href: '/dashboard',        icon: '⊞', label: 'Dashboard' },
  { key: 'vacature-analyse', href: '/vacature-analyse', icon: '✦', label: 'Vacature Analyse' },
  { key: 'ideeen',           href: '/dashboard#ideeen', icon: '💡', label: 'Ideeënbus' },
]

export default function Sidebar({ activeItem, isAdmin }: SidebarProps) {
  return (
    <nav
      className="w-14 flex flex-col items-center gap-1 py-4 px-2 shrink-0"
      style={{
        backgroundColor: 'var(--color-surface-alt)',
        borderRight: '1px solid var(--color-border)',
        minHeight: '100vh',
      }}
    >
      <div
        className="w-7 h-7 rounded-full mb-4 shrink-0"
        style={{ background: 'linear-gradient(225deg, #7db4c3, #6895a2)' }}
      />

      {NAV_ITEMS.map(({ key, href, icon, label }) => (
        <a
          key={key}
          href={href}
          title={label}
          className="w-9 h-9 rounded-lg flex items-center justify-center text-base transition-colors"
          style={{
            backgroundColor: activeItem === key ? 'var(--color-surface)' : 'transparent',
            color: activeItem === key ? 'var(--color-accent)' : 'var(--color-muted)',
          }}
        >
          {icon}
        </a>
      ))}

      {isAdmin && (
        <a
          href="/admin"
          title="Admin"
          className="w-9 h-9 rounded-lg flex items-center justify-center text-base transition-colors"
          style={{
            backgroundColor: activeItem === 'admin' ? 'var(--color-surface)' : 'transparent',
            color: activeItem === 'admin' ? 'var(--color-accent)' : 'var(--color-muted)',
          }}
        >
          ⚙
        </a>
      )}

      <div className="mt-auto">
        <LogoutButton />
      </div>
    </nav>
  )
}
