'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, type ComponentProps, type ReactNode } from 'react'

import { ConfirmButton } from '@/components/button/confirm-button'
import { toast } from '@/components/ui/toast'
import { useTRPC, useTRPCClient } from '@/lib/trpc-client'

export interface WLBRecordDeleteButtonProps extends Omit<
  ComponentProps<typeof ConfirmButton>,
  'children' | 'confirm' | 'onConfirm'
> {
  profileId: string
  recordId: string
  recordDate?: string
  recordQueryDate: string
  children: ReactNode
  onSuccess?: () => void
}

export function WLBRecordDeleteButton({
  profileId,
  recordId,
  recordDate,
  recordQueryDate,
  children,
  onSuccess,
  disabled,
  ...restProps
}: WLBRecordDeleteButtonProps) {
  const trpc = useTRPC()
  const trpcClient = useTRPCClient()
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)

  const deleteMutation = useMutation({
    mutationFn: async () => {
      return trpcClient.wlb.record.delete.mutate({ id: recordId })
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: trpc.wlb.record.listByProfileAndDate.queryKey({
            profileId,
            date: recordQueryDate,
          }),
        }),
        queryClient.invalidateQueries({
          queryKey: trpc.wlb.record.get.queryKey({ id: recordId }),
        }),
      ])
      toast.success({
        title: '删除成功',
        description: `WLB 记录「${recordDate || recordId}」已删除`,
      })
      onSuccess?.()
      setOpen(false)
    },
  })

  return (
    <ConfirmButton
      {...restProps}
      disabled={disabled || deleteMutation.isPending}
      confirm={`确认删除 WLB 记录「${recordDate || recordId}」吗？`}
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
