'use client'

import { ReactNode } from 'react'

type ButtonProps = {
  variant?: 'primary' | 'ghost'
  size?: 'sm' | 'md'
  children: ReactNode
  href?: string
  type?: 'button' | 'submit'
  disabled?: boolean
  onClick?: () => void
  className?: string
}

export default function Button({
  variant = 'primary',
  size = 'md',
  children,
  href,
  type = 'button',
  disabled,
  onClick,
  className = '',
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center font-semibold rounded-lg transition-opacity hover:opacity-90 disabled:opacity-40'
  const sizes: Record<string, string> = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
  }
  const colors: Record<string, React.CSSProperties> = {
    primary: { backgroundColor: 'var(--color-primary)', color: '#ffffff' },
    ghost:   { backgroundColor: 'var(--color-surface)', color: 'var(--color-accent)' },
  }

  const cls = `${base} ${sizes[size]} ${className}`

  if (href) {
    return (
      <a href={href} className={cls} style={colors[variant]}>
        {children}
      </a>
    )
  }

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={cls}
      style={colors[variant]}
    >
      {children}
    </button>
  )
}
