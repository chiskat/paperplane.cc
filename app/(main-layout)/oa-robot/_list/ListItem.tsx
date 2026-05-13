'use client'

import { IconEdit, IconTrash } from '@tabler/icons-react'
import Image from 'next/image'

import { cn } from '@/utils/style'
import { OARobotDeleteButton } from '../_item/OARobotDeleteButton'
import { OARobotEditButton } from '../_item/OARobotEditButton'
import type { OARobotProfileListItem } from '../localProfileStorage'
import { oaRobotTypeIconMap } from '../robot-icon'

type ListItemProps = {
  item: OARobotProfileListItem
  source: 'local' | 'cloud'
  active?: boolean
  onSelect?: (profileId: string) => void
  onDeleteSuccess?: (profileId: string) => void
}

export default function ListItem({
  item,
  source,
  active = false,
  onSelect,
  onDeleteSuccess,
}: ListItemProps) {
  const typeIcon = oaRobotTypeIconMap[item.type]

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect?.(item.id)}
      onKeyDown={event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onSelect?.(item.id)
        }
      }}
      className={cn(
        'rounded-lg border bg-white px-3 py-2 transition-all',
        'cursor-pointer',
        'focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:outline-none',
        active
          ? 'border-sky-500 bg-sky-50 shadow-sm shadow-sky-100 hover:bg-sky-100/80'
          : 'border-slate-200 hover:bg-slate-50'
      )}
    >
      <div className="flex min-w-0 items-start gap-2">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded">
          <Image src={typeIcon.icon} alt={typeIcon.alt} className="size-12" />
        </div>

        <div className="min-w-0 flex-1 space-y-1">
          <p className="truncate text-sm font-medium text-slate-900" title={item.name}>
            {item.name}
          </p>

          <div className="flex min-w-0 items-end justify-start gap-2">
            <div className="flex shrink-0 items-end gap-1">
              <OARobotEditButton
                profileId={item.id}
                source={source}
                localProfile={source === 'local' ? item : undefined}
                variant="ghost"
                size="sm"
                className="h-6 gap-1 px-2 text-slate-500 hover:bg-sky-100 hover:text-sky-700 dark:hover:bg-sky-950/40 dark:hover:text-sky-200"
                onClick={event => event.stopPropagation()}
              >
                <IconEdit size={14} />
                编辑
              </OARobotEditButton>

              <OARobotDeleteButton
                profileId={item.id}
                profileName={item.name}
                source={source}
                variant="ghost"
                size="sm"
                className="h-6 gap-1 px-2 text-slate-500 hover:bg-rose-100 hover:text-rose-700 dark:hover:bg-rose-950/40 dark:hover:text-rose-200"
                onClick={event => event.stopPropagation()}
                onSuccess={() => onDeleteSuccess?.(item.id)}
              >
                <IconTrash size={14} />
                删除
              </OARobotDeleteButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
