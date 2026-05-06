'use client'

import {
  IconChevronRight,
  IconExternalLink,
  IconGridDots,
  IconMapPinFilled,
} from '@tabler/icons-react'
import Link from 'next/link'
import { useState } from 'react'

import { HighlighterLink } from '@/components/animate-ui/primitives/effects/highlighter-link'
import { Button } from '@/components/ui/button'
import { Highlighter } from '@/components/ui/highlighter'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/utils/style'

interface NavLink {
  label: string
  href: string
}

interface NavLinkGroup {
  title: string
  links: NavLink[]
}

export const navLinks: NavLink[] = [
  { label: '博客', href: '/' },
  { label: 'Awesome', href: '/awesome' },
  { label: '开源', href: '/open' },
  { label: 'Demos', href: '/demos' },
  { label: '制品库', href: '/registry' },
]

export const moreLinkGroups: NavLinkGroup[] = [
  {
    title: '在线服务',
    links: [
      { label: '短链接', href: '/short' },
      { label: 'KMS 激活服务', href: '/kms' },
    ],
  },
  {
    title: '更多页面',
    links: [
      { label: '样板与配置', href: '/snippet' },
      { label: '关于', href: '/about' },
    ],
  },
]

export const moreLinks = moreLinkGroups.flatMap(group => group.links)

const getFirstSegment = (path: string) => path.split('/').filter(Boolean)[0] ?? ''
const isExternalHref = (href: string) => /^(?:[a-z][a-z\d+\-.]*:|\/\/)/i.test(href)

export function isLinkActive(pathname: string, href: string) {
  if (href === '/') {
    return (
      pathname === '/' ||
      pathname.startsWith('/post/') ||
      pathname.startsWith('/archives/') ||
      pathname.startsWith('/categories/') ||
      pathname.startsWith('/tags/')
    )
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
  return (
    <HighlighterLink
      href={href}
      active={active}
      enableActiveHighlighter={highlightWhenActive}
      onClick={onClick}
      className={cn(
        'font-title-serif rounded-md px-2 py-1 text-xl sm:px-3',
        block && 'block px-3 py-2',
        active ? 'font-medium text-gray-900' : 'text-gray-600'
      )}
    >
      {label}
    </HighlighterLink>
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
  const isExternal = isExternalHref(href)
  const iconClassName = cn('shrink-0', active ? 'text-gray-900' : 'text-gray-500')

  return (
    <Link
      href={href}
      onClick={onSelect}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        'font-title-serif flex items-center justify-between gap-2 rounded-md bg-gray-100 px-3 py-2 text-base shadow-sm shadow-gray-200/60 transition-colors',
        active
          ? 'bg-sky-200 font-medium text-gray-900 shadow-sky-200/60'
          : 'bg-gray-200/65 text-gray-600 hover:bg-gray-200'
      )}
    >
      <span>
        {active ? (
          label
        ) : hovered ? (
          <Highlighter action="underline" color="#97d7ff" iterations={2} padding={0}>
            {label}
          </Highlighter>
        ) : (
          label
        )}
      </span>
      {active ? (
        <IconMapPinFilled size={16} className={iconClassName} />
      ) : isExternal ? (
        <IconExternalLink size={16} className={iconClassName} />
      ) : hovered ? (
        <IconChevronRight size={16} className="shrink-0 text-gray-700" />
      ) : (
        <IconChevronRight size={16} className={iconClassName} />
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

      <Popover
        open={isMorePopoverOpen}
        onOpenChange={({ open }) => setIsMorePopoverOpen(open)}
        positioning={{ placement: 'bottom', offset: { mainAxis: 8 } }}
      >
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon-md"
            className="ml-2 rounded-md border-0 bg-transparent p-0 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
            aria-label="更多导航"
          >
            <IconGridDots size={18} />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-sm px-4 py-4">
          <div className="space-y-8">
            {moreLinkGroups.map(({ title, links }) => (
              <section key={title}>
                <h3 className="px-1 text-left text-[14px] font-medium tracking-wide text-gray-500">
                  {title}
                </h3>

                <div className="mt-4 grid grid-cols-2 gap-4">
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
