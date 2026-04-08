'use client'

import { IconGridDots, IconMenu2, IconX } from '@tabler/icons-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { PropsWithChildren } from 'react'
import { useState } from 'react'

import { Highlighter } from '@/components/ui/highlighter'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { RippleButton } from '@/components/ui/ripple-button'
import { cn } from '@/utils/style'

const navLinks = [
  { label: '博客', href: '/' },
  { label: 'Awesome', href: '/awesome' },
  { label: '开源', href: '/open' },
  { label: 'Demos', href: '/demos' },
  { label: '制品库', href: '/registry' },
]

const moreLinks = [
  { label: '样板与配置', href: '/snippet' },
  { label: '短链接', href: '/short' },
  { label: '关于', href: '/about' },
]

function NavItem({
  label,
  href,
  active,
  block,
  onClick,
}: {
  label: string
  href: string
  active: boolean
  block?: boolean
  onClick?: () => void
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <Link
      href={href}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        'font-title-serif rounded-md px-2 py-1 text-xl sm:px-3',
        block && 'block px-3 py-2',
        active ? 'font-medium text-gray-900' : 'text-gray-600'
      )}
    >
      {active ? (
        <Highlighter action="highlight" color="#87CEFA">
          {label}
        </Highlighter>
      ) : hovered ? (
        <Highlighter action="underline" color="#87CEFA">
          {label}
        </Highlighter>
      ) : (
        label
      )}
    </Link>
  )
}

export default function MainLayout({ children }: PropsWithChildren) {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  const getFirstSegment = (path: string) => path.split('/').filter(Boolean)[0] ?? ''
  const currentSegment = getFirstSegment(pathname)
  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/' || pathname.startsWith('/post/')
    }
    return currentSegment === getFirstSegment(href)
  }

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
          paddingLeft: 'calc(100vw - 100%)',
        }}
      >
        {/* 主导航行 */}
        <div className="mx-auto grid h-28 max-w-360 grid-cols-[1fr_auto_1fr] items-center px-4 sm:px-6 lg:px-8">
          <Link href="/" className="font-title-serif text-4xl tracking-tight text-gray-900">
            纸飞机的信笺
          </Link>

          {/* 桌面端居中导航 */}
          <nav className="hidden items-center gap-0 sm:flex sm:gap-1">
            {navLinks.map(({ label, href }) => (
              <NavItem key={href} label={label} href={href} active={isActive(href)} />
            ))}

            {moreLinks
              .filter(({ href }) => isActive(href))
              .map(({ label, href }) => (
                <NavItem key={href} label={label} href={href} active={true} />
              ))}

            <Popover>
              <PopoverTrigger asChild>
                <RippleButton
                  className="ml-2 h-8 w-8 rounded-md border-0 bg-transparent p-0 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                  rippleColor="#6b7280"
                  duration="500ms"
                  aria-label="更多导航"
                >
                  <IconGridDots size={18} />
                </RippleButton>
              </PopoverTrigger>
              <PopoverContent className="w-32 gap-0 p-1" align="center" sideOffset={8}>
                {moreLinks.map(({ label, href }) => (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      'font-title-serif block rounded-md px-3 py-2 text-base transition-colors hover:bg-gray-50',
                      isActive(href) ? 'font-medium text-gray-900' : 'text-gray-600'
                    )}
                  >
                    {label}
                  </Link>
                ))}
              </PopoverContent>
            </Popover>
          </nav>

          {/* 右侧：移动端汉堡按钮 */}
          <div className="flex justify-end">
            <button
              className="flex h-8 w-8 items-center justify-center rounded-md text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 sm:hidden"
              onClick={() => setMenuOpen(v => !v)}
              aria-label="导航菜单"
              aria-expanded={menuOpen}
            >
              {menuOpen ? <IconX size={16} /> : <IconMenu2 size={16} />}
            </button>
          </div>
        </div>

        {/* 移动端下拉菜单 */}
        {menuOpen && (
          <nav className="border-t border-gray-100 px-4 py-2 sm:hidden">
            {[...navLinks, ...moreLinks].map(({ label, href }) => (
              <NavItem
                key={href}
                label={label}
                href={href}
                active={isActive(href)}
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
