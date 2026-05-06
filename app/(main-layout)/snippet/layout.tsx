'use client'

import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/utils/style'
import { list } from './list'
import { SnippetLink } from './SnippetLink'

interface SnippetCategory {
  title: string
  href: string
  baseHref: string
  key: string
  iconKey: string
}

interface SnippetGroup {
  title: string
  categories: SnippetCategory[]
}

function getSnippetDirSlug(dir: string) {
  return dir.replace(/^_+/, '')
}

function getSnippetIconKey(dir: string) {
  return getSnippetDirSlug(dir).replace(/\./g, '-')
}

const snippetGroups: SnippetGroup[] = list.map(group => ({
  title: group.title,
  categories: group.children
    .filter(category => category.children.length > 0)
    .map(category => {
      const dirSlug = getSnippetDirSlug(category.dir)
      const firstChild = category.children[0]
      const baseHref = `/snippet/${dirSlug}`

      return {
        title: category.title,
        href: `${baseHref}/${firstChild}`,
        baseHref,
        key: `${dirSlug}/${firstChild}`,
        iconKey: category.icon ?? getSnippetIconKey(category.dir),
      }
    }),
}))

export default function SnippetLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  return (
    <section className="relative pb-16">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-12 right-0 h-72 w-72 rounded-full bg-linear-to-br from-sky-200/35 via-orange-100/30 to-transparent blur-3xl"
      />

      <div className="grid gap-6 md:grid-cols-[24rem_minmax(0,1fr)]">
        <aside className="min-w-0 md:sticky md:top-28 md:h-[calc(100dvh-11rem)]">
          <ScrollArea
            className={cn(
              'mr-2 h-full min-h-0 rounded-3xl pr-1',
              '[&_[data-slot=scroll-area-scrollbar][data-orientation=vertical]]:w-1.5',
              '[&_[data-slot=scroll-area-scrollbar][data-orientation=vertical]]:p-0',
              '**:data-[slot=scroll-area-thumb]:bg-slate-300/45'
            )}
            scrollFade
          >
            <div className="flex flex-col gap-6 pb-4">
              {snippetGroups.map(group => (
                <section key={group.title} className="space-y-2">
                  <h2 className="flex items-center gap-3 px-1 text-sm font-medium tracking-wide text-slate-400">
                    <span className="shrink-0">{group.title}</span>
                    <span aria-hidden className="h-px min-w-0 flex-1 bg-slate-200/75" />
                  </h2>

                  <div className="grid grid-cols-2 gap-0.5">
                    {group.categories.map(category => {
                      const active =
                        pathname === category.href || pathname.startsWith(`${category.baseHref}/`)

                      return (
                        <SnippetLink
                          key={category.key}
                          title={category.title}
                          href={category.href}
                          active={active}
                          iconKey={category.iconKey}
                        />
                      )
                    })}
                  </div>
                </section>
              ))}
            </div>
          </ScrollArea>
        </aside>

        <div className="min-w-0">{children}</div>
      </div>
    </section>
  )
}
