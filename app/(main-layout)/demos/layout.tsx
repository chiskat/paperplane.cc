'use client'

import { allDemos } from 'content-collections'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/utils/style'
import { DemoSidebarItem } from './DemoSidebarItem'
import { filterAndSortByDemoOrder } from './sort'

export default function DemosLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const sortedDemos = filterAndSortByDemoOrder(allDemos)

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
              'h-full min-h-0 pr-1',
              '[&_[data-slot=scroll-area-scrollbar][data-orientation=vertical]]:w-1.5',
              '[&_[data-slot=scroll-area-scrollbar][data-orientation=vertical]]:p-0',
              '**:data-[slot=scroll-area-thumb]:bg-slate-300/45'
            )}
            scrollFade
          >
            <div className="flex flex-col gap-2">
              {sortedDemos.map(project => {
                const href = `/demos/${project._meta.path}`

                return (
                  <DemoSidebarItem
                    key={project._meta.path}
                    title={project.title}
                    filename={project._meta.path}
                    type={project.type}
                    status={project.status}
                    active={pathname === href}
                  />
                )
              })}
            </div>
          </ScrollArea>
        </aside>

        <div className="min-w-0">{children}</div>
      </div>
    </section>
  )
}
