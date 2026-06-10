'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, type ComponentProps, type ReactNode } from 'react'

import { ConfirmButton } from '@/components/button/confirm-button'
import { toast } from '@/components/ui/toast'
import { useTRPC, useTRPCClient } from '@/lib/trpc-client'

export interface WLBSubscriptionDeleteButtonProps extends Omit<
  ComponentProps<typeof ConfirmButton>,
  'children' | 'confirm' | 'onConfirm'
> {
  subscriptionId: string
  subscriptionName?: string
  profileId?: string
  children: ReactNode
  onSuccess?: () => void
}

export function WLBSubscriptionDeleteButton({
  subscriptionId,
  subscriptionName,
  profileId,
  children,
  onSuccess,
  disabled,
  ...restProps
}: WLBSubscriptionDeleteButtonProps) {
  const trpc = useTRPC()
  const trpcClient = useTRPCClient()
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)

  const deleteMutation = useMutation({
    mutationFn: async () => {
      return trpcClient.wlb.subscription.delete.mutate({ id: subscriptionId })
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: trpc.wlb.subscription.listByProfile.pathKey() }),
        queryClient.invalidateQueries({
          queryKey: trpc.wlb.subscription.get.queryKey({ id: subscriptionId }),
        }),
        profileId
          ? queryClient.invalidateQueries({
              queryKey: trpc.wlb.subscription.listByProfile.queryKey({ profileId }),
            })
          : Promise.resolve(),
      ])
      toast.success({
        title: '删除成功',
        description: `WLB 订阅「${subscriptionName || '未命名'}」已删除`,
      })
      onSuccess?.()
      setOpen(false)
    },
  })

  return (
    <ConfirmButton
      {...restProps}
      disabled={disabled || deleteMutation.isPending}
      confirm={`确认删除 WLB 订阅「${subscriptionName || '未命名'}」吗？`}
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
