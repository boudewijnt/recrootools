type CreditsDisplayProps = {
  credits: number
}

export default function CreditsDisplay({ credits }: CreditsDisplayProps) {
  return (
    <div
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm"
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        color: credits > 0 ? 'var(--color-accent)' : '#f87171',
      }}
    >
      <span className="font-semibold">{credits}</span>
      <span style={{ color: 'var(--color-muted)' }}>
        {credits === 1 ? 'analyse' : 'analyses'} resterend
      </span>
    </div>
  )
}
