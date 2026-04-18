'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { PropsWithChildren } from 'react'
import { useState } from 'react'

import { isLinkActive, MainNavigation, moreLinks, NavItem, navLinks } from './MainNavigation'
import UserInfoBar from './UserInfoBar'

export default function MainLayout({ children }: PropsWithChildren) {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div>
      <header
        className="fixed top-0 right-0 left-0 z-50 w-full"
        style={{
          backgroundColor: 'transparent',
          backgroundImage: 'radial-gradient(transparent 1px, #fff 1px)',
          backgroundSize: '4px 4px',
          backdropFilter: 'blur(3px)',
          mask: 'linear-gradient(rgb(0, 0, 0) 80%, rgba(0, 0, 0, 0) 100%)',
          transition: 'all 0.2s ease-out',
        }}
      >
        {/* 主导航行 */}
        <div className="mx-auto grid h-28 max-w-360 grid-cols-[1fr_auto_1fr] items-center px-4 sm:px-6 lg:px-8">
          <Link href="/" className="font-title-serif text-4xl tracking-tight text-gray-900">
            纸飞机的信笺
          </Link>

          <MainNavigation pathname={pathname} />

          <UserInfoBar menuOpen={menuOpen} onToggleMenu={() => setMenuOpen(v => !v)} />
        </div>

        {/* 移动端下拉菜单 */}
        {menuOpen && (
          <nav className="border-t border-gray-100 px-4 py-2 sm:hidden">
            {[...navLinks, ...moreLinks].map(({ label, href }) => (
              <NavItem
                key={href}
                label={label}
                href={href}
                active={isLinkActive(pathname, href)}
                block
                onClick={() => setMenuOpen(false)}
              />
            ))}
          </nav>
        )}
      </header>

      <main className="mx-auto max-w-360 px-4 pt-28 sm:px-6 lg:px-8">{children}</main>
    </div>
  )
}
