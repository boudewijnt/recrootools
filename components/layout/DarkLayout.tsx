import { ReactNode } from 'react'
import Sidebar from './Sidebar'

type ActiveItem = 'dashboard' | 'vacature-analyse' | 'ideeen' | 'admin'

type DarkLayoutProps = {
  activeItem: ActiveItem
  isAdmin: boolean
  children: ReactNode
}

export default function DarkLayout({ activeItem, isAdmin, children }: DarkLayoutProps) {
  return (
    <div className="flex min-h-screen" style={{ backgroundColor: 'var(--color-bg)' }}>
      <Sidebar activeItem={activeItem} isAdmin={isAdmin} />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
