type ToolCardProps = {
  href: string
  icon: string
  title: string
  description: string
  availability: string
}

export default function ToolCard({ href, icon, title, description, availability }: ToolCardProps) {
  return (
    <a
      href={href}
      className="group block rounded-2xl p-6 border border-[#1a2e30] hover:border-[#006f66] transition-colors"
      style={{ backgroundColor: 'var(--color-surface)' }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-lg mb-4"
        style={{ backgroundColor: 'var(--color-primary)' }}
      >
        {icon}
      </div>
      <h3
        className="font-semibold mb-1 transition-colors group-hover:text-[#006f66]"
        style={{ color: 'var(--color-text)' }}
      >
        {title}
      </h3>
      <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
        {description}
      </p>
      <p className="text-xs mt-3 font-medium" style={{ color: 'var(--color-accent)' }}>
        {availability}
      </p>
    </a>
  )
}
