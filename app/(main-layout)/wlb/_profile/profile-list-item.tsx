'use client'

import { IconEdit, IconTrash } from '@tabler/icons-react'

import { cn } from '@/utils/style'
import { WLBProfileDeleteButton } from './profile-delete-button'
import { WLBProfileEditButton } from './profile-edit-button'

export type WLBProfileListItemData = {
  id: string
  name: string
}

export interface WLBProfileListItemProps {
  profile: WLBProfileListItemData
  active: boolean
  onSelect: () => void
  onDeleteSuccess: () => void
}

export function WLBProfileListItem({
  profile,
  active,
  onSelect,
  onDeleteSuccess,
}: WLBProfileListItemProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      className={cn(
        'group flex min-w-0 cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-all',
        'focus-visible:ring-ring/32 focus-visible:ring-[3px] focus-visible:outline-none',
        active
          ? 'border-primary/50 bg-primary/8 shadow-sm'
          : 'border-input bg-background hover:bg-muted/48'
      )}
      onClick={onSelect}
      onKeyDown={event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onSelect()
        }
      }}
    >
      <div className="min-w-0 flex-1">
        <p className="text-foreground w-full truncate text-sm font-medium" title={profile.name}>
          {profile.name}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-1" onClick={event => event.stopPropagation()}>
        <WLBProfileEditButton
          wlbProfileId={profile.id}
          variant="ghost"
          size="icon-sm"
          className="text-muted-foreground hover:bg-primary/10 hover:text-primary data-[state=open]:bg-primary/10 data-[state=open]:text-primary"
          aria-label={`编辑 ${profile.name}`}
        >
          <IconEdit aria-hidden />
        </WLBProfileEditButton>

        <WLBProfileDeleteButton
          profileId={profile.id}
          profileName={profile.name}
          variant="ghost"
          size="icon-sm"
          className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive data-[state=open]:bg-destructive/10 data-[state=open]:text-destructive"
          aria-label={`删除 ${profile.name}`}
          onSuccess={onDeleteSuccess}
        >
          <IconTrash aria-hidden />
        </WLBProfileDeleteButton>
      </div>
    </div>
  )
}
