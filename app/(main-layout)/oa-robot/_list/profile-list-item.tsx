'use client'

import { IconEdit, IconTrash } from '@tabler/icons-react'
import Image from 'next/image'

import { cn } from '@/utils/style'
import { OARobotDeleteButton } from '../_item/oa-robot-delete-button'
import { OARobotEditButton } from '../_item/oa-robot-edit-button'
import type { OARobotProfileListItem } from '../local-profile-storage'
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
        'group flex min-w-0 cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-all',
        'focus-visible:ring-ring/32 focus-visible:ring-[3px] focus-visible:outline-none',
        active
          ? 'border-primary/50 bg-primary/8 shadow-sm'
          : 'border-input bg-background hover:bg-muted/48'
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded">
          <Image src={typeIcon.icon} alt={typeIcon.alt} className="size-8" />
        </div>

        <p
          className="text-foreground min-w-0 flex-1 truncate text-sm font-medium"
          title={item.name}
        >
          {item.name}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-1" onClick={event => event.stopPropagation()}>
        <OARobotEditButton
          profileId={item.id}
          source={source}
          localProfile={source === 'local' ? item : undefined}
          variant="ghost"
          size="icon-sm"
          className="text-muted-foreground hover:bg-primary/10 hover:text-primary data-[state=open]:bg-primary/10 data-[state=open]:text-primary"
          aria-label={`编辑 ${item.name}`}
          title={`编辑 ${item.name}`}
          onClick={event => event.stopPropagation()}
        >
          <IconEdit aria-hidden />
        </OARobotEditButton>

        <OARobotDeleteButton
          profileId={item.id}
          profileName={item.name}
          source={source}
          variant="ghost"
          size="icon-sm"
          className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive data-[state=open]:bg-destructive/10 data-[state=open]:text-destructive"
          aria-label={`删除 ${item.name}`}
          title={`删除 ${item.name}`}
          onClick={event => event.stopPropagation()}
          onSuccess={() => onDeleteSuccess?.(item.id)}
        >
          <IconTrash aria-hidden />
        </OARobotDeleteButton>
      </div>
    </div>
  )
}
