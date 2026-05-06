'use client'

import { IconMenu2, IconUser, IconX } from '@tabler/icons-react'
import dynamic from 'next/dynamic'
import { useState } from 'react'

import LoginButton from '@/components/helper/LoginButton'
import { Button } from '@/components/ui/button'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import { Skeleton } from '@/components/ui/skeleton'
import { authClient, useSession } from '@/lib/auth-client'
import { cn } from '@/utils/style'

type UserInfoBarProps = {
  menuOpen: boolean
  onToggleMenu: () => void
}

function UserInfoBar({ menuOpen, onToggleMenu }: UserInfoBarProps) {
  const { user, isPending } = useSession()
  const userEmail = user?.email?.trim()
  const userImage = user?.image?.trim()
  const userInitial = userEmail?.charAt(0).toUpperCase() ?? 'U'
  const [isUserCardOpen, setIsUserCardOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const isLoggedIn = Boolean(userEmail)

  const logoutHandler = async () => {
    if (isLoggingOut) {
      return
    }

    setIsUserCardOpen(true)
    setIsLoggingOut(true)
    try {
      await authClient.signOut()
      window.location.reload()
    } finally {
      setIsLoggingOut(false)
      setIsUserCardOpen(false)
    }
  }

  return (
    <div className="flex items-center justify-end gap-2">
      <HoverCard
        open={isLoggingOut || isUserCardOpen}
        onOpenChange={({ open }) => {
          if (isLoggingOut && !open) {
            return
          }
          setIsUserCardOpen(open)
        }}
        openDelay={10}
        closeDelay={140}
        positioning={{ placement: 'bottom-end', offset: { mainAxis: 4 } }}
      >
        <HoverCardTrigger asChild>
          <button
            type="button"
            className="hidden min-w-0 cursor-pointer items-center gap-2 rounded-md bg-white/85 px-2 py-1 text-left sm:flex"
          >
            <div
              className={cn(
                'flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-sm text-sm font-medium',
                userEmail ? 'bg-sky-100 text-sky-700' : 'bg-gray-100 text-gray-500'
              )}
            >
              {isPending ? (
                <Skeleton className="h-full w-full rounded-sm" />
              ) : userEmail && userImage ? (
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
            <div
              className={cn(
                'max-w-44 truncate text-[15px]',
                userEmail ? 'text-gray-800' : 'text-gray-600'
              )}
            >
              {isPending ? <Skeleton className="h-4 w-20 rounded-full" /> : (userEmail ?? '未登录')}
            </div>
          </button>
        </HoverCardTrigger>

        <HoverCardContent className="w-sm px-4 py-4 text-sm">
          <div className="space-y-3">
            {isPending ? (
              <>
                <Skeleton className="h-5 w-40 rounded-full" />
                <Skeleton className="h-4 w-full rounded-full" />
                <Skeleton className="h-9 w-28 rounded-md" />
              </>
            ) : (
              <>
                <p className="text-base font-medium text-gray-800">{userEmail ?? '未登录'}</p>
                {isLoggedIn ? (
                  <>
                    <p className="text-sm text-gray-500">你已登录，可继续浏览与管理个人内容。</p>
                    <Button
                      className="h-9 text-sm"
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
                    <LoginButton className="h-9 text-sm" size="lg">
                      通过 Gitea OAuth 登录
                    </LoginButton>
                  </>
                )}
              </>
            )}
          </div>
        </HoverCardContent>
      </HoverCard>

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

export default dynamic(() => Promise.resolve(UserInfoBar), { ssr: false })
