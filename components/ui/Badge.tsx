type BadgeProps =
  | { variant: 'plan'; plan: string; startedAt?: string }
  | { variant: 'tag'; label: string }

export default function Badge(props: BadgeProps) {
  if (props.variant === 'tag') {
    return (
      <span
        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-widest uppercase"
        style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-accent)' }}
      >
        {props.label}
      </span>
    )
  }

  return (
    <div
      className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl border"
      style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
    >
      <div className="w-2 h-2 rounded-full bg-green-400 shrink-0" />
      <div>
        <p className="text-sm font-semibold capitalize" style={{ color: 'var(--color-text)' }}>
          {props.plan} plan
        </p>
        {props.startedAt && (
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>
            Gestart op {props.startedAt}
          </p>
        )}
      </div>
    </div>
  )
}
