type ComingSoonCardProps = {
  title: string
  description: string
}

export default function ComingSoonCard({ title, description }: ComingSoonCardProps) {
  return (
    <div
      className="rounded-2xl p-6 border border-dashed opacity-60"
      style={{
        backgroundColor: 'var(--color-surface-alt)',
        borderColor: 'var(--color-border)',
      }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center text-lg mb-4"
        style={{ backgroundColor: 'var(--color-border)', color: 'var(--color-muted)' }}
      >
        ⧗
      </div>
      <h3 className="font-semibold mb-1" style={{ color: 'var(--color-muted)' }}>
        {title}
      </h3>
      <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
        {description}
      </p>
      <p className="text-xs mt-3 font-medium uppercase tracking-wide" style={{ color: 'var(--color-border)' }}>
        Binnenkort
      </p>
    </div>
  )
}
