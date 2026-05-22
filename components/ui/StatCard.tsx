type StatCardProps = {
  value: string | number
  label: string
  positive?: boolean
}

export default function StatCard({ value, label, positive }: StatCardProps) {
  const valueColor =
    positive === true  ? '#4ade80' :
    positive === false ? '#f87171' :
    'var(--color-text)'

  return (
    <div
      className="rounded-xl p-4 text-center"
      style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
    >
      <p className="text-2xl font-bold" style={{ color: valueColor }}>
        {value}
      </p>
      <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>
        {label}
      </p>
    </div>
  )
}
