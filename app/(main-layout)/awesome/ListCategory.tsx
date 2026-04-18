'use client'

import { AwesomeTreeResult } from '@/apis/awesome/items'
import { Button } from '@/components/ui/button'
import { useSession } from '@/lib/auth-client'
import { ListItem } from './ListItem'

export interface ListCategoryProps {
  catelog: AwesomeTreeResult
  sectionRef: (element: HTMLElement | null) => void
}

export function ListCategory({ catelog, sectionRef }: ListCategoryProps) {
  const { user, isPending } = useSession()

  const parentName = catelog.parent?.name
  const isSecondaryCategory = Boolean(parentName)

  return (
    <section data-section-id={catelog.id} ref={sectionRef} className="scroll-mt-52 space-y-3">
      <header className="sticky top-44 z-30 border-b border-slate-200 bg-white/95 py-2 backdrop-blur">
        <div className="flex items-center gap-3">
          {isSecondaryCategory ? (
            <h2 className="text-slate-700">
              <span className="text-slate-300">{parentName}</span>
              <span className="px-1.5 text-slate-300">/</span>
              <span>{catelog.name}</span>
            </h2>
          ) : (
            <h2 className="text-slate-700">{catelog.name}</h2>
          )}

          {!isPending && user ? (
            <div className="ml-auto inline-flex shrink-0 items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100/90 p-1">
                <Button
                  type="button"
                  variant="outline"
                  size="xs"
                  className="min-w-16 justify-center border-[#f7c948] bg-[#fff7db] text-[12px] leading-none text-[#9a6700] hover:border-[#f2b705] hover:bg-[#fff1c2] hover:text-[#7a5200]"
                >
                  排序
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="xs"
                  className="min-w-16 justify-center border-[#8ad8ff] bg-[#f0faff] text-[12px] leading-none text-[#0093d1] hover:border-[#5cc8ff] hover:bg-[#e1f5ff] hover:text-[#007bb0]"
                >
                  编辑
                </Button>

                <Button
                  type="button"
                  variant="destructive"
                  size="xs"
                  className="min-w-16 justify-center text-[12px] leading-none"
                >
                  删除
                </Button>
              </span>

              <Button
                type="button"
                variant="outline"
                size="xs"
                className="min-w-24 justify-center border-[#63e6be] bg-[#e6fcf5] text-[12px] leading-none text-[#087f5b] hover:border-[#38d9a9] hover:bg-[#c3fae8] hover:text-[#066649]"
              >
                添加 Awesome
              </Button>
            </div>
          ) : null}
        </div>
      </header>

      <ul className="flex flex-col gap-1.5">
        {catelog.underAwesomes.map(item => (
          <ListItem key={item.id} item={item} />
        ))}
      </ul>
    </section>
  )
}
