'use client'

import { IconMenu2, IconUser, IconX } from '@tabler/icons-react'
import { useEffect, useRef, useState } from 'react'

import LoginButton from '@/components/helper/LoginButton'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { authClient } from '@/lib/auth-client'
import { cn } from '@/utils/style'

type UserInfoBarProps = {
  userEmail?: string
  userImage?: string
  menuOpen: boolean
  onToggleMenu: () => void
}

export function UserInfoBar({ userEmail, userImage, menuOpen, onToggleMenu }: UserInfoBarProps) {
  const userInitial = userEmail?.charAt(0).toUpperCase() ?? 'U'
  const [isUserPopoverOpen, setIsUserPopoverOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isLoggedIn = Boolean(userEmail)

  const logoutHandler = async () => {
    if (isLoggingOut) {
      return
    }

    setIsLoggingOut(true)
    try {
      await authClient.signOut()
      window.location.reload()
    } finally {
      setIsLoggingOut(false)
    }
  }

  const clearCloseTimer = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
  }

  const openUserPopover = () => {
    clearCloseTimer()
    setIsUserPopoverOpen(true)
  }

  const scheduleCloseUserPopover = () => {
    clearCloseTimer()
    closeTimerRef.current = setTimeout(() => {
      setIsUserPopoverOpen(false)
      closeTimerRef.current = null
    }, 140)
  }

  useEffect(() => {
    return () => clearCloseTimer()
  }, [])

  return (
    <div className="flex items-center justify-end gap-2">
      <Popover open={isUserPopoverOpen} onOpenChange={setIsUserPopoverOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="hidden min-w-0 cursor-pointer items-center gap-2 rounded-md bg-white/85 px-2 py-1 text-left sm:flex"
            onMouseEnter={openUserPopover}
            onMouseLeave={scheduleCloseUserPopover}
          >
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
              className={cn(
                'max-w-44 truncate text-[15px]',
                userEmail ? 'text-gray-800' : 'text-gray-600'
              )}
            >
              {userEmail ?? '未登录'}
            </span>
          </button>
        </PopoverTrigger>

        <PopoverContent
          className="w-sm px-4 py-4 text-sm"
          align="end"
          sideOffset={4}
          onMouseEnter={openUserPopover}
          onMouseLeave={scheduleCloseUserPopover}
        >
          <div className="space-y-3">
            <p className="text-base font-medium text-gray-800">{userEmail ?? '未登录'}</p>
            {isLoggedIn ? (
              <>
                <p className="text-sm text-gray-500">你已登录，可继续浏览与管理个人内容。</p>
                <Button
                  className="h-9 w-full text-sm"
                  variant="outline"
                  size="lg"
                  onClick={() => void logoutHandler()}
                  disabled={isLoggingOut}
                >
                  {isLoggingOut ? '退出中...' : '退出登录'}
                </Button>
              </>
            ) : (
              <>
                <p className="text-sm text-gray-500">可通过 Gitea OAuth 快速登录后继续操作。</p>
                <LoginButton className="h-9 w-full text-sm" size="lg">
                  通过 Gitea OAuth 登录
                </LoginButton>
              </>
            )}
          </div>
        </PopoverContent>
      </Popover>

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
