'use client'

import { IconPointFilled, IconSquareRotatedFilled } from '@tabler/icons-react'
import { AnimatePresence, motion } from 'motion/react'

import { AwesomeCatelogNode } from '@/apis/awesome/catelogs'
import { cn } from '@/utils/style'

const CHILDREN_TRANSITION = { duration: 0.2, ease: 'easeOut' } as const

export interface CategorySidebarItemProps {
  category: AwesomeCatelogNode
  showChildren: boolean
  onScrollToSection: (id: string) => void
  depth?: number
}

export function CategorySidebarItem({
  category,
  showChildren,
  onScrollToSection,
  depth = 0,
}: CategorySidebarItemProps) {
  const children = category.children || []
  const isPrimaryCategory = category.parentId == null
  const isChildCategory = depth > 0

  return (
    <li>
      <button
        type="button"
        onClick={() => void onScrollToSection(category.id)}
        className={cn(
          'inline-flex max-w-full cursor-pointer items-center gap-1.5 self-start rounded-md px-1.5 py-0.5 pr-1 text-left underline-offset-4 transition-colors hover:underline',
          isChildCategory ? 'text-[14px] text-slate-600' : 'text-[16px] text-slate-700'
        )}
      >
        {isPrimaryCategory ? (
          <IconSquareRotatedFilled size={10} className="shrink-0 text-slate-300" />
        ) : (
          <IconPointFilled size={8} className="shrink-0 text-slate-300" />
        )}
        <span>{category.name}</span>
      </button>

      <AnimatePresence initial={false}>
        {showChildren && children.length > 0 && (
          <motion.div
            key={`${category.id}-children`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={CHILDREN_TRANSITION}
            className="overflow-hidden"
          >
            <ul className="mt-1 flex flex-col gap-0.5 pl-2">
              {children.map(child => (
                <CategorySidebarItem
                  key={child.id}
                  category={child}
                  showChildren={showChildren}
                  onScrollToSection={onScrollToSection}
                  depth={depth + 1}
                />
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  )
}
