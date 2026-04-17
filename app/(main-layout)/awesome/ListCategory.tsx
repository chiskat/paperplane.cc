'use client'

import { AwesomeTreeResult } from '@/apis/awesome/items'
import { ListItem } from './ListItem'

export interface ListCategoryProps {
  catelog: AwesomeTreeResult
  sectionRef: (element: HTMLElement | null) => void
}

export function ListCategory({ catelog, sectionRef }: ListCategoryProps) {
  const parentName = catelog.parent?.name
  const isSecondaryCategory = Boolean(parentName)

  return (
    <section data-section-id={catelog.id} ref={sectionRef} className="scroll-mt-52 space-y-3">
      <header className="sticky top-44 z-30 border-b border-slate-200 bg-white/95 py-2 backdrop-blur">
        {isSecondaryCategory ? (
          <h2 className="text-slate-700">
            <span className="text-slate-300">{parentName}</span>
            <span className="px-1.5 text-slate-300">/</span>
            <span>{catelog.name}</span>
          </h2>
        ) : (
          catelog.name
        )}
      </header>

      <ul className="flex flex-col gap-1.5">
        {catelog.underAwesomes.map(item => (
          <ListItem key={item.id} item={item} />
        ))}
      </ul>
    </section>
  )
}
