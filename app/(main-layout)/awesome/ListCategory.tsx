'use client'

import type { AwesomeTreeResult } from '@/apis/awesome/items'
import { useSession } from '@/lib/auth-client'
import { AwesomeEditButton } from './AwesomeEditButton'
import { AwesomeSortButton } from './AwesomeSortButton'
import { CategoryDeleteButton } from './CategoryDeleteButton'
import { CategoryEditButton, type CategoryFormValue } from './CategoryEditButton'
import { ListItem } from './ListItem'

export interface ListCategoryProps {
  catelog: AwesomeTreeResult
  hasChildren?: boolean
  sectionRef: (element: HTMLElement | null) => void
  onEditCategory?: (value: CategoryFormValue) => Promise<void>
}

export function ListCategory({
  catelog,
  hasChildren = false,
  sectionRef,
  onEditCategory,
}: ListCategoryProps) {
  const { user, isPending } = useSession()
  const softButtonClassName =
    'justify-center border-slate-200 bg-slate-50 text-[12px] leading-none text-slate-600 hover:border-slate-300 hover:bg-slate-100 hover:text-slate-700'

  const parentName = catelog.parent?.name
  const isSecondaryCategory = Boolean(parentName)
  const isVirtualCategory = catelog.id === '__no-id'

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
                <AwesomeSortButton
                  catelog={catelog}
                  variant="outline"
                  size="xs"
                  className={`min-w-16 ${softButtonClassName}`}
                >
                  排序
                </AwesomeSortButton>

                {isVirtualCategory ? null : (
                  <CategoryEditButton
                    categoryId={catelog.id}
                    parentId={catelog.parentId ?? undefined}
                    variant="outline"
                    size="xs"
                    className={`min-w-16 ${softButtonClassName}`}
                    onSubmit={async value => {
                      await onEditCategory?.(value)
                    }}
                  >
                    编辑
                  </CategoryEditButton>
                )}

                {isVirtualCategory ? null : (
                  <CategoryDeleteButton
                    category={{ ...catelog, hasChildren }}
                    type="button"
                    variant="outline"
                    size="xs"
                    className={`min-w-16 ${softButtonClassName}`}
                  >
                    删除
                  </CategoryDeleteButton>
                )}
              </span>

              <AwesomeEditButton
                variant="outline"
                size="xs"
                className={`${softButtonClassName} min-w-24`}
                catelogId={catelog.id === '__no-id' ? undefined : catelog.id}
              >
                添加 Awesome
              </AwesomeEditButton>
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
