'use client'

import { IconMenu2, IconUser, IconX } from '@tabler/icons-react'

import { cn } from '@/utils/style'

type UserInfoBarProps = {
  userEmail?: string
  userImage?: string
  menuOpen: boolean
  onToggleMenu: () => void
}

export function UserInfoBar({ userEmail, userImage, menuOpen, onToggleMenu }: UserInfoBarProps) {
  const userInitial = userEmail?.charAt(0).toUpperCase() ?? 'U'

  return (
    <div className="flex items-center justify-end gap-2">
      <div className="hidden min-w-0 cursor-pointer items-center gap-2 rounded-md bg-white/85 px-2 py-1 sm:flex">
        <div
          className={cn(
            'flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-sm text-sm font-medium',
            userEmail ? 'bg-sky-100 text-sky-700' : 'bg-gray-100 text-gray-500'
          )}
        >
          {userEmail && userImage ? (
            <img
              src={userImage}
              alt={userEmail}
              className="h-full w-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : userEmail ? (
            userInitial
          ) : (
            <IconUser size={16} stroke={1.8} />
          )}
        </div>
        <span
          className={cn('max-w-44 truncate text-sm', userEmail ? 'text-gray-700' : 'text-gray-500')}
        >
          {userEmail ?? '未登录'}
        </span>
      </div>

      <button
        className="flex h-8 w-8 items-center justify-center rounded-md text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 sm:hidden"
        onClick={onToggleMenu}
        aria-label="导航菜单"
        aria-expanded={menuOpen}
      >
        {menuOpen ? <IconX size={16} /> : <IconMenu2 size={16} />}
      </button>
    </div>
  )
}
