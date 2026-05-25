'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, type ComponentProps, type ReactNode } from 'react'

import { ConfirmButton } from '@/components/button/confirm-button'
import { toast } from '@/components/ui/toast'
import { useTRPC, useTRPCClient } from '@/lib/trpc-client'

export interface WLBProfileDeleteButtonProps extends Omit<
  ComponentProps<typeof ConfirmButton>,
  'children' | 'confirm' | 'onConfirm'
> {
  profileId: string
  profileName?: string
  children: ReactNode
  onSuccess?: () => void
}

export function WLBProfileDeleteButton({
  profileId,
  profileName,
  children,
  onSuccess,
  disabled,
  ...restProps
}: WLBProfileDeleteButtonProps) {
  const trpc = useTRPC()
  const trpcClient = useTRPCClient()
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)

  const deleteMutation = useMutation({
    mutationFn: async () => {
      return trpcClient.wlb.profile.delete.mutate({ id: profileId })
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: trpc.wlb.profile.list.pathKey() })
      toast.success({
        title: '删除成功',
        description: `WLB 档案「${profileName || '未命名'}」已删除`,
      })
      onSuccess?.()
      setOpen(false)
    },
  })

  return (
    <ConfirmButton
      {...restProps}
      disabled={disabled || deleteMutation.isPending}
      confirm={`删除后不可恢复，确认删除 WLB 档案「${profileName || '未命名'}」吗？\n\n相关每日消息订阅也将一并删除。`}
      confirmButtonText={deleteMutation.isPending ? '删除中...' : '确认删除'}
      confirmButtonProps={{ variant: 'destructive', disabled: deleteMutation.isPending }}
      cancelButtonProps={{ disabled: deleteMutation.isPending }}
      popoverProps={{
        open,
        onOpenChange: details => {
          setOpen(details.open)
          if (details.open) {
            deleteMutation.reset()
          }
        },
      }}
      popoverContentProps={{ className: 'max-w-96' }}
      onConfirm={() => {
        void deleteMutation.mutateAsync()
      }}
    >
      {children}
    </ConfirmButton>
  )
}
