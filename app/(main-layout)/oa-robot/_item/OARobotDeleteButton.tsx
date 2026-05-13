'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, type ComponentProps, type ReactNode } from 'react'

import { ConfirmButton } from '@/components/button/ConfirmButton'
import { toast } from '@/components/ui/toast'
import { useTRPC, useTRPCClient } from '@/lib/trpc-client'
import { deleteOARobotLocalProfile, useOARobotLocalProfiles } from '../localProfileStorage'

export interface OARobotDeleteButtonProps extends Omit<
  ComponentProps<typeof ConfirmButton>,
  'children' | 'confirm' | 'onConfirm'
> {
  profileId: string
  profileName?: string
  source?: 'local' | 'cloud'
  children: ReactNode
  onSuccess?: () => void
}

export function OARobotDeleteButton({
  profileId,
  profileName,
  source = 'cloud',
  children,
  onSuccess,
  disabled,
  ...restProps
}: OARobotDeleteButtonProps) {
  const isLocalProfile = source === 'local'
  const trpc = useTRPC()
  const trpcClient = useTRPCClient()
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [localPending, setLocalPending] = useState(false)
  const [, setLocalProfiles] = useOARobotLocalProfiles()

  const deleteMutation = useMutation({
    mutationFn: async () => {
      return trpcClient.oaRobot.profile.delete.mutate({ id: profileId })
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: trpc.oaRobot.profile.list.pathKey() })
      toast.success({
        title: '删除成功',
        description: `OA 机器人「${profileName || '未命名'}」已删除`,
      })
      onSuccess?.()
      setOpen(false)
    },
  })

  const pending = isLocalProfile ? localPending : deleteMutation.isPending

  const handleConfirm = async () => {
    if (isLocalProfile) {
      setLocalPending(true)
      try {
        setLocalProfiles(prev => deleteOARobotLocalProfile(prev ?? [], profileId))
        toast.success({
          title: '删除成功',
          description: `本地 OA 机器人「${profileName || '未命名'}」已删除`,
        })
        onSuccess?.()
        setOpen(false)
      } finally {
        setLocalPending(false)
      }
      return
    }

    await deleteMutation.mutateAsync()
  }

  return (
    <ConfirmButton
      {...restProps}
      disabled={disabled || pending}
      confirm={`删除后不可恢复，确认删除${isLocalProfile ? '本地 OA 机器人' : 'OA 机器人'}「${profileName || '未命名'}」吗？`}
      confirmButtonText={pending ? '删除中...' : '确认删除'}
      confirmButtonProps={{ variant: 'destructive', disabled: pending }}
      cancelButtonProps={{ disabled: pending }}
      popoverProps={{
        open,
        onOpenChange: details => {
          setOpen(details.open)
          if (details.open && !isLocalProfile) {
            deleteMutation.reset()
          }
        },
      }}
      popoverContentProps={{ className: 'max-w-96' }}
      onConfirm={() => {
        void handleConfirm()
      }}
    >
      {children}
    </ConfirmButton>
  )
}
