'use client'

import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'

import { Switch } from '@/components/animate-ui/components/radix/switch'
import { ScrollAreaFade } from '@/components/ui/scroll-area-fade'
import { useTRPC } from '@/lib/trpc-client'
import { cn } from '@/utils/style'
import { CategorySidebarItem } from './CategorySidebarItem'

export interface CategorySidebarProps {
  onScrollToSection: (id: string) => void
}

export function CategorySidebar({ onScrollToSection }: CategorySidebarProps) {
  const trpc = useTRPC()
  const [showChildren, setShowChildren] = useState(false)

  const { data: catelogs } = useQuery({
    ...trpc.awesome.catelogs.tree.queryOptions(),
    initialData: [],
  })

  return (
    <aside className="hidden md:block">
      <div className="sticky top-28 h-[calc(100vh-9rem)]">
        <div className="flex h-full flex-col overflow-hidden rounded-2xl bg-white/90 backdrop-blur">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-title-serif text-xl text-slate-800">分类</h2>

            <div className="mr-2 flex shrink-0 items-center gap-2">
              <span className="text-xs text-slate-600">显示子类别</span>
              <Switch
                checked={showChildren}
                onCheckedChange={setShowChildren}
                aria-label="子类别显示开关"
                className="cursor-pointer"
              />
            </div>
          </div>

          <ScrollAreaFade
            className={cn(
              'mt-3 mr-1 min-h-0 flex-1',
              '[&_[data-slot=scroll-area-scrollbar][data-orientation=vertical]]:w-1.5',
              '[&_[data-slot=scroll-area-scrollbar][data-orientation=vertical]]:p-0',
              '**:data-[slot=scroll-area-thumb]:bg-slate-300/45'
            )}
            topFadeClassName="from-white/90"
            bottomFadeClassName="from-white/90"
          >
            <ul className="flex flex-col gap-1 pr-3">
              {catelogs.map(category => (
                <CategorySidebarItem
                  key={category.id}
                  category={category}
                  showChildren={showChildren}
                  onScrollToSection={onScrollToSection}
                />
              ))}
            </ul>
          </ScrollAreaFade>
        </div>
      </div>
    </aside>
  )
}
