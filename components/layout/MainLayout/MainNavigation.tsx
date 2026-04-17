'use client'

import { IconGridDots } from '@tabler/icons-react'
import Link from 'next/link'
import { useState } from 'react'

import { Highlighter } from '@/components/ui/highlighter'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { RippleButton } from '@/components/ui/ripple-button'
import { cn } from '@/utils/style'

export const navLinks = [
  { label: '博客', href: '/' },
  { label: 'Awesome', href: '/awesome' },
  { label: '开源', href: '/open' },
  { label: 'Demos', href: '/demos' },
  { label: '制品库', href: '/registry' },
]

export const moreLinkGroups = [
  {
    title: '更多页面',
    links: [
      { label: '样板与配置', href: '/snippet' },
      { label: '短链接', href: '/short' },
    ],
  },
  {
    title: '站点信息',
    links: [{ label: '关于', href: '/about' }],
  },
]

export const moreLinks = moreLinkGroups.flatMap(group => group.links)

const getFirstSegment = (path: string) => path.split('/').filter(Boolean)[0] ?? ''

export function isLinkActive(pathname: string, href: string) {
  if (href === '/') {
    return pathname === '/' || pathname.startsWith('/post/')
  }
  return getFirstSegment(pathname) === getFirstSegment(href)
}

export function NavItem({
  label,
  href,
  active,
  highlightWhenActive = true,
  block,
  onClick,
}: {
  label: string
  href: string
  active: boolean
  highlightWhenActive?: boolean
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
      {active && highlightWhenActive ? (
        <Highlighter action="highlight" color="#97d7ff">
          {label}
        </Highlighter>
      ) : active ? (
        label
      ) : hovered ? (
        <Highlighter action="underline" color="#97d7ff">
          {label}
        </Highlighter>
      ) : (
        label
      )}
    </Link>
  )
}

function PopoverNavItem({
  label,
  href,
  active,
  onSelect,
}: {
  label: string
  href: string
  active: boolean
  onSelect?: () => void
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <Link
      href={href}
      onClick={onSelect}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        'font-title-serif rounded-md bg-gray-100 px-3 py-2 text-base shadow-sm shadow-gray-200/60 transition-colors',
        active
          ? 'bg-sky-200 font-medium text-gray-900 shadow-sky-200/60'
          : 'bg-gray-200/65 text-gray-600 hover:bg-gray-200'
      )}
    >
      {active ? (
        label
      ) : hovered ? (
        <Highlighter action="underline" color="#97d7ff" iterations={2} padding={0}>
          {label}
        </Highlighter>
      ) : (
        label
      )}
    </Link>
  )
}

type MainNavigationProps = {
  pathname: string
}

export function MainNavigation({ pathname }: MainNavigationProps) {
  const activeMainHref = navLinks.find(({ href }) => isLinkActive(pathname, href))?.href ?? null
  const activeMoreHref = moreLinks.find(({ href }) => isLinkActive(pathname, href))?.href ?? null
  const [isMorePopoverOpen, setIsMorePopoverOpen] = useState(false)

  const renderedExtraLink =
    activeMoreHref == null ? null : (moreLinks.find(({ href }) => href === activeMoreHref) ?? null)

  return (
    <nav className="hidden items-center gap-0 sm:flex sm:gap-1">
      {navLinks.map(({ label, href }) => (
        <NavItem
          key={href}
          label={label}
          href={href}
          active={isLinkActive(pathname, href)}
          highlightWhenActive={activeMoreHref == null && activeMainHref === href}
        />
      ))}

      {renderedExtraLink ? (
        <NavItem
          key={renderedExtraLink.href}
          label={renderedExtraLink.label}
          href={renderedExtraLink.href}
          active={isLinkActive(pathname, renderedExtraLink.href)}
          highlightWhenActive={activeMoreHref === renderedExtraLink.href}
        />
      ) : null}

      <Popover open={isMorePopoverOpen} onOpenChange={setIsMorePopoverOpen}>
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
        <PopoverContent className="w-md px-4 py-4" align="center" sideOffset={8}>
          <div className="space-y-6">
            {moreLinkGroups.map(({ title, links }) => (
              <section key={title}>
                <h3 className="px-1 text-left text-sm font-medium tracking-wide text-gray-500">
                  {title}
                </h3>
                <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-5">
                  {links.map(({ label, href }) => (
                    <PopoverNavItem
                      key={href}
                      label={label}
                      href={href}
                      active={isLinkActive(pathname, href)}
                      onSelect={() => setIsMorePopoverOpen(false)}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </nav>
  )
}
